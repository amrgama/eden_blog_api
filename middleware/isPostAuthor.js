const Post = require("../model/post");
const User = require("../model/user")
const jwt = require("jsonwebtoken");

const isPostAuthor = async (req, res, next)=> {
    const {postId} = req.query;
    const cookies = req.cookies;
    console.log("cookie", cookies)

    if(!cookies?.jwt) {
        req.hasAccount= false;
        req.isPostAuthor= false;
        return next();
    };

    const refreshToken = cookies.jwt;

    try{
        const foundUser = await User.findOne({refreshToken})
        if(!!!foundUser) {
            req.hasAccount= false;
            req.isPostAuthor= false;
        }else{
            
            req.post = await Post.findById(postId).exec();    
            // console.log("req.post?.author == foundUser._id", req.post?.author, foundUser._id)
            req.hasAccount= true;
            req.isPostAuthor= req.post?.author?.toString() == foundUser?._id?.toString();
        }
        next();
    }
    catch(err){
        console.log("err",err)
        next(err);
    }
}

module.exports = isPostAuthor;