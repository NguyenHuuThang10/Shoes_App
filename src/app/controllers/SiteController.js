
class SiteController {
    index (req, res, nex) {
        res.render('home')
    }
    xacthuc (req, res, next) {
        res.render('form/userForm')
    }
     xacthuc (req, res, next) {
        res.render('form/userForm')
    }
    cart (req, res, next) {
        res.render('cart/cart')
    }
}

module.exports = new SiteController