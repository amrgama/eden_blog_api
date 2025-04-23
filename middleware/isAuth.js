const User = require("../model/user")
const jwt = require("jsonwebtoken");

const isAuth = async (req, res, next)=> {
    const cookies = req.cookies;
    console.log("cookie", cookies)

    if(!cookies?.jwt) return res.sendStatus(401);

    const refreshToken = cookies.jwt;

    try{
        const foundUser = await User.findOne({refreshToken})
        if(!foundUser) return res.sendStatus(401)
        
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE, (err, decoded)=> {
            if( err || 
                decoded.userId !== foundUser._id.toString()
            ) {
                console.log("decoded", decoded.userId, "_id", foundUser._id.toString())
                return res.sendStatus(403)
            }

            res.locals.user = foundUser;
            next();
        })
    }
    catch(err){
        console.log("err",err)
        res.status(500).json({error: err.message})
    }
}

module.exports = isAuth;