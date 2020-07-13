//socket
const Koa = require('koa')
const app = new Koa()
const fs = require('fs')
const path = require('path')
var options = {
    key: fs.readFileSync(path.join(__dirname, '../../bin/xiongxiong.site.key')),  //ssl文件路径  
    cert: fs.readFileSync(path.join(__dirname, '../../bin/xiongxiong.site.pem'))  //ssl文件路径	
};
const server = require('http').createServer(app.callback())
const httpsServer = require('https').createServer(options, app.callback())
const io = require('socket.io')(server);
const ios = require('socket.io')(httpsServer);
let i = 0;
let socketMap = {}
//监听connect事件
io.on('connection', socket => {
    Koa.socket = socket;
    console.log('客户端已连接' + (++i));
    // console.log(io.sockets.sockets);
    // console.log(socket.id);

    Koa.io = io;
    socket.on('open', id => {
        console.log('open: ' + id);
        socket.userId = id;
        socketMap[id] = socket;
    })
    Koa.socketMap = socketMap;
    //监听disconnect事件
    socket.on('disconnect', () => {
        delete socketMap[socket.userId]
        console.log('客户端已断开' + --i)
    })
});
//监听connect事件
ios.on('connection', socket => {
    Koa.socket = socket;
    console.log('客户端已连接' + (++i));
    // console.log(io.sockets.sockets);
    // console.log(socket.id);

    Koa.io = io;
    socket.on('open', id => {
        console.log('open: ' + id);
        socket.userId = id;
        socketMap[id] = socket;
    })
    Koa.socketMap = socketMap;
    //监听disconnect事件
    socket.on('disconnect', () => {
        delete socketMap[socket.userId]
        console.log('客户端已断开' + --i)
    })
});
server.listen(9977);
httpsServer.listen(9978)
