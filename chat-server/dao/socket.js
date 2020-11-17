const dbserver = require('../dao/dbserver')

module.exports = io => {
    let userList = {};
    io.on('connection', (socket) => {
        //用户登录
        socket.on('login', (id, state) => {
            socket.name = id;
            userList[socket.name] = { myId: socket.id, myState: state }
            console.log(userList);
        })

        //接发消息
        socket.on('handleMsg', (msgs, fromId, toId) => {
            //消息状态未读
            let state = 1;
            if (userList[toId].myState == 1) {
                //用户在线则已读
                state = 0;
            }
            socket.to(userList[toId].myId).emit('dealMsg', msgs, fromId, 1);//表示发给对方的
            socket.emit('dealMsg', msgs, toId, 0)
            //存入数据库
            //更新通讯时间
            dbserver.upFriendLastTime({ uid: fromId, fid: toId })
            //存储消息
            dbserver.createMessage(fromId, toId, msgs.message, msgs.type, state)
            //发送消息


        })

        //用户离开
        socket.on('disconnecting', () => {
            if (userList.hasOwnProperty(socket.name)) {
                delete userList[socket.name]
                console.log(socket.id + '离开了');
            }
        })

    })
}