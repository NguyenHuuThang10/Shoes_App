const User = require("../models/User");
const Shoe = require("../models/Shoe");
const Order = require("../models/Order");
const paypal = require("paypal-rest-sdk");
const PAGE_SIZE = 12;
const axios = require('axios').default; // npm install axios
const CryptoJS = require('crypto-js'); // npm install crypto-js
const moment = require('moment'); // npm install moment
const config = {
  app_id: "2554",
  key1: "sdngKKJmqEMzvh5QQcdD2A9XBSKUNaYn",
  key2: "trMrHtvjo6myautxDUiAcYsVtaeQ8nhf",
  endpoint: "https://sb-openapi.zalopay.vn/v2/create"
};

const {
  mongooseToObject,
  mutipleMongooseToObject,
} = require("../../util/mongoose");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
class ShoesController {

  error(req, res, next) {
    res.render('supports/error')
  }

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
      if (shoe) {

        if (shoe.images) {
          let imageArray = shoe.images.split(',');
          res.render("shoes/show", {
            shoe: mongooseToObject(shoe),
            imageArr: imageArray,
            openCart: req.flash('openCart')
          });
        } else {
          res.render("shoes/show", {
            shoe: mongooseToObject(shoe),
            openCart: req.flash('openCart')
          });
        }


      } else {
        res.render("supports/error");
      }
    });
  }

  // [GET] /shoes/shoes-type/:type
  async shoeType(req, res, next) {
    try {
      var type = req.params.type
      var shoeType = await Shoe.findOne({ slugType: type })

      var page = parseInt(req.query.page) || 1;
      var allShoe = await Shoe.find({ slugType: type }).countDocuments();
      var maxPage = Math.ceil(allShoe / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      let wishlistItemIds = null;
      if (res.locals.currentUser) {
        const userId = res.locals.currentUser._id
        var user = await User.findOne({ _id: userId }).populate("wishlistItems.shoe")
        wishlistItemIds = user.wishlistItems.map(item => item.shoe._id.toString());
      }

      Shoe.find({ slugType: type, quantity: {$ne: "0"} })
        .skip(offset)
        .limit(PAGE_SIZE)
        .then(shoes => {
          res.render('shoes/shoeType', {
            page,
            maxPage,
            shoes: mutipleMongooseToObject(shoes),
            shoeType: shoeType.typeDetail,
            wishlistItems: wishlistItemIds
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

        if (order) {
          order.orderItems = order.orderItems.filter(item => item.shoe);
          await order.save();
        }

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
              let price = shoe.price;
              if (shoe.priceDiscount) {
                price = shoe.priceDiscount
              }
              const newOrder = new Order({
                orderItems: [
                  {
                    name: shoe.name,
                    size: size,
                    amount: amount,
                    image: shoe.image,
                    price: price,
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
                req.flash("openCart", "open")
                res.redirect("back");
                // res.redirect("/shoes/cart");
              });
            })
            .catch(next);
        } else {
          const existingOrderItem = order.orderItems.find(
            (item) => item.shoe.toString() === shoeId && item.size === Number(size)
          );

          if (existingOrderItem) {
            existingOrderItem.amount += amoutNum;
          } else {
            const shoe = await Shoe.findOne({ _id: shoeId });
            let price = shoe.price;
            if (shoe.priceDiscount) {
              price = shoe.priceDiscount
            }
            order.orderItems.push({
              name: shoe.name,
              size: size,
              amount: amount,
              image: shoe.image,
              price: price,
              shoe: shoe._id,
            });
          }
          order.itemsPrice = order.orderItems.reduce(
            (total, item) => total + item.price * item.amount,
            0
          );
          order.totalPrice = order.itemsPrice + order.shippingPrice;
          await order.save();
          req.flash("openCart", "open")
          return res.redirect("back");
          // return res.redirect("/shoes/cart");
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

      // res.redirect("back");
      return res.json({ success: true, updatedOrder: order });
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
      var { fullName, phone, address, city, cityName, paymentMethod, district, districtName, ward, wardName, note } = req.body;
      var orderId = req.params.id;

      if (paymentMethod == "COD") {
        Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, paymentMethod, note }
        )
          .then((data) => {
            res.redirect("/shoes/my-order");
          })
          .catch(next);
      } else if (paymentMethod == "PayPal") {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, note }
        );
        if (orderUpdate) {
          const order = await Order.findOne({ _id: orderId });
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
              payment_method: "PayPal",
            },
            redirect_urls: {
              return_url: process.env.APP_URL + `/shoes/pay-success?totalAmount=${totalAmount}&orderId=${orderId}`,
              cancel_url: process.env.APP_URL + "/cancel",
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
      } else if (paymentMethod == "ATM") {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, note }
        );

        const orderItem = await Order.findOne({ _id: orderId });
        const totalPrice = orderItem.totalPrice * 1000;

        const embed_data = {
          "preferred_payment_method": ["domestic_card", "account"],
          "redirecturl": process.env.APP_URL + "/shoes/my-order"
        };

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
          app_id: config.app_id,
          app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
          app_user: "user123",
          app_time: Date.now(), // miliseconds
          item: JSON.stringify(items),
          embed_data: JSON.stringify(embed_data),
          amount: totalPrice,
          description: `Thanh toán đơn hàng #${transID}`,
          bank_code: "",
          callback_url: "https://a9ca-171-252-155-81.ngrok-free.app/shoes/callback?id=" + orderId + "&paymethod=" + paymentMethod
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
          const result = await axios.post(config.endpoint, null, { params: order });
          const responseData = result.data;

          if (responseData.return_code === 1 && responseData.sub_return_code === 1) {
            // Giao dịch thành công, redirect tới order_url
            return res.redirect(responseData.order_url);
          } else {
            // Nếu giao dịch không thành công, trả về lỗi
            return res.status(400).json({
              message: "Giao dịch không thành công",
              detail: responseData
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      } else if (paymentMethod == "VietQR") {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, note }
        );

        const orderItem = await Order.findOne({ _id: orderId });
        const totalPrice = orderItem.totalPrice * 1000;

        const embed_data = {
          "preferred_payment_method": ["vietqr"],
          "redirecturl": process.env.APP_URL + "/shoes/my-order",
          "promotioninfo": "",
          "merchantinfo": "embeddata123"
        };

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
          app_id: config.app_id,
          app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
          app_user: "user123",
          app_time: Date.now(), // miliseconds
          item: JSON.stringify(items),
          embed_data: JSON.stringify(embed_data),
          amount: totalPrice,
          description: `Thanh toán đơn hàng #${transID}`,
          bank_code: "",
          callback_url: "https://a9ca-171-252-155-81.ngrok-free.app/shoes/callback?id=" + orderId + "&paymethod=" + paymentMethod
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
          const result = await axios.post(config.endpoint, null, { params: order });
          const responseData = result.data;

          if (responseData.return_code === 1 && responseData.sub_return_code === 1) {
            // Giao dịch thành công, redirect tới order_url
            return res.redirect(responseData.order_url);
          } else {
            // Nếu giao dịch không thành công, trả về lỗi
            return res.status(400).json({
              message: "Giao dịch không thành công",
              detail: responseData
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      } else if (paymentMethod == "ZaloPayQR") {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, note }
        );

        const orderItem = await Order.findOne({ _id: orderId });
        const totalPrice = orderItem.totalPrice * 1000;

        const embed_data = {
          "preferred_payment_method": ["zalopay_wallet"],
          "redirecturl": process.env.APP_URL + "/shoes/my-order"
        };

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
          app_id: config.app_id,
          app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
          app_user: "user123",
          app_time: Date.now(), // miliseconds
          item: JSON.stringify(items),
          embed_data: JSON.stringify(embed_data),
          amount: totalPrice,
          description: `Thanh toán đơn hàng #${transID}`,
          bank_code: "",
          callback_url: "https://a9ca-171-252-155-81.ngrok-free.app/shoes/callback?id=" + orderId + "&paymethod=" + paymentMethod
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
          const result = await axios.post(config.endpoint, null, { params: order });
          const responseData = result.data;

          if (responseData.return_code === 1 && responseData.sub_return_code === 1) {
            // Giao dịch thành công, redirect tới order_url
            return res.redirect(responseData.order_url);
          } else {
            // Nếu giao dịch không thành công, trả về lỗi
            return res.status(400).json({
              message: "Giao dịch không thành công",
              detail: responseData
            });
          }
        } catch (error) {
          console.log(error.message);
        }
      } else if (paymentMethod == "Visa") {
        var orderUpdate = await Order.updateOne(
          { _id: orderId },
          { shippingAddress: { fullName, phone, address, city, cityName, district, districtName, ward, wardName }, note }
        );

        const orderItem = await Order.findOne({ _id: orderId });
        const totalPrice = orderItem.totalPrice * 1000;

        const embed_data = {
          "preferred_payment_method": ["international_card"],
          "redirecturl": process.env.APP_URL + "/shoes/my-order"
        };

        const items = [{}];
        const transID = Math.floor(Math.random() * 1000000);
        const order = {
          app_id: config.app_id,
          app_trans_id: `${moment().format('YYMMDD')}_${transID}`, // translation missing: vi.docs.shared.sample_code.comments.app_trans_id
          app_user: "user123",
          app_time: Date.now(), // miliseconds
          item: JSON.stringify(items),
          embed_data: JSON.stringify(embed_data),
          amount: totalPrice,
          description: `Thanh toán đơn hàng #${transID}`,
          bank_code: "",
          callback_url: "https://a9ca-171-252-155-81.ngrok-free.app/shoes/callback?id=" + orderId + "&paymethod=" + paymentMethod
        };

        // appid|app_trans_id|appuser|amount|apptime|embeddata|item
        const data = config.app_id + "|" + order.app_trans_id + "|" + order.app_user + "|" + order.amount + "|" + order.app_time + "|" + order.embed_data + "|" + order.item;
        order.mac = CryptoJS.HmacSHA256(data, config.key1).toString();

        try {
          const result = await axios.post(config.endpoint, null, { params: order });
          const responseData = result.data;

          if (responseData.return_code === 1 && responseData.sub_return_code === 1) {
            // Giao dịch thành công, redirect tới order_url
            return res.redirect(responseData.order_url);
          } else {
            // Nếu giao dịch không thành công, trả về lỗi
            return res.status(400).json({
              message: "Giao dịch không thành công",
              detail: responseData
            });
          }
        } catch (error) {
          console.log(error.message);
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

    Order.findOne({ _id: orderId, paymentMethod: "Thanh toán bằng tiền mặc" })
      .then(data => {
        if (!data) {
          throw new Error("Order not found");
        }
      })
      .catch(err => {
        console.log("ERR: " + err)
      })
      .catch(next)

    paypal.payment.execute(
      paymentId,
      execute_payment_json,
      async function (error, payment) {
        if (error) {
          res.render("cancle");
        } else {
          try {

            await Order.updateOne(
              { _id: orderId },
              { paymentMethod: "PayPal", isPaid: true, paidAt: Date.now() }
            )
            return res.redirect("/shoes/my-order");

          } catch (error) {
            console.log("ERR: ", error)
            return next(updateError);
          }

        }
      }
    );
  }

  // /callbakck
  async callback(req, res, next) {
    let result = {};

    try {
      let dataStr = req.body.data;
      let reqMac = req.body.mac;
      const orderId = req.query.id
      const paymentMethod = req.query.paymethod

      let mac = CryptoJS.HmacSHA256(dataStr, config.key2).toString();
      console.log("mac =", mac);


      // kiểm tra callback hợp lệ (đến từ ZaloPay server)
      if (reqMac !== mac) {
        // callback không hợp lệ
        result.return_code = -1;
        result.return_message = "mac not equal";
      }
      else {
        // thanh toán thành công
        // merchant cập nhật trạng thái cho đơn hàng
        let dataJson = JSON.parse(dataStr, config.key2);
        console.log("update order's status = success where app_trans_id =", dataJson["app_trans_id"]);

        await Order.updateOne(
          { _id: orderId },
          { paymentMethod: paymentMethod, isPaid: true, paidAt: Date.now() }
        )

        result.return_code = 1;
        result.return_message = "success";

      }
    } catch (ex) {
      result.return_code = 0; // ZaloPay server sẽ callback lại (tối đa 3 lần)
      result.return_message = ex.message;
    }

    // thông báo kết quả cho ZaloPay server
    res.json(result);
  }


  // [get] /shoes/my-order
  myOrder(req, res, next) {
    var userId = res.locals.currentUser._id
    if (userId) {
      Order.find({ user: userId, paymentMethod: { $ne: null } })
        .populate("orderItems.shoe")
        .populate({
          path: "user",
          model: "User",
        })
        .then(data => {
          res.render('shoes/myOrder', {
            user: res.locals.currentUser,
            orders: mutipleMongooseToObject(data),
            err: req.flash('err'),
            success: req.flash('success')
          })
        })
        .catch(err => {
          console.log("ERR MY-ODER: " + err)
        })
        .catch(next)
    }
  }

  // [GET] /shoes/my-order-detail
  myOrderDetail(req, res, next) {
    var orderId = req.params.id
    Order.findOne({ _id: orderId })
      .populate("orderItems.shoe")
      .populate({
        path: "user",
        model: "User",
      })
      .then((data) => {
        if (data) {
          res.render('shoes/myOrderDetail', {
            user: res.locals.currentUser,
            order: mongooseToObject(data)
          })

        } else {
          res.render('supports/error')
        }
      })
      .catch(err => {
        console.log("ERR: " + err)
        res.render('supports/error')
      })
      .catch(next)
  }

  // [DELETE] /shoes/my-order/:id/delete
  async deleteOrder(req, res, next) {
    try {
      const orderId = req.params.id;
      if(orderId){
        const order = await Order.findById({ _id: orderId });

        if (order) {
          // Kiểm tra trạng thái đơn hàng
          if (order.status === "Đang giao hàng") {
            req.flash("err", "Đơn hàng của bạn hiện đang được giao, vì vậy bạn không thể hủy đơn hàng vào lúc này.");
            return res.redirect("back"); 
          }
        } else {
          req.flash("err", "Đơn hàng không tồn tại!");
          return res.redirect("back"); 
        }
      }
      
      await Order.updateOne(
        { _id: orderId },
        { status: "Đã hủy" }
      )
      req.flash("success", "Đơn hàng của bạn đã được hủy.");
      return res.redirect("back");
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

  // [GET] /shoes/sale
  async sale(req, res, next) {

    var page = parseInt(req.query.page) || 1;
    var allShoe = await Shoe.find({ priceDiscount: { $ne: null } }).countDocuments();
    var maxPage = Math.ceil(allShoe / PAGE_SIZE);

    if (page > maxPage) {
      page = 1;
    }

    var offset = (page - 1) * PAGE_SIZE;

    let wishlistItemIds = null;
    if (res.locals.currentUser) {
      const userId = res.locals.currentUser._id;
      const user = await User.findOne({ _id: userId }).populate("wishlistItems.shoe");
      wishlistItemIds = user.wishlistItems.map(item => item.shoe._id.toString());
    }

    Shoe.find({ priceDiscount: { $ne: null } })
      .skip(offset)
      .limit(PAGE_SIZE)
      .then(shoes => {
        res.render('shoes/sale', {
          page,
          maxPage,
          shoes: mutipleMongooseToObject(shoes),
          wishlistItems: wishlistItemIds
        })
      })
  }

}

module.exports = new ShoesController()
