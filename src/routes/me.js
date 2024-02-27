const express = require('express')
const router = express.Router()

const meController = require('../app/controllers/MeController')

router.get('/create/shoes', meController.createShoes)
router.get('/home', meController.index)

module.exports = router