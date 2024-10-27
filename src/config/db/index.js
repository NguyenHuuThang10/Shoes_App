const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect(process.env.URL_MONGODB);
        //mongodb+srv://root:123@cluster0.watqp3z.mongodb.net/Shoes_app?retryWrites=true&w=majority&appName=Cluster0
        console.log('Connect successfully !')
    } catch (error) {
        console.log('Connect fail !')
    }
}

module.exports = { connect }