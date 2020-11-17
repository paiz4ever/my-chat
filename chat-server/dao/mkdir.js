//新建目录文件夹
const fs = require('fs')
const path = require('path');

exports.mkdirs = (pathname, cb) => {
    //判断是否是绝对路径
    pathname = path.isAbsolute(pathname) ? pathname : path.join(__dirname, pathname);
    //获取相对路径
    pathname = path.relative(__dirname, pathname);
    let floders = pathname.split(path.sep);
    let pre = '';
    floders.forEach(floder => {
        try {
            let _stat = fs.statSync(path.join(__dirname, pre, floder));
            let hasMkdir = _stat && _stat.isDirectory();
            if (hasMkdir) {
                cb
            }
        } catch (error) {
            try {
                fs.mkdirSync(path.join(__dirname, pre, floder));
                cb && cb(null)
            } catch (error) {
                cb && cb(error)
            }
        }
        pre = path.join(pre, floder);
    });
}