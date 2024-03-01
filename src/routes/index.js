const siteRouter = require('./site')
const meRouter = require('./me')
const shoeDetailRouter = require('./shoeDetail')
const shoeGirlRouter = require('./shoeGirl')
function route (app) {

    app.use('/me', meRouter)
    app.use('/shoe', shoeDetailRouter)
    app.use('/shoe',shoeGirlRouter)
    app.use('/', siteRouter)

}

module.exports =  route 