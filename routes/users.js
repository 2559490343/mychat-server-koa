const router = require('koa-router')()
const res = require('../public/javascripts/res')
const User = require('../dbs/moduls/users')
const ApplyList = require('../dbs/moduls/applyList')
const Koa = require('koa')
const multiparty = require("multiparty");
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
        Koa.redis.set(`${doc._id}-Info`, JSON.stringify(doc));
        code = 1;
        msg = '登陆成功!';
        let userToken = {
          username: request.body.username,
          _id: doc._id
        }
        const token = Koa.jwt.sign(userToken, Koa.secret, { expiresIn: '1h' });
        data = { userInfo: doc, token }
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
  });
  let applyCount = 0;
  await ApplyList.find({ receiveUserId: query._id, isAgree: false }, (err, docs) => {
    if (err) {
      return
    }
    if (docs) {
      applyCount = docs.length;
    }
  })
  data = { mailList, applyCount }
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
  let code, msg, data;
  const receiveId = ctx.query._id;
  const user = await Koa.utils.getRedis(ctx);
  const apply = new ApplyList({
    applyUserId: user._id,
    receiveUserId: receiveId,
    applyDate: new Date(),
    isAgree: false
  });
  if (user.friends.includes(receiveId)) {
    code = 0;
    msg = '此用户已经是您的好友，无法重复添加!';
  } else if (user._id == receiveId) {
    code = 0;
    msg = '无法添加自己为好友!';
  } else {
    await ApplyList.findOne({
      applyUserId: user._id,
      receiveUserId: receiveId,
    }, (err, doc) => {
      if (err) {
        return
      }
      if (doc) {
        code = 0;
        msg = '请勿重复发送申请!'
      } else {
        code = 1;
        msg = '发送成功!';
        apply.save();
      }
    })
  }

  ctx.body = res(code, msg, data)
})
// 修改用户头像
router.post('/changeUserAvatar', async (ctx, next) => {
  let code, msg, data
  let form = new multiparty.Form({ uploadDir: './static/files/' });
  form.maxFilesSize = 3 * 1024 * 1024;
  let uploadImg = function () {
    return new Promise((resolve, reject) => {
      form.parse(ctx.req, async (err, fields, files) => {
        if (err) {
          if (err.message == 'maximum file length exceeded') {
            code = 0;
            data = null;
            msg = '图片不能大于3M!';
          }
          resolve(err)
          return
        }
        const baseUrl = process.env.APP_ENV === 'dev' ? 'https://localhost:3000' : 'https://xiongxiong.site:3000'
        const avatarUrl = baseUrl + files.file[0].path.replace('static', '');//文件信息
        let user = await Koa.utils.getRedis(ctx);
        await User.updateOne({ _id: user._id }, { avatarUrl }, (err, docs) => {
          if (err) {
            code = 0;
            data = null;
            msg = '数据库错误';
            return
          }
          code = 1;
          data = { avatarUrl };
          msg = '上传成功';
        })
        resolve(true)
      });
    })
  }
  await uploadImg()
  ctx.body = res(code, msg, data)

})
// 修改用户昵称
router.get('/changeUserNickname', async (ctx, next) => {
  let code, msg, data
  const nickname = ctx.query.nickname;
  const user = await Koa.utils.getRedis(ctx);
  await User.updateOne({ _id: user._id }, { nickname }, (err, doc) => {
    if (err) {
      return
    }
    code = 1;
    msg = '修改成功!'
  })
  ctx.body = res(code, msg, data)

})
// 获取好友申请记录列表
router.get('/getApplyList', async (ctx, next) => {
  const user = await Koa.utils.getRedis(ctx);
  let code, msg, data;
  let applyList = [];
  let resultList;
  await ApplyList.find({ receiveUserId: user._id }, async (err, docs) => {
    if (err) {
      return
    }
    if (docs) {
      resultList = [...docs];
    }
  })
  for (let applyRecord of resultList) {
    await User.findOne({ _id: applyRecord.applyUserId }, (err, doc) => {
      if (err) {
        return
      }
      if (doc) {
        let obj = {
          _id: applyRecord._id,
          nickname: doc.nickname,
          avatarUrl: doc.avatarUrl,
          username: doc.username,
          applyDate: applyRecord.applyDate,
          isAgree: applyRecord.isAgree
        }
        applyList.push(obj)
      }
    })
  }
  code = 1;
  msg = "查询成功!"
  data = { applyList }
  ctx.body = res(code, msg, data)
})
// 同意好友申请
router.get('/agreeApply', async (ctx) => {
  let code, data, msg;
  const _id = ctx.query._id;
  let applyUserId, receiveUserId;
  await ApplyList.updateOne({ _id }, { isAgree: true }, (err, doc) => {
    if (err) {
      ctx.body = res(code, msg, data)
      return
    }
  });
  await ApplyList.findOne({ _id }, (err, doc) => {
    if (err) {
      ctx.body = res(code, msg, data)
      return
    }
    if (doc) {
      applyUserId = doc.applyUserId;
      receiveUserId = doc.receiveUserId;
    }
  });
  await User.updateOne({ _id: applyUserId }, { $addToSet: { friends: receiveUserId } }, (err, doc) => {
    if (err) {
      ctx.body = res(code, msg, data)
      return
    }
    console.log('updateOne111', doc);
  })
  await User.updateOne({ _id: receiveUserId }, { $addToSet: { friends: applyUserId } }, (err, doc) => {
    if (err) {
      ctx.body = res(code, msg, data)
      return
    }
    console.log('updateOne222', doc);
  })
  code = 1;
  msg = '添加成功'

  ctx.body = res(code, msg, data)
})
module.exports = router
