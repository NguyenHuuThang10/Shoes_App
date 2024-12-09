const User = require("../models/User");
const Shoe = require("../models/Shoe");
const {
  mongooseToObject,
  mutipleMongooseToObject,
} = require("../../util/mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailer = require("../../util/mailer");
const { renderSync } = require("sass");
const Order = require("../models/Order");

class SiteController {
  checkClient(req, res, next) {
    var checkLogin = res.locals.currentUser;
    if (!checkLogin) {
      next();
    } else {
      res.redirect("/");
    }
  }

  checkLoginClient(req, res, next) {
    var checkLogin = res.locals.currentUser;
    if (checkLogin) {
      next();
    } else {
      res.redirect("/login");
    }
  }

  async index(req, res, next) {
    try {
      const [shoeHight, shoeHightType, sandal, sandalType, baby, babyType, boot, bootType, discount] = await Promise.all([
        Shoe.find({ typeDetail: "Giày cao gót", priceDiscount: null, quantity: {$ne: "0"} }).limit(6),
        Shoe.findOne({ typeDetail: "Giày cao gót" }),
        Shoe.find({ typeDetail: "Dép nam", priceDiscount: null, quantity: {$ne: "0"} }).limit(6),
        Shoe.findOne({ typeDetail: "Dép nam" }),
        Shoe.find({ typeDetail: "Giày búp bê", priceDiscount: null, quantity: {$ne: "0"} }).limit(6),
        Shoe.findOne({ typeDetail: "Giày búp bê" }),
        Shoe.find({ typeDetail: "Boot nam", priceDiscount: null, quantity: {$ne: "0"} }).limit(6),
        Shoe.findOne({ typeDetail: "Boot nam" }),
        Shoe.find({ priceDiscount: { $ne: null }, quantity: {$ne: "0"} }).limit(6)
      ]);

      let wishlistItemIds = null;
      // return res.send(res.locals.currentUser)
      if (res.locals.currentUser) {
        // console.log('xin chao')
        const userId = res.locals.currentUser._id;
        const user = await User.findOne({ _id: userId }).populate("wishlistItems.shoe");
        wishlistItemIds = user.wishlistItems.map(item => item.shoe._id.toString());
      }

      res.render("home", {
        shoeHight: mutipleMongooseToObject(shoeHight),
        sandal: mutipleMongooseToObject(sandal),
        baby: mutipleMongooseToObject(baby),
        boot: mutipleMongooseToObject(boot),
        discount: mutipleMongooseToObject(discount),
        shoeHightType: shoeHightType.slugType,
        sandalType: sandalType.slugType,
        babyType: babyType.slugType,
        bootType: bootType.slugType,
        wishlistItems: wishlistItemIds
      });

    } catch (error) {
      console.log("ERR: " + error);
      next(error); // Đảm bảo chuyển tiếp lỗi đến middleware xử lý lỗi.
    }
  }

  // [POST] /register
  register(req, res, next) {
    const { name, email, phone, password, confirm_password } = req.body;
    const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const regPhone = /^0\d{9}$/;
    const isCheckEmail = regEmail.test(email);
    const isCheckPhone = regPhone.test(phone);

    if (!name || !email || !phone || !password || !confirm_password) {
      return res.render("form/userForm", {
        errSignUp: "Vui lòng nhập đầy đủ thông tin!",
        old: req.body
      })
    } else if (!isCheckEmail) {
      return res.render("form/userForm", {
        errSignUp: "Email không đúng định dạng!",
        old: req.body
      })
    } else if (!isCheckPhone) {
      return res.render("form/userForm", {
        errSignUp: "Số điện thoại không đúng định dạng!",
        old: req.body
      })
    } else if (password !== confirm_password) {
      return res.render("form/userForm", {
        errSignUp: "Nhập lại mật khẩu không trùng khớp!",
        old: req.body
      })
    }

    User.findOne({ email: req.body.email , authProvider: 'local'})
      .then((data) => {
        if (data) {
          return res.render("form/userForm", {
            errSignUp: "Email đã tồn tại trong hệ thống!",
            old: req.body
          })
        } else {
          var token = bcrypt.hashSync(email, 5);
          req.body.activeToken = token;
          req.body.password = bcrypt.hashSync(password, 10);
          const user = new User(req.body);
          user.save()
            .then(() => {
              var sendMail = mailer.sendMail(
                email,
                "Active User",
                `Hi, ${name}. Vui lòng bấm vào nút "Active" để kích hoạt tài khoản.<br> <br> <br> <a style="padding: 16px 32px;
                  display: inline-block;
                  background-color: green;
                  color: #fff;
                  text-decoration: none;
                  font-size: 25px;" href="${process.env.APP_URL}/active?token=${token}"> Active </a>`
              );
              if (sendMail) {
                return res.render("form/userForm", {
                  sucessSignUp: "Tạo tài khoản thành công, vui lòng kiểm tra email để kích hoạt tài khoản!",
                })
              } else {
                return res.render("form/userForm", {
                  errSignUp: "Gửi mail thất bại!",
                })
              }
            })
            .catch(next)

        }
      })
      .catch((err) => {
        console.log("ERR: " + err);
        return res.render("form/userForm", {
          errSignUp: "Tạo tài khoản thất bại!",
          old: req.body
        })
      })
      .catch(next);
  }

  // [Get] /active
  async active(req, res, next) {
    try {
      var token = req.query.token
      var checkToken = await User.findOneAndUpdate(
        { activeToken: token },
        { activeToken: null, status: 1 },
        { new: true }
      );
      if (checkToken) {
        res.redirect('/login')
      }else{
        res.render('supports/error')
      }
    } catch (error) {
      console.log("ERR: " + error)
    }

  }

  // [GET] /login
  signIn(req, res, next) {
    res.render("form/userForm");
  }

  // [POST] /login
  login(req, res, next) {
    const { email, password } = req.body;
    const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = regEmail.test(email);

    if (!email || !password) {
      return res.render("form/userForm", {
        errLogin: "Vui lòng nhập đầy đủ thông tin!",
        oldLogin: req.body
      })
    } else if (!isCheckEmail) {
      return res.render("form/userForm", {
        errLogin: "Email không đúng định dạng!",
        oldLogin: req.body
      });


    }

    User.findOne({ email: req.body.email, status: 1 , authProvider: 'local'})
      .then((data) => {
        if (data) {
          const comparePassword = bcrypt.compareSync(password, data.password);
          if (!comparePassword) {
            res.render("form/userForm", {
              errLogin: "Mật khẩu không chính xác!",
              oldLogin: req.body
            });
          } else {
            return data;
          }
        } else {
          res.render("form/userForm", {
            errLogin: "Email không tồn tại trong hệ thống hoặc chưa được kích hoạt!",
            oldLogin: req.body
          });
        }
      })
      .then((data) => {
        var token = jwt.sign({ _id: data._id, isAdmin: data.isAdmin }, "nht");
        var checkCookie = res.cookie("token", token, { httpOnly: true });
        if (checkCookie) {
          res.redirect("/");
        }
      })
      .catch((err) => {
        console.log("ERR: " + err);
        res.render("form/userForm", {
          err: "Đăng nhập thất bại!",
          old: req.body
        });
      })
      .catch(next);
  }

  async checkLogin(req, res, next) {
    try {
      var token = req.cookies.token;
      if (token) {
        var decodeToken = jwt.verify(token, "nht");

        const order = await Order.findOne({ user: decodeToken._id, paymentMethod: null}).populate("orderItems.shoe");
        let countOrder = 0;
        if(order){
          order.orderItems.forEach(data => {
            countOrder += data.amount;
          });
          const orderData = mongooseToObject(order)
          res.locals.orderData = orderData;
          res.locals.countOrder = countOrder;
          // Tính tổng số lượng sản phẩm bằng cách sử dụng phương thức reduce
          const totalAmount = order.orderItems.reduce((total, item) => total + item.amount, 0);
          res.locals.totalAmount = totalAmount;
        }

        User.findOne({ _id: decodeToken._id })
          .then((data) => {
            if(data) {
              const countWishlist = data.wishlistItems.length;
              data = mongooseToObject(data);
              res.locals.countWishlist = countWishlist;
              res.locals.currentUser = data;
              next();
            } else {
              // Xóa cookie nếu không tìm thấy User
              res.clearCookie("token");
              return res.redirect("/login");
            }
          })
          .catch((err) => {
            console.log("ERR: " + err);
            next(err);
          })
          .catch(next);
      } else {
        next();
      }
    } catch (error) {
      console.log("ERR:  " + error);
      res.redirect("/login");
    }
  }

  // [GET] /log-out
  async logOut(req, res, next) {
    try {
      await res.clearCookie("token");
      res.redirect("/");
    } catch (error) {
      console.log("ERR: ", error);
    }
  }

  // [GET] /forgot
  forgotPassword(req, res, next) {
    res.render("form/forgotPassword");
  }

  // [POST] /forgot
  async sendGmail(req, res, next) {
    try {
      var email = req.body.email;
      var checkEmail = await User.findOne({ email });

      if (!email) {
        res.render("form/forgotPassword", {
          msgErr: "Vui lòng nhập đầy đủ thông tin!"
        });
      }

      if (checkEmail) {
        var token = bcrypt.hashSync(email, 5);
        checkEmail.resetToken = token;
        checkEmail.save();

        var sendMail = mailer.sendMail(
          checkEmail.email,
          "RESET PASSWORD",
          `Hi, ${checkEmail.name}. Vui lòng bấm vào nút "Reset" để được đặt lại mật khẩu. <br> <br> <br> <a style="padding: 16px 32px;
          display: inline-block;
          background-color: green;
          color: #fff;
          text-decoration: none;
          font-size: 25px;" href="${process.env.APP_URL}/reset?email=${checkEmail.email}&token=${token}"> Reset </a>`
        );
        if (sendMail) {
          res.render("form/forgotPassword", {
            msg: "Vui lòng kiểm tra email để đặt lại mật khẩu!"
          });
        } else {
          res.render("form/forgotPassword", {
            msgErr: "Gửi mail thất bại!"
          });
        }
      } else {
        res.render("form/forgotPassword", {
          msgErr: "Email không tồn tại trong hệ thống!"
        });
      }
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [Get] /reset
  async renderReset(req, res, next) {
    try {
      var token = req.query.token
      var email = req.query.email
      var checkToken = await User.findOneAndUpdate(
        { resetToken: token },
        { resetToken: null },
        { new: true }
      );
      if (checkToken) {
        res.render('form/resetPassword', { email })
      } else {
        res.redirect('/login')
      }
    } catch (error) {
      console.log("ERR: " + error)
    }
  }

  // [PUT] /reset
  resetPassword(req, res, next) {
    const { email, password, confirm_password } = req.body;

    if (!password || !confirm_password) {
      return res.render("form/resetPassword", {
        msgErr: "Vui long nhập đầy đủ thông tin!",
        email
      });
    } else if (password !== confirm_password) {
      return res.render("form/resetPassword", {
        msgErr: "Nhập lại mật khẩu không trùng khớp!",
        email
      });
    }

    var passwordHash = bcrypt.hashSync(password, 10);

    User.updateOne({ email, authProvider: 'local', status: 1 }, { password: passwordHash })
      .then(data => {
        if (data) {
          res.redirect('/login')
        } else {
          res.render("form/resetPassword", {
            msgErr: "Cấp lại mật khẩu không thành công!",
            email
          });
        }
      })
      .catch(err => {
        console.log("ERR: " + err)
      })
      .catch(next)
  }

  cart(req, res, next) {
    res.render('shoes/cart')
  }

  // [GET] /profile
  async profile(req, res, next) {
    var userId = res.locals.currentUser._id
    var shippingAddress = await Order.findOne({ user: userId })
    if (shippingAddress) {
      res.render('form/profile', {
        user: res.locals.currentUser,
        shippingAddress: mongooseToObject(shippingAddress.shippingAddress),
        success: req.flash('success'),
        err: req.flash('err')
      })
    } else {
      res.render('form/profile', {
        user: res.locals.currentUser,
        success: req.flash('success'),
        err: req.flash('err')
      })
    }
  }

  // [POST] /profile
  updateProfile(req, res, next) {
    try {
      const { name, email, phone, city, district, ward, address, cityName, districtName, wardName } = req.body;
      const userId = res.locals.currentUser
      const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
      const regPhone = /^0\d{9}$/;
      const isCheckEmail = regEmail.test(email);
      const isCheckPhone = regPhone.test(phone);

      if (!name || !email || !phone) {
        req.flash('err', 'Vui lòng nhập đầy đủ thông tin!')
        return res.redirect('back');
      } else {
        if (!isCheckEmail) {
          req.flash('err', 'Emai không đúng định dạng!')
          return res.redirect('back');
        } else if (!isCheckPhone) {
          req.flash('err', 'Số điện thoại không đúng định dạng!')
          return res.redirect('back');
        }

        User.updateOne({ _id: userId }, {
          name,
          email,
          phone,
          shippingAddress: { address, city, district, ward, cityName, districtName, wardName }
        })
          .then(() => {
            req.flash('success', 'Cập nhật thông tin thành công!')
            res.redirect('back')
          })
          .catch(next)
      }
    } catch (error) {
      console.log("ERR UPDATE PROFILE: ", error)
      req.flash('err', 'Hệ thống gặp sự cố, vui lòng thử lại sau!')
      res.redirect('back');
    }

  }

  // [get] /password
  password(req, res, next) {

    var userId = res.locals.currentUser._id

    res.render('form/password', {
      user: res.locals.currentUser,
    })
  }

  // [post] /password
  async changePass(req, res, next) {
    try {
      var { passOld, passNew, confirm_password } = req.body
      var userId = res.locals.currentUser._id

      if (!passNew || !passOld || !confirm_password) {
        return res.render('form/password', {
          msgErr: "Vui lòng nhập đầy đủ thông tin!",
          user: res.locals.currentUser,
        })
      }
      var comparePassword = bcrypt.compareSync(passOld, res.locals.currentUser.password);

      if (comparePassword) {
        if (passNew !== confirm_password) {
          return res.render('form/password', {
            msgErr: "Nhập lại mật khẩu không trùng khớp!",
            user: res.locals.currentUser,
          })
        } else {
          var passNewHash = bcrypt.hashSync(passNew, 10);
          var update = await User.findOneAndUpdate(
            { _id: userId },
            { password: passNewHash },
            { new: true }
          )

          if (update) {
            return res.render('form/password', {
              msg: "Đổi mật khẩu thành công!",
              user: res.locals.currentUser,
            })
          } else {
            res.json('LOi')
          }

        }
      } else {
        return res.render('form/password', {
          msgErr: "Mật khẩu cũ không đúng!",
          user: res.locals.currentUser,
        })
      }

    } catch (error) {
      console.log("ERR: " + error)
    }


  }

  //[GET] /search
  search(req, res, next) {
    const keyWord = req.params.keyWord;
    res.render("search");
  }

  // [GET] /auth-provider
  authProvider(req, res, next) {
    if (req.user) {
      const accountId = req.user.accountId;
      if (accountId) {
        User.findOne({ accountId: accountId, activeToken: null })
          .then((data) => {
            var token = jwt.sign({ _id: data._id, isAdmin: data.isAdmin }, "nht");
            var checkCookie = res.cookie("token", token, { httpOnly: true });
            if (checkCookie) {
              res.redirect("/");
            }
          })
          .catch((err) => {
            console.log("ERR: " + err);
            req.flash('err', "Đăng nhập thất bại")
            res.redirect('/login');
          })
          .catch(next);
      }
    } else {
      res.redirect('/login')
    }

  }

  // [GET] /auth-provider
  authFail(req, res, next) {
    res.redirect('/login')
  }


}

module.exports = new SiteController();
