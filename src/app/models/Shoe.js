const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')

const Shoe = new Schema({
    name: {type: String, require: true},
    description: {type: String},
    type: {type: String},
    price: {type:Number},
    typeDetail: {type: String},
    size: {type: Number},
    material: {type: String},
    soleMaterial: {type: String},
    height: {type: String},
    origin: {type: String},
    image: {type: String},
    slug: {type: String, slug: 'name', unique: true},
}, {
    conllection: 'shoes',
    timestamps: true
})

//Add plugin
mongoose.plugin(slug)
Shoe.plugin(mongooseDelete,  { 
    deletedAt : true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

module.exports = mongoose.model('Shoe', Shoe)