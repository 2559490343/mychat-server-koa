//socket
const Koa = require('koa')
const app = new Koa()
const server = require('http').createServer(app.callback())
const io = require('socket.io')(server);
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

server.listen(9978);
