const express = require("express") 
const { signup,
        login, 
        logout,
        forgotPassword,
        changePassword
       } = require("../controllers/userAuth.controller")
const { verifyJwt } = require("../middlewares/auth")
const upload = require("../middlewares/multer")

const authRouter = express.Router()

authRouter.post("/signup",upload.single("avatar"),signup)
authRouter.post("/login",login)
authRouter.post("/logout",logout)
authRouter.post("/password/forgot",forgotPassword)
authRouter.post("/password/change",verifyJwt,changePassword)


module.exports = authRouter
