const mongoose = require("mongoose")

const dbConn = async()=>{
    try{
        await mongoose.connect(process.env.DATABASE_URI, {
            UseUnifiedTopology: true,
            UseNewUrlParser: true
        })
    }
    catch(err){
        console.log("connection error: ", err)
    }
}

module.exports = dbConn