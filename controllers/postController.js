const mongoose = require("mongoose")
const Post = require("../model/post");
const User = require("../model/user");
const Comment = require("../model/comment")
const Reply = require("../model/reply")
const NestedReply = require("../model/nestedReply")
const {isValidObj, removeFile} = require("../util/helper");
const fs = require("fs")
const path= require("path");
const { SendedPost, FetchPost } = require("../util/post");

const createPost = async(req, res)=>{
    const {title, image, content, category, isPrivate} = req.body
    const user = res.locals.user;

    if(!!!title || !!!image || !!!content || !!!category){
        return res.sendStatus(400)
    }

    try{

        const post = await Post.create({
            ...req.body,
            isPrivate: isPrivate || false,
            author: user._id
        })
        user.posts.push(post._id);
        user.posts_count += 1;
        await user.save();
        res.status(201).json("Article created successfully")
    }
    catch(err){
        return res.sendStatus(500)
    }

}

const getPosts = async(req, res)=>{
    try{
        const foundedPosts = await Post.find({}, "-content -comments")
        .populate("author", "firstName lastName userName").exec();

        if(!foundedPosts.length) return res.sendStatus(204)

        res.status(200).json({"posts": foundedPosts})
        console.log("posts: ",foundedPosts)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const getPostsByQuery = async(req, res)=>{
    const query = req.query
    console.log("query in getPostsByQuery", query)

    const {limit, skip, ...findByQuery}= query;
    
    const validObjKey = ['category', 'cat', 'tag', "createdAt"];

    const validQuery = isValidObj(findByQuery, validObjKey)
    
    if(!validQuery || !!!limit || !!!skip) return res.sendStatus(400)
        console.log("findByQuery>>", findByQuery);
    try{
        const foundedPosts = await Post.find(findByQuery, "-content -comments", {limit, skip})
        .populate("author", "firstName lastName userName").exec();

        if(!foundedPosts.length) return res.status(200).json({"posts": []})

        res.status(200).json({"posts": foundedPosts})
        console.log("posts in getPostsByQuery: ",foundedPosts)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const getPostById = async(req, res)=>{
    const postId = req.params.id;
    console.log("ingetPostId postId: ", postId)

    // const query = req.query
    // console.log("query", query)

    if(!postId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId)
        .populate("author","_id vector firstName lastName userName bio socialLinks")
        .populate("reactionList", "firstName lastName userName")
        .populate("saveList", "firstName lastName userName")
        .populate({
            path: "comments.values",
            options: {limit: 1},
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies",
                model: "Reply",
            },
            {
                path: "replies.replyTo",
                model: "User",
                select: "firstName lastName"
            }]
        }).exec();

        if(!foundedPost) return res.sendStatus(204)

        const sendedComments = {...foundedPost._doc?.comments}
        sendedComments.values = sendedComments?.values?.map(comment =>{
            console.log("comment in sendedComments", comment)
            const {replies, ...rest} = comment._doc;
            // const firstReply = replies?.at(0);
            // const numOfReplies = replies?.length;

            // const mainReplies = replies.filter(reply =>{
            //     const castedReplyToIdVal = reply.replyTo._id.toString();
            //     const castedUserIdVal = comment.userId._id.toString();

            //     return castedUserIdVal === castedReplyToIdVal;
            // })
        
            // const numOfMainReplies = mainReplies.length
            // const sendedReplies = {
            //     values: [firstReply],
            //     count: numOfMainReplies
            // }
            const numOfMainReplies = replies.length;
            return {"value": {...rest}, numOfMainReplies }
        })

        const sendedPost = {
            ...foundedPost._doc,
            "comments": {...sendedComments}
        }

        res.status(200).json({...sendedPost})

        // console.log("sendedPost: ",sendedPost)
    }
    catch(err){
        console.log("err: ", err)
        return res.sendStatus(500)
    }
}

const getUserPosts = async(req, res)=>{
    const {userId, skip, limit} = req.query;

    console.log("in get user posts: userId", userId, "query:", skip, limit)
    if(!!!userId) return res.status(400).json("Missing userId")
    try{
        const foundedPosts = await Post
        .find({author: new mongoose.Types.ObjectId(userId), isPrivate: false})
        .populate("author", "_id firstName lastName userName")
        .limit(limit ?? 1)
        .skip(skip ?? 0)
        .exec();

        console.log("posts: ",foundedPosts)
        if(!!!foundedPosts.length) return res.status(200).json({"posts": []})

        res.status(200).json({"posts": foundedPosts})
    }
    catch(err){
        return res.sendStatus(500)
    }
}


const editPost = async(req, res)=>{
    const postId = req.params.id
    console.log("postId", postId)

    const{title, image, content, category, tags, isPrivate} = req.body

    if(!!!postId || !!!title || !!!image || !!!content || !!!category) return res.sendStatus(400)

    try{
        
        const foundedPost = await Post.findById(postId).exec();

        if(!foundedPost) return res.sendStatus(400);

        if(foundedPost.image !== image){
            const imageName = foundedPost.image.split("/").at(-1);
            console.log("imageName", imageName)
            const prevImagePath = path.join(__dirname, "..", "/public/uploads", "/", imageName)
            console.log("imagePath", prevImagePath);
            
            removeFile(prevImagePath)
        }

        foundedPost.updateOne({...req.body, isPrivate: isPrivate ?? false}).exec()
       
        // {...foundedPost, title, image, desc, content, category, tags, isPrivate: isPrivate || false}
        // await updatededPost.save();
        // console.log("updatedPost", updatededPost)

        res.sendStatus(200)
        // .json({updatededPost})
    }
    catch(err){
        console.log("server error in editePost: ", err)
        return res.sendStatus(500)
    }
}

const deletePost = async(req, res)=>{
    const postId = req.params.id
    console.log("postId", postId)
    const user = res.locals.user;

    if(!postId) return res.sendStatus(400)
    
    const foundedPost = await Post.findById(postId);
    if(!foundedPost) return res.sendStatus(400);

    try{
        // const deletedPost = await Post.findByIdAndDelete(postId).exec();

        const imageName = foundedPost.image.split("/").at(-1);
        console.log("imageName", imageName)
        const prevImagePath = path.join(__dirname, "..", "/public/uploads", "/", imageName)
        console.log("imagePath", prevImagePath);
        
        removeFile(prevImagePath)

        foundedPost.deleteOne()
        user.posts_count -= 1;
        await user.save();
        res.sendStatus(204)
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const reactOnPost = async(req, res)=>{
    const {postId, userId} = req.query;
    console.log("postId", postId, "userId", userId)
    if(!postId || !userId) return res.sendStatus(400)

    try{        
        const foundedPost = await Post.findById(postId).exec();
        if(!foundedPost) return res.sendStatus(204);

        // e226e9cf-53e
        const dblUser = foundedPost?.reactionList?.some(user => user.toString() === userId)
        if(dblUser){
            foundedPost.reactionList = foundedPost?.reactionList?.filter(user => user.toString() !== userId)
        }
        else{
            foundedPost.reactionList.push(new mongoose.Types.ObjectId(userId))
        }

        // foundedPost.reactionList = [];

        const updatededPost = await foundedPost.save();
        console.log("updatedPost in react", updatededPost)
        
        const reactionList= (await updatededPost.populate("reactionList", "_id firstName LastName userName")).$getPopulatedDocs();

        res.status(200).json({reactionList})
    }
    catch(err){
        console.log("err in react", err)
        return res.sendStatus(500)
    }
}

const addToSaveList = async(req, res)=>{
    const postId = req.params.id
    const user = res.locals.user
    const userId = user._id

    if(!postId || !userId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId).exec();
        
        if(!foundedPost) return res.sendStatus(204);

        const saveList = foundedPost.saveList;

        const isUserInSaveList = saveList.some(user => {
            console.log("types", user, "id", userId)
            return user.toString() === userId.toString()
        })

        console.log("isUserInSaveList", isUserInSaveList)
        let newSaveList = [...saveList]

        if(isUserInSaveList){
            foundedPost.saveList = saveList.filter(user => user.toString() !== userId.toString())
            user.saveList = user.saveList.filter(post => post.toString() !== postId)
        }
        else{
            foundedPost.saveList.push(userId)
            user.saveList.push(new mongoose.Types.ObjectId(postId))
        }

        // const updatededPost= structuredClone(foundedPost);
        // updatededPost = {...updatededPost, "saveList": [...newSaveList]}
        const updatededPost = await foundedPost.save();
        console.log("updatedPost in save", updatededPost)
        const updatededUser = await user.save()

        res.status(200).json({users: updatededPost.populate("saveList", "firstName LastName userName")})
    }
    catch(err){
        return res.sendStatus(500)
    }
}

const createUserComment = async(req, res)=>{
    const postId = req.params.id;
    const {content, replayTo} = req.body;
    const userId = res.locals.user._id;
    console.log("postId", postId, "userId", userId, "content", content, "replayTo", replayTo)
    if(!postId || !userId || !content) return res.sendStatus(400)

    try{        
        const foundedPost = await Post.findById(postId).exec();
        if(!foundedPost) return res.sendStatus(204);

        if(replayTo){
            const user = new mongoose.Types.ObjectId(userId);
            const comment= {userId: user, content, replayTo, "date": Date.now()}
            foundedPost.comments.users.push(comment);
        }
        else{
            const user = new mongoose.Types.ObjectId(userId);
            // const comment= {userId: user, content, "date": Date.now()}
            const comment= {userId: user, content}
            const newComment = await Comment.create(comment)
            const commentsCount = foundedPost.comments.count;
            foundedPost.comments.count = (commentsCount)? commentsCount + 1: 1;
            // foundedPost.comments.users.push(comment);
            foundedPost.comments.values.push(newComment._id);
        }

        // foundedPost.comments = [];

        const updatededPost = await foundedPost.save();
        console.log("updatedPost in react", updatededPost)
        
        const comments= (await updatededPost.populate("comments.values.userId", "_id firstName LastName userName")).comments;
        console.log("userComments", comments);
    
        res.status(200).json({...comments})
    }
    catch(err){
        console.log("err in add comment", err)
        return res.sendStatus(500)
    }
}

const createReplyToComment = async(req, res)=>{
    const postId = req.params.id;
    const commentId = req.params.commentId;
    const {content} = req.body;
    const userId = res.locals.user._id;
    console.log("postId", postId, "commentId", commentId, "userId", userId, "content", content)
    if(!postId || !commentId || !userId || !content) return res.sendStatus(400)

    try{        
        const foundedPost = await Post.findById(postId)
        .populate({
            path: "comments.values",
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            }]
        })
        .exec();
        if(!foundedPost) return res.sendStatus(404);

        const foundedComments = foundedPost?.comments?.values.filter(comment =>{
            return comment._id.toString() === commentId;
        })

        if(!foundedComments[0]) return res.sendStatus(404)

        const user = new mongoose.Types.ObjectId(userId);
        const reply= {commentId, userId: user, content}
        const newReply = await Reply.create(reply);
  
        console.log("foundedComment", foundedComments[0])
        foundedComments[0]?.replies?.push(newReply._id);

        const updatededComment = await foundedComments[0].save();
        console.log("updatededComment in create reply", updatededComment)
        
        const sendedReply= newReply.populate([
            {
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            }
        ]);
        
        res.status(200).json({...sendedReply._doc})
    }
    catch(err){
        console.log("err in add reply to comment", err)
        return res.sendStatus(500)
    }
}

