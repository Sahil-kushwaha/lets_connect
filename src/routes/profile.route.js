const express = require("express")
const { getProfile,
       updateProfile,
       deleteProfile} = require("../controllers/profile.controller")
const {verifyJwt} = require("../middlewares/auth")

const profileRouter = express.Router()

profileRouter.use(verifyJwt)
profileRouter.get("/view",getProfile)
profileRouter.patch("/update",updateProfile)
profileRouter.post("/delete",deleteProfile)  


module.exports = profileRouter
