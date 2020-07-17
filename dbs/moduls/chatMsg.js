const mongoose = require('mongoose')

let chatMsgSchma = new mongoose.Schema({
    sendUserId: String,
    receiveUserId: String,
    chatMsg: String,
    msgDate: Date,
    isRead: Boolean
})

module.exports = mongoose.model('ChatMsg', chatMsgSchma)