const getCommentMainReplies = async(req, res)=>{
    const {id: postId, commentId} = req.params
    const query = req.query;
    console.log("in get reply PostId ", postId, "commentId", commentId, "query", query)

    if(!postId || !commentId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId)
        .populate({
            path: "comments.values",
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies",
                model: "Reply",
                options: {...query},
                populate: [{
                    path: "userId",
                    model: "User",
                    select: "firstName lastName userName"
                }]
            }]})
        .exec();

        if(!foundedPost) return res.sendStatus(404)

        const foundedComments = foundedPost?.comments?.values.filter(comment =>{
            console.log("commentId", commentId, "_id", comment._id)
            return comment._id.toString() === commentId;
        })

        console.log("foundedComment", foundedComments, "foundedComment", foundedComments[0]);
        if(!foundedComments[0]) return res.sendStatus(404)

        const mainReplies = foundedComments[0]
        .replies
        .map(reply =>{
     
            const {nestedReplies, ...rest} = reply._doc;
            const numOfNestedReplies = nestedReplies.length;
            return {...rest, numOfNestedReplies}
         })
        
        const numOfMainReplies = mainReplies.length;
        const sendedReplies = {commentId , "values": [...mainReplies], "count": numOfMainReplies}
        console.log("sendedReplies", sendedReplies);
        res.status(200).json({...sendedReplies})
    }
    catch(err){
        console.log("err: ", err)
        return res.sendStatus(500)
    }
}

