const express = require('express')
const router = express.Router()

const shoegirlController = require('../app/controllers/ShoeGirlController')

router.get('/shoe-girl',shoegirlController.index)
module.exports = router