const siteRouter = require('./site')
const meRouter = require('./me')
const shoesRouter = require('./shoes')
const siteController = require('../app/controllers/SiteController')

function route (app) {
    app.use(siteController.checkLogin)
    app.use('/me', meRouter)
    app.use('/shoes', shoesRouter)
    app.use('/', siteRouter)

}

module.exports =  route 