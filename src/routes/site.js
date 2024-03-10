const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')


router.get('/reset', siteController.checkLoginClient, siteController.renderReset)
router.put('/reset', siteController.checkLoginClient, siteController.resetPassword)
router.get('/forgot', siteController.checkLoginClient, siteController.forgotPassword)
router.post('/forgot', siteController.checkLoginClient, siteController.sendGmail)

router.post('/register', siteController.checkLoginClient, siteController.register)
router.get('/sign-in', siteController.checkLoginClient, siteController.signIn)
router.post('/sign-in', siteController.checkLoginClient, siteController.login)
router.get('/log-out', siteController.logOut)
router.get('/', siteController.index)
// router.get('/', siteController.index)

module.exports = router