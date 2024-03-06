const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt');

class MeController {
    checkLoginAdmin (req, res, next) {
        var checkLogin = res.locals.currentUser
        if(checkLogin && checkLogin.isAdmin){
            next()
        }else{
            res.redirect('/')
        }
    }



    // [GET] /me/home
    index (req, res, next) {
        res.render('me/home')
    }

    // [GET] /me/create/shoes
    createShoes (req, res, next) {
        res.render('me/createShoes')
    }

    // [POST] /me/store/shoes
    async storeShoes (req, res, next) {
        try {
            req.body.image = req.file.filename
            await Shoe.createShoe(req.body)
            res.redirect('/me/stored/shoes')
        } catch (error) {
            next(error)
        }
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
    async updateShoes (req, res, next) {
        try {
            if (req.file) {
                req.body.image = req.file.filename;
            }
            await Shoe.updateShoe(req.params.id, req.body);
            res.redirect('/me/stored/shoes');
        } catch (error) {
            next(error);
        }
    }

    // [DELETE] /me/:id/delete/shoes
    async deleteShoes(req, res, next) {
        try {
            await Shoe.deleteShoe(req.params.id);
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }

    // [DELETE] /me/:id/destroy/shoes
    async destroyShoes(req, res, next) {
        try {
            await Shoe.destroyShoe(req.params.id);
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }

    // [PATCH] /me/:id/restore/shoes
    async restoreShoes (req, res, next) {
        try {
            await Shoe.restoreShoe(req.params.id);
            res.redirect('back');
        } catch (error) {
            next(error);
        }
    }


    // [GET] /me/create/users
    createUsers (req, res, next) {
        res.render('me/createUsers')
    }

     // [POST] /me/store/users
     async storeUsers (req, res, next) {
        try {
            const newUser = await User.createUser(req.body);
            res.redirect('/me/stored/users');
        } catch (error) {
            res.render('me/createUsers', {
                old: req.body,
                err: error.message
            });
        }
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
        async deleteUsers(req, res, next) {
            try {
                await User.deleteUser(req.params.id);
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        }

        // [DELETE] /me/:id/destroy/users
        async destroyUsers(req, res, next) {
            try {
                await User.destroyUser(req.params.id);
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        }

        // [PATCH] /me/:id/restore/users
        async restoreUsers (req, res, next) {
            try {
                await Shoe.restoreShoe(req.params.id);
                res.redirect('back');
            } catch (error) {
                next(error);
            }
        }

       

        // [GET] /me/:id/edit/users
        editUsers (req, res, next) {
            User.findById(req.params.id)
                .then(user => { 
                    res.render('me/editUsers', {
                        user: mongooseToObject(user)
                    })
                })
                .catch(next)
        }

        // [PUT] /me/:id/edit/user
        async updateUsers (req, res, next) {
            try {
                const newUser = await User.upadteUser(req.body, req.params.id);
                res.redirect('/me/stored/users');
            } catch (error) {
                res.render('me/editUsers', {
                    old: req.body,
                    err: error.message
                });
            }
        }

}

module.exports = new MeController
