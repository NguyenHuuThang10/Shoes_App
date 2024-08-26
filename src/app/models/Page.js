const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')
const bcrypt = require('bcrypt');

const Page = new Schema({
    title: { type: String },
    avatar: { type: String },
    category: {type: String },
    content: { type: String },
    slugCategory: { type: String, slug: "category"}

}, {
    conllection: 'pages',
    timestamps: true
})

//Add plugin
mongoose.plugin(slug)
Page.plugin(mongooseDelete, {
    deletedAt: true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

module.exports = mongoose.model('Page', Page)