const createReplyToReply = async(req, res)=>{
    const {id: postId, commentId, replyId} = req.params;
    const {content, replyToId} = req.body;
    const userId = res.locals.user._id;
    console.log("postId", postId, "commentId", commentId, "userId", userId, "content", content, "replyId", replyId, "replyToId", replyToId)
    if(!postId || !commentId || !replyId || !replyToId || !userId || !content) return res.sendStatus(400)

    try{        
        const foundedPost = await Post.findById(postId)
        .populate({
            path: "comments.values",
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },{
                path: "replies",
                model: "Reply",
                populate: {
                    path: "nestedReplies",
                    model: "NestedReply"
                }
            }]
        })
        .exec();
        if(!foundedPost) return res.sendStatus(404);

        const foundedComment = foundedPost?.comments?.values.find(comment =>{
            return comment._id.toString() === commentId;
        })

        if(!foundedComment) return res.sendStatus(404)

        const foundedReply = foundedComment?.replies.find(reply =>{
            return reply._id.toString() === replyId
        })

        if(!foundedReply) return res.sendStatus(404)
        console.log("foundedReply", foundedReply)

        if(replyId !== replyToId){
            const foundedNestedReply = foundedReply.nestedReplies.find(nestedReply =>{
                return nestedReply._id.toString() === replyToId
            })

            if(!foundedNestedReply) return res.sendStatus(404)
        }

        const user = new mongoose.Types.ObjectId(userId);
      
        const _replyToReplyId = new mongoose.Types.ObjectId(replyId);
        const _replyToNestedReplyId = new mongoose.Types.ObjectId(replyToId);
        const _mainReplyId = (replyId === replyToId)? _replyToReplyId : undefined;
        const _nestedReplyId = (replyId !== replyToId)? _replyToNestedReplyId : undefined;
        console.log("_mainReplyId", _mainReplyId, "_nestedReplyId", _nestedReplyId )

        const nestedReply= {  
                            userId: user, 
                            content, 
                            mainReplyId: _mainReplyId,
                            nestedReplyId: _nestedReplyId
                        }

        const newNestedReply = await NestedReply.create(nestedReply);
        
        foundedReply?.nestedReplies?.push(newNestedReply._id);

        const updatededReply = await foundedReply.save();
        console.log("updatededReply in create reply to reply", updatededReply)
        
        const populatedReply= await updatededReply.populate(
            [
                {
                    path: "nestedReplies",
                    model: "NestedReply",
                    populate: [
                        {
                            path: "userId",
                            model: "User",
                            select: "_id firstName LastName userName"
                        },
                        {
                            path: "mainReplyId",
                            model: "Reply",
                            populate: {
                                path: "userId",
                                model: "User",
                                select: "_id firstName LastName userName"
                            }
                        },
                        {
                            path: "nestedReplyId",
                            model: "NestedReply",
                            populate: {
                                path: "userId",
                                model: "User",
                                select: "_id firstName LastName userName"
                            }
                        }
                    ]
                }
            ]
        );
        
        const {mainReplyId, nestedReplyId, ...rest} = populatedReply.nestedReplies.at(-1);
        const sendedNestedReply = (mainReplyId)? {...rest, "replyToId": {...mainReplyId}} : {...rest, "replyToId": {...nestedReplyId}}

        res.status(200).json({...sendedNestedReply._doc})
    }
    catch(err){
        console.log("err in create reply to reply", err)
        return res.sendStatus(500)
    }
}

