const express = require('express')
const router = express.Router()

const userformController = require('../app/controllers/UserFormController')

router.get('/',userformController.index)
module.exports = router