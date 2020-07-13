const Redis = require('ioredis')
const redis = {
    port: 6379,          // Redis port
    host: '8.129.53.167',   // Redis host
    prefix: 'sam:', //存诸前缀
    ttl: 60 * 60 * 23,  //过期时间   
    family: 4,
    db: 0
}
const newRedis = new Redis(redis)
module.exports = newRedis