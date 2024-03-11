const express = require('express')
const router = express.Router()

const shoesController = require('../app/controllers/ShoesController')

router.delete('/delete-cart/:id', shoesController.checkLoginClient, shoesController.deleteToCart)
router.post('/update-cart/:id', shoesController.checkLoginClient, shoesController.updateShippingCart)
router.put('/quantity/:id', shoesController.checkLoginClient, shoesController.updateQuantity)
router.get('/cart', shoesController.checkLoginClient, shoesController.cart)
router.get('/pay-success', shoesController.checkLoginClient, shoesController.paySuccess)
router.get('/my-order', shoesController.myOrder)
router.post('/add-to-cart', shoesController.checkLoginClient, shoesController.addToCart)
router.get('/:slug', shoesController.show)

router.get('/shoe-type/:type',shoesController.shoeType)


module.exports = router