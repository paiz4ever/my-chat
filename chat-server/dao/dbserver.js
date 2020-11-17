//引入加密
const bcrypt = require('../dao/bcrypt');
//引入token
const jwt = require('../dao/jwt');
const dbmodel = require('../model/dbmodel');
const User = dbmodel.model('User');
const Friend = dbmodel.model('Friend');
const Message = dbmodel.model('Message');

//注册
//新建用户
exports.createUser = (name, email, pwd, res) => {
    //密码加密
    let newPwd = bcrypt.encryption(pwd);
    let data = {
        name,
        email,
        pwd: newPwd,
        registerTime: new Date()
    }

    let user = new User(data);
    user.save((err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200 })
        }
    })
}

//匹配用户
exports.countUser = (data, type, res) => {
    let condition = {};
    condition[type] = data;
    User.countDocuments(condition, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200, result })
        }
    })
}

//登录
//用户验证
exports.checkUser = (data, pwd, res) => {
    let condition = { $or: [{ name: data }, { email: data }] };
    let fields = { name: 1, imgUrl: 1, pwd: 1 }
    User.find(condition, fields, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            //用户名错误
            if (result == '') {
                res.send({ status: 400 });
            } else {
                let output = result[0];
                //密码验证
                let correctPwd = bcrypt.verification(pwd, output.pwd);
                if (correctPwd) {
                    let token = jwt.generateToken(output._id)
                    let identity = {
                        id: output._id,
                        name: output.name,
                        imgUrl: output.imgUrl,
                        token,
                    }
                    res.send({ status: 200, identity })
                } else {
                    // 密码错误
                    res.send({ status: 400 })
                }
            }

        }
    })
}

//搜索
//搜索用户
exports.searchUser = (data, res) => {
    let condition;
    //输入PaiZ或者ZaiP搜索所有人
    if (data == 'PaiZ' || data == 'ZaiP') {
        condition = {}
    } else {
        //模糊查找
        condition = { $or: [{ name: { $regex: data } }, { email: { $regex: data } }] };
    }

    let fields = { name: 1, imgUrl: 1, email: 1 }
    User.find(condition, fields, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200, result })
        }
    })
}

//判断是否为好友 并返回昵称
exports.isFriend = (uid, fid, res) => {
    let condition = { userId: uid, friendId: fid, state: 0 };
    let fields = { nickName: 1, state: 1 };
    Friend.findOne(condition, fields, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            if (result) {
                //为好友
                res.send({ status: 200, result })
            } else {
                //非好友
                res.send({ status: 400 })
            }
        }
    })
}

//用户
//用户详情
exports.userDetail = (id, res) => {
    let condition = { _id: id };
    let fields = { pwd: 0 };
    User.findOne(condition, fields, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200, result })
        }
    })
}

//用户信息更改
exports.userUpdate = (datas, res) => {
    let updateStr = {};
    //判断是否是需要密码修改
    if (datas.type == 'pwd') {
        User.find({ _id: datas.id }, { pwd: 1 }, (err, result) => {
            if (err) {
                res.send({ status: 500 });
            } else {
                if (result == [] || !datas.pwd) {
                    res.send({ status: 400 });
                    return
                }
                let output = result[0];
                //密码验证
                let correctPwd = bcrypt.verification(datas.pwd, output.pwd);
                if (correctPwd) {
                    //密码加密
                    let newPwd = bcrypt.encryption(datas.data);
                    updateStr[datas.type] = newPwd
                    User.findByIdAndUpdate(datas.id, updateStr, (err, fin) => {
                        if (err) {
                            res.send({ status: 500 })
                        } else {
                            res.send({ status: 200 })
                        }
                    })
                } else {
                    // 密码错误
                    res.send({ status: 400 })
                }
            }
        })
    } else {
        updateStr[datas.type] = datas.data;
        //判断用户名是否重名
        if (datas.type == 'name') {
            User.countDocuments(updateStr, (err, result) => {
                if (err) {
                    res.send({ status: 500 })
                } else {
                    if (result == 0) {
                        User.findByIdAndUpdate(datas.id, updateStr, (err, fin) => {
                            if (err) {
                                res.send({ status: 500 })
                            } else {
                                res.send({ status: 200 })
                            }
                        })
                    } else {
                        // 重名
                        res.send({ status: 402 })
                    }
                }
            })
        } else {
            User.findByIdAndUpdate(datas.id, updateStr, (err, fin) => {
                if (err) {
                    res.send({ status: 500 })
                } else {
                    res.send({ status: 200 })
                }
            })
        }
    }

}

//好友
//获取好友昵称(获取好友时获得)
// exports.getNickName = (datas, res) => {
//     let condition = { userId: datas.uid, friendId: datas.fid };
//     let fields = { nickName: 1 };
//     Friend.findOne(condition, fields, (err, result) => {
//         if (err) {
//             res.send({ status: 500 })
//         } else {
//             res.send({ status: 200, result })
//         }
//     })
// }

//好友昵称修改
exports.updateNickName = (datas, res) => {
    let condition = { userId: datas.uid, friendId: datas.fid };
    let updateStr = { nickName: datas.name };
    Friend.updateOne(condition, updateStr, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200 })
        }
    })
}

