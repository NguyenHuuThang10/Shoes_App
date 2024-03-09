const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')
router.get('/cart',siteController.cart)
router.get('/register',siteController.xacthuc)
router.get('/profile',siteController.profile)
router.get('/password',siteController.chancepass)
router.get('/', siteController.index)

module.exports = router