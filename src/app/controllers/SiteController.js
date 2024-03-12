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
      res.redirect("/");
    }
  }

  async index(req, res, next) {
    try {
      var shoeHight = await Shoe.find({ typeDetail: "Giày cao gót"}).limit(4)
      var shoeHightType = await Shoe.findOne({ typeDetail: "Giày cao gót"})

      var sandal = await Shoe.find({ typeDetail: "Dép nam"}).limit(4)
      var sandalType = await Shoe.findOne({ typeDetail: "Dép nam"})
      if( shoeHight ){
        res.render("home", {
          shoeHight: mutipleMongooseToObject(shoeHight),
          sandal: mutipleMongooseToObject(sandal),
          shoeHightType: shoeHightType.slugType,
          sandalType: sandalType.slugType,
        });
      }
    } catch (error) {
      console.log("ERR: " + error)
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
      return res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
    } else if (!isCheckEmail) {
      return res.status(400).json("Email không đúng định dạng!");
    } else if (!isCheckPhone) {
      return res.status(400).json("Số điện thoại không đúng định dạng!");
    } else if (password !== confirm_password) {
      return res.status(400).json("Nhập lại mật khẩu không trùng khớp!");
    }

    User.findOne({ email: req.body.email })
      .then((data) => {
        if (data) {
          return res.json("Email đã tồn tại trong hệ thống!");
        } else {
          req.body.password = bcrypt.hashSync(password, 10);
          const user = new User(req.body);
          return user.save();
        }
      })
      .then((data) => {
        res.json("Tạo tài khoản thành công!");
      })
      .catch((err) => {
        console.log("ERR: " + err);
        res.status(500).json("Tạo tài khoản thất bại!");
      })
      .catch(next);
  }

  // [GET] /sign-in
  signIn(req, res, next) {
    res.render("form/userForm");
  }

  // [POST] /sign-in
  login(req, res, next) {
    const { email, password } = req.body;
    const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/;
    const isCheckEmail = regEmail.test(email);

    if (!email || !password) {
      return res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
    } else if (!isCheckEmail) {
      return res.status(400).json("Email không đúng định dạng!");
    }

    User.findOne({ email: req.body.email })
      .then((data) => {
        if (data) {
          const comparePassword = bcrypt.compareSync(password, data.password);
          if (!comparePassword) {
            return res.json("Mật khẩu không chính xác!");
          } else {
            return data;
          }
        } else {
          return res.json("Email không tồn tại trong hệ thống!");
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
        res.status(500).json("Đang nhập thất bại!");
      })
      .catch(next);
  }

  checkLogin(req, res, next) {
    try {
      var token = req.cookies.token;
      if (token) {
        var decodeToken = jwt.verify(token, "nht");
        User.findOne({ _id: decodeToken._id })
          .then((data) => {
            data = mongooseToObject(data);
            res.locals.currentUser = data;
            next();
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
      res.redirect("/sign-in");
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
    res.render("/forgotPassword");
  }

  // [POST] /forgot
  async sendGmail(req, res, next) {
    try {
      var email = req.body.email;
      var checkEmail = await User.findOne({ email });

      if (checkEmail) {
        var token = bcrypt.hashSync(email, 5);
        checkEmail.resetToken = token;
        checkEmail.save();

        var sendMail = mailer.sendMail(
          checkEmail.email,
          "RESET PASSWORD",
          `<a href="${process.env.APP_URL}/reset?email=${checkEmail.email}&token=${token}"> Reset </a>`
        );
        if (sendMail) {
          res.json("Gui mail thanh cong");
        } else {
          res.json("Gui mail that bai");
        }
      } else {
        res.json("Email khong ton tai trong he thong");
      }
    } catch (error) {
      console.log("ERR: " + error);
    }
  }

  // [Get] /reset
  async renderReset (req, res, next) {
    var token = req.query.token
    var email = req.query.email
    var checkToken = await User.findOneAndUpdate(
                                { resetToken: token },
                                {  resetToken: null },
                                { new: true }
                            );
    if(checkToken){
        res.json('Render ra file reset')
    }else{
        res.json('Loi')
    }
  }

  // [PUT] /reset
  resetPassword (req, res, next) {
    const { email, password, confirm_password } = req.body;

    if (!password || !confirm_password) {
      return res.status(400).json("Vui lòng nhập đầy đủ thông tin!");
    } else if (password !== confirm_password) {
      return res.status(400).json("Nhập lại mật khẩu không trùng khớp!");
    }
    var passwordHash = bcrypt.hashSync(password, 10);

    User.updateOne({ email }, { password: passwordHash })
        .then(data => {
            res.json('Doi mat khau thanh cong')
        })
        .catch(err => {
            console.log("ERR: " + err)
        })
        .catch(next)
  }

    cart (req, res, next) {
        res.render('shoes/cart')
    }
    
    async profile (req, res, next) {
        var userId = res.locals.currentUser._id
        var shippingAddress = await Order.findOne({ user: userId })
        if(shippingAddress){
          res.render('form/profile', {
            user: res.locals.currentUser,
            shippingAddress: mongooseToObject(shippingAddress.shippingAddress)
          })
        }else{
          res.render('form/profile', {
            user: res.locals.currentUser,
          })
        }
    } 
    
    chancepass (req, res, next) {
        res.render('form/password')
    }

}

module.exports = new SiteController();
