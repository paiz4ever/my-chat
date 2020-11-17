const dbserver = require('../dao/dbserver')
// const jwt = require('../dao/jwt');
//用户登录
exports.logOn = (req, res) => {
    const { data, pwd } = req.body;
    dbserver.checkUser(data, pwd, res);
}

/*
token验证测试
exports.test = (req, res) => {
    const { token } = req.body;
    let aab = jwt.verifyToken(token);
    res.send(aab);
}
*/