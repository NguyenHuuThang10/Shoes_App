const mongoose = require('mongoose')

async function connect() {
    try {
        await mongoose.connect('mongodb://localhost:27017/Shoes_app');
        //mongodb+srv://root:123@cluster0.watqp3z.mongodb.net/Shoes_app?retryWrites=true&w=majority&appName=Cluster0
        console.log('Connect successfully !')
    } catch (error) {
        console.log('Connect fail !')
    }
}

module.exports = { connect }