const dbserver = require('../dao/dbserver')

//用户搜索
exports.searchUser = (req, res) => {
    const { data } = req.body;
    dbserver.searchUser(data, res);
}

//判断是否为好友
exports.isFriend = (req, res) => {
    const { uid, fid } = req.body;
    dbserver.isFriend(uid, fid, res)
}


