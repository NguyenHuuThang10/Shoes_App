
class SupportsController {

    wishlist (req, res, next) {
        res.render('supports/wishlist');
    }


}

module.exports = new SupportsController();