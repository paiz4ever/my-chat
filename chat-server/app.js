const express = require('express')
const app = express()
const port = 3000

//socket.io
const server = app.listen(8082)
const io = require('socket.io').listen(server)
require('./dao/socket')(io)

//引入解析req.body插件
const bodyParser = require('body-parser');
//引入token
const jwt = require('./dao/jwt')

//跨域
app.all('*', (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin,X-Requested-With,Content-Type,Accept");
    res.header("Access-Control-Allow-Credentials", true);
    res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
    res.header("X-Powered-By", ' 3.2.1')
    res.header("Content-Type", "application/json;charset=utf-8");
    if (req.method == 'OPTIONS') {
        res.sendStatus(200)
    } else {
        next();
    }

});

//解析前端数据(同时限制文件大小)
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(bodyParser.json({ limit: '50mb' }));

//获取静态目录(前端才能访问)
app.use(express.static(__dirname + '/static'));

//token拦截
app.use((req, res, next) => {
    let token = req.body.token
    if (token) {
        let tokenMatch = jwt.verifyToken(token);
        if (tokenMatch) {
            next()
        } else {
            res.send({ status: 300 })
        }
    } else {
        next()
    }
})

//引入路由
require('./router/index')(app);
require('./router/files')(app);


//404页面
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

//错误处理
app.use((err, req, res, next) => {
    res.status(err.status || 500)
    res.send(err.message);
});

app.listen(port, () => { console.log('服务器启动成功 监听3000端口'); })