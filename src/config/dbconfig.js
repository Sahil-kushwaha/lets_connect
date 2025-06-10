const mongoose  = require("mongoose");

const connectDB = async () =>{
     
    try {
          await mongoose.connect(process.env.MONGODB_URL+"/devTinder")
          mongoose.connection.on("error" ,(err)=>{throw new Error(err.message)})
          console.log(`\nMongoDB connected !! DB HOST : ${mongoose.connection.host} `)
          
    } catch (error) {
        console.log("Error in DB Connection::"+error.message )
        process.exit(1);
    }
}

module.exports = connectDB;