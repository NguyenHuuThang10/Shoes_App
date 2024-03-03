const express = require('express')
const router = express.Router()

const shoesController = require('../app/controllers/ShoesController')


router.post('/add-to-cart', shoesController.addToCart)
router.get('/:slug', shoesController.show)


module.exports = router