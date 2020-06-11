const router = require('koa-router')()
const res = require('../public/javascripts/res')

const User = require('../dbs/moduls/users')

router.prefix('/users')

router.post('/login', async (ctx, next) => {
  // console.log(ctx.request.body);
  let request = ctx.request;
  const user = new User({
    username: request.body.username,
    password: request.body.password
  })
  let code, msg, data
  try {
    code = 1;
    msg = ""
  } catch (err) {

  }
  ctx.body = res(code, msg, data)
})

router.post('/register', async (ctx, next) => {
  // console.log(ctx.request.body);
  let request = ctx.request;
  const user = new User({
    username: request.body.username,
    password: request.body.password
  })
  let code, msg, data
  try {
    // await user.save();
    console.log(User.find({ username: request.body.username }));

    code = 1;
    msg = "注册成功！";
    data = []
  } catch (err) {
    console.log(err);
    code = 0;
    msg = "注册失败！";
    data = []
  }
  ctx.body = res(code, msg, data)
})
module.exports = router
