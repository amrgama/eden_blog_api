const mongoose = require("mongoose");
const User = require("./user")
const Schema = mongoose.Schema;

const NestedReplySchema = new Schema({
    userId: {type: Schema.Types.ObjectId, ref: "User"},
    content: {
        type: String,
        require: true
    },
    mainReplyId: {type: Schema.Types.ObjectId, ref: "Reply"},
    nestedReplyId: {type: Schema.Types.ObjectId, ref: "NestedRepy"}
}, {timestamps: true})

module.exports = mongoose.model("NestedReply", NestedReplySchema)