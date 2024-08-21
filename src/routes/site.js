const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')
const supportsController = require('../app/controllers/SupportsController')

router.get('/help', supportsController.help)

router.get('/forgot', siteController.checkClient, siteController.forgotPassword)
router.post('/forgot', siteController.checkClient, siteController.sendGmail)
router.get('/reset', siteController.checkClient, siteController.renderReset)
router.put('/reset', siteController.checkClient, siteController.resetPassword)

router.post('/sign-up', siteController.checkClient, siteController.register)
router.get('/login', siteController.checkClient, siteController.signIn)
router.get('/sign-up', siteController.checkClient, siteController.signIn)
router.get('/active', siteController.checkClient, siteController.active)
router.post('/login', siteController.checkClient, siteController.login)
router.get('/log-out', siteController.logOut)

router.get('/profile', siteController.checkLoginClient ,siteController.profile)
router.get('/password', siteController.checkLoginClient ,siteController.password)
router.put('/password', siteController.checkLoginClient ,siteController.changePass)

router.get('/', siteController.index)


module.exports = router