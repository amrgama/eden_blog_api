const jwt = require("jsonwebtoken");
require("dotenv").config()

const verfiyJWT = (req, res, next)=> {
    const authHeader = req.headers["authorization"];
    console.log("authheader", authHeader);

    if(!authHeader) return res.sendStatus(401);

    const accessToken = authHeader.split(" ")[1];

    jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRETE, (err, decoded)=>{
        if(err) return res.sendStatus(403)
        next()
    })
}

module.exports = verfiyJWT