const dbserver = require('../dao/dbserver')

//获取好友昵称
// exports.getNickName = (req, res) => {
//     const datas = req.body
//     dbserver.getNickName(datas, res);
// }

//好友昵称修改
exports.updateNickName = (req, res) => {
    const datas = req.body
    dbserver.updateNickName(datas, res);
}

//好友申请
exports.addFriend = (req, res) => {
    const datas = req.body
    dbserver.addFriend(datas, res);
}

//更改好友状态
exports.updateState = (req, res) => {
    const datas = req.body
    dbserver.updateState(datas, res);
}

//删除或拒绝好友
exports.delateFriend = (req, res) => {
    const datas = req.body
    dbserver.delateFriend(datas, res);
}