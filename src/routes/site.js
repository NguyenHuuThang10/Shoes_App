const express = require('express')
const router = express.Router()

const siteController = require('../app/controllers/SiteController')

router.get('/private', siteController.private)
router.post('/register', siteController.register)
router.get('/sign-in', siteController.signIn)
router.post('/login', siteController.login)
router.get('/', siteController.index)

module.exports = router