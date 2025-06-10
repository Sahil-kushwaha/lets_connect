const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
       firstName:{
         type:String,
         require:true
       },
       lastName:{
          type:String,
          require:true
       },
       emailId:{
         type:String,
         require: true,
         unique:true
       },
       password:{
          type: String
       },
       age:{
          type:Number,

       },
       gender:{
          type: String
       }       
},{timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User