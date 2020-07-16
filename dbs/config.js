const dbs = process.env.APP_ENV === 'dev' ? 'mongodb://127.0.0.1:27017/dbs' : 'mongodb://8.129.53.167:27018/mychat'
module.exports = {
    dbs
}