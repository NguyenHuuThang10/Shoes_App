const mongoose = require('mongoose')
const Schema = mongoose.Schema
const mongooseDelete = require('mongoose-delete')
const slug = require('mongoose-slug-updater')

const Order = new Schema({
    orderItems: [
        {
            name: { type: String, required: true },
            size: { type: Number, required: true },
            amount: { type: Number, required: true },
            image: { type: String, required: true },
            price: { type: Number, required: true },
            shoe: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Shoe',
                required: true,
            },
        },
    ],
    shippingAddress: {
        fullName: { type: String },
        address: { type: String },
        cityName: { type: String },
        districtName: { type: String },
        wardName: { type: String },
        phone: { type: String },
        note: {
            type: String, 
            trim: true, // Loại bỏ khoảng trắng thừa
            default: '', // Nếu không có ghi chú, mặc định là chuỗi rỗng
        },
    },
    paymentMethod: { type: String },
    itemsPrice: { type: Number },
    shippingPrice: { type: Number, default: 30 },
    totalPrice: { type: Number },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isPaid: { type: Boolean, default: false },
    paidAt: { type: Date },
    isDelivered: { type: Boolean, default: false },
    deliveredAt: { type: Date },
    status: { type: String, default: "Chờ xử lý" },
},
    {
        timestamps: true,
        collection: 'orders'
    }
);

//Add plugin
mongoose.plugin(slug)
Order.plugin(mongooseDelete, {
    deletedAt: true, // Thêm thời gian xóa vào db
    overrideMethods: 'all' // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

module.exports = mongoose.model('Order', Order);