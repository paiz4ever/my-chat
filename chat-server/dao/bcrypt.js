const bcrypt = require('bcryptjs');

//加密
exports.encryption = v => {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(v, salt);
    return hash;
}

//解密
exports.verification = (v, hash) => bcrypt.compareSync(v, hash);//比较返回true或者false