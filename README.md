# my-chat
## 基于uniapp和socket.io实现的聊天app

## 改善
### 1.加入邮箱真实性验证（验证码）
### 2.优化showtoast的图标
### 3.uni.preloadPage预加载页面
### 4.无好友页面的加入
### 5.添加正在键入的功能
### 6.密码框可以用*replace数字，这样不用切换input的type
### 7.添加好友通讯列表
### 8.加入群聊功能

## 开发中的问题
### 1.css：info.vue 用户详情页
使用滚动选择picker包裹.part(每一行)时，:last-child会影响到该行的下边框
>>>
使用&:not(:only-child):last-child来筛选掉picker里面的part，因为它属于唯一子元素，缺点：当part_list只有一个part时也会被影响

### 2.html：chatroom 聊天页
textare多行文本框输入符号不会换行
>>>
uniapp框架本身问题

### 3.html：chatroom 聊天页
textare多行文本框无法使用@comfirm
>>>目前不支持（考虑使用手动发送）
1.使用input代替，缺点：高度无法自增，自成一行
2.@input事件监听\n换行，缺点：无法取消换行默认事件（软键盘）
3.使用自定义发送键

### 4.html js：chatroom 聊天页
input框自动聚焦时弹起软键盘，需求是点击表情时自动聚焦，但是键盘覆盖表情页，导致问题是无法在指定光标位置插入表情
>>>
目前不支持

### 5.html：chatroom 聊天页
发送的图片设置aspectFit会留白
>>>
后续使用js获取图片高度进行适配

### 6.css：chatroom 聊天页
音频遮罩层层级问题 z-index 
>>>
需要注意z-index只能工作在被明确定义了absolute，fixed或relative 这三个定位属性的元素中

### 7.html js：chatroom 聊天页
scroll-into-view不灵敏 在语音输入时，其他时候正常 
>>>
未知原因

### 8.html css：chatroom 聊天页
地图map标签，无法在scroll-view标签中使用，层级为最高无法修改
>>>
改为使用静态图片


### 9.js：uni.navigateback不刷新数据
修改头像然后返回没有刷新头像 （将获取数据设置在onShow中，其他都可以实时更新，但是头像不行 性别之类的可以）
>>>
//返回上一页时刷新数据
returnData(){
       uni.$emit("getData",{imgUrl: this.cropFilePath});
       uni.navigateBack({
		       delta: 1
		                   })
            },
//返回页
onShow(){
uni.$on("getData", res => {
                 this.info.imgUrl = res.imgUrl
                 // 清除监听
                 uni.$off('getData');
                          }
                }
			})

