const mongoose = require("mongoose")
const isEmail = require('validator/lib/isEmail')

const userSchema = new mongoose.Schema({
       firstName:{
         type:String,
         require:true,
         minLength:2
       },
       lastName:{
          type:String,
       },
       emailId:{
         type:String,
         require: true,
         unique:true,
         lowercase:true,
         validate(value){
           if(!isEmail(value)){
            throw new Error("Enter valid mail")
           }
         }
       },
       password:{
          type: String,
          required:true
       },
       age:{
          type:Number,
          max:80
       },
       gender:{
          type: String,
          validate(data){
           if(!["male" ,"female","other"].includes(data)){
              throw new Error("Gender is not valid")
           }
          }
       },
       avatarUrl:{
          type: String
       },
       about:{
         type :String
       },
       skills:{
         type:[String]
       }

},{timestamps:true})

const User = mongoose.model("User",userSchema)

module.exports = User