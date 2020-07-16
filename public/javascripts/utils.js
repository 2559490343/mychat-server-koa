const Koa = require('koa')

const getRedis = (ctx) => {
    return new Promise(async resolve => {
        const token = ctx.header.authorization;
        let payload;
        if (token) {
            payload = await Koa.verify(token.split(' ')[1], Koa.secret)  // // 解密，获取payload
        } else {
            ctx.body = {
                msg: 'token 错误',
                code: -1,
                data: null
            }
            resolve(false)
        }
        let user = await Koa.redis.get(`${payload._id}-Info`);
        resolve(JSON.parse(user || '{}'))
    })

}

module.exports = {
    getRedis
}