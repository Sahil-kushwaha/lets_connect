const express = require('express')
require("dotenv").config()
const connectDB = require("./config/dbconfig")
const User = require("./models/user.model")
const ApiError = require("./utils/ApiError")
const ApiResponse = require("./utils/ApiResponse")

const bcrypt = require('bcrypt')
const {userAuth} = require("./middlewares/auth")
const cookiesParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const app = express()
const PORT = 3000

const authRouter = require("./routes/auth.route")
const profileRouter = require('./routes/profile.route')
const userRouter = require('./routes/user.route')

app.use(express.json())
app.use(cookiesParser())




app.get('/feeds',async(req,res)=>{
        try {
            const users=  await User.find([])
            if(users){
                  res.status(200).json(ApiResponse(200,users,"users fetched successfully"))
                  
            }
            else{
                  throw new ApiError(404,"feed does'nt exist")
            }
      } catch (error) {
            res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500, error.message|| "server internal error"))
            
      }
})


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

 