//创建好友表
exports.createFriend = (uid, fid, state, res) => {
    let data = {
        userId: uid,
        friendId: fid,
        state,
        addTime: new Date(),
        lastTime: new Date()
    }
    let friend = new Friend(data);
    friend.save((err, result) => {
        if (err) {
            console.log('添加好友出错', err);
        } else {
            // res.send({ status: 200 })
        }
    })
}

//更新好友最后通讯时间
exports.upFriendLastTime = (datas) => {
    let condition = { $or: [{ userId: datas.uid, friendId: datas.fid }, { userId: datas.fid, friendId: datas.uid }] }
    // let condition = { userId: uid, friendId: fid };
    let updateStr = { lastTime: new Date() };
    Friend.updateMany(condition, updateStr, (err, res) => {
        if (err) {
            console.log('更新申请时间出错', err);
        } else {
            // res.send({ status: 200 })
        }
    })
}

//创建1-1消息表
exports.createMessage = (uid, fid, msg, type, state, res) => {
    let data = {
        userId: uid,
        friendId: fid,
        message: msg,
        type,
        time: new Date(),
        state,
    }
    let message = new Message(data);
    message.save((err, result) => {
        if (err) {
            if (res) {
                res.send({ status: 500 })
            }
        } else {
            if (res) {
                res.send({ status: 200 })
            }
        }
    })
}

//添加好友
exports.addFriend = (datas, res) => {
    //判断是否申请过
    let condition = { userId: datas.uid, friendId: datas.fid };
    Friend.countDocuments(condition, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            //result为0为初次申请
            if (!result) {
                this.createFriend(datas.uid, datas.fid, 1);
                this.createFriend(datas.fid, datas.uid, 2);
            } else {
                //后面申请更改时间
                this.upFriendLastTime(datas);
                // this.upFriendLastTime(datas.uid, datas.fid);
                // this.upFriendLastTime(datas.fid, datas.uid);
            }
            //添加消息
            this.createMessage(datas.uid, datas.fid, datas.msg, 0, 1, res)
        }
    })

}

//更新好友状态
exports.updateState = (datas, res) => {
    let condition = { $or: [{ userId: datas.uid, friendId: datas.fid }, { userId: datas.fid, friendId: datas.uid }] }
    let updateStr = { state: 0, lastTime: new Date() };
    Friend.updateMany(condition, updateStr, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            this.createMessage(datas.fid, datas.uid, "我们是好友啦~快来聊天吧", 0, 1, res)
        }
    })
}

//拒绝或删除好友
exports.delateFriend = (datas, res) => {
    let condition = { $or: [{ userId: datas.uid, friendId: datas.fid }, { userId: datas.fid, friendId: datas.uid }] }
    Friend.deleteMany(condition, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200 })
        }
    })
}

//首页
//获取用户列表
exports.getUserLists = (uid, state, res) => {
    Friend.find({})
        .where({ userId: uid, state })
        .populate('friendId')  //关联查询
        .sort({ lastTime: -1 })
        .exec().then(e => {
            let result = e.map(v => {
                return {
                    id: v.friendId._id,
                    name: v.friendId.name,
                    nickName: v.nickName,
                    imgUrl: v.friendId.imgUrl,
                    lastTime: v.lastTime
                }
            })
            res.send({ status: 200, result })
        }).catch(err => {
            res.send({ status: 500 })
        })
}

//获取1-1最后消息
exports.getLastMsg = (datas, res) => {
    Message.findOne({})
        .where({ $or: [{ userId: datas.uid, friendId: datas.fid }, { userId: datas.fid, friendId: datas.uid }] })
        .sort({ time: -1 })
        .exec().then(v => {
            let result = {
                message: v.message,
                time: v.time,
                type: v.type
            }
            res.send({ status: 200, result })
        }).catch(err => {
            res.send({ status: 500, err })
        })
}

//汇总未读消息数
exports.unreadMsg = (datas, res) => {
    let condition = { userId: datas.fid, friendId: datas.uid, state: 1 };
    Message.countDocuments(condition, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200, result })
        }
    })
}

//更新好友未读消息数
exports.updateReadMsg = (datas, res) => {
    let condition = { userId: datas.fid, friendId: datas.uid, state: 1 };
    let updateStr = { state: 0 }
    Message.updateMany(condition, updateStr, (err, result) => {
        if (err) {
            res.send({ status: 500 })
        } else {
            res.send({ status: 200 })
        }
    })
}

//消息操作
//分页获取1-1聊天数据
exports.msgData = (datas, res) => {
    let skipNum = datas.page * datas.pageSize;  //跳过的条数
    Message.find({})
        .where({ $or: [{ userId: datas.uid, friendId: datas.fid }, { userId: datas.fid, friendId: datas.uid }] })
        .sort({ time: -1 })
        .populate('userId')  //关联查询
        .skip(skipNum)
        .limit(datas.pageSize)
        .exec().then(e => {
            let result = e.map(v => {
                return {
                    id: v._id,  //数据本身的id，用于定位
                    message: v.message,
                    type: v.type,
                    time: v.time,
                    fromId: v.userId._id,
                    imgUrl: v.userId.imgUrl,
                }
            })
            res.send({ status: 200, result })
        }).catch(err => {
            res.send({ status: 500 })
        })
}