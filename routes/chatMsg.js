const router = require('koa-router')()
const res = require('../public/javascripts/res')
const ChatMsg = require('../dbs/moduls/chatMsg')
const ChatList = require('../dbs/moduls/chatList')
const User = require('../dbs/moduls/users')
const Koa = require('koa')

router.prefix('/chat')

// 发送消息
router.post('/sendChatMsg', async (ctx, next) => {
    let request = ctx.request;
    const chatMsg = new ChatMsg({
        sendUserId: request.body.sendUserId,
        receiveUserId: request.body.receiveUserId,
        chatMsg: request.body.chatMsg,
        msgDate: new Date(),
        isRead: false
    });
    const chatList = new ChatList({
        sendUserId: request.body.sendUserId,
        receiveUserId: request.body.receiveUserId,
        chatDate: new Date(),
        lastChatContent: request.body.chatMsg
    })
    let chatMsgObj = {
        sendUserId: request.body.sendUserId,
        receiveUserId: request.body.receiveUserId,
        chatMsg: request.body.chatMsg,
        msgDate: new Date(),
        sendUserAvatar: request.body.sendUserAvatar,
        _id: chatMsg._id
    }
    // Koa.socketArr.some(socket => {
    //     // console.log(socket.userId, request.body.receiveUserId);
    //     if (socket.userId == request.body.receiveUserId) {
    //         // Koa.io.sockets.socket(socket.id).emit('getChatMsg', request.body.content);
    //         console.log('getChatMsg');

    //         socket.emit('getChatMsg', chatMsg)
    //         return true
    //     }
    // })
    Koa.socketMap[request.body.receiveUserId] &&
        Koa.socketMap[request.body.receiveUserId].emit('getChatMsg', chatMsgObj);
    let code, msg, data;
    await chatMsg.save();
    await ChatList.findOne({
        $or: [{
            sendUserId: request.body.sendUserId,
            receiveUserId: request.body.receiveUserId
        }, {
            sendUserId: request.body.receiveUserId,
            receiveUserId: request.body.sendUserId
        }]
    }, (err, doc) => {
        if (err) {
            ctx.body = res(code, msg, data)
            return
        }
        if (doc) {
            ChatList.updateOne({
                $or: [{
                    sendUserId: request.body.sendUserId,
                    receiveUserId: request.body.receiveUserId
                }, {
                    sendUserId: request.body.receiveUserId,
                    receiveUserId: request.body.sendUserId
                }]
            }, { lastChatContent: request.body.chatMsg, chatDate: new Date() }, (err, doc) => {
                if (err) {
                    console.log('lastchatcontent更新错误-----');
                    ctx.body = res(code, msg, data);
                    return
                }
            })
        } else {
            chatList.save();
        }
    })
    code = 1;
    msg = "发送成功!"
    ctx.body = res(code, msg, data)
})
// 获取聊天列表
router.get('/getChatList', async (ctx, next) => {
    let code, msg, data
    let tempList = []
    let chatList = []
    let user = await Koa.utils.getRedis(ctx);
    await ChatList.find({ $or: [{ sendUserId: user._id }, { receiveUserId: user._id }] }, (err, docs) => {
        if (err) {
            ctx.body = res(code, msg, data);
            return
        }
        if (docs && docs.length) {
            tempList = [...docs];
        }
    })
    for (let chatListItem of tempList) {
        const _id = user._id === chatListItem.sendUserId ? chatListItem.receiveUserId : chatListItem.sendUserId;
        await User.findOne({ _id }, (err, doc) => {
            if (err) {
                ctx.body = res(code, msg, data);
                return
            }
            if (doc) {
                let obj = Object.assign({}, chatListItem._doc);
                obj.nickname = doc.nickname;
                obj.avatarUrl = doc.avatarUrl;
                obj.otherUserId = doc._id;
                chatList.push(obj)
            }
        })
    }
    code = 1;
    msg = '查询成功!'
    data = { chatList }
    ctx.body = res(code, msg, data)
})
// 获取单人聊天记录
router.post('/getHisChatMsgList', async (ctx, next) => {
    let code, msg, data
    let request = ctx.request;
    let chatMsgList = [];
    let pageNo = request.body.pageNo;
    let pageSize = request.body.pageSize;
    let user = await Koa.utils.getRedis(ctx);
    await ChatMsg.updateMany({ receiveUserId: user._id, isRead: false }, { isRead: true }, (err, docs) => {
        if (err) {
            ctx.body = res(code, msg, data);
            return
        }
    })
    await ChatMsg.find({ $or: [{ sendUserId: request.body.sendUserId, receiveUserId: request.body.receiveUserId }, { sendUserId: request.body.receiveUserId, receiveUserId: request.body.sendUserId }] }, async (err, docs) => {
        if (err) {
            code = 0;
            msg = '系统错误，查询历史消息记录失败';
            data = null;
            return
        }
        if (docs && docs.length) {
            docs.forEach(chatMsg => {
                let obj = {
                    _id: chatMsg._id,
                    sendUserId: chatMsg.sendUserId,
                    receiveUserId: chatMsg.receiveUserId,
                    chatMsg: chatMsg.chatMsg,
                    msgDate: chatMsg.msgDate
                };
                chatMsgList.unshift(obj)
            })
            code = 1;
            msg = '查询成功！';
        } else {
            code = 1;
            msg = '无历史消息记录';
            data = { chatMsgList: [] }
        }

    }).sort({ _id: -1 }).skip(pageNo * pageSize)
        .limit(pageSize)
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
