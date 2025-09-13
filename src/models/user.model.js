const mongoose = require("mongoose")
const isEmail = require('validator/lib/isEmail')
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")

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
          min:18,
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
          type: String,
          default:"https://cdn.vectorstock.com/i/500p/46/76/gray-male-head-placeholder-vector-23804676.jpg"
       },
       about:{ 
         type :String
       },
       skills:{
         type:[String]
       },
       isPremium:{
          type:Boolean,
          default:false 
       },
       membershipType:{
          type:String,
          default:"free"
       }

},{timestamps:true})

userSchema.methods.isPasswordCorrect = async function(password){
         const user = this
         const hashPassord = user.password
         return await bcrypt.compare(password,hashPassord)

}

userSchema.methods.generateAccessToken = async function (){
     const user = this
     const accessToken  = await jwt.sign({_id:user._id},process.env.JWT_SECRET,{expiresIn:process.env.ACCESS_TOKEN_EXPIRY} )   
     return accessToken      
}

// userSchema.methods.generateRefreshToken = async function(){
//      const user = this
//      const refreshToken = await jwt.sign({id:user._id} ,process.env.JWT_SECRET,{expiresIn:process.env.REFRESH_TOKEN_EXPIRY})
//      return refreshToken
// }

const User = mongoose.model("User",userSchema)

module.exports = User