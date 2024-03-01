
class ShoeGirlController {

    index (req, res, next) {
        res.render('shoes/shoeGirl')
    }

}

module.exports = new ShoeGirlController