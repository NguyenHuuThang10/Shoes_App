const express = require('express')
const router = express.Router()

const shoesController = require('../app/controllers/ShoesController')

router.get('/sale', shoesController.sale)

router.delete('/delete-cart/:id', shoesController.checkLoginClient, shoesController.deleteToCart)
router.post('/update-cart/:id', shoesController.checkLoginClient, shoesController.updateShippingCart)
router.put('/quantity/:id', shoesController.checkLoginClient, shoesController.updateQuantity)
router.get('/cart', shoesController.cart)
router.get('/pay-success', shoesController.checkLoginClient, shoesController.paySuccess)
router.get('/my-order', shoesController.checkLoginClient, shoesController.myOrder)
router.get('/my-order-detail/:id', shoesController.checkLoginClient, shoesController.myOrderDetail)
router.delete("/my-order/:id/delete", shoesController.checkLoginClient, shoesController.deleteOrder);
router.post('/add-to-cart', shoesController.checkLoginClient, shoesController.addToCart)
router.get('/:slug', shoesController.show)

router.get('/shoe-type/:type',shoesController.shoeType)


module.exports = router