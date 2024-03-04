const express = require('express')
const router = express.Router()

const shoesController = require('../app/controllers/ShoesController')

router.put('/quantity/:id', shoesController.updateQuantity)
router.get('/cart', shoesController.cart)
router.post('/add-to-cart', shoesController.addToCart)
router.get('/:slug', shoesController.show)


module.exports = router