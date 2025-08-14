const jwt = require("jsonwebtoken")
const ApiError = require("../utils/ApiError")
const User = require("../models/user.model")
require("dotenv").config()

const verifyJwt=  async (req,res,next)=>{
       try{
            const accessToken = req.cookies.token
            if(!accessToken){
                throw new ApiError(401,"Invalid token or token expired")
            }
            const decodedData =  await jwt.verify(accessToken,process.env.JWT_SECRET)
            const user = await User.findById(decodedData?._id)
                        .select("-password")
            if(!user){
                 throw new ApiError(400,"User does'nt exist")
            }
            req.user =user
            next()
       }catch(error){
           res
           .status(error.statuscode || 401)
           .json(new ApiError(error.statuscode || 401, error.message || "Invalid Token"))
       }      

}

module.exports={
    verifyJwt
}