const http = require("node:http")
const express = require('express')
require("dotenv").config({path:`.env.${process.env.NODE_ENV}`})
const connectDB = require("./config/dbconfig")
const cookiesParser = require("cookie-parser")
const cors = require("cors")

const authRouter = require("./routes/auth.route")
const profileRouter = require('./routes/profile.route')
const userRouter = require('./routes/user.route')
const paymentRouter = require('./routes/payment.route')
const initializeSocketServer = require("./utils/socket")
const chatRouter = require("./routes/chat.route")

const app = express()
const PORT = 3000
const httpServer = http.createServer(app)
require("./utils/cronJob")
initializeSocketServer(httpServer)

app.use(express.json())
app.use(cookiesParser())
app.use(express.static("public"))
app.use(express.urlencoded()) 
const corsOption ={
       origin: process.env.ORIGIN,
       credentials: true, 
}
app.use(cors(corsOption))

app.use("/api/v1/auth",authRouter)
app.use("/api/v1/profile",profileRouter)
app.use("/api/v1/user",userRouter)
app.use("/api/v1/payment",paymentRouter)
app.use("/api/v1/chat",chatRouter)

connectDB()
.then(()=>{
       console.log("DB connection established")
       httpServer.listen(process.env.PORT || PORT,()=>{
              console.log(`Server is  listening on port: ${PORT}`) 
       })
       
})
.catch((e)=>console.log("Error occured in DB connection: "))



