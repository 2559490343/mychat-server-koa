const router = require('koa-router')()
const res = require('../public/javascripts/res')

const User = require('../dbs/moduls/users')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  // console.log(ctx.request.body);
  let request = ctx.request;
  let code, msg, data
  await User.findOne({ username: request.body.username, password: request.body.password }, (err, doc) => {
    if (err) {
      code = 0;
      msg = '系统错误!';
      data = null;
      return
    }
    if (doc) {
      code = 1;
      msg = '登陆成功!';
      data = { userInfo: doc }
    } else {
      code = 0;
      msg = '用户名或密码错误!';
      data = null;
    }
  })
  ctx.body = res(code, msg, data)
})

router.post('/register', async (ctx, next) => {
  let request = ctx.request;
  const user = new User({
    username: request.body.username,
    password: request.body.password,
    nickname: request.body.username,
    avatarUrl: 'https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1408233282,1483083519&fm=26&gp=0.jpg'
  })
  let code, msg, data
  await User.find({ username: request.body.username }, async (err, doc) => {
    if (err) {
      code = 0;
      msg = "系统错误，注册失败！";
      data = null
      return
    }
    if (doc.length) {
      code = 0;
      msg = '用户名已被注册!';
      data = null
    } else {
      await user.save();
      code = 1;
      msg = "注册成功！";
      data = null
    }
  });
  // console.log(err);

  ctx.body = res(code, msg, data)
})
module.exports = router
