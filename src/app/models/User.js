const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')

const User = new Schema({
    name: {type: String},
    email: {type: String},
    password: {type: String},
    phone: {type: String},
    isAdmin: {type: Boolean, default: false},
}, {
    conllection: 'users',
    timestamps: true
})

//Add plugin
mongoose.plugin(slug)
User.plugin(mongooseDelete,  { 
    deletedAt : true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

module.exports = mongoose.model('User', User)