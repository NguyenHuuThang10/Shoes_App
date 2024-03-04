
class ShoeController {

    shoeDetail (req, res, next) {
        res.render('shoes/shoeDetail')
    }

    shoeGirl (req, res, next) {
        res.render('shoes/shoeGirl')
    }

}

module.exports = new ShoeController