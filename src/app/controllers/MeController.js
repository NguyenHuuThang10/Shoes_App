const Shoe = require("../models/Shoe");
const User = require("../models/User");
const Order = require("../models/Order");
const url = require('url')
const { URL, URLSearchParams } = require('url');
const {
  mongooseToObject,
  mutipleMongooseToObject,
} = require("../../util/mongoose");
const bcrypt = require("bcrypt");
const PAGE_SIZE = 6;

class MeController {
  
  checkLoginAdmin(req, res, next) {
    var checkLogin = res.locals.currentUser;
    if (checkLogin && checkLogin.isAdmin) {
      next();
    } else {
      res.redirect("/");
    }
  }

  // [GET] /me/home
  index(req, res, next) {
    res.render("me/home");
  }

  // [GET] /me/create/shoes
  createShoes(req, res, next) {
    res.render("me/createShoes");
  }

  // [POST] /me/store/shoes
  async storeShoes(req, res, next) {
    try {
      req.body.image = req.file.filename;
      await Shoe.createShoe(req.body);
      res.redirect("/me/stored/shoes"); ///me/stored/shoes
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/stored/shoes
  async storedShoes(req, res, next) {
    try {
      // Lấy đường dẫn URL hiện tại
      var urlString = req.originalUrl;

      const myURL = url.parse(urlString, true);
      const urlParams = new URLSearchParams(myURL.search);
      urlParams.delete('page');

      const newUrl = "?"+urlParams.toString();


      // const parsedUrl = url.parse(currenUrl, true);
      // const query = parsedUrl.search;

      // const urlParams = new URLSearchParams(query);
      // urlParams.delete('page');
      // queryString = urlParams.toString()



      let shoeQuery = Shoe.find({});

      if (req.query.hasOwnProperty('_sort')){
        shoeQuery = shoeQuery.sort({
          [req.query.column]: req.query.type
        })
      }


      var page = parseInt(req.query.page) || 1;
      var allShoe = await Shoe.find({}).countDocuments();
      var maxPage = Math.ceil(allShoe / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Promise.all([
        shoeQuery,
        Shoe.countDocumentsWithDeleted({ deleted: true }),
      ]).then(([shoes, deletedCount]) => {
        shoes = shoes.slice(offset, offset + PAGE_SIZE);

        res.render("me/storedShoes", {
          page,
          maxPage,
          deletedCount,
          newUrl: newUrl,
          shoes: mutipleMongooseToObject(shoes),
        });
      });
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [GET] /me/trash/shoes
  async trashShoes(req, res, next) {
    try {
      var page = parseInt(req.query.page) || 1;
      var allShoe = await Shoe.findWithDeleted({
        deleted: true,
      }).countDocuments();
      var maxPage = Math.ceil(allShoe / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Shoe.findWithDeleted({ deleted: true })
        .skip(offset)
        .limit(PAGE_SIZE)
        .then((shoes) => {
          res.render("me/trashShoes", {
            page,
            maxPage,
            shoes: mutipleMongooseToObject(shoes),
          });
        })
        .catch(next);
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [GET] /me/:id/edit/shoes
  editShoes(req, res, next) {
    Shoe.findById(req.params.id)
      .then((shoe) => {
        res.render("me/editShoes", {
          shoe: mongooseToObject(shoe),
        });
      })
      .catch(next);
  }

  // [PUT] /me/:id/update/shoes
  async updateShoes(req, res, next) {
    try {
      if (req.file) {
        req.body.image = req.file.filename;
      }
      await Shoe.updateShoe(req.params.id, req.body);
      res.redirect("/me/stored/shoes");
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /me/:id/delete/shoes
  async deleteShoes(req, res, next) {
    try {
      await Shoe.deleteShoe(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /me/:id/destroy/shoes
  async destroyShoes(req, res, next) {
    try {
      await Shoe.destroyShoe(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /me/:id/restore/shoes
  async restoreShoes(req, res, next) {
    try {
      await Shoe.restoreShoe(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/create/users
  createUsers(req, res, next) {
    res.render("me/createUsers");
  }

  // [POST] /me/store/users
  async storeUsers(req, res, next) {
    try {
      const newUser = await User.createUser(req.body);
      res.redirect("/me/stored/users");
    } catch (error) {
      res.render("me/createUsers", {
        old: req.body,
        err: error.message,
      });
    }
  }

  // [GET] /me/stored/users
  async storedUsers(req, res, next) {
    try {
      // Lấy đường dẫn URL hiện tại
      var urlString = req.originalUrl;

      const myURL = url.parse(urlString, true);
      const urlParams = new URLSearchParams(myURL.search);
      urlParams.delete('page');

      const newUrl = "?"+urlParams.toString();


      let userQuery = User.find({});

      if (req.query.hasOwnProperty('_sort')){
        userQuery = userQuery.sort({
          [req.query.column]: req.query.type
        })
      }

      var page = parseInt(req.query.page) || 1;
      var allUser = await User.find({}).countDocuments();
      var maxPage = Math.ceil(allUser / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Promise.all([
        userQuery,
        User.countDocumentsWithDeleted({ deleted: true }),
      ]).then(([users, deletedCount]) => {
        users = users.slice(offset, offset + PAGE_SIZE);

        res.render("me/storedUsers", {
          page,
          maxPage,
          deletedCount,
          newUrl: newUrl,
          users: mutipleMongooseToObject(users),
        });
      });
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [GET] /me/trash/users
  async trashUsers(req, res, next) {
    try {
      var page = parseInt(req.query.page) || 1;
      var allUser = await User.findWithDeleted({
        deleted: true,
      }).countDocuments();
      var maxPage = Math.ceil(allUser / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      User.findWithDeleted({ deleted: true })
        .skip(offset)
        .limit(PAGE_SIZE)
        .then((users) => {
          res.render("me/trashUsers", {
            page,
            maxPage,
            users: mutipleMongooseToObject(users),
          });
        })
        .catch(next);
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [DELETE] /me/:id/delete/users
  async deleteUsers(req, res, next) {
    try {
      await User.deleteUser(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [DELETE] /me/:id/destroy/users
  async destroyUsers(req, res, next) {
    try {
      await User.destroyUser(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [PATCH] /me/:id/restore/users
  async restoreUsers(req, res, next) {
    try {
      await User.restoreUser(req.params.id);
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/:id/edit/users
  editUsers(req, res, next) {
    User.findById(req.params.id)
      .then((user) => {
        res.render("me/editUsers", {
          user: mongooseToObject(user),
        });
      })
      .catch(next);
  }

  // [PUT] /me/:id/edit/user
  async updateUsers(req, res, next) {
    try {
      const newUser = await User.upadteUser(req.body, req.params.id);
      res.redirect("/me/stored/users");
    } catch (error) {
      res.render("me/editUsers", {
        old: req.body,
        err: error.message,
      });
    }
  }

  // [GET] me/stored/orders
  async storedOrders(req, res, next) {
    try {

      var page = parseInt(req.query.page) || 1;
      var allOrder = await Order.find({}).countDocuments();
      var maxPage = Math.ceil(allOrder / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      var orderQuery = Order.find({}).populate({path: "user", model: "User",})

      Promise.all([
        orderQuery,
        Order.countDocumentsWithDeleted({ deleted: true }),
      ]).then(([orders, deletedCount]) => {
        orders = orders.slice(offset, offset + PAGE_SIZE);

        res.render("me/storedOrder", {
          page,
          maxPage,
          deletedCount,
          orders: mutipleMongooseToObject(orders),
        });
      });

      // Order.find({})
      //   .populate({
      //     path: "user",
      //     model: "User",
      //   })
      //   .skip(offset)
      //   .limit(PAGE_SIZE)
      //   .then((orders) => {
      //     res.render("me/storedOrder", {
      //       page,
      //       maxPage,
      //       orders: mutipleMongooseToObject(orders),
      //     });
      //   })
      //   .catch(next);

    } catch (error) {
      console.log("ERR: " + error);
    }
  }

   // [DELETE] /me/:id/delete/order
   async deleteOrder(req, res, next) {
    try {
      var orderId = req.params.id
      await Order.delete({ _id: orderId})
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/trash/orders
  async trashOrders(req, res, next) {
    try {
      var page = parseInt(req.query.page) || 1;
      var allOrder = await Order.findWithDeleted({
        deleted: true,
      }).countDocuments();
      var maxPage = Math.ceil(allOrder / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Order.findWithDeleted({ deleted: true })
        .populate({path: "user", model: "User",})
        .skip(offset)
        .limit(PAGE_SIZE)
        .then((orders) => {
          res.render("me/trashOrders", {
            page,
            maxPage,
            orders: mutipleMongooseToObject(orders),
          });
        })
        .catch(next);
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

    // [PATCH] /me/:id/restore/order
    async restoreOrder(req, res, next) {
      try {
        var orderId = req.params.id
        await Order.restore({ _id: orderId })
        res.redirect("back");
      } catch (error) {
        next(error);
      }
    }

    // [DELETE] /me/:id/destroy/order
    async destroyOrder(req, res, next) {
      try {
        var orderId = req.params.id
        await Order.deleteOne({ _id: orderId });
        res.redirect("back");
      } catch (error) {
        next(error);
      }
    }

  // [GET] /me/stored/order-detail/:id
  async orderDetail(req, res, next) {
    try {
        const orderId = req.params.id
        const order = await Order.findOne({
            _id: orderId
        })
            .populate("orderItems.shoe")
            .populate({
            path: "user",
            model: "User",
            });

        res.render("me/orderDetail", {
            order: mongooseToObject(order),
        });
    } catch (error) {
      console.log("ERR OrderDetail: " + error);
    }
  }
}

module.exports = new MeController();
