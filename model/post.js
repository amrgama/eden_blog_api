const mongoose = require("mongoose");
const User = require("./user")
const Comment = require("./comment")
const Schema = mongoose.Schema;

const PostSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    image: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
    },
    content: {
        type: String,
        require: true,
    },
    readings: {
        type: Number,
        default: 0
    },
    reactionList : [
        { 
            type: Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    saveList: [
        {
            type: Schema.Types.ObjectId, 
            ref: "User"
        }
    ],
    // comments: {
    //     users: [{
    //         userId: {type: Schema.Types.ObjectId, ref: "User"},
    //         content: {
    //             type: String,
    //             require: true
    //         },
    //         replayTo: {
    //             type: String
    //         },
    //         date: {
    //             type: Date,
    //             default: Date.now()
    //         }
    //     }],
    //     guests: [{
    //         firstName: {
    //             type: String,
    //             require: true
    //         },
    //         lastName: {
    //             type: String,
    //             require: true
    //         },
    //         email: {
    //             type: String,
    //             require: true
    //         },
    //         content: {
    //             type: String,
    //             require: true
    //         },
    //         date: {
    //             type: Date,
    //             default: Date.now()
    //         }
    //     }]
    // },
    comments: {
        values: [{
            type: Schema.Types.ObjectId,
            ref: "Comment"
        }],
        count: {
            type: Number,
        }
    },
    author:{
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    category: {
        type: String,
        require: true
    },
    tags: [{type: String}],
    isPrivate: {
        type: Boolean,
        default: false
    }

}, {timestamps: true})

module.exports = mongoose.model("Post", PostSchema)