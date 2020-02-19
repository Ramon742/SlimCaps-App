const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    titulo: String,
    image: String,
    body: String,
    data: {type: Date, default: Date.now()}
});

module.exports = mongoose.model('Blog', BlogSchema);