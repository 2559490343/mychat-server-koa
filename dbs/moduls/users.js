const mongoose = require('mongoose')

let userSchma = new mongoose.Schema({
    username: String,
    password: String,
    nickname: String,
    avatarUrl: String,
    friends: Array
})

module.exports = mongoose.model('User', userSchma)