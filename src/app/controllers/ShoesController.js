const User = require("../models/User");
const Shoe = require("../models/Shoe");
const Order = require("../models/Order");
const paypal = require("paypal-rest-sdk");
const PAGE_SIZE = 12;

const {
  mongooseToObject,
  mutipleMongooseToObject,
} = require("../../util/mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
class ShoesController {

  checkLoginClient(req, res, next) {
    var checkLogin = res.locals.currentUser;
    if (checkLogin) {
      next();
    } else {
      res.redirect("/login");
    }
  }

  // [GET] /shoes/show
  show(req, res, next) {
    Shoe.findOne({ slug: req.params.slug }).then((shoe) => {
      res.render("shoes/show", {
        shoe: mongooseToObject(shoe),
      });
    });
  }

  // [GET] /shoes/shoes-type/:type
  async shoeType (req, res, next) {
    try {
        var type = req.params.type
        var shoeType = await Shoe.findOne({ slugType: type})

        var page = parseInt(req.query.page) || 1;
        var allShoe = await Shoe.find({ slugType: type}).countDocuments();
        var maxPage = Math.ceil(allShoe / PAGE_SIZE);

        if (page > maxPage) {
          page = 1;
        }

        var offset = (page - 1) * PAGE_SIZE;

        Shoe.find({ slugType: type })
          .skip(offset)
          .limit(PAGE_SIZE)
          .then(shoes => {
            res.render('shoes/shoeType', {
              page,
              maxPage,
              shoes: mutipleMongooseToObject(shoes),
              shoeType: shoeType.typeDetail
            })
    
          })
          .catch(err => {
            console.log("ERR: " + err)
          })
          .catch(next)
    } catch (error) {
      console.log("ERR: " + error)
    }
  }

  // [get] /shoes/cart
  async cart(req, res, next) {
    try {
      var token = req.cookies.token;
      if (token) {
        const userId = jwt.verify(token, "nht");
        const order = await Order.findOne({
          user: userId,
          isPaid: false,
          paymentMethod: null,
        })
          .populate("orderItems.shoe")
          .populate({
            path: "user",
            model: "User",
          });

        res.render("shoes/cart", {
          order: mongooseToObject(order),
          cartEmpty: "Giỏ hàng trống!",
        });
      } else {
        res.redirect("/login");
      }
    } catch (error) {
      console.log("ERR CART: " + error);
    }
  }

  // [post] /shoes/add-to-cart
  async addToCart(req, res, next) {
    try {
      const { shoeId, amount, size } = req.body;
      const amoutNum = new Number(amount);
      var token = req.cookies.token;
      if (token) {
        var userId = jwt.verify(token, "nht");
        const order = await Order.findOne({
          user: userId._id,
          isPaid: false,
          paymentMethod: null,
        });
        if (!order) {
          Shoe.findOne({ _id: shoeId })
            .then((shoe) => {
              const newOrder = new Order({
                orderItems: [
                  {
                    name: shoe.name,
                    size: size,
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
                res.redirect("/shoes/cart");
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
              size: size,
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
          return res.redirect("/shoes/cart");
        }
      } else {
        res.redirect("/login");
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
      const item = order.orderItems.find(
        (item) => item._id.toString() === itemId
      );

      if (action === "increase") {
        newQuantity = item.amount + 1;
      } else if (action === "decrease") {
        newQuantity = item.amount - 1;
        if (newQuantity < 1) {
          newQuantity = 1; // Đảm bảo số lượng không âm
        }
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid action" });
      }

      // Cập nhật số lượng mới vào cơ sở dữ liệu
      item.amount = newQuantity;
      order.itemsPrice = order.orderItems.reduce(
        (total, item) => total + item.price * item.amount,
        0
      );
      order.totalPrice = order.itemsPrice + order.shippingPrice;
      await order.save();

      res.redirect("back");
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }

  // [POST] /shoes/update-cart/:id
  async updateShippingCart(req, res, next) {
    try {
      var { fullName, phone, address, city, paymentMethod } = req.body;
      var orderId = req.params.id;

      if (paymentMethod == "Thanh toán bằng tiền mặt") {
        Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city }, paymentMethod }
        )
          .then((data) => {
            res.redirect("/shoes/my-order");
          })
          .catch(next);
      } else {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city }, paymentMethod }
        );
        if (orderUpdate) {
          var order = await Order.findOne({ _id: orderId });

          var items = order.orderItems.map((item) => {
            return {
              name: item.name,
              sku: item._id,
              price: item.price,
              currency: "USD",
              quantity: item.amount,
            };
          });

          const itemsTotal = order.orderItems.reduce((total, item) => {
            return total + item.price * item.amount;
          }, 0);

          const totalAmount = itemsTotal + order.shippingPrice;

          var create_payment_json = {
            intent: "sale",
            payer: {
              payment_method: "paypal",
            },
            redirect_urls: {
              return_url: `https://topshoes.onrender.com/shoes/pay-success?totalAmount=${totalAmount}&orderId=${orderId}`,
              cancel_url: "https://topshoes.onrender.com/cancel",
            },
            transactions: [
              {
                item_list: {
                  items: items,
                },
                amount: {
                  currency: "USD",
                  total: totalAmount,
                  details: {
                    subtotal: itemsTotal,
                    shipping: order.shippingPrice,
                  },
                },
                description: "This is the payment description.",
              },
            ],
          };

          paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
              console.log("ERR: " + error);
              throw error;
            } else {
              for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === "approval_url") {
                  res.redirect(payment.links[i].href);
                }
              }
            }
          });
        }
      }
    } catch (error) {
      console.log("ERR: " + error)

    }
  }

  // [GET] /shoes/pay-success
  paySuccess(req, res, next) {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const totalAmount = req.query.totalAmount;
    const orderId = req.query.orderId

    const execute_payment_json = {
      payer_id: payerId,
      transactions: [
        {
          amount: {
            currency: "USD",
            total: totalAmount,
          },
        },
      ],
    };

    Order.findOne({ _id: orderId,  paymentMethod: "Thanh toán bằng tiền mặc"})
      .then(data => {
        return res.redirect("/shoes/my-order");
      })
      .catch(err =>{
        console.log("ERR: "+err)
      })
      .catch(next)

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      function (error, payment) {
        if (error) {
          res.render("cancle");
        } else {
          Order.updateOne(
            { _id: orderId },
            { paymentMethod: "Thanh toán bằng Paypal", isPaid: true, paidAt: Date.now()}
          )
            .then((data) => {
              res.redirect("/shoes/my-order");
            })
            .catch(next);
        }
      }
    );
  }

  // [get] /shoes/my-order
  myOrder (req, res, next) {
    var userId = res.locals.currentUser._id
    if(userId){
      Order.find({ user: userId, paymentMethod: { $ne: null } })
        .populate("orderItems.shoe")
        .populate({
          path: "user",
          model: "User",
        })
        .then(data => {
          res.render('shoes/myOrder', {
            user: res.locals.currentUser,
            orders: mutipleMongooseToObject(data)
          })
        })
        .catch(err => {
          console.log("ERR MY-ODER: " + err)
        })
        .catch(next)
    }
  }
  
  // [GET] /shoes/my-order-detail
  myOrderDetail (req, res, next) {
    var orderId = req.params.id
    Order.findOne({ _id: orderId })
      .populate("orderItems.shoe")
      .populate({
        path: "user",
        model: "User",
      })
      .then((data) => {
        if(data){
          res.render('shoes/myOrderDetail', {
            user: res.locals.currentUser,
            order: mongooseToObject(data)
          })

        }else{
          res.redirect('back')
        }
      })
      .catch(err => {
        console.log("ERR: " + err)
      })
      .catch(next)
  }

    // [DELETE] /shoes/my-order/:id/delete
    async deleteOrder(req, res, next) {
      try {
        await Order.deleteOne({ _id: req.params.id});
        res.redirect("back");
      } catch (error) {
        console.log("ERR: " + error)
        next(error);
      }
    }


  // [DELETE] /shoes/delete-cart/:id
  async deleteToCart(req, res, next) {
    try {
      // Lấy id của orderItem từ yêu cầu
      const orderItemId = req.params.id;

      // Tìm và xóa orderItem trong cơ sở dữ liệu
      const order = await Order.findOneAndUpdate(
        { "orderItems._id": orderItemId },
        { $pull: { orderItems: { _id: orderItemId } } },
        { new: true }
      );

      if (!order) {
        return res
          .status(404)
          .json({ message: "Không tìm thấy order hoặc orderItem" });
      }

      if (order.orderItems.length === 0) {
        // Nếu không còn dữ liệu trong orderItems, xóa luôn order
        await Order.deleteOne({ _id: order._id });
        return res.redirect("back");
      }

      order.itemsPrice = order.orderItems.reduce(
        (total, item) => total + item.price * item.amount,
        0
      );
      order.totalPrice = order.itemsPrice + order.shippingPrice;
      await order.save();

      // Trả về phản hồi thành công nếu orderItem được xóa thành công
      return res.redirect("back");
    } catch (error) {
      // Xử lý lỗi nếu có
      console.error("Lỗi khi xóa orderItem:", error);
      return res
        .status(500)
        .json({ message: "Đã xảy ra lỗi khi xóa orderItem" });
    }
  }

  
}

module.exports = new ShoesController();
