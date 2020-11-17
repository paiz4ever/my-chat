const dbserver = require('../dao/dbserver')

//用户详情
exports.userDetail = (req, res) => {
    const { id } = req.body;
    dbserver.userDetail(id, res);
}

//信息修改
exports.userUpdate = (req, res) => {
    const datas = req.body
    dbserver.userUpdate(datas, res);
}
