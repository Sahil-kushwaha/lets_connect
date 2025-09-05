const express = require('express')
require("dotenv").config({path:`.env.${process.env.NODE_EVN}`})
const connectDB = require("./config/dbconfig")
const cookiesParser = require("cookie-parser")
const cors = require("cors")
const app = express()
const PORT = 3000

const authRouter = require("./routes/auth.route")
const profileRouter = require('./routes/profile.route')
const userRouter = require('./routes/user.route')
require("./utils/cronJob")
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

connectDB()
.then(()=>{
       console.log("DB connection established")
       app.listen(process.env.PORT || PORT,()=>{
              console.log(`Server is  listening on port: ${PORT}`)
       })
       
})
.catch((e)=>console.log("Error occured in DB connection: "))

 


