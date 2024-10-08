const siteRouter = require('./site')
const meRouter = require('./me')
const shoesRouter = require('./shoes')
const blogsRouter = require('./blogs')
const pagesRouter = require('./pages')
const siteController = require('../app/controllers/SiteController')

function route (app) {
    app.use(siteController.checkLogin)
    app.use('/pages', pagesRouter)
    app.use('/blogs', blogsRouter)
    app.use('/me', meRouter)
    app.use('/shoes', shoesRouter)
    app.use('/', siteRouter)
    app.use((req, res, next) => {
        res.render('supports/error')
    })

}

module.exports =  route 