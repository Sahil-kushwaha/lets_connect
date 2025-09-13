const mongoose = require("mongoose")

const paymentSchema = new  mongoose.Schema({
        userId:{
            type:mongoose.Types.ObjectId,
            ref:"User",
            required:true
        },
        paymentId:{
           type:String,  
        },
        orderId:{
           type:String,
           required:true
        },
        currency:{
            type:String,
            required:true,
        },
        status:{
          type:String,
          required:true
        },
        amount:{
            type:Number,
            required:true,
        },
        reciept:{
           type:String,
           required:true,
        },
        notes:{
           firstName:{
              type:String,
           },
           lastName:{
              type:String
           },
           emailId:{
              type:String
           },
           membershipType:{
              type:String,
              required:true
           },
           membershipDuration:{
               type:String,
               enum:["Monthly","Yearly"]
           },
           membershipExpiry:{
             type:Date
           }
        }

},{timestamps:true})

   paymentSchema.index({orderId:1})
   const Payment =  mongoose.model("Payment",paymentSchema)

   module.exports=Payment
