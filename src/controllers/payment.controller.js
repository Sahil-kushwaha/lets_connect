const razorpayInstance = require("../config/razorpay.config");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const Payment = require("../models/payment.model");
const {
  validateWebhookSignature,
} = require("razorpay/dist/utils/razorpay-utils");
const { addMonths } = require("date-fns");
const User = require("../models/user.model");

const createOrder = async (req, res) => {
  try {
    const { firstName, lastName, emailId } = req.user;
    const { duration, membershipType } = req.body;
    if (!["Monthly", "Yearly"].includes(duration)) {
      throw new ApiError(400, "Invalid plan duration");
    }
    // amount must be passed through backend not via frontend due to security reason
    const amount = {
      plus: duration === "Monthly" ? 50 : 300,
      prime: duration === "Monthly" ? 100 : 500,
    };

    const orderOption = {
      amount: amount[membershipType] * 100,
      currency: "INR",
      receipt: `reciept#${Date.now()}`,
      partial_payment: false,
      notes: {
        firstName,
        lastName,
        emailId,
        membershipType: membershipType,
        membershipDuration: duration,
      },
    };
    const order = await razorpayInstance.orders.create(orderOption);

    const payment = new Payment({
      userId: req.user._id,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
      status: order.status,
      reciept: order.receipt,
      notes: order.notes,
    });
    const savedPayment = await payment.save();
    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { ...savedPayment.toJSON(), keyId: process.env.RAZORPAY_KEY_ID },
          "order created successfully"
        )
      );
  } catch (error) {
    res
      .status(error.statusCode || 400)
      .json(
        new ApiError(
          error.statusCode || 400,
          error.message || "something went wrong while payment"
        )
      );
  }
};

const verifyPayment = async (req, res) => {
  try {
    console.log(req.body)
    const webhookSignature = req.get("X-Razorpay-Signature");
    
    const isValidSignature = validateWebhookSignature(
      JSON.stringify(req.body),
      webhookSignature,
      process.env.RAZORPAY_WEBHOOK_SECRET
    );
    
    if (!isValidSignature) {
      console.log("invalid signature")
      throw new ApiError(400, "webhook signature is invalid");

    }
    console.log("after signature")

    // update my payment status in DB
    const paymentDetail = req.body.payload.payment.entity;
    console.log(req.body.payload)
    const payment = await Payment.findOne({ orderId: paymentDetail.order_id });
    payment.status = paymentDetail.status;
    payment.paymentId = paymentDetail.id;
    // calc expiry date for premium
    const unixTimestamp = paymentDetail.created_at;
    const millisecondTimestamp = unixTimestamp * 1000;
    const paymentDate = new Date(millisecondTimestamp);
    const membershipValidity = payment.notes.membershipDuration === "Monthly" ? 1 : 12;
    const membershipExpiry = addMonths(paymentDate, membershipValidity);
    payment.notes.membershipExpiry = membershipExpiry;

    await payment.save();

    // update the user as premium
    if (req.body.event === "payment.captured") {
      const user = await User.findOne({ _id: payment.userId });
      user.isPremium = true;
      user.membershipType = paymentDetail.notes.membershipType;
      await user.save()
    }
    if (req.body.event === "payment.failed") {
    }

     res
     .status(200)
     .json(new ApiResponse(200 ,{},"webhook received successfully"))
  } catch (error) {
    console.log(error.message)
    res
      .status(error?.statusCode || 500)
      .json(
        new ApiError(
          error?.statusCode || 500,
          error.message || "something went wrong on payment verification"
        )
      );
  }
};

module.exports = {
  createOrder,
  verifyPayment
};
