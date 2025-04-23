const mongoose = require("mongoose")
const Post = require("./post")
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    firstName: {
        type: String,
        require: true,
    },
    lastName: {
        type: String,
        require: true,
    },
    userName: {
        type: String,
        require: true,
        unique: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    vector: {
        type: String,
    },
    bio: {
        type: String,
    },
    socialLinks: {
        quora: { type: String },
        facebook: { type: String },
        twitter: { type: String },
        instagram: { type: String },
    },
    saveList: [
        {type: Schema.Types.ObjectId, ref: "Post"}
    ],
    posts: [
        {type: Schema.Types.ObjectId, ref: "Post"}
    ],
    posts_count: {type: Number, default: 0},
    blockList: [
        {type: Schema.Types.ObjectId, ref: "user"}
    ],
    followers: [{type: Schema.Types.ObjectId, ref: "User"}],
    followers_count: {type: Number, default: 0},
    following: [{type: Schema.Types.ObjectId, ref: "User"}],
    following_count: {type: Number, default: 0},
    refreshToken: {
        type: String,
    },
}, {timestamps: true});

UserSchema.index({firstName: "text", lastName: "text", userName: "text"})
module.exports = mongoose.model("User", UserSchema);