//引入文件上传插件
const multer = require('multer');
//引入创建目录文件
const mkdir = require('../dao/mkdir')

//磁盘存储引擎--控制文件存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let url = req.body.url;
        //创建文件，文件名前端传递
        mkdir.mkdirs('../static/' + url, err => {
            console.log(err);
        })
        cb(null, 'static/' + url)
    },
    filename: function (req, file, cb) {
        let name = req.body.name;
        let type = file.originalname.replace(/.+\./, '.')
        // console.log(file);
        // {
        //     fieldname: 'file',
        //     originalname: '02.jpg',
        //     encoding: '7bit',
        //     mimetype: 'image/jpeg'
        //   }
        cb(null, name + type)
    }
})

const upload = multer({ storage: storage })

module.exports = (app) => {
    //前端文件上传
    app.post('/files/upload', upload.array('file', 10), function (req, res, next) {
        //路径
        let url = req.body.url;
        //获取文件名
        let name = req.files[0].filename;
        let imgUrl = '/' + url + '/' + name
        res.send(imgUrl)
    })

}