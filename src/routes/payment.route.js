const express = require("express")
const { createOrder, verifyPayment, webhookHanlder } = require("../controllers/payment.controller")
const { verifyJwt } = require("../middlewares/auth")

const paymentRoute = express.Router()

paymentRoute.post("/create/order",verifyJwt,createOrder)
paymentRoute.post("/webhook",webhookHanlder)
paymentRoute.post("/verify",verifyJwt,verifyPayment)

module.exports = paymentRoute