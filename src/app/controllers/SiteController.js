const User = require('../models/User')
const Shoe = require('../models/Shoe')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class SiteController {
    checkLoginClient (req, res, next) {
        var checkLogin = res.locals.currentUser
        if(!checkLogin){
            next()
        }else{
            res.redirect('/')
        }
    }
    // [POST] /register
    register (req, res, next) {
        const { name, email, phone, password, confirm_password } = req.body
        const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const regPhone = /^0\d{9}$/
        const isCheckEmail = regEmail.test(email)
        const isCheckPhone = regPhone.test(phone)

        if (!name || !email || !phone || !password || !confirm_password) {
            return res.status(400).json("Vui lòng nhập đầy đủ thông tin!")
        }else if (!isCheckEmail){
            return res.status(400).json("Email không đúng định dạng!")
        }else if (!isCheckPhone){
            return res.status(400).json("Số điện thoại không đúng định dạng!")
        } else if (password !== confirm_password) {
            return res.status(400).json("Nhập lại mật khẩu không trùng khớp!")
        }

        User.findOne({ email: req.body.email })
            .then(data => {
                if(data){
                    return res.json("Email đã tồn tại trong hệ thống!")
                }else{
                    req.body.password = bcrypt.hashSync(password, 10)
                    const user = new User(req.body)
                    return user.save()
                }
            })
            .then((data) => {
                res.json("Tạo tài khoản thành công!")
            })
            .catch(err => {
                console.log("ERR: " + err)
                res.status(500).json("Tạo tài khoản thất bại!")
            })
            .catch(next)
    }

    // [GET] /sign-in
    signIn (req, res, next){
        res.render('signIn')
    }

    // [POST] /login
    login (req, res, next) {
        const { email, password} = req.body
        const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
        const isCheckEmail = regEmail.test(email)

        if (!email || !password ) {
            return res.status(400).json("Vui lòng nhập đầy đủ thông tin!")
        }else if (!isCheckEmail){
            return res.status(400).json("Email không đúng định dạng!")
        }

        User.findOne({ email: req.body.email })
            .then(data => {
                if(data){
                    const comparePassword = bcrypt.compareSync(password, data.password)
                    if(!comparePassword){
                        return res.json("Mật khẩu không chính xác!")
                    }else {
                        return data
                    }
                    
                }else{
                    return res.json("Email không tồn tại trong hệ thống!")
                }
            })
            .then((data) => {
                var token = jwt.sign({ _id: data._id, isAdmin: data.isAdmin}, 'nht')
                var checkCookie = res.cookie('token', token, { httpOnly: true });
                if(checkCookie) {
                    res.redirect('/')
                }
            })
            .catch(err => {
                console.log("ERR: " + err)
                res.status(500).json("Đang nhập thất bại!")
            })
            .catch(next)
    }

    
    checkLogin (req, res, next) {
        try {
            var token = req.cookies.token
            if(token){
                var decodeToken = jwt.verify(token, 'nht')
                User.findOne({ _id: decodeToken._id})
                .then((data) => {
                        data = mongooseToObject(data)
                        res.locals.currentUser = data
                        next()
                    })
                    .catch(err => {
                        console.log("ERR: " + err)
                        next(err)
                    })
                    .catch(next)
            }else {
                next()
            }
        } catch (error) {
            console.log("ERR:  " + error)
            res.redirect('/sign-in')
        }
    }

    index (req, res, next) {
        Shoe.find({})
            .then((shoes) => {
                res.render('home', {
                    shoes: mutipleMongooseToObject(shoes)
                })
            })
            .catch(next)
    }


}

module.exports = new SiteController
