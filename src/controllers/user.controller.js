const ConnectionRequest = require("../models/connectionRequest.model")
const ApiResponse = require("../utils/ApiResponse")
const {validateMongodbId} = require("../utils/validator")
const ApiError = require("../utils/ApiError")
const User =require("../models/user.model")

const connectionRequestSend = async function(req,res){
       try {
          
             const status = req.params.status
             const toUserId = req.params.userId
             const fromUserId = req.user._id
             validateMongodbId(toUserId)
             // check already existance of request
             const request = await ConnectionRequest.findOne({$or:[
               {
                     fromUserId,
                     toUserId
               },
               {
                     fromUserId:toUserId,
                     toUserId:fromUserId
               }
            ]})
            if(request){
               throw new ApiError(400,"connection request already sent")
            }
            const newRequest = new ConnectionRequest({
                    fromUserId,
                    toUserId,
                    status
            })
            await newRequest.save()
            res
            .status(201)
            .json(new ApiResponse(201,newRequest,`request has been sent:${status}`))
        
       } catch (error) {
         res
         .status(error.statusCode ||400)
         .json(new ApiError(error.statusCode || 400,error.message || "Error occured request has not been sent"))
      }
   }
   
   const connectionRequestReview = async function(req,res){
       try {
                const {status,requestId} = req.params
                const userId = req.user._id
                validateMongodbId(requestId)
                const allowedStatus =  ["reject","accept"]
                if(!allowedStatus.includes(status)){
                   throw new ApiError(400,"invalid status")    
                  }
                  const request = await ConnectionRequest.findOneAndUpdate(
                     {
                     _id:requestId,
                     toUserId:userId,
                     status:"interested"
                    },
                     {$set:{status:status}},
                     {runValidators:true,new:true}
                  )
                if(!request){
                   throw new ApiError(404,"connection request not found")
                }  
                 res
                 .status(200)
                 .json(new ApiResponse(200,request,`request ${status}ed`)) 
                
        } 
       catch (error) {
         res
         .status(error.statuCode ||400)
         .json(new ApiError(error.statusCode || 400,error.message || "Error occured while reviewing request"))
       }
}

const getRequests = async function(req,res){
        try {
              // loggedin User id
               const userId = req.user._id 
               const allRequests = await ConnectionRequest.aggregate([
                   {$match:{toUserId:userId,status:"interested"}},
                   {
                     $lookup:{
                        from:"users",
                        localField:"fromUserId",
                        foreignField:"_id",
                        as:"fromUserData",
                        pipeline:[
                         {
                           $project:{
                              "password":0,
                              "skills":0,
                              "about":0
                              
                           }
                        }
                        ]
                     },
                   },
                   {
                      $lookup:{
                        from:"users",
                        localField:"toUserId",
                        foreignField:"_id",
                        as:"toUserData",
                        pipeline:[
                         {
                           $project:{
                              "password":0,
                              "about":0,
                              "skills":0
                           }
                        }
                        ]
                     }
                   },
                   {
                     $project:{
                        "fromUserId":0,
                        "toUserId":0,
                     }
                   }
                   
                  ])
               
               res
               .status(200)
               .json(new ApiResponse(200,allRequests,"all request fetched successfully"))
               
         } 
         catch (error) {
                res
                .status(error?.statuCode || 500)
                .json(new ApiError(error.statusCode || 500,error.message || "server internal error "))
              }
}

const getAllConnections = async function(req,res){
          try {
                const userId = req.user._id
                const allCollections = await ConnectionRequest.find({
                  $or:[
                        {fromUserId:userId,status:"accepted"},
                        {toUserId:userId,status:"accepted"}
                     ] 
                })
                res
                .status(200)
                .json(200,allCollections,"all request fetched successfully")
          } catch (error) {
               res
               .status(error?.statuCode)
               .json(new ApiError(error.statusCode || 500,{},error.message || "server internal error "))
          }
}

module.exports ={
     connectionRequestSend,
     connectionRequestReview,
     getRequests,
     getAllConnections
}

