const siteRouter = require('./site')
const meRouter = require('./me')
const shoesRouter = require('./shoes')

function route (app) {

    app.use('/me', meRouter)
    app.use('/shoes', shoesRouter)
    app.use('/', siteRouter)

}

module.exports =  route 