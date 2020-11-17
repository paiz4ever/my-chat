const dbserver = require('../dao/dbserver')

//获取1-1聊天数据
exports.msgData = (req, res) => {
    const datas = req.body
    dbserver.msgData(datas, res);
}