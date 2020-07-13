const res = function (code = 0, msg = '数据库错误', data = null) {
    return {
        code,
        msg,
        data
    }
}
module.exports = res