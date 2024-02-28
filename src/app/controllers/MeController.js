const Shoe = require('../models/Shoe')
const { mongooseToObject, mutipleMongooseToObject } = require('../../util/mongoose')
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
}

module.exports = new MeController
