const express = require('express')
require("dotenv").config()
const connectDB = require("./config/dbconfig")
const User = require("./models/user.model")

const app = express()
const PORT = 3000




connectDB()
.then(()=>{
       console.log("DB connection established")
       app.listen(PORT,()=>{
              console.log(`Server is successfully listening on port: ${PORT}`)
       })

})
.catch((e)=>console.log("Error occured in DB connection: "))

 


