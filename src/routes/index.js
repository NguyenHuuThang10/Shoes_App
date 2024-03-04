const siteRouter = require('./site')
const meRouter = require('./me')
const shoeRouter = require('./shoe')
function route (app) {

    app.use('/me', meRouter)
    app.use('/shoe', shoeRouter)
    app.use('/', siteRouter)

}

module.exports =  route 