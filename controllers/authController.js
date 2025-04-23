const User = require(`../model/user.js`)
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const handleLogIn = async (req, res)=> {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({error: "user email and user passowrd are required"})
    }

    try{
        const foundedUser = await User.findOne({email})
        if(!!!foundedUser) return res.status(401).json({errorMsg: "This email not found"})
        console.log("logged foundedUser", foundedUser);
        const pwdMatched = await bcrypt.compare(password, foundedUser.password)
        console.log("matched", pwdMatched)
        if(pwdMatched){
    
            const accessToken = jwt.sign({userId: foundedUser._id}, process.env.ACCESS_TOKEN_SECRETE, {expiresIn: "2m"})
            const refreshToken = jwt.sign({userId: foundedUser._id}, process.env.REFRESH_TOKEN_SECRETE, {expiresIn: "1d"})
    
            const user = await foundedUser.populate([
                {path: "following", model: "User", select: "_id firstName lastName userName"}, 
                {path: "followers", model: "User", select: "_id firstName lastName userName"}
            ])
            // .populate("followers", "_id firstName lastName userName")
            // .populate("blockList").exec();
            console.log("loggedUser: ", user); 

            user.refreshToken = refreshToken
            await user.save()
            // console.log("updatedUser", updatedUser)
            
            res.cookie("jwt", refreshToken, {httpOnly: true, sameSite: "None", secure: true, maxAge: 24 * 60 * 60 * 1000})
            // res.cookie("jwt", refreshToken, {httpOnly: true, maxAge: 24 * 60 * 60 * 1000})
            const {_id, firstName, lastName, userName, email, following, followers, blockList} = user
            res.status(200).json({
                id: _id, 
                firstName, 
                lastName, 
                userName, 
                email,
                following,
                followers,
                blockList, 
                accessToken, 
                accessTokenDur: 24 * 60 * 60 * 1000
            })
        } 
        else{
            return res.sendStatus(401)
        }
    }
    catch(err){
        return res.status(500).json({error: err.message})
    }
}

const handleLogOut = async (req, res)=> {
    const cookies = req.cookies;
    // console.log("cookie", cookies)

    if(!cookies?.jwt) {
        return res.sendStatus(204);
    }

    const refreshToken = cookies.jwt;

    try{
        const foundUser = await User.findOne({refreshToken})
        if(!foundUser) {
            res.clearCookie("jwt", {httpOnly: true, sameSite: "None", secure: true});
            return res.sendStatus(204);
        }
        
        const updatedUser = await User.updateOne({refreshToken}, {refreshToken: ""})

        res.clearCookie("jwt", {httpOnly: true, sameSite: "None", secure: true});
        // res.cookie("jwt", refreshToken, {httpOnly: true})
        res.sendStatus(204)
        // console.log("updatedUser: ", updatedUser, "users: ", otherUsers)
    }
    catch(err){
        console.log("logOut error: ", err.message);
        res.status(500).json({error: err.message})
    }
}

module.exports = {handleLogIn, handleLogOut};