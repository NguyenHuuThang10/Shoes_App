const express = require('express')
const router = express.Router()
const path = require('path')

const supportsController = require('../app/controllers/SupportsController')

router.get('/:slugCategory/:slug', supportsController.blogDetail);
router.get('/:slugCategory', supportsController.blogCategory);
router.get('/', supportsController.blogs);

router.get("*", supportsController.error)






module.exports = router