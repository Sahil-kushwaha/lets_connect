const express = require("express")
const { getProfile,
       updateProfile,
       deleteProfile,
       updateUserAvatar} = require("../controllers/profile.controller")
const {verifyJwt} = require("../middlewares/auth")
const upload = require("../middlewares/multer")

const profileRouter = express.Router()

profileRouter.use(verifyJwt)
profileRouter.get("/view",getProfile)
profileRouter.patch("/update",updateProfile)
profileRouter.put("/avatar/update",upload.single("avatar"),updateUserAvatar)
profileRouter.delete("/delete",deleteProfile)


module.exports = profileRouter
