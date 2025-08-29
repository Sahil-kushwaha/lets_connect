const User = require("../models/user.model")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const {validateSignupData, validateLoginData ,validatePassword} = require("../utils/validator")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")


// signup handler
const signup = async (req, res)=>{ 
      try {
            // validation of data
            validateSignupData(req)
            // check is user alredy exist or not
            const isUserExit= await User.findOne({emailId:req.body.emailId})
            if(isUserExit) throw new ApiError(400,"User already exist") 
            //encypt password
            const plainPasswrod  =  req.body.password
            const hashPassord = await bcrypt.hash(plainPasswrod ,10)
            const data = req.body
            // create the instance of user model
            const newUser = new User({...data,password:hashPassord})
            const user = await newUser.save()
            const authToken =  await user.generateAccessToken()
            res
            .status(201)
            .cookie("token",authToken,{httpOnly:true})
            .json(new ApiResponse(201,{...user._doc,password:null},"User added successfully"))

      } catch (error) {
            res
            .status(error.statusCode || 400)
            .json(new ApiError(error.statusCode || 400, error.message || "something went wrong"))
      }
      
}

// login handler
const login = async(req,res)=>{
      try{
            validateLoginData(req)
            const {emailId ,password} = req.body
            const user = await User.findOne({emailId:emailId})
            
            if(!user){
                  throw new ApiError(404 , "user doesn't exist")
            } 
            const isMatch = await user.isPasswordCorrect(password)
            if(!isMatch) throw new ApiError(400 , "Invalid credentials")
          
           const authToken= await user.generateAccessToken()    
           res
           .status(200)
           .cookie("token",authToken,{httpOnly:true})
           .json(new ApiResponse(200,
            {
             ...user._doc,
             password:""
            },"User loged in successfully"))
            
      } 
      catch(error){
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400 , error.message || "something went wrong"))
      }
}

// logout hanlder
const logout = async(req,res)=>{

            //delete cookie
            res.clearCookie("token",
                  {httpOnly:true}
            )
            res
            .status(200)
            .json(new ApiResponse(200,{},"User logout Successfully"))

}
 
// forgot-password
const forgotPassword = async(req,res)=>{
       //TODO verify via otp
       try {
             validatePassword(req)
             const {emailId,oldPassword , newPassword} = req.body   
             const user = await User.findOne({emailId:emailId})
             const isMatch = await user.isPasswordCorrect(oldPassword)
             if(!isMatch){
                  throw new ApiError(400 , "invalid Credentials")
             }
             const hashPassord = await bcrypt(newPassword ,10)
             user.password = hashPassord
             await user.save({validateBeforeSave:false})
             res
             .status(200)
             .json(new ApiResponse(200,{},"password change successfully"))

       } catch (error) {
            res.status(error.statusCode || 400)
            .json( new ApiError(error.statusCode || 400, error.message || "invalid request"))
       }
}

// change-current-password
const changePassword = async(req,res)=>{
        try {
            
             validatePassword(req)
             const {oldPassword , newPassword} = req.body
             const userId = req?.user._id
      
             const user = await User.findById(userId)
          
             const isMatch = await user.isPasswordCorrect(oldPassword)
             if(!isMatch){
                   throw new ApiError(400 , "invalid Credentials")
             }
             
             const hashPassord = await bcrypt.hash(newPassword ,10)
             user.password = hashPassord
             await user.save({validateBeforeSave:false})
             res
             .status(200)
             .clearCookie("token")
             .json(new ApiResponse(200,{},"password change successfully"))
 
        } catch (error) {
            res.status(error.statusCode || 400)
            .json( new ApiError(error.statusCode || 400, error.message || "invalid request"))
        }
}

module.exports={
     signup,
     login,
     logout,
     forgotPassword,
     changePassword
}