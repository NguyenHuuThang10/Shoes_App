class SupportsController {
    //[GET] /help
    help(req, res, next) {
        res.render("supports/help");
      }
}

module.exports = new SupportsController()
