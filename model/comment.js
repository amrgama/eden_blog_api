const mongoose = require("mongoose");
const User = require("./user")
const Reply = require("./reply")
const Schema = mongoose.Schema;

// const UserComment = new Schema({
//     userId: {type: Schema.Types.ObjectId, ref: "User"},
//     content: {
//         type: String,
//         require: true
//     },
//     replayTo: {
//         type: String
//     },
//     date: {
//         type: Date,
//         default: Date.now()
//     }
// }, {timestamps: true})

// const GuestComment = new Schema({
//     firstName: {
//         type: String,
//         require: true
//     },
//     lastName: {
//         type: String,
//         require: true
//     },
//     email: {
//         type: String,
//         require: true
//     },
//     content: {
//         type: String,
//         require: true
//     },
//     date: {
//         type: Date,
//         default: Date.now()
//     }
// })

const CommentSchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    content: {
        type: String,
        require: true
    },
    // replies: [{
    //     userId: {type: Schema.Types.ObjectId, ref: "User"},
    //     replyTo: {type: Schema.Types.ObjectId, ref: "User"},
    //     content: {
    //         type: String,
    //         require: true
    //     },
    //     createdAt: {
    //         type: Date,
    //         default: Date.now(),
    //     },
    // }],
    replies: [{type: Schema.Types.ObjectId, ref: "Reply"}],
}, {timestamps: true})

module.exports = mongoose.model("Comment", CommentSchema)