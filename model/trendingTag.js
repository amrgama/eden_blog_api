const mongoose = require("mongoose");
const Post = require("./post");
const Schema = mongoose.Schema;

const TrendingTagSchema = new Schema({
    values: [
        {
            type: String,
            unique: true
        }
    ]
})

module.exports = mongoose.model("TrendingTag", TrendingTagSchema)