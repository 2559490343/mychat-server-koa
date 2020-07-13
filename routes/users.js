const router = require('koa-router')()
const res = require('../public/javascripts/res')
const User = require('../dbs/moduls/users')
const koa = require('koa')
// 获取汉字首字拼音
const cnchar = require('cnchar')
router.prefix('/users')

// 登录
router.post('/login', async (ctx, next) => {
  let request = ctx.request;
  let code, msg, data
  await User.findOne({ username: request.body.username, password: request.body.password },
    (err, doc) => {
      if (err) {
        code = 0;
        msg = '系统错误!';
        data = null;
        return
      }
      if (doc) {
        koa.redis.set(`${doc._id}-Info`, JSON.stringify(doc));
        code = 1;
        msg = '登陆成功!';
        let userToken = {
          username: request.body.username
        }
        const token = koa.jwt.sign(userToken, koa.secret, { expiresIn: '1h' });
        data = { userInfo: doc ,token}
      } else {
        code = 0;
        msg = '用户名或密码错误!';
        data = null;
      }
    })
  ctx.body = res(code, msg, data)
})
// 注册
router.post('/register', async (ctx, next) => {
  let request = ctx.request;
  const user = new User({
    username: request.body.username,
    password: request.body.password,
    nickname: request.body.username,
    avatarUrl: 'https://dss3.bdstatic.com/70cFv8Sh_Q1YnxGkpoWK1HF6hhy/it/u=1408233282,1483083519&fm=26&gp=0.jpg',
    friends: []
  })
  let code, msg, data
  await User.find({ username: request.body.username }, (err, doc) => {
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
      user.save();
      code = 1;
      msg = "注册成功！";
      data = null
    }
  });
  ctx.body = res(code, msg, data)
})
// 获取好友列表
router.get('/getFrientsList', async (ctx, next) => {
  let query = ctx.query;
  let code, msg, data
  let friendsList = [];
  let friends = []
  await User.findOne({ _id: query._id }, async (err, doc) => {
    if (err) {
      code = 0;
      msg = "系统错误!"
      data = null;
      return
    }
    if (doc) {
      doc.friends.forEach(item => {
        friends.push(item)
      })

    } else {
      code = 0;
      msg = "查询不到当前用户!"
      data = null
    }
  })
  if (friends.length) {
    for (let friendsId of friends) {
      await User.findOne({ _id: friendsId }, (err, doc) => {
        if (err) {
          code = 0;
          msg = "系统错误!"
          data = null;
          return
        }
        if (doc) {
          let friendObj = {
            avatarUrl: doc.avatarUrl,
            nickname: doc.nickname,
            _id: doc._id
          }
          friendsList.push(friendObj);
          code = 1;
          msg = "查询成功"
        } else {
          code = 0;
          msg = "查询不到当前好友用户!"
          data = null
        }
      })
    }
  } else {
    code = 1;
    msg = '好友列表为空'
  }

  let mailList = [
    {
      label: 'A',
      friends: [
      ]
    },
    {
      label: 'B',
      friends: [

      ]
    }, {
      label: 'C',
      friends: [

      ]
    }, {
      label: 'D',
      friends: [

      ]
    }, {
      label: 'E',
      friends: [

      ]
    }, {
      label: 'F',
      friends: [

      ]
    }, {
      label: 'G',
      friends: [

      ]
    }, {
      label: 'H',
      friends: [

      ]
    }, {
      label: 'I',
      friends: [

      ]
    }, {
      label: 'J',
      friends: [

      ]
    }, {
      label: 'K',
      friends: [

      ]
    }, {
      label: 'L',
      friends: [

      ]
    }, {
      label: 'M',
      friends: [

      ]
    }, {
      label: 'N',
      friends: [

      ]
    }, {
      label: 'O',
      friends: [

      ]
    }, {
      label: 'P',
      friends: [

      ]
    }, {
      label: 'Q',
      friends: [

      ]
    }, {
      label: 'R',
      friends: [

      ]
    }, {
      label: 'S',
      friends: [

      ]
    }, {
      label: 'T',
      friends: [

      ]
    }, {
      label: 'U',
      friends: [

      ]
    }, {
      label: 'V',
      friends: [

      ]
    }, {
      label: 'W',
      friends: [

      ]
    }, {
      label: 'X',
      friends: [

      ]
    }, {
      label: 'Y',
      friends: [

      ]
    }, {
      label: 'Z',
      friends: [

      ]
    },
    {
      label: '#',
      friends: [

      ]
    }
  ]
  friendsList.forEach(item => {
    let has = mailList.some(it => {
      if (it.label == cnchar.spell(item.nickname)[0].toUpperCase()) {
        it.friends.push(item);
        return true
      }
    })
    if (!has) {
      mailList[mailList.length - 1].friends.push(item)
    }
  })
  data = { mailList }
  ctx.body = res(code, msg, data)
})
// 搜索好友
router.get('/searchFriends', async (ctx, next) => {
  let query = ctx.query;
  let code, data, msg;
  console.log(query.username);
  let resultList = []
  await User.find({ username: query.username }, (err, doc) => {
    if (err) {
      return
    }
    if (doc) {
      doc.forEach(item => {
        let obj = {
          avatarUrl: item.avatarUrl,
          username: item.username,
          nickname: item.nickname,
          _id: item._id
        }
        resultList.push(obj)
      })
      data = { resultList }
      msg = '查询成功!'
      code = 1
    }
    else {
      msg = "查找不到此用户";
      data = null
    }
    // if()
  })
  ctx.body = res(code, msg, data)
})
// 发送好友申请
router.get('/sendAddFriends', async (ctx, next) => {

})
module.exports = router
