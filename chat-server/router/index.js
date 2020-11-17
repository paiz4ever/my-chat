//引入注册服务
const signup = require('../server/signup')
//引入登录服务
const signin = require('../server/signin')
//引入搜索服务
const search = require('../server/search')
//引入用户服务
const user = require('../server/user')
//引入好友服务
const friend = require('../server/friend')
//引入主页服务
const lists = require('../server/lists')
//引入聊天服务
const chat = require('../server/chat')

module.exports = app => {
    //注册页面
    //注册
    app.post('/signup/add', (req, res) => {
        signup.addUser(req, res);
    })

    //判断占用情况
    app.post('/signup/judge', (req, res) => {
        signup.judgeValue(req, res);
    })

    //登录页面
    //登录
    app.post('/signin/check', (req, res) => {
        signin.logOn(req, res);
    })

    //搜索页面
    //搜索用户
    app.post('/search/user', (req, res) => {
        search.searchUser(req, res);
    })

    //是否为好友
    app.post('/search/usercheck', (req, res) => {
        search.isFriend(req, res);
    })

    //用户详情
    //详情信息
    app.post('/user/detail', (req, res) => {
        user.userDetail(req, res);
    })

    //信息修改
    app.post('/user/update', (req, res) => {
        user.userUpdate(req, res);
    })

    //好友管理
    //获取昵称
    // app.post('/friend/nickname', (req, res) => {
    //     friend.getNickName(req, res);
    // })

    //昵称修改
    app.post('/friend/upnickname', (req, res) => {
        friend.updateNickName(req, res);
    })

    //添加好友
    app.post('/friend/addfriend', (req, res) => {
        friend.addFriend(req, res);
    })

    //更改好友状态
    app.post('/friend/updatestate', (req, res) => {
        friend.updateState(req, res);
    })

    //拒绝或删除好友
    app.post('/friend/delatefriend', (req, res) => {
        friend.delateFriend(req, res);
    })

    //列表页
    //获取好友列表
    app.post('/lists/getlist', (req, res) => {
        lists.getUserLists(req, res);
    })

    //获取最后一条消息
    app.post('/lists/getlastmsg', (req, res) => {
        lists.getLastMsg(req, res);
    })

    //获取未读消息数
    app.post('/lists/getunread', (req, res) => {
        lists.unreadMsg(req, res);
    })

    //更新未读消息数
    app.post('/lists/updatemsg', (req, res) => {
        lists.updateReadMsg(req, res);
    })

    //获取1-1聊天数据
    app.post('/chat/msgdata', (req, res) => {
        chat.msgData(req, res);
    })


}
