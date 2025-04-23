const allowedOrigins = require("./allowedOrigins")

const corsOptions = {
    origin: (origin, callback)=> {
        console.log("origin", origin);
        console.log(allowedOrigins.indexOf(origin), "allow", allowedOrigins)
        if(allowedOrigins.indexOf(origin) !== -1){
            callback(null, true);
        }else{
            callback(new Error("not allowed by CORS"))
        }
    },
    optionsSuccessStatus: 200
}

module.exports = corsOptions;