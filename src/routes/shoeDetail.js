const express = require('express')
const router = express.Router()

const shoedetailController = require('../app/controllers/ShoeDetailController')

router.get('/shoe-detail',shoedetailController.index)

module.exports = router