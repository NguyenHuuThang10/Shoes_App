const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')

router.post('/register', siteController.checkLoginClient, siteController.register)
router.get('/sign-in', siteController.checkLoginClient, siteController.signIn)
router.post('/login', siteController.checkLoginClient, siteController.login)
router.get('/', siteController.index)
// router.get('/', siteController.index)

module.exports = router