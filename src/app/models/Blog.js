const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')
const bcrypt = require('bcrypt');

const Blog = new Schema({
    title: { type: String },
    description: { type: String },
    avatar: { type: String },
    category: {type: String },
    content: { type: String },
    slug: { type: String, slug: "title", unique: true },
    slugCategory: { type: String, slug: "category"}

}, {
    conllection: 'blogs',
    timestamps: true
})

//Add plugin
mongoose.plugin(slug)
Blog.plugin(mongooseDelete, {
    deletedAt: true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

module.exports = mongoose.model('Blog', Blog)