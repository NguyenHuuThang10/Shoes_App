
class MeController {

    index (req, res, next) {
        res.render('me/home')
    }

}

module.exports = new MeController