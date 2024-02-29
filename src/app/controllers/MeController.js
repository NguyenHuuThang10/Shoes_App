const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt');

class MeController {
    // [GET] /me/home
    index (req, res, next) {
        res.render('me/home')
    }

    // [GET] /me/create/shoes
    createShoes (req, res, next) {
        res.render('me/createShoes')
    }

    // [POST] /me/store/shoes
    storeShoes (req, res, next) {
        req.body.image = req.file.filename
        const shoe = new Shoe(req.body)
        shoe.save()
            .then(() => {
                res.redirect('/me/stored/shoes')
            })
            .catch(next)
    }

    // [GET] /me/stored/shoes
    storedShoes (req, res, next) {
        let shoeQuery = Shoe.find({})

        Promise.all([shoeQuery, Shoe.countDocumentsWithDeleted({ deleted: true})])
            .then(([shoes, deletedCount]) => {
                res.render('me/storedShoes', {
                    deletedCount,
                    shoes: mutipleMongooseToObject(shoes)
                })
            })

        // Shoe.find({})
        //     .then(shoes => {
        //         res.render('me/storedShoes', {
        //             shoes: mutipleMongooseToObject(shoes)
        //         })
        //     })
        //     .catch(next)
    }

    // [GET] /me/trash/shoes
    trashShoes (req, res, next) {
        Shoe.findWithDeleted({ deleted: true })
            .then((shoes) => {
                res.render("me/trashShoes", {
                    shoes: mutipleMongooseToObject(shoes),
                });
            })
            .catch(next);
    }

    // [GET] /me/:id/edit/shoes
    editShoes (req, res, next) {
        Shoe.findById(req.params.id)
            .then(shoe => {
                res.render('me/editShoes', {
                    shoe: mongooseToObject(shoe)
                })
            })
            .catch(next)
    }

    // [PUT] /me/:id/update/shoes
    updateShoes (req, res, next) {
        if(req.file){
            req.body.image = req.file.filename
        }
        Shoe.updateOne({ _id: req.params.id}, req.body)
            .then(() => {
                res.redirect('/me/stored/shoes')    
            })
            .catch(next)
    }

    // [DELETE] /me/:id/delete/shoes
    delete(req, res, next) {
        Shoe.delete({ _id: req.params.id })
            .then(() =>
                res.redirect('back')
            )
            .catch(next)
    }

    // [DELETE] /me/:id/destroy/shoes
    destroy(req, res, next) {
        Shoe.deleteOne({ _id: req.params.id })
            .then(() =>
                res.redirect('back')
            )
            .catch(next)
    }

    // [PATCH] /me/:id/restore/shoes
    restore (req, res, next) {
        Shoe.restore({ _id: req.params.id })
            .then(() =>
                res.redirect('back')
            )
            .catch(next)
    }


    // [GET] /me/create/users
    createUsers (req, res, next) {
        res.render('me/createUsers')
    }


    // [GET] /me/stored/users
    storedUsers (req, res, next) {
        let userQuery = User.find({})

        Promise.all([userQuery, User.countDocumentsWithDeleted({ deleted: true})])
            .then(([users, deletedCount]) => {
                res.render('me/storedUsers', {
                    deletedCount,
                    users: mutipleMongooseToObject(users)
                })
            })
    }

        // [GET] /me/trash/users
        trashUsers (req, res, next) {
            User.findWithDeleted({ deleted: true })
                .then((users) => {
                    res.render("me/trashUsers", {
                        users: mutipleMongooseToObject(users),
                    });
                })
                .catch(next);
        }

        // [DELETE] /me/:id/delete/users
        delete(req, res, next) {
            User.delete({ _id: req.params.id })
                .then(() =>
                    res.redirect('back')
                )
                .catch(next)
        }

        // [DELETE] /me/:id/destroy/users
        destroy(req, res, next) {
            User.deleteOne({ _id: req.params.id })
                .then(() =>
                    res.redirect('back')
                )
                .catch(next)
        }

        // [PATCH] /me/:id/restore/users
        restore (req, res, next) {
            User.restore({ _id: req.params.id })
                .then(() =>
                    res.redirect('back')
                )
                .catch(next)
        }

        storeUsers (req, res, next) {
            
            const { name, email, phone, password, confirm_password, isAdmin } = req.body
            const regEmail = /^\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/
            const regPhone = /^0\d{9}$/
            const isCheckEmail = regEmail.test(email)
            const isCheckPhone = regPhone.test(phone)

            if (!name || !email || !phone || !password || !confirm_password) {
                return res.render('me/createUsers', {
                    user: req.body,
                    err: 'Vui lòng nhập đầy đủ thông tin!'
                })
            }else if (!isCheckEmail){
                return res.render('me/createUsers', {
                    user: req.body,
                    err: 'Email không đúng định dạng!'
                })
            }else if (!isCheckPhone){
                return res.render('me/createUsers', {
                    user: req.body,
                    err: 'Số điện thoại không đúng định dạng!'
                })
            } else if (password !== confirm_password) {
                return res.render('me/createUsers', {
                    user: req.body,
                    err: 'Nhập lại mật khẩu không trùng khớp!'
                })
            }

            User.findOne({ email: req.body.email })
                .then(data => {
                    if(data){
                        res.render('me/createUsers', {
                            user: req.body,
                            err: 'Email đã tồn tại trong hệ thống!'
                        })
                    }else{
                        if(req.body.isAdmin === "Admin"){
                            req.body.isAdmin = true
                        }else{
                            req.body.isAdmin = false
                        }
                        req.body.password = bcrypt.hashSync(password, 10)
                        const user = new User(req.body)
                        user.save()
                            .then((data) => {
                                res.redirect('/me/stored/users')
                            })
                    }
                })
                .catch(err => {
                    console.log("ERR: " + err)
                    res.status(500).json("Tạo tài khoản thất bại!")
                })
                .catch(next)
        }

}

module.exports = new MeController
