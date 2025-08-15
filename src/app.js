const express = require('express')
require("dotenv").config()
const connectDB = require("./config/dbconfig")
const cookiesParser = require("cookie-parser")
const app = express()
const PORT = 3000

const authRouter = require("./routes/auth.route")
const profileRouter = require('./routes/profile.route')
const userRouter = require('./routes/user.route')

app.use(express.json())
app.use(cookiesParser())
app.use(express.static("public"))


app.use("/api/v1/auth",authRouter)
app.use("/api/v1/profile",profileRouter)
app.use("/api/v1/user",userRouter)

connectDB()
.then(()=>{
       console.log("DB connection established")
       app.listen(PORT,()=>{
              console.log(`Server is  listening on port: ${PORT}`)
       })

})
.catch((e)=>console.log("Error occured in DB connection: "))

 


