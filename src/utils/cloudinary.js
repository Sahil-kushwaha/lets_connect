const cloudinary = require('cloudinary').v2
const fs = require('fs')

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_SECRET,
  secure: process.env.NODE_ENV==="development"?false:true
});

const uploadImage = async (localFilePath) => {
  
    if(!localFilePath) return null;
    // Use the uploaded file's name as the asset's public ID and 
    // allow overwriting the asset with new versions
    const options = {
      use_filename: true,
      unique_filename: false,
      overwrite: true,
    };

    try {
      // Upload the image
      const response = await cloudinary.uploader.upload(localFilePath, options);
        // Remove the local file after upload
      fs.unlinkSync(localFilePath)
      return response
      
    }catch (error) {
      //remove the locally saved temprory file as the upload operartion got failed
      fs.unlinkSync(localFilePath) 
      console.log("couldinary service::Error: ",error)
      return null;
    }
};

const cloudinaryDeletFile=async (publicId)=>{
                try{
                     if(!publicId) return null;
                      //delete file on cloudinary
                      const response=await cloudinary.uploader.destroy(publicId)        
                     // file has been deleted successfully
                      // console.log(response)
                      return response;
                }   
                
               catch(error){
                    console.log("couldinary service::Error:",error.message)
                    return null;
               } 
}

module.exports={
    uploadImage,
    cloudinaryDeletFile
}

