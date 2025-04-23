const User = require("../model/user")
const jwt = require("jsonwebtoken");

const handleRefreshToken = async (req, res)=> {
    // const cookies = req.cookies;
    // console.log("cookie", cookies)

    // if(!cookies?.jwt) return res.sendStatus(401);

    // const refreshToken = cookies.jwt;

    // try{
    //     const foundUser = await User.findOne({refreshToken})
    //     if(!foundUser) return res.sendStatus(401)
        
    //     jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRETE, (err, decoded)=> {
    //         if( err || 
    //             decoded.userId !== foundUser._id.toString()
    //         ) return res.sendStatus(403)
    
    //         const accessToken = jwt.sign({userId: foundUser._id}, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: "30s"})
    //         res.status(200).json({accessToken})        
    //     })
    // }
    // catch(err){
    //     res.status(500).json({error: err.message})
    // }

    console.log("resvariable", res.locals.user);
    const accessToken = jwt.sign({userId: res.locals.user._id}, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: "2m"})
    res.status(200).json({accessToken})
}

module.exports = handleRefreshToken;