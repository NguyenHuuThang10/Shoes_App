const User = require('../models/User')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
class SiteController {
    index (req, res, next) {
        res.render('home')
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
                var token = jwt.sign({ _id: data._id}, 'nht')
                var checkCookie = res.cookie('token', token, { httpOnly: true });
                if(checkCookie) {
                    res.redirect('/private')
                }
            })
            .catch(err => {
                console.log("ERR: " + err)
                res.status(500).json("Đang nhập thất bại!")
            })
            .catch(next)
    }

    // [GET] /private
    private (req, res, next) {
        try {
            var token = req.cookies.token
            var rs = jwt.verify(token, 'nht')
            if(rs){
                res.json('Welcom')
            }
        } catch (error) {
            res.redirect('/sign-in')
        }
    }

}

module.exports = new SiteController
