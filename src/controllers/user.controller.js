const ConnectionRequest = require("../models/connectionRequest.model")
const ApiResponse = require("../utils/ApiResponse")
const {validateMongodbId} = require("../utils/validator")
const ApiError = require("../utils/ApiError")
const User = require("../models/user.model")
const sendEmail = require("../utils/sendEmail")

const connectionRequestSend = async function(req,res){
       try {
          
             const status = req.params.status
             const toUserId = req.params.userId
             const fromUserId = req.user._id
             validateMongodbId(toUserId)
               const allowedStatus =  ["ignored","interested"]
                if(!allowedStatus.includes(status)){
                   throw new ApiError(400,"invalid status")    
                  }
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
           const savedRequest = await newRequest.save()
           const populatedRequest = await ConnectionRequest.findById(savedRequest._id)
           .populate("fromUserId", "firstName lastName")
           .populate("toUserId", "firstName lastName emailId");

            // send Email to the requested user
            if(populatedRequest.status!="ignored")
               { 
                  const senderName = populatedRequest.fromUserId.firstName +" "+ (populatedRequest.fromUserId?.lastName ??"")
                  const recipientName = populatedRequest.toUserId.firstName +" "+populatedRequest.toUserId?.lastName ??""
                  const emailRes= await sendEmail(
                  "manishdwivedi2408@gmail.com", //SES testing (sandbox email)
                  "connectionRequest",
                  {
                     senderName,
                     recipientName,
                     recipientEmailId:toUserId.emailId
                  }
                  )
                 console.log(emailRes) 
               }
            res
            .status(201)
            .json(new ApiResponse(201,populatedRequest,`request has been sent:${status}`))
        
       } catch (error) {
         res
         .status(error.statusCode ||400)
         .json(new ApiError(error.statusCode || 400,error.message || "Error occured request has not been sent"))
      }
   }
   
const connectionRequestReview = async function(req,res){
       try {
                const {status,requestId} = req.params
                const loggedInuserId = req.user._id
                validateMongodbId(requestId)
                const allowedStatus =  ["rejected","accepted"]
                if(!allowedStatus.includes(status)){
                   throw new ApiError(400,"invalid status")    
                  }
                  const request = await ConnectionRequest.findOneAndUpdate(
                     {
                     _id:requestId,
                     toUserId:loggedInuserId,
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
                 .json(new ApiResponse(200,request,`request ${status}`)) 
                
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
               const loggedInuserId = req.user._id 
               
             // using populate and ref
              const allRequests = await ConnectionRequest.find({toUserId:loggedInuserId,status:"interested"})
                                  .populate("fromUserId","firstName lastName age gender avatarUrl skills about")
                                  .populate("toUserId" ,"firstName lastName age gender avatarUrl skills about")

            // using aggregation pipeline (it is used for complex query)
               // const allRequests = await ConnectionRequest.aggregate([
               //     {$match:{toUserId:loggedInuserId,status:"interested"}},
               //     {
               //       $lookup:{
               //          from:"users",
               //          localField:"fromUserId",
               //          foreignField:"_id",
               //          as:"fromUserData",  
               //          pipeline:[
               //           {
               //             $project:{
               //                "_id":0,
               //                "password":0,
               //                   
               //             }
               //          }
               //          ]
               //       },
               //     },
               //     {
               //        $lookup:{
               //          from:"users",
               //          localField:"toUserId",
               //          foreignField:"_id",
               //          as:"toUserData",
               //          pipeline:[
               //           {
               //             $project:{
               //                "_id":0,
               //                "password":0,
               //             }
               //          }
               //          ]
               //       }
               //     },
               //     {
               //       $project:{
               //          "_id":0,
               //          "fromUserId":0,
               //          "toUserId":0,
               //       }
               //     }
                   
               //    ])
               
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
                const allConnections = await ConnectionRequest.find({
                  $or:[
                        {fromUserId:userId,status:"accepted"},
                        {toUserId:userId,status:"accepted"}
                     ] 
                })
                .populate("fromUserId","firstName lastName age gender avatarUrl about")
                .populate("toUserId","firstName lastName age gender avatarUrl about")

                if(!allConnections || allConnections.length === 0) {
                   return res.status(200).json(new ApiResponse(200,[],"No connections found"))
                } 

                const connections= allConnections.map((connection) => {
      
                   if( connection.fromUserId._id.toString()===userId.toString()){
                      return connection.toUserId
                   }
                   return connection.fromUserId
                })
         

                res
                .status(200) 
                .json(new ApiResponse(200,connections,"all request fetched successfully"))
          } catch (error) {
               res
               .status(error?.statuCode || 500)
               .json(new ApiError(error.statusCode || 500,{},error.message || "server internal error "))
          }
}

const getFeeds = async function(req,res){

   try {
       // User should see all the user cards expect
       // 0. his own card
       // 1.his connections
       // 2.ignored people 
       // 3.already sent the connection request
      const loggedUserId = req.user._id
      const page = req.query.page ? parseInt(req.query.page) : 1
      let limit = req.query.limit ? parseInt(req.query.limit) : 10
      limit = limit > 50 ? 50 : limit // limit to 50
      const skip = (page - 1) * limit

      // find all connection requests (sent + received)
      const connectionRequest= await ConnectionRequest.find({
       $or: [
            { fromUserId: loggedUserId },  // request send by loggedin user (sent)
            { toUserId: loggedUserId }   // some send request to loggedin user (received)
          ]
      }).select("fromUserId toUserId");
      
     // id's must be hide from feeds
        const hideUserFromFeeds = new Set()
        connectionRequest.forEach(req => {
          hideUserFromFeeds.add(req.fromUserId.toString())
          hideUserFromFeeds.add(req.toUserId.toString())
        })

         const feeds = await User.find({
           $and: [ 
                  { _id: { $ne: loggedUserId } },
                  { _id: { $nin: Array.from(hideUserFromFeeds) } } 
               ]
          })
         .select("-password") // Exclude sensitive fields
         .skip(skip)
         .limit(limit)
         res
         .status(200)
         .json(new ApiResponse(200,feeds,"all feeds fetched successfully"))
     } catch (error) {
         res
         .status(error?.statuCode || 500)
         .json(new ApiError(error.statusCode || 500,{},error.message || "server internal error "))
     }
}

module.exports ={
     connectionRequestSend,
     connectionRequestReview,
     getRequests,
     getAllConnections,
     getFeeds
}

