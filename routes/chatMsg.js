const router = require('koa-router')()
const res = require('../public/javascripts/res')
const ChatMsg = require('../dbs/moduls/chatMsg')
const User = require('../dbs/moduls/users')
const Koa = require('koa')

router.prefix('/chat')

router.post('/sendChatMsg', async (ctx, next) => {
    let request = ctx.request;
    const chatMsg = new ChatMsg({
        sendUserId: request.body.sendUserId,
        receiveUserId: request.body.receiveUserId,
        chatMsg: request.body.chatMsg,
        msgDate: new Date()
    });
    let chatMsgObj = {
        sendUserId: request.body.sendUserId,
        receiveUserId: request.body.receiveUserId,
        chatMsg: request.body.chatMsg,
        msgDate: new Date(),
        sendUserAvatar: request.body.sendUserAvatar,
        _id: chatMsg._id
    }
    Koa.socketMap[request.body.receiveUserId].emit('getChatMsg', chatMsgObj);
    // Koa.socketArr.some(socket => {
    //     // console.log(socket.userId, request.body.receiveUserId);
    //     if (socket.userId == request.body.receiveUserId) {
    //         // Koa.io.sockets.socket(socket.id).emit('getChatMsg', request.body.content);
    //         console.log('getChatMsg');

    //         socket.emit('getChatMsg', chatMsg)
    //         return true
    //     }
    // })

    let code, msg, data;
    await chatMsg.save();
    code = 1;
    msg = "发送成功!"
    data = null;
    ctx.body = res(code, msg, data)
})
router.get('/getChatList', async (ctx, next) => {
    let code, msg, data
    // console.log(ctx.session.user._id);
    let chatList = [];
    // 使用for of await 解决循环内异步问题
    for (let id of ctx.session.user.friends) {
        await User.findOne({ _id: id }, (err, doc) => {
            if (err) {
                code = 0;
                msg = '系统错误!';
                data = null;
                return
            }
            if (doc) {
                let obj = {
                    _id: doc._id,
                    nickname: doc.nickname,
                    avatarUrl: doc.avatarUrl
                }
                chatList.push(obj);
            }
        })
    }
    code = 1;
    msg = '查询成功!'
    data = { chatList }
    ctx.body = res(code, msg, data)
})
router.post('/getHisChatMsgList', async (ctx, next) => {
    let code, msg, data
    let request = ctx.request;
    let chatMsgList = []
    await ChatMsg.find({ $or: [{ sendUserId: request.body.sendUserId, receiveUserId: request.body.receiveUserId }, { sendUserId: request.body.receiveUserId, receiveUserId: request.body.sendUserId }] }, async (err, doc) => {
        if (err) {
            code = 0;
            msg = '系统错误，查询历史消息记录失败';
            data = null;
            return
        }
        if (doc) {
            doc.forEach(chatMsg => {
                let obj = {
                    _id: chatMsg._id,
                    sendUserId: chatMsg.sendUserId,
                    receiveUserId: chatMsg.receiveUserId,
                    chatMsg: chatMsg.chatMsg,
                    msgDate: chatMsg.msgDate
                };
                chatMsgList.push(obj)
            })
            code = 1;
            msg = '查询成功！';
            // data = { chatMsgList }
        } else {
            code = 1;
            msg = '无历史消息记录';
            data = { chatMsgList: [] }
        }

    }).skip(request.body.pageNo)
        .limit(request.body.pageSize)
    for (let chatMsg of chatMsgList) {
        await User.findOne({ _id: chatMsg.sendUserId }, (err, doc) => {
            if (err) {
                code = 0;
                msg = '查询发送用户错误!';
                data = null;
                return
            }
            if (doc) {
                chatMsg.sendUserAvatar = doc.avatarUrl;
            } else {
                code = 0;
                msg = '无此发送用户!';
                data = null;
                return
            }

        })
    }
    data = { chatMsgList }
    ctx.body = res(code, msg, data)
})
module.exports = router
