const express = require("express")
const {verifyJwt} = require("../middlewares/auth")
const {fetchAllChats } = require("../controllers/chat.controller")

const chatRouter = express.Router()

chatRouter.get("/fetch/:toUserId",verifyJwt,fetchAllChats)

module.exports = chatRouter