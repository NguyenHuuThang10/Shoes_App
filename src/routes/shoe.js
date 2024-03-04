const express = require('express')
const router = express.Router()

const shoeController = require('../app/controllers/ShoeController')

router.get('/shoe-detail',shoeController.shoeDetail)
router.get('/shoe-girl',shoeController.shoeGirl)
module.exports = router