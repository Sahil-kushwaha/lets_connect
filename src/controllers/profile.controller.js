const User = require("../models/user.model")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")
const { cloudinaryDeletFile, uploadImage } = require("../utils/cloudinary")
const {validateDataToBeUpdate} = require("../utils/validator")
const {extractPublicId} = require("cloudinary-build-url")
const getProfile = async(req,res)=>{
        const userId = req.user._id
        try {
              const users=  await User.findById(userId)
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
                  }).select("-password")
      
            res.status(200).json(new ApiResponse(200 , updatedUser,"Profile updated successfully"))
             
       } catch (error) {
            res.status(error.statusCode || 400).json(new ApiError(error.statusCode || 400 ,error.message ||  "server internal error"))
       }
}

const updateUserAvatar = async (req, res) => {

   const avatarLocalPath = req.file?.path
   if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is missing")
   }
   const cloudinaryPath = await uploadImage(avatarLocalPath);
   
   if (!cloudinaryPath.url) {
      throw new ApiError(400, "Error while uploading on avatar")
   }

   const oldAvatarUrl = await User.findById(req.user?._id).select("avatarUrl")
   
   const publicId = extractPublicId(oldAvatarUrl.avatarUrl)

   const user= await User.findByIdAndUpdate(req.user?._id,
      {
         $set: { avatarUrl: cloudinaryPath.url }
      },
      { new: true }).select("-password")

   //delete old image   
   await cloudinaryDeletFile(publicId)

   return res
      .status(200)
      .json(new ApiResponse(200, user, "Avatar updated successfully"))

}


const deleteProfile = async(req,res)=>{
      const userId = req.user._id
      //TODO : first verify with by using its password
      try {
            const deletedUser = await User.findByIdAndDelete(userId);
             const response = await cloudinaryDeletFile(extractPublicId(deletedUser.avatarUrl))
             console.log(response)
            res.status(200).json(new ApiResponse(200 , deletedUser,"user deleted successfully"))

         } catch (error) {
             res.status(error.statusCode || 500).json(new ApiError(error.statusCode || 500 ,error.message || "internal server error"))
         }
}



module.exports ={
       getProfile,
       updateProfile,
       updateUserAvatar,
       deleteProfile
}