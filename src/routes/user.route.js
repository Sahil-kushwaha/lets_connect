const express = require("express")
const { verifyJwt } = require("../middlewares/auth")
const { connectionRequestSend, connectionRequestReview ,getRequests,getAllConnections, getFeeds} = require("../controllers/user.controller")


const userRouter = express.Router()

userRouter.use(verifyJwt)
userRouter.get("/requests/received",getRequests)
userRouter.get("/connections",getAllConnections)
userRouter.post("/request/send/:status/:userId",connectionRequestSend)
userRouter.post("/request/review/:status/:requestId",connectionRequestReview)
userRouter.get("/feeds",getFeeds)


module.exports = userRouter
