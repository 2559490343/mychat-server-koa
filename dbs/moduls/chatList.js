const mongoose = require('mongoose')

let chatListSchma = new mongoose.Schema({
    sendUserId: String,
    receiveUserId: String,
    lastChatContent:String,
    chatDate: Date
})

module.exports = mongoose.model('ChatList', chatListSchma)