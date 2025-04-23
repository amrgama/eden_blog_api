const mongoose = require("mongoose");
const User = require("./user")
const Comment = require("./comment")
const NestedReply = require("./nestedReply")
const Schema = mongoose.Schema;

const ReplySchema = new Schema({
    commentId: {type: Schema.Types.ObjectId, ref: "Comment"},
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    content: {
        type: String,
        require: true
    },
    nestedReplies: [{type: Schema.Types.ObjectId, ref: "NestedReply"}]
}, {timestamps: true})

module.exports = mongoose.model("Reply", ReplySchema)