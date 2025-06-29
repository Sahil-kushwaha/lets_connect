const express = require('express')
require("dotenv").config()
const connectDB = require("./config/dbconfig")
const User = require("./models/user.model")
const ApiError = require("./utils/ApiError")
const ApiResponse = require("./utils/ApiResponse")
const {validateSignupData, validateLoginData} = require("./utils/validator")
const bcrypt = require('bcrypt')
const {userAuth} = require("./middlewares/auth")
const cookiesParser = require("cookie-parser")
const jwt = require("jsonwebtoken")
const app = express()
const PORT = 3000

app.use(express.json())
app.use(cookiesParser())

app.post("/user/signup",async (req, res)=>{ 

      try {
            // validation of data
             validateSignupData(req)
            // check is user alredy exist or not
            const userData = await User.findOne({emailId:req.emailId})
            if(userData) throw new ApiError(400,"User already exist") 
            //encypt password
            const plainPasswrod  =  req.body.password
            const hashPassord = await bcrypt.hash(plainPasswrod ,10)

            const data = req.body
            // create the instance of user model

            const user = new User({...data,password:hashPassord})
            await user.save()
            res.status(201).json(new ApiResponse(201,{},"User added successfully"))
        
      } catch (error) {
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400, error.message))
      }
      
})

app.post("/user/login" , async(req,res)=>{
      try{
            validateLoginData(req)
            const {emailId ,password} = req.body
            const userData = await User.findOne({emailId:emailId})
            
            if(!userData){
                  throw new ApiError(404 , "user doesn't exist")
            } 
            const isMatch =  await bcrypt.compare(password,userData.password)
            if(!isMatch) throw new ApiError(401 , "Invalid credentials")
          
           const authToken= await jwt.sign({_id:userData._id},process.env.JWT_SECRET,{expiresIn:"1d"} )
           const{firstName ,lastName}  = userData          
           res
           .status(200)
           .cookie("token",authToken,{httpOnly:true})
           .json(new ApiResponse(200,
            {
             firstName,
             lastName,
             emailId,
             authToken
            },"User loged in successfully"))
            
      } 
      catch(error){
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400 , error.message || "something went wrong"))
      }
})
app.get("/user/logout",userAuth,async(req,res)=>{

            //delete cookie
            res.clearCookie("token")
            res
            .status(200)
            .json(new ApiResponse(200,{},"User logout Successfully"))

})
app.patch("/user/update-profile",userAuth ,async(req,res)=>{
      const userId = req._id;
      
      const  data = req.body;
      const ALLOWed_UPDATE = ["photoUrl" ,"gender","skills","about","age", ]
      
      try { 
            
      
            const isUpdateAllowed = Object.keys(data).every(item=>ALLOWed_UPDATE.includes(item))
            if(!isUpdateAllowed) throw new ApiError(400,"This update not allowed") 
            const updatedUser = await User.findByIdAndUpdate(userId,data,
                  {
                        returnDocument:"after",
                        runValidators:true
                  })
            if(!updatedUser){
              throw new ApiError(404 ,"user does'nt exist")
            }
            res.status(200).json(new ApiResponse(200 , updatedUser,"user data updated successfully"))
             
       } catch (error) {
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400 ,error.message ||  "server internal error"))
       }
}) 

app.get('/user/profile',userAuth,async(req,res)=>{
        const userId = req._id
        try {
              const users=  await User.findById(userId
              )
              if(!users){
                    
                    throw new ApiError(404,"user does'nt exist")
                  }
                  res.status(200).json(new ApiResponse(200,users,"users fetched successfully"))
                  
            } catch (error) {
                  res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500,error.message ||"server internal error"))
                  
            }
})
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

app.delete("/user/delete",userAuth,async(req,res)=>{
      const userId = req._id
      try {
            const deletedUser = await User.findByIdAndDelete(userId);
                res.status(200).json(new ApiResponse(200 , deletedUser,"user deleted successfully"))

         } catch (error) {
             res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500 ,error.message || "internal server error"))
         }
})

connectDB()
.then(()=>{
       console.log("DB connection established")
       app.listen(PORT,()=>{
              console.log(`Server is successfully listening on port: ${PORT}`)
       })

})
.catch((e)=>console.log("Error occured in DB connection: "))

 


