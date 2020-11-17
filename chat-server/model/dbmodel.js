const mongoose = require('mongoose')
const db = require('../config/connect');
const Schema = mongoose.Schema;

//用户表
const userSchema = new Schema({
    name: { type: String, unique: true },                    //用户名
    pwd: { type: String },                                   //密码
    email: { type: String, unique: true },                   //邮箱
    sex: { type: String, default: 'secret' },                //性别（男：male  女：female 保密：secret） 
    address: { type: String },                               //地址
    birth: { type: String },                                   //生日
    introduce: { type: String },                             //签名
    imgUrl: { type: String, default: '/user/user.png' },     //头像
    registerTime: { type: Date },                            //注册时间
});

//好友表
const friendSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },    //用户id
    friendId: { type: Schema.Types.ObjectId, ref: 'User' },  //好友id
    state: { type: Number },                                 //好友状态 （0：好友 1：发送申请 2：接受申请）
    addTime: { type: Date },                                 //关系时间
    nickName: { type: String },                              //好友昵称
    lastTime: { type: Date }                                  //最后通讯时间
})

//1-1消息表
const messageSchema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: 'User' },    //用户id
    friendId: { type: Schema.Types.ObjectId, ref: 'User' },  //好友id
    message: { type: String },                               //发送内容
    type: { type: Number },                                  //内容属性 (0：文字 1：图片 2：音频 3：位置)
    time: { type: Date },                                    //发送时间
    state: { type: Number }                                  //消息状态 （0：已读 1：未读）
})



module.exports = db.model('User', userSchema);
module.exports = db.model('Friend', friendSchema);
module.exports = db.model('Message', messageSchema);
