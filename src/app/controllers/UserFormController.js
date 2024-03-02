
class UserFormController {

    index (req, res, next) {
        res.render('form/userForm')
    }

}

module.exports = new UserFormController