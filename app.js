const Koa = require('koa')
const app = new Koa()



// 跨域配置
var cors = require('koa2-cors');
app.use(cors({
  credentials: true,//默认情况下，Cookie不包括在CORS请求之中。设为true，即表示服务器许可Cookie可以包含在请求中
  origin: ctx => ctx.header.origin, // web前端服务器地址，注意这里不能用*
}));

// ssl配置
const sslify = require('koa-sslify').default;
app.use(sslify());

const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')

// 静态资源管理
const static = require('koa-static');
app.use(static(__dirname + '/static'))


// jwt
const jwt = require('jsonwebtoken')
const jwtKoa = require('koa-jwt')
const util = require('util')
const verify = util.promisify(jwt.verify) // 解密
const secret = 'myChatJwt'
// 拦截token错误拦截
app.use(async (ctx, next) => {
  return next().catch((err) => {
    if (err.status === 401) {
      console.log('token错误拦截::---------------');
      ctx.status = 200;
      ctx.body = {
        code: -1,
        msg: 'token无效',
        data: null
      }
    } else {
      throw err;
    }
  })
});
app.use(jwtKoa({ secret }).unless({
  path: [/^\/users\/login/, /^\/users\/register/, /^\/static\/files/] //数组中的路径不需要通过jwt验证
}))
Koa.jwt = jwt;
Koa.secret = secret;
Koa.verify = verify;



// redis
const redis = require("./redis/config")
Koa.redis = redis;


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

// 引入工具js
const utils = require('./public/javascripts/utils')
Koa.utils = utils;
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
function uncaughtExceptionHandler(err) {
  if (err && err.code == 'ECONNREFUSED') {
    //do someting
    console.log('redis断开连接或者连不上');

  } else {
    process.exit(1);
  }
}
process.on('uncaughtException', uncaughtExceptionHandler);

module.exports = app
