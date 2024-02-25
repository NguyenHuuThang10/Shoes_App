
class SiteController {
    index (req, res, nex) {
        res.render('home')
    }

}

module.exports = new SiteController