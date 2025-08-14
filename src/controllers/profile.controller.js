const User = require("../models/user.model")
const {validateDataToBeUpdate} = require("../utils/validator")

const getProfile = async(req,res)=>{
        const userId = req.user._id
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
}

const updateProfile = async(req,res)=>{
      const userId = req.user._id;
      
       try { 
            validateDataToBeUpdate(req)
            const loggedInUser = req.user

            Object.keys(req.body).forEach((key)=>loggedInUser[key]=req.body[key])
            
            const updatedUser = await User.findByIdAndUpdate(userId,loggedInUser,
                  {
                        returnDocument:"after",
                        runValidators:true
                  })
      
            res.status(200).json(new ApiResponse(200 , updatedUser,"Profile updated successfully"))
             
       } catch (error) {
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400 ,error.message ||  "server internal error"))
       }
}

const deleteProfile = async(req,res)=>{
      const userId = req.user._id
      try {
            const deletedUser = await User.findByIdAndDelete(userId);
                res.status(200).json(new ApiResponse(200 , deletedUser,"user deleted successfully"))

         } catch (error) {
             res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500 ,error.message || "internal server error"))
         }
}

module.exports ={
       getProfile,
       updateProfile,
       deleteProfile
}