const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongooseDelete = require("mongoose-delete");
const slug = require("mongoose-slug-updater");

const Shoe = new Schema(
  {
    name: { type: String, require: true },
    description: { type: String },
    type: { type: String },
    price: { type: Number },
    typeDetail: { type: String },
    priceDiscount: { type: Number },
    quantity: { type: String },
    status: { type: String, default: "0" },
    image: { type: String },
    images: { type: String },
    slug: { type: String, slug: "name", unique: true },
    slugType: { type: String, slug: "typeDetail"},
  },
  {
    conllection: "shoes",
    timestamps: true,
  }
);

//Add plugin
mongoose.plugin(slug);
Shoe.plugin(mongooseDelete, {
  deletedAt: true, // Thêm thời gian xóa vào db
  overrideMethods: "all", // Ghi đè chỉ hiện những dữ liệu ko có field deleteAt
});

//Bussiness Logic
Shoe.statics.createShoe = async function (shoeData) {
  try {
    var Shoe = this;
    var newShoe = new Shoe(shoeData);
    return await newShoe.save();
  } catch (error) {
    console.log("ERR: " + error);
    throw new Error("Không thể tạo mới sản phẩm giày.");
  }
};

Shoe.statics.updateShoe = async function (shoeId, updatedShoeData) {
    try {
        var Shoe = this
        await Shoe.updateOne({ _id: shoeId }, updatedShoeData);
    } catch (error) {
        console.log("ERR: " + error);
        throw new Error('Không thể cập nhật thông tin giày.');
    }
}

Shoe.statics.deleteShoe = async function (shoeId) {
    try {
        var Shoe = this
        await Shoe.delete({ _id: shoeId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể xóa sản phảm giày")
    }
}

Shoe.statics.destroyShoe = async function (shoeId) {
    try {
        var Shoe = this
        await Shoe.deleteOne({ _id: shoeId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể xóa vĩnh viễn sản phảm giày")
    }
}

Shoe.statics.restoreShoe = async function (shoeId) {
    try {
        var Shoe = this
        await Shoe.restore({ _id: shoeId })
    } catch (error) {
        console.log("ERR: " + error)
        throw new Error("Không thể khôi phục sản phảm giày")
    }
}

module.exports = mongoose.model("Shoe", Shoe);
