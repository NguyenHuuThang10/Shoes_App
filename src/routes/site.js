const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')

router.get('/forgot', siteController.checkClient, siteController.forgotPassword)
router.post('/forgot', siteController.checkClient, siteController.sendGmail)
router.get('/reset', siteController.checkClient, siteController.renderReset)
router.put('/reset', siteController.checkClient, siteController.resetPassword)

router.post('/register', siteController.checkClient, siteController.register)
router.get('/sign-in', siteController.checkClient, siteController.signIn)
router.post('/sign-in', siteController.checkClient, siteController.login)
router.get('/log-out', siteController.logOut)

router.get('/profile', siteController.checkLoginClient ,siteController.profile)
router.get('/password', siteController.checkLoginClient ,siteController.chancepass)


router.get('/', siteController.index)


module.exports = router