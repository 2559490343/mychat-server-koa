const mongoose = require('mongoose')

let applyListSchma = new mongoose.Schema({
    applyUserId: String,
    receiveUserId: String,
    applyDate: Date,
    isAgree: Boolean
})

module.exports = mongoose.model('ApplyList', applyListSchma)