//发送邮件插件
const nodemailer = require('nodemailer')
//引入证书
const credentials = require('../config/credentials')
//创建传输方式
const transporter = nodemailer.createTransport({
    service: 'qq',
    auth: {
        user: credentials.qq.user,
        pass: credentials.qq.pass
    }
});
//注册发送邮件给用户
exports.emailSignUp = (email, res) => {
    //发送内容
    let options = {
        from: '1151892501@qq.com',
        to: email,
        subject: '你好，感谢体验卤蛋app！',
        html: '<span>欢迎你的加入!!!</span></br><a href="https://github.com/PaiZ4ever">点击前往我的github</a>'
    };
    //发送邮件
    transporter.sendMail(options, (err, msg) => {
        if (err) {
            console.log(err);
        } else {
            console.log('邮箱发送成功');
        }
    })
}