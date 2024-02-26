const siteRouter = require('./site')
const meRouter = require('./me')
const shoeDetailRouter = require('./shoeDetail')

function route (app) {

    app.use('/me', meRouter)
    app.use('/shoe', shoeDetailRouter)
    app.use('/', siteRouter)

}

module.exports =  route 