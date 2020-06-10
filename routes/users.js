const router = require('koa-router')()
const res = require('../public/javascripts/res')
router.prefix('/users')

router.get('/', function (ctx, next) {
  ctx.body = res(1, 'this is a users/bar response', [])
})

router.get('/bar', function (ctx, next) {
  ctx.body = 'this is a users/bar response'
})

module.exports = router
