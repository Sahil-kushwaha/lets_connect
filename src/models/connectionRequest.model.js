const mongoose = require("mongoose")


const connectionsRequestSchema = new mongoose.Schema({
         fromUserId:{
             type:mongoose.Types.ObjectId,
             require:true
         },
         toUserId:{
            type:mongoose.Types.ObjectId
         },
         status:{
            type:String,
            enum:{
                values:["ignored","interested","accepted","rejected"],
                message:"{VALUE} is not valid"
            }
         }
},{timestamps:true})

// restrict user don't send request to itself
connectionsRequestSchema.pre("save",function(next){
    const {fromUserId,toUserId} = this
    if(fromUserId.toString()===toUserId.toString()){
        throw new Error("you con't sent request to youself")
    }    
    next()
})

connectionsRequestSchema.index({fromUserId:1 ,toUserId:1})

const ConnectionRequest = mongoose.model("connectionRequest",connectionsRequestSchema)

module.exports = ConnectionRequest