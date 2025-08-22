const validator = require("validator")
const ApiError = require("./ApiError");
const mongoose = require("mongoose")

const validateSignupData = (req)=>{
    const {firstName , lastName , emailId ,password} = req.body
      if ([firstName, emailId, password].some((field) => field?.trim() === "")) {
          throw new ApiError(400, "fields are required");
      }
 
      if(!validator.isEmail(emailId)){
         throw new ApiError(400,"Enter valid Email")
         
        }
      if(!validator.isStrongPassword(password)){
        throw new ApiError(400,"Enter strong password")
            
      }

}

const validateLoginData  = (req)=>{
    const {emailId , password} = req.body
    if(!emailId || !password){
        throw new ApiError(400,"All fields are required")
    }
    else if(!validator.isEmail(emailId)){
         throw new ApiError(400,"Enter valid emailId")         
    }
    else if(!emailId || !password){
         throw new ApiError(400,"both email and password are required")
    }
}

   const validateDataToBeUpdate = (req)=>{
        const  data = req.body;
        const ALLOWed_UPDATE = ["firstName","lastName","photoUrl" ,"gender","skills","about","age", ]
        const isUpdateAllowed = Object.keys(data).every(item=>ALLOWed_UPDATE.includes(item))
        if(!isUpdateAllowed) throw new ApiError(400,`Only ${ALLOWed_UPDATE} \n is allowed to upadate `) 

        const isEmptyInput =  Object.keys(req.body).some((item)=>item.trim()==="")
        if(isEmptyInput){
            throw new ApiError(400,"Enter valid input data")
        }
        //TODO : senetize xss attack prone

   }

   const validatePassword = (req)=>{
          const {newPassword} = req.body
        //   if(validator.isStrongPassword(newPassword)){
              
        //       throw new ApiError(400 , "Enter strong password")
        //   }
          if(newPassword.trim()==="") {
              throw new ApiError(400 , "Enter valid password")
          }  
   }
   const validateMongodbId = (mongodbId)=>{
          if(!mongoose.isValidObjectId(mongodbId)){
              throw new ApiError(400,"UserId is not valid")
          }
   }

module.exports ={
    validateSignupData,
    validateLoginData,
    validateDataToBeUpdate,
    validatePassword,
    validateMongodbId
}