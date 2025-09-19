const Chat = require("../models/chat.model")
const ApiError = require("../utils/ApiError")
const ApiResponse = require("../utils/ApiResponse")

const logger = require("pino")()


const fetchAllChats = async(req,res)=>{
       try {
             const userId = req.user._id
             const {toUserId} = req.params
             const chats = await Chat.findOne({
                   participents:{
                     $all:[userId,toUserId]
                   }
             }).populate("messages.senderId","firstName lastName")
             
              res
              .status(200)
              .json(new ApiResponse(200,chats,"Chat fetched successfully"))

       } catch (error) {
           logger.info(error.message);
           res
           .status(error?.statusCode || 500)
           .json(
                new ApiError(
                  error?.statusCode || 500,
                  error.message || "something went wrong on fetching chats"
                )
            );
       }
}

module.exports={
     fetchAllChats
}