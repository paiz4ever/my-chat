const dbserver = require('../dao/dbserver')
//引入邮件发送
const emailserver = require('../dao/emailserver')

//用户注册
exports.addUser = (req, res) => {
    const { name, email, pwd } = req.body;
    dbserver.createUser(name, email, pwd, res);
    // emailserver.emailSignUp(email, res);
}

//用户或邮箱是否占用
exports.judgeValue = (req, res) => {
    const { data, type } = req.body;
    dbserver.countUser(data, type, res);
}