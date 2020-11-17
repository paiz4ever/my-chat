const dbserver = require('../dao/dbserver')

//获取好友列表
exports.getUserLists = (req, res) => {
    const { uid, state } = req.body;
    dbserver.getUserLists(uid, state, res)
}

//获取最后一条消息
exports.getLastMsg = (req, res) => {
    const datas = req.body;
    dbserver.getLastMsg(datas, res)
}

//获取未读消息数
exports.unreadMsg = (req, res) => {
    const datas = req.body;
    dbserver.unreadMsg(datas, res)
}

//更新好友未读消息数
exports.updateReadMsg = (req, res) => {
    const datas = req.body;
    dbserver.updateReadMsg(datas, res)
}