const getRepliesToReply = async(req, res)=>{
    const {id: postId, commentId, replyId} = req.params
    // const query = req.query;
    console.log("in get replies to reply PostId ", postId, "commentId", commentId, "replyId", replyId)

    if(!postId || !commentId || !replyId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId)
        .populate({
            path: "comments.values",
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies",
                model: "Reply",
                populate: [{
                    path: "nestedReplies",
                    model: "NestedReply",
                    populate: [
                        {
                            path: "userId",
                            model: "User",
                            select: "_id firstName LastName userName"
                        },
                        {
                            path: "mainReplyId",
                            model: "Reply",
                            populate: {
                                path: "userId",
                                model: "User",
                                select: "_id firstName LastName userName"
                            }
                        },
                        {
                            path: "nestedReplyId",
                            model: "NestedReply",
                            populate: {
                                path: "userId",
                                model: "User",
                                select: "_id firstName LastName userName"
                            }
                        }
                    ]
                }]
            }]})
        .exec();

        if(!foundedPost) return res.sendStatus(404)
        
        const foundedComment = foundedPost?.comments?.values.find(comment =>{
            console.log("commentId", commentId, "_id", comment._id)
            return comment._id.toString() === commentId;
        })

        console.log("foundedComment", foundedComment);
        if(!foundedComment) return res.sendStatus(404)

        const foundedReply = foundedComment
        .replies
        .find(reply =>{
            return reply._id.toString() === replyId
        })

        if(!foundedReply) return res.sendStatus(404);
        console.log("foundedReply", foundedReply)

        const {nestedReplies, ...rest} = foundedReply._doc;
        const numOfNestedReplies = nestedReplies.length;
        console.log("nestedReplies", nestedReplies);

        const sendedNestedReplies = nestedReplies.map((nestedReply) =>{
            const {mainReplyId, nestedReplyId, ...rest} = nestedReply._doc;
            const sendedNestedReply = (mainReplyId)? {...rest, "replyToId": {...mainReplyId.userId._doc}} : {...rest, "replyToId": {...nestedReplyId.userId._doc}}
            return sendedNestedReply;
        })
        console.log("sendedNestedReplies", sendedNestedReplies);
        res.status(200).json({"repliesToId": replyId, "values": [...sendedNestedReplies], "count": numOfNestedReplies})
    }
    catch(err){
        console.log("err: ", err)
        return res.sendStatus(500)
    }
}

