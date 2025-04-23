const mongoose = require("mongoose");
const Post = require("./post");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
    values: [
        {
            type: String,
            unique: true
        }
    ]
})

module.exports = mongoose.model("Category", CategorySchema)