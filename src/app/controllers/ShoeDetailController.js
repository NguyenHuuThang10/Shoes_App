
class ShoeDetailController {

    index (req, res, next) {
        res.render('shoes/shoeDetail')
    }

}

module.exports = new ShoeDetailController