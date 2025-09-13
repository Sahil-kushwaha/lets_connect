const express = require("express")
const { createOrder, verifyPayment } = require("../controllers/payment.controller")
const { verifyJwt } = require("../middlewares/auth")

const paymentRoute = express.Router()

paymentRoute.post("/create/order",verifyJwt,createOrder)
paymentRoute.post("/webhook",verifyPayment)

module.exports = paymentRoute