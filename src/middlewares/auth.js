const jwt = require("jsonwebtoken")
const ApiError = require("../utils/ApiError")
require("dotenv").config()

const userAuth =  async (req,res,next)=>{
       try{
            const accessToken = req.cookies.token
            if(!accessToken){
                throw new ApiError(401,"Invalid token or token expired")
            }
            const decodedData =  await jwt.verify(accessToken,process.env.JWT_SECRET)
            const{ _id} = decodedData
            req._id = _id
            next()
       }catch(error){
           res
           .status(error.statuscode || 401)
           .json(new ApiError(error.statuscode || 401, error.message || "Invalid Token"))
       }      

}

module.exports={
    userAuth
}