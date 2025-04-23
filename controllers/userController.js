const mongoose = require("mongoose")
const Post = require("../model/post");
const User = require("../model/user");
const {isValidObj} = require("../util/helper");
const bcrypt = require("bcrypt");

const getAccount = async(req, res)=>{
    const {username} = req.query;

    try{
        const foundedUser = await User
        .findOne({userName: username}, "-email -password -saveList -refreshToken")
        .populate([
            {
                path: "posts", 
                model: "Post", 
                select: "-content",
                options: {limit: 10},
                populate: "author"
            },
            {
                path: "followers", 
                model: "User", 
                select: "_id firstName lastName userName",
                options: {limit: 50}
            },
            {
                path: "following", 
                model: "User", 
                select: "_id firstName lastName userName",
                options: {limit: 50}
            }
        ])
        .exec();

        if(!foundedUser) return res.status(400).json({errorMsg: "This is account not found"})
        console.log("foundedAccount", foundedUser);

        return res.status(200).json({...foundedUser._doc})
    }
    catch(err){
        console.log("err in getmyAccount", err)
        return res.sendStatus(500)
    }
}

const getMyAccount = async(req, res)=>{
    const {username} = req.query;

    try{
        const foundedUser = await User
        .findOne({userName: username}, "-email -password -saveList -refreshToken")
        .populate([
            {
                path: "posts", 
                model: "Post", 
                select: "-content",
                options: {limit: 10},
                populate: "author"
            },
            {
                path: "followers", 
                model: "User", 
                select: "_id firstName lastName userName",
                options: {limit: 50}
            },
            {
                path: "following", 
                model: "User", 
                select: "_id firstName lastName userName",
                options: {limit: 50}
            }
        ])
        .exec();

        if(!foundedUser) return res.status(400).json({errorMsg: "This is account not found"})
        console.log("foundedAccount", foundedUser);

        return res.status(200).json({...foundedUser._doc})
    }
    catch(err){
        console.log("err in getmyAccount", err)
        return res.sendStatus(500)
    }
}

