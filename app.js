const Koa = require('koa')
const app = new Koa()

// 跨域配置
var cors = require('koa2-cors');
app.use(cors({
  credentials: true,//默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器许可Cookie可以包含在请求中
  origin: ctx => ctx.header.origin, // web前端服务器地址，注意这里不能用*
}));

const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

// 静态资源管理
const static = require('koa-static');
app.use(static(__dirname + '/static'))


// session配置
const session = require('koa-session');
app.keys = ['some secret hurr'];//cookie的签名
const CONFIG = {
  key: 'koa:sess', //默认
  maxAge: 86400000,//cookie的过期时间
  overwrite: true,
  httpOnly: true,//true表示只有服务器端可以获取cookie
  signed: true,
  rolling: false,
  renew: true
};
app.use(session(CONFIG, app))


//操作数据库,引入这两个模块
const mongoose = require('mongoose')
const dbConfig = require('./dbs/config')
//mongoose 连接数据库
mongoose.connect(dbConfig.dbs, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})

const index = require('./routes/index')
const users = require('./routes/users')
const chatMsg = require('./routes/chatMsg')

// 引入socket
require('./public/javascripts/socket');
// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes: ['json', 'form', 'text']
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  // console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(chatMsg.routes(), chatMsg.allowedMethods())

// error-handling
app.on('error', (err, ctx) => {
  console.error('server error', err, ctx)
});

module.exports = app
