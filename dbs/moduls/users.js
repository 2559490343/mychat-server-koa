const mongoose = require('mongoose')

let userSchma = new mongoose.Schema({
    username: String,
    password: String,
    nickname: String,
    avatarUrl: String
})

module.exports = mongoose.model('User', userSchma)