const createGuestComment = async(req, res)=>{
    const postId = req.params.id;
    const {firstName, lastName, email, content} = req.body;
    const userId = res.locals.user._id;
    console.log("postId", postId, "userId", userId, "content", content, "replayTo", replayTo, "date", date)
    if(!postId || !firstName || !lastName || !email || !content) return res.sendStatus(400)

    try{        
        const foundedPost = await Post.findById(postId).exec();
        if(!foundedPost) return res.sendStatus(204);

        const comment= {firstName, lastName, email, content, date: Date.now}
        foundedPost.comments.guests.push(comment);

        // foundedPost.comments = [];

        const updatededPost = await foundedPost.save();
        console.log("updatedPost in react", updatededPost)
        
        const comments= updatededPost.comments.guests;
        console.log("guestComments", comments);
        res.status(200).json({...comments})
    }
    catch(err){
        console.log("err in add comment", err)
        return res.sendStatus(500)
    }
}

const getComments = async(req, res)=>{
    const postId = req.params.id;
    console.log("in get comment postId: ", postId)
    console.log("query", req.query);
    // const query = req.query.split("&&")
    // const limit = query[0].split("=")[1]
    // const skip = query[1].splite("=")[1]
    // const newQuery = {limit, skip}
    // console.log("newQuery", newQuery)

    const query = req.query;
    if(!postId) return res.sendStatus(400)

    try{
        const foundedPost = await Post.findById(postId)
        .populate("author","firstName lastName userName")
        .populate("reactionList", "firstName lastName userName")
        .populate("saveList", "firstName lastName userName")
        .populate({
            path: "comments.values",
            options: {...query},
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies",
                model: "Reply",
            },
            {
                path: "replies.replyTo",
                model: "User",
                select: "firstName lastName"
            }]
        }).exec();

        const foundedComments = {...foundedPost._doc?.comments}
        // foundedComments.values = foundedComments.values.slice((1 - foundedComments.values.length))

        const sendedComments = {...foundedComments}
        sendedComments.values = sendedComments?.values?.map(comment =>{
            console.log("comment in sendedComments", comment)
            const {replies, ...rest} = comment._doc;
            const numOfMainReplies = replies.length;
            return {"value": {...rest}, numOfMainReplies }
        })

        res.status(200).json({...sendedComments})
    }
    catch(err){
        console.log("err in get comments: ", err)
        return res.sendStatus(500)
    }
}

const increaseReadingsByOne = async(req, res)=>{
    const {postId, isReader} = req.query;
    // console.log("in get comment postId: ", postId, "isReader", isReader)

    if(!!!postId || (isReader === undefined || isReader === null)) {
        return res.status(400).json({"errorMsg": "Missing article id or isReader"})
    }

    try{
        const foundedPost = await Post.findById(postId).exec();

        if(isReader === "true"){
            foundedPost.readings= foundedPost.readings + 1;
            await foundedPost.save();
        }
        res.sendStatus(201)
    }
    catch(err){
        console.log("err in increase readings: ", err)
        return res.sendStatus(500)
    }
}

const postController = { 
    createPost,
    getPosts,
    getPostsByQuery,
    getPostById,
    getUserPosts,
    editPost,
    deletePost,
    reactOnPost,
    addToSaveList,
    increaseReadingsByOne,
    createUserComment,
    createGuestComment,
    getComments,
    createReplyToComment,
    getCommentMainReplies,
    createReplyToReply,
    getRepliesToReply
}

module.exports = postController