const express = require('express')
const router = express.Router()

const supportsController = require('../app/controllers/SupportsController')

router.get('/:slugCategory', supportsController.pageDetail);
router.get("*", supportsController.error)

module.exports = router