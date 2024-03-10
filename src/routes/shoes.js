const express = require('express')
const router = express.Router()

const shoesController = require('../app/controllers/ShoesController')

router.delete('/delete-cart/:id', shoesController.deleteToCart)
router.post('/update-cart/:id', shoesController.updateShippingCart)
router.put('/quantity/:id', shoesController.updateQuantity)
router.get('/cart', shoesController.cart)
router.get('/pay-success', shoesController.paySuccess)
router.get('/my-order', shoesController.myOrder)
router.post('/add-to-cart', shoesController.addToCart)
router.get('/:slug', shoesController.show)


module.exports = router