const getAccountInfo = async (req, res)=>{
    const {userName} = req.query;

    try{
        const [foundedUser] = await User
        .find({userName}, "-email -password -saveList -refreshToken")
        .exec();

        if(!foundedUser) return res.sendStatus(404)
       
        console.log("foundedUser: ",foundedUser)
        return res.status(200).json({...foundedUser._doc})
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const getMyAccountInfo = async (req, res)=>{
    const user = res.locals.user
    console.log("user", user)

    try{
        const {refreshToken, password, ...restUserInfo} = user._doc
        
        return res.status(200).json({...restUserInfo})
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const editAccount = async(req, res)=>{
    const { 
        quoraLink, 
        redditLink,
        youtubeLink,
        facebookLink, 
        twitterLink,
        password, 
        ...restUserInformation
    } = req.body

    const user = res.locals.user
    console.log("user", user)

    try{
        const socialLinks = {"quora": quoraLink, "reddit": redditLink, "youtube": youtubeLink, "facebook": facebookLink, "twitter": twitterLink}
        if(password){
            const hashedPassword = await bcrypt.hash(password, 12);

            const allUserData = {...user._doc, ...restUserInformation, socialLinks, "password": hashedPassword}
            const updatededUser = await User.findByIdAndUpdate(user._id, {...allUserData});
            // const updatededUser = await user.save();
            console.log("updated User: ", updatededUser)
            return res.sendStatus(201);
        }

        const allUserData = {...user._doc, ...restUserInformation, socialLinks}
        const updatededUser = await User.findByIdAndUpdate(user._id, {...allUserData});
        // const updatededUser = await user.save();
        console.log("updated User: ", updatededUser)
        res.sendStatus(201)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const getPosts = async(req, res)=>{
    const user = res.locals.user
    console.log("user", user)

    try{
        const foundedPosts = await Post
        .find({_id: user._id}, "-content -comments")
        .populate("author", "firstName lastName userName")
        .exec();

        if(!foundedPosts.length) return res.sendStatus(404)

        res.status(200).json({"posts": foundedPosts})

        console.log("posts: ",foundedPosts)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const getMyPosts = async(req, res)=>{
    const {skip, limit} = req.query;
    const user = res.locals.user
    console.log("user in getMyPosts", user)
    
    try{
        const foundedPosts = await Post
        .find({author: user._id}, "-content -comments", {skip, limit})
        .populate("author", "firstName lastName userName")
        .exec();

        if(!foundedPosts.length) return res.status(200).json({"posts": foundedPosts})

        res.status(200).json({"posts": foundedPosts})
        console.log("posts: ",foundedPosts)
    }
    catch(err){
        console.log("error in getMyPosts", err)
        return res.sendStatus(500)
    }
}

const getUserPosts = async(req, res)=>{
    const {userName} = req.params
    const {skip, limit} = req.query;
    // console.log("userName", userName)

    try{
        const [foundedUser] = await User
        .find({userName}, "-email -password -saveList -refreshToken")
        .exec();

        if(!foundedUser) return res.status(404).send("user not found")

        const foundedPosts = await Post
        .find({author: foundedUser._id}, "-content -comments", {skip, limit})
        .populate("author", "firstName lastName userName")
        .exec();

        if(!foundedPosts.length) return res.status(200).json({"posts": foundedPosts})

        res.status(200).json({"posts": foundedPosts})
        console.log("posts: ",foundedPosts)
    }
    catch(err){
        console.log("error in getUsersPosts", err)
        return res.sendStatus(500)
    }
}

const getSaveListPosts = async(req, res)=>{
    const user = res.locals.user
    console.log("user", user)

    try{
        const foundedPosts = await Post
        .find({_id: user._id}, "-content -comments")
        .populate("author", "firstName lastName userName")
        .exec();
        
        if(!foundedPosts.length) return res.sendStatus(204)

        res.status(200).json({"posts": foundedPosts})

        console.log("posts: ",foundedPosts)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const addToSaveList = async(req, res)=>{
    const postId = req.params.postId
    const user = res.locals.user
    const userId = user._id

    if(!postId || !userId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId).exec();
        
        if(!foundedPost) return res.sendStatus(204);

        const saveList = user.saveList;

        const isPostInSaveList = saveList.some(post => post.toString() === postId)
        let newSaveList = [...saveList]

        if(isPostInSaveList){
            newSaveList = saveList.filter(post => post.toString() !== postId)
        }
        else{
            newSaveList.push(mongoose.Schema.ObjectId(postId));
        }

        const updatededUser = {...user, "saveList": [...newSaveList]}
        await user.save();
        console.log("updatedPost", updatededUser)

        res.sendStatus(200)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const follow = async(req, res)=>{
    const accountId = req.params.accountId
    const user = res.locals.user
    const userId = user._id
    console.log("in follow: accountId", accountId, "userId", userId, res.locals)
    if(!accountId || !userId) return res.status(400).json({errorMsg: "Missing accountId or userId"})

    try{
        const foundedAccount = await User.findById(accountId).exec();
        
        if(!foundedAccount) return res.status(400).json({errorMsg: "This account not found"});

        const isAccountInFollowingList = user.following.some(accountId => accountId.toString() === foundedAccount._id.toString())
        
        if(isAccountInFollowingList){
            return res.status(400).json({errorMsg: "You are already follow this account"});
        }

        foundedAccount.followers.push(userId);
        foundedAccount.followers_count += 1; 
        user.following.push(foundedAccount._id);
        user.following_count += 1;
        await Promise.all([foundedAccount.save(),user.save()])
        const {_id, vector, firstName, lastName, userName} = foundedAccount._doc;
        res.status(200).json({followedAccount: {_id, firstName, lastName, vector, userName}})
    }
    catch(err){
        console.log("error in follow: ", err);
        return res.sendStatus(500)
    }
}

const unfollow = async(req, res)=>{
    const accountId = req.params.accountId
    const user = res.locals.user
    const userId = user._id.toString()

    if(!!!accountId || !!!userId) return res.status(400).json({errorMsg: "Missing accountId or userId"})

    try{
        const foundedAccount = await User.findById(accountId).exec();
        
        if(!foundedAccount) return res.status(400).json({errorMsg: "This account not found"});

        const isAccountInFollowingList = user.following.some(accountId => accountId.toString() === foundedAccount._id.toString())
        
        if(!isAccountInFollowingList){
            return res.sendStatus(400);
        }

        foundedAccount.followers = foundedAccount.followers.filter(followerId => followerId.toString() !== userId);
        foundedAccount.followers_count -= 1;
        user.following = user.following.filter(accountId => accountId.toString() !== foundedAccount._id.toString());
        user.following_count -= 1;
        await Promise.all([foundedAccount.save(),user.save()])

        res.status(200).json({accountId: foundedAccount._id, followerId: userId})
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const block = async(req, res)=>{
    const accountId = req.params.accountId
    const user = res.locals.user
    const userId = user._id.toString()

    if(!accountId || !userId) return res.status(400).json({errorMsg: "Missing accountId or userId"})

    try{
        const foundedAccount = await User.findById(accountId).exec();
        
        if(!foundedAccount) return res.status(400).json({errorMsg: "This account not found"});

        const isAccountInFollowerList = user.followers.some(followerId => followerId.toString() === foundedAccount._id.toString())    
        if(!isAccountInFollowerList){
            return res.sendStatus(400);
        }

        const isAccountInBlockList = user.blockList.some(userId => userId === foundedAccount._id.toString())
        if(isAccountInBlockList){
            return res.sendStatus(400);
        }

        foundedAccount.following = foundedAccount.following.filter(accountId => accountId.toString() !== userId);
        foundedAccount.following_count -= 1
        user.followers = user.followers.filter(followerId => followerId.toString() !== foundedAccount._id.toString())
        user.followers_count -= 1
        user.blockList.push(foundedAccount._id);
        await Promise.all([foundedAccount.save(),user.save()])
        
        res.sendStatus(200)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const search = async(req, res)=>{
    const keyword = req.query.keyword.toLowerCase()
    // const user = res.locals.user
    // const userId = user._id.toString()

    if(!!!keyword) return res.status(400).json({errorMsg: "Missing keyword query"})
    // console.log("keyword", keyword)
    try{
        const users = await User.find({$text: {$search: keyword}}).exec();
        
        res.status(200).json({users})
    }
    catch(err){
        return res.sendStatus(500)
    }
}


module.exports = {getAccount, getMyAccount,getAccountInfo, getMyAccountInfo, editAccount, getMyPosts, getUserPosts, getPosts, getSaveListPosts, addToSaveList, follow, unfollow, block, search};