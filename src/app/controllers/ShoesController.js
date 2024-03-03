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
                user: userId._id
              });
              
              newOrder.itemsPrice = newOrder.orderItems.reduce((total, item) => total + item.price * item.amount,0);
              
              newOrder.totalPrice = newOrder.itemsPrice + newOrder.shippingPrice

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
          order.totalPrice = order.itemsPrice + order.shippingPrice
          await order.save();
          return res.redirect('back');
        }
      } else {
        res.redirect("/sign-in");
      }
    } catch (error) {
      console.log("ERR Order: " + error);
    }
  }
}

module.exports = new ShoesController();
