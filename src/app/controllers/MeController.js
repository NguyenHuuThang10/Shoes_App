const Shoe = require("../models/Shoe");
const User = require("../models/User");
const Order = require("../models/Order");
const Blog = require("../models/Blog");
const Page = require("../models/Page");
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
    res.render("me/createShoes", {
      err: req.flash('err')
    });
  }

  // [POST] /me/store/shoes
  async storeShoes(req, res, next) {
    try {
      if (req.file) {
        req.body.image = req.file.filename;
      } else {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!');
        return res.redirect('back')
      }

      const { name, type, typeDetail, description, quantity, status, price } = req.body
      if (!name || !type || !typeDetail || !description || !quantity || !status || !price) {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!');
        return res.redirect('back')
      }
      await Shoe.createShoe(req.body);
      req.flash('success', 'Thêm sản phẩm thành công!');
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

      const newUrl = "?" + urlParams.toString();


      // const parsedUrl = url.parse(currenUrl, true);
      // const query = parsedUrl.search;

      // const urlParams = new URLSearchParams(query);
      // urlParams.delete('page');
      // queryString = urlParams.toString()



      let shoeQuery = Shoe.find({});

      if (req.query.hasOwnProperty('_sort')) {
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
          success: req.flash('success'),
          err: req.flash('err'),
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
          err: req.flash('err')
        });
      })
      .catch(next);
  }

  // [PUT] /me/:id/update/shoes
  async updateShoes(req, res, next) {
    try {
      const { name, type, typeDetail, description, quantity, status, price } = req.body
      if (!name || !type || !typeDetail || !description || !quantity || !status || !price) {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!');
        return res.redirect('back')
      }

      if(req.file) {
        req.body.image = req.file.filename;
      }
      await Shoe.updateShoe(req.params.id, req.body);
      req.flash('success', 'Cập nhật sản phẩm thành công!')
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

      const newUrl = "?" + urlParams.toString();


      let userQuery = User.find({});

      if (req.query.hasOwnProperty('_sort')) {
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

      var orderQuery = Order.find({}).populate({ path: "user", model: "User", })

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

    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [DELETE] /me/:id/delete/order
  async deleteOrder(req, res, next) {
    try {
      var orderId = req.params.id
      await Order.delete({ _id: orderId })
      res.redirect("back");
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/:id/edit/order
  editOrder(req, res, next) {
    Order.findById(req.params.id)
      .then(order => {
        res.render('me/editOrder', {
          order: mongooseToObject(order),
          success: req.flash('success')
        })
      })
      .catch(err => {
        console.log("ERR EDIT-ODER: " + err)
      })
      .catch(next)
  }

  // [PUT] /me/:id/edit/order
  updateOrder(req, res, next) {
    try {
      const orderId = req.params.id;
      let { fullName, phone, city, paymentMethod, isPaid, isDelivered, status } = req.body
      const regPhone = /^0\d{9}$/;
      isDelivered = isDelivered === "Đã giao hàng"
      isPaid = isPaid === 'Đã thanh toán'

      const isCheckPhone = regPhone.test(phone);


      if (!fullName || !phone || !city || !paymentMethod || !status) {
        return res.render("me/editOrder", {
          err: "Vui lòng nhập đầy đủ thông tin!",
          old: { fullName, phone, city, paymentMethod, isPaid, isDelivered, status }
        })
      } else if (!isCheckPhone) {
        return res.render("me/editOrder", {
          err: "Số điện thoại không đúng định dạng!",
          old: { fullName, phone, city, paymentMethod, isPaid, isDelivered, status }
        })
      }
      Order.updateOne({ _id: orderId }, {
        shippingAddress: { fullName, phone, city },
        paymentMethod,
        isPaid,
        isDelivered,
        status
      })
        .then(data => {
          req.flash('success', 'Cập nhật đơn hàng thành công!')
          res.redirect("back")
        })
        .catch(next)

    } catch (err) {
      console.log("ERR UPDATE-ODER: " + err)
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
        .populate({ path: "user", model: "User", })
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

  //[GET] /me/create/blogs
  createBlogs(req, res, next) {
    res.render('me/createBlogs', {
      success: req.flash('success'),
      err: req.flash('err')
    })
  }

  //[POST] /me/create/blogs
  storeBlogs(req, res, next) {

    const { title, description, category, content } = req.body
    if (!title || !description || !category || !content || !req.file) {
      req.flash('err', 'Vui lòng nhập đầy đủ thông tin!')
      return res.redirect('back')
    } else {
      req.body.avatar = req.file.filename;
    }

    var newBlog = new Blog(req.body)

    newBlog.save()
      .then(() => {
        req.flash('success', 'Thêm bài blog thành công!')
        res.redirect('back')
      })
      .catch(next)
  }

  //[GET] /me/stored/blogs
  async storedBlogs(req, res, next) {
    try {
      // Lấy đường dẫn URL hiện tại
      var urlString = req.originalUrl;

      const myURL = url.parse(urlString, true);
      const urlParams = new URLSearchParams(myURL.search);
      urlParams.delete('page');

      const newUrl = "?" + urlParams.toString();

      let blogQuery = Blog.find({});

      if (req.query.hasOwnProperty('_sort')) {
        blogQuery = blogQuery.sort({
          [req.query.column]: req.query.type
        })
      }


      var page = parseInt(req.query.page) || 1;
      var allBlog = await Blog.find({}).countDocuments();
      var maxPage = Math.ceil(allBlog / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Promise.all([
        blogQuery,
        Blog.countDocumentsWithDeleted({ deleted: true }),
      ]).then(([blogs, deletedCount]) => {
        blogs = blogs.slice(offset, offset + PAGE_SIZE);

        res.render("me/storedBlogs", {
          success: req.flash('success'),
          err: req.flash('err'),
          page,
          maxPage,
          deletedCount,
          newUrl: newUrl,
          blogs: mutipleMongooseToObject(blogs),
        });
      });
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [Get] /me/trash/blogs
  async trashBlogs(req, res, next) {
    try {
      var page = parseInt(req.query.page) || 1;
      var allBlog = await Blog.findWithDeleted({
        deleted: true,
      }).countDocuments();
      var maxPage = Math.ceil(allBlog / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Blog.findWithDeleted({ deleted: true })
        .skip(offset)
        .limit(PAGE_SIZE)
        .then((blogs) => {
          res.render("me/trashBlogs", {
            page,
            maxPage,
            blogs: mutipleMongooseToObject(blogs),
            success: req.flash('success')
          });
        })
        .catch(next);
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [delete] /me/:id/delete/blogs
  deleteBlogs(req, res, next) {
    try {
      const blogId = req.params.id;
      if (blogId) {
        Blog.delete({ _id: blogId })
          .then(() => {
            req.flash('success', 'Xóa bài viết thành công!')
            res.redirect('back')
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [patch] /me/:id/restore/blogs
  restoreBlogs(req, res, next) {
    try {
      const blogId = req.params.id;
      if (blogId) {
        Blog.restore({ _id: blogId })
          .then(() => {
            req.flash('success', 'Phục hồi bài viết thành công!')
            res.redirect('back')
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [delete] /me/:id/destroy/blogs
  destroyBlogs(req, res, next) {
    try {
      const blogId = req.params.id
      if (blogId) {
        Blog.deleteOne({ _id: blogId })
          .then(() => {
            req.flash('success', 'Xóa vĩnh viễn bài viết thành công!')
            res.redirect("back");
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/:id/edit/shoes
  editBlogs(req, res, next) {
    const blogId = req.params.id
    if (blogId) {
      Blog.findById(blogId)
        .then((blog) => {
          res.render("me/editBlogs", {
            blog: mongooseToObject(blog),
            err: req.flash('err')
          });
        })
        .catch(next);
    }
  }

  //[PUT] /me/:id/edit/shoes
  updateBlogs(req, res, next) {
    try {
      const blogId = req.params.id
      const { title, description, category, content } = req.body
      if (!title || !description || !category || !content) {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!')
        return res.redirect('back')
      }

      if (req.file) {
        req.body.avatar = req.file.filename;
      }

      if (blogId) {
        Blog.updateOne({ _id: blogId }, req.body)
          .then(() => {
            req.flash('success', 'Cập nhật bài viết thành công!')
            res.redirect('/me/stored/blogs')
          })
      }
    } catch (error) {
      next(error);
    }

  }

  // [GET] /me/create/pages
  createPages(req, res, next) {
    res.render('me/createPages', {
      success: req.flash('success')
    })
  }

  //[POST] /me/create/pages
  storePages(req, res, next) {
    if (req.file) {
      req.body.avatar = req.file.filename;
    }

    var newPage = new Page(req.body)

    newPage.save()
      .then(() => {
        req.flash('success', 'Thêm trang thành công!')
        res.redirect('back')
      })
      .catch(next)
  }

  //[GET] /me/stored/pages
  async storedPages(req, res, next) {
    try {
      // Lấy đường dẫn URL hiện tại
      var urlString = req.originalUrl;

      const myURL = url.parse(urlString, true);
      const urlParams = new URLSearchParams(myURL.search);
      urlParams.delete('page');

      const newUrl = "?" + urlParams.toString();

      let pageQuery = Page.find({});

      if (req.query.hasOwnProperty('_sort')) {
        pageQuery = pageQuery.sort({
          [req.query.column]: req.query.type
        })
      }


      var page = parseInt(req.query.page) || 1;
      var allPage = await Page.find({}).countDocuments();
      var maxPage = Math.ceil(allPage / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Promise.all([
        pageQuery,
        Page.countDocumentsWithDeleted({ deleted: true }),
      ]).then(([pages, deletedCount]) => {
        pages = pages.slice(offset, offset + PAGE_SIZE);

        res.render("me/storedPages", {
          success: req.flash('success'),
          err: req.flash('err'),
          page,
          maxPage,
          deletedCount,
          newUrl: newUrl,
          pages: mutipleMongooseToObject(pages),
        });
      });
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [Get] /me/trash/pages
  async trashPages(req, res, next) {
    try {
      var page = parseInt(req.query.page) || 1;
      var allPage = await Blog.findWithDeleted({
        deleted: true,
      }).countDocuments();
      var maxPage = Math.ceil(allPage / PAGE_SIZE);

      if (page > maxPage) {
        page = 1;
      }

      var offset = (page - 1) * PAGE_SIZE;

      Page.findWithDeleted({ deleted: true })
        .skip(offset)
        .limit(PAGE_SIZE)
        .then((pages) => {
          res.render("me/trashPages", {
            page,
            maxPage,
            pages: mutipleMongooseToObject(pages),
            success: req.flash('success')
          });
        })
        .catch(next);
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [delete] /me/:id/delete/blogs
  deletePages(req, res, next) {
    try {
      const pageId = req.params.id;
      if (pageId) {
        Page.delete({ _id: pageId })
          .then(() => {
            req.flash('success', 'Xóa trang thành công!')
            res.redirect('back')
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [patch] /me/:id/restore/blogs
  restorePages(req, res, next) {
    try {
      const pageId = req.params.id;
      if (pageId) {
        Page.restore({ _id: pageId })
          .then(() => {
            req.flash('success', 'Phục hồi trang thành công!')
            res.redirect('back')
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [delete] /me/:id/destroy/blogs
  destroyPages(req, res, next) {
    try {
      const pageId = req.params.id
      if (pageId) {
        Page.deleteOne({ _id: pageId })
          .then(() => {
            req.flash('success', 'Xóa vĩnh viễn trang thành công!')
            res.redirect("back");
          })
      }
    } catch (error) {
      next(error);
    }
  }

  // [GET] /me/:id/edit/shoes
  editPages(req, res, next) {
    const pageId = req.params.id
    if (pageId) {
      Page.findById(pageId)
        .then((page) => {
          res.render("me/editPages", {
            page: mongooseToObject(page),
            err: req.flash('err')
          });
        })
        .catch(next);
    }
  }

  //[PUT] /me/:id/edit/shoes
  updatePages(req, res, next) {
    try {
      const pageId = req.params.id
      const { title, category, content } = req.body
      if (!title || !category || !content) {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!')
        return res.redirect('back')
      }

      if (req.file) {
        req.body.avatar = req.file.filename;
      }

      if (pageId) {
        Page.updateOne({ _id: pageId }, req.body)
          .then(() => {
            req.flash('success', 'Cập nhật trang thành công!')
            res.redirect('/me/stored/pages')
          })
      }
    } catch (error) {
      next(error);
    }

  }

}



module.exports = new MeController();
