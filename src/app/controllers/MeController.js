const Shoe = require('../models/Shoe')
const User = require('../models/User')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
const bcrypt = require('bcrypt');
const PAGE_SIZE = 2

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
    async storedShoes (req, res, next) {
        try {
            let shoeQuery = Shoe.find({})
            var page = parseInt(req.query.page) || 1
            var allShoe = await Shoe.find({}).countDocuments()
            var maxPage = Math.ceil(allShoe / PAGE_SIZE);

            if(page > maxPage){
                page = 1
            }

            var begin = page - 2
            if(begin < 1){
                begin = 1
            }

            var end = page + 2
            if(end > maxPage){
                end = maxPage
            }
            
            var offset = (page - 1) * PAGE_SIZE

            Promise.all([shoeQuery, Shoe.countDocumentsWithDeleted({ deleted: true})])
                .then(([shoes, deletedCount]) => {

                    shoes = shoes.slice(offset, offset + PAGE_SIZE)
                    
                    res.render('me/storedShoes', {
                        begin,
                        end,
                        page,
                        maxPage,
                        deletedCount,
                        shoes: mutipleMongooseToObject(shoes)
                    })
                })


        } catch (error) {
            console.log("ERR: " + error)
        }
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
    async storedUsers (req, res, next) {
        try {
            let userQuery = User.find({})
            var page = parseInt(req.query.page) || 1
            var allUser = await User.find({}).countDocuments()
            var maxPage = Math.ceil(allUser / PAGE_SIZE);

            if(page > maxPage){
                page = 1
            }

            var begin = page - 2
            if(begin < 1){
                begin = 1
            }

            var end = page + 2
            if(end > maxPage){
                end = maxPage
            }
            
            var offset = (page - 1) * PAGE_SIZE

            Promise.all([userQuery, User.countDocumentsWithDeleted({ deleted: true})])
                .then(([users, deletedCount]) => {

                    users = users.slice(offset, offset + PAGE_SIZE)
                    
                    res.render('me/storedUsers', {
                        begin,
                        end,
                        page,
                        maxPage,
                        deletedCount,
                        users: mutipleMongooseToObject(users)
                    })
                })


        } catch (error) {
            console.log("ERR: " + error)
        }
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
                await User.restoreUser(req.params.id);
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
