const validator = require("validator")
const ApiError = require("./ApiError")

const validateSignupData = (req)=>{
    const {firstName , lastName , emailId ,password} = req.body
    if(!firstName || !emailId || !password ){
          for (const [key , value] of Object.entries(req.body)){
                if(!value) throw new ApiError(400,`All fields are required ${key} is missing`)
          }
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

module.exports ={
    validateSignupData,
    validateLoginData
}