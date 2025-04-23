const allowedOrigins = require("../config/allowedOrigins");

const credentials = (req, res, next)=>{
    const origin = req.headers.origin;
    if(allowedOrigins.indexOf(origin) !== -1){
        // res.headers('Access-Control-Allow-Credentials', true);
        res.set({
            'Access-Control-Allow-Credentials': "true",
        })
    }
    next();
}

module.exports = credentials;