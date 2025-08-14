const express = require("express") 
const { signup,
        login, 
        logout,
        forgotPassword,
        changePassword
       } = require("../controllers/userAuth.controller")
const { verifyJwt } = require("../middlewares/auth")
const authRouter = express.Router()

authRouter.post("/signup",signup)
authRouter.post("/login",login)
authRouter.post("/logout",logout)
authRouter.post("/password/forgot",forgotPassword)
authRouter.post("/password/change",verifyJwt,changePassword)


module.exports = authRouter
