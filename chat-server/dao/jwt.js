//引入token
const jwt = require('jsonwebtoken');
//签名
let secret = 'PaiZ_ZaiP';
//生成token
exports.generateToken = id => {
    let payload = { id, time: new Date() };
    //设置为1小时过期
    // let token = jwt.sign(payload,secret,{expiresIn:60*60})
    let token = jwt.sign(payload, secret);
    return token;
}

//解码token
exports.verifyToken = v => {
    let payload;
    jwt.verify(v, secret, (err, result) => {
        if (err) {
            payload = 0
        } else {
            payload = 1
        }
    });
    return payload
}

