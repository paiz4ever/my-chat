//引入mongoose模块
const mongoose = require('mongoose');

const db = mongoose.createConnection('mongodb://localhost/mychat', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('数据库连接成功')
});

module.exports = db;
