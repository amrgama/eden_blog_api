const mongoose = require("mongoose")
const Post = require("../model/post");

class FetchPost{
    async get(query){
        this.data = await Post.find(query)
        .populate("author","firstName lastName userName")
        .populate("reactionList", "firstName lastName userName")
        .populate("saveList", "firstName lastName userName")
        .populate({
            path: "comments",
            options: {limit: 10},
            populate: [{
                path: "userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies.userId",
                model: "User",
                select: "firstName lastName userName"
            },
            {
                path: "replies.replyTo",
                model: "User",
                select: "firstName lastName"
            }]
        }).exec();
    }
}

class SendPost{
    set(data){
        this.data.comments.values = data?.comments?.map(comment =>{
            console.log("comment in editedcoment", comment)
            const {replies, ...rest} = comment._doc;
            const firstReply = replies?.at(0);
            const numOfReplies = replies?.length;

            const mainReplies = replies.filter(reply =>{
                const castedReplyToIdVal = reply.replyTo._id.toString();
                const castedUserIdVal = comment.userId._id.toString();

                return castedUserIdVal === castedReplyToIdVal;
            })
        
            const numOfMainReplies = mainReplies.length
            return {...rest, firstReply, numOfMainReplies }
        })

        this.data.comments.count = data?.comments.legnth;
        this.data.comments.numofRest = 0;
    }
}

module.exports = {
    FetchPost,
    SendPost,
}