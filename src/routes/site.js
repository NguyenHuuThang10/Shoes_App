const express = require('express')
const passport = require('passport');
const router = express.Router()

const siteController = require('../app/controllers/SiteController')
const supportsController = require('../app/controllers/SupportsController')


router.get('/auth/facebook',
    passport.authenticate('facebook'));

router.get('/auth/facebook/callback',
    passport.authenticate('facebook', { failureRedirect: '/auth/fail' }),
    function (req, res) {
        res.redirect('/auth-provider');
    });

// Auth Google
router.get('/auth/google',
    passport.authenticate('google', {
        scope:
            ['email', 'profile']
    }
    ));
router.get('/auth/google/callback',
    passport.authenticate('google', {
        successRedirect: '/auth-provider',
        failureRedirect: '/auth/fail'
    }));
router.get('/auth-provider', siteController.authProvider);
router.get('/auth/fail', siteController.authFail)

// Wishlist
router.delete('/delete-wishlist/:id', siteController.checkLoginClient, supportsController.deleteWishlist)
router.post('/add-wishlist', siteController.checkLoginClient, supportsController.addWishlist)
router.get('/wishlist', siteController.checkLoginClient, supportsController.wishlist)

router.get('/help', supportsController.help)

// Change password
router.get('/forgot', siteController.checkClient, siteController.forgotPassword)
router.post('/forgot', siteController.checkClient, siteController.sendGmail)
router.get('/reset', siteController.checkClient, siteController.renderReset)
router.put('/reset', siteController.checkClient, siteController.resetPassword)

// Auth users
router.post('/sign-up', siteController.checkClient, siteController.register)
router.get('/login', siteController.checkClient, siteController.signIn)
router.get('/sign-up', siteController.checkClient, siteController.signIn)
router.get('/active', siteController.checkClient, siteController.active)
router.post('/login', siteController.checkClient, siteController.login)
router.get('/log-out', siteController.logOut)

router.get('/profile', siteController.checkLoginClient, siteController.profile)
router.get('/password', siteController.checkLoginClient, siteController.password)
router.put('/password', siteController.checkLoginClient, siteController.changePass)

// Search
router.get('/search', siteController.search)
router.get('/', siteController.index)


module.exports = router