const User = require("../models/User");
const Shoe = require("../models/Shoe");
const Order = require("../models/Order");
const {
  mongooseToObject,
  mutipleMongooseToObject,
} = require("../../util/mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
class ShoesController {
  // [GET] /shoes/show
  show(req, res, next) {
    Shoe.findOne({ slug: req.params.slug }).then((shoe) => {
      res.render("shoes/show", {
        shoe: mongooseToObject(shoe),
      });
    });
  }

  // [get] /shoes/cart
  async cart(req, res, next) {
    try {
      var token = req.cookies.token;
      if (token) {
        const userId = jwt.verify(token, "nht");
        const order = await Order.findOne({ user: userId, isPaid: false }).populate("orderItems.shoe").populate({
          path: 'user',
          model: 'User',
      });
        if(!order) {
          res.render('shoes/cart', { cartEmpty: "Giỏ hàng trống!"})
        }else{
          res.render('shoes/cart', {order: mongooseToObject(order)})
          // res.json(order)
        }
      } else {
        res.redirect("/sign-in");
      }
    } catch (error) {
      console.log("ERR CART: " + error);
    }
  }

  // [post] /shoes/add-to-cart
  async addToCart(req, res, next) {
    try {
      const { shoeId, amount } = req.body;
      const amoutNum = new Number(amount);
      var token = req.cookies.token;
      if (token) {
        var userId = jwt.verify(token, "nht");
        const order = await Order.findOne({ user: userId._id, isPaid: false });
        if (!order) {
          Shoe.findOne({ _id: shoeId })
            .then((shoe) => {
              const newOrder = new Order({
                orderItems: [
                  {
                    name: shoe.name,
                    amount: amount,
                    image: shoe.image,
                    price: shoe.price,
                    shoe: shoe._id,
                  },
                ],
                user: userId._id,
              });

              newOrder.itemsPrice = newOrder.orderItems.reduce(
                (total, item) => total + item.price * item.amount,
                0
              );

              newOrder.totalPrice =
                newOrder.itemsPrice + newOrder.shippingPrice;

              newOrder.save().then(() => {
                res.redirect("back");
              });
            })
            .catch(next);
        } else {
          const existingOrderItem = order.orderItems.find(
            (item) => item.shoe.toString() === shoeId
          );

          if (existingOrderItem) {
            existingOrderItem.amount += amoutNum;
          } else {
            const shoe = await Shoe.findOne({ _id: shoeId });
            order.orderItems.push({
              name: shoe.name,
              amount: amount,
              image: shoe.image,
              price: shoe.price,
              shoe: shoe._id,
            });
          }
          order.itemsPrice = order.orderItems.reduce(
            (total, item) => total + item.price * item.amount,
            0
          );
          order.totalPrice = order.itemsPrice + order.shippingPrice;
          await order.save();
          return res.redirect("back");
        }
      } else {
        res.redirect("/sign-in");
      }
    } catch (error) {
      console.log("ERR Order: " + error);
    }
  }

  // [put] /shoes/quantity/:id
  async updateQuantity(req, res, next) {
    try {
        const itemId = req.params.id;
        const action = req.body.action; // Lấy hành động từ nút tăng giảm

        let newQuantity;
        const order = await Order.findOne({ "orderItems._id": itemId });
        // res.json(order)
        const item = order.orderItems.find(item => item._id.toString() === itemId);

        if (action === 'increase') {
            newQuantity = item.amount + 1;
        } else if (action === 'decrease') {
            newQuantity = item.amount - 1;
            if (newQuantity < 1) {
                newQuantity = 1; // Đảm bảo số lượng không âm
            }
        } else {
            return res.status(400).json({ success: false, message: "Invalid action" });
        }

        // Cập nhật số lượng mới vào cơ sở dữ liệu
        item.amount = newQuantity;
        order.itemsPrice = order.orderItems.reduce(
          (total, item) => total + item.price * item.amount,
          0
        );
        order.totalPrice = order.itemsPrice + order.shippingPrice;
        await order.save();

        res.redirect('back')
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
  }

  // [PUT] /shoes/update-cart/:id
  updateShippingCart (req, res, next) {
    var orderId = req.params.id;
    
    Order.updateOne({ _id: orderId}, {shippingAddress: req.body})
      .then((data) => {
        res.redirect('/')
      })
      .catch(next)
  }
}

module.exports = new ShoesController();
