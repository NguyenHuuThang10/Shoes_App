
class MeController {

    index (req, res, next) {
        res.render('me/home')
    }

    // [GET] /me/create/shoes
    createShoes (req, res, next) {
        res.render('me/create-shoes')
    }

}

module.exports = new MeController