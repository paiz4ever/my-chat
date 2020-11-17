<template>
	<view class="content">
		<view class="top_bar">
			<view class="top_bar_left" @tap="toBack">
				<image src="../../static/images/index/back.png" mode="widthFix"></image>
			</view>
			<view class="top_bar_center">
				{{name}}
			</view>
			<view class="top_bar_right">
				<image :src="fimg" mode="widthFix"></image>
			</view>
		</view>
		<scroll-view scroll-y="true" class="main" :scroll-with-animation="scrollAnimation" :scroll-into-view="scrollTarget" @tap='hideAll' @scrolltoupper="onLoading">
			<view class="chat_main" :style="{paddingBottom:dynamicPadding+'px'}">
				<view class="loading" v-if="this.loadFlag">
					<image src="../../static/images/index/loading.png" mode="" :animation="animationData"></image>
				</view>
				<view class="chat_list">
					<view class="chat_content" v-for="(item,index) in message" :key="index" :id="'msg-'+item.id">
						<!-- index==0是给第一条信息必须加上时间 -->
						<view class="chat_time" v-if="index>0&&item.time!=message[index-1].time||index==0">{{item.time|formatChatTime}}</view>
						<view class="msg msg_left" v-if="item.fromId==fid">
							<image :src="fimg" mode="" class="head_pic"></image>
							<!-- 文字 -->
							<view class="msg_info" v-if="item.type==0">{{item.message}}</view>
							<!-- 图片 -->
							<image :src="item.message" mode="aspectFill" v-if="item.type==1" class="msg_img" @tap="previewImg(item.message)"></image>
							<!-- 音频 -->
							<view class="msg_info msg_voice" v-if="item.type==2" :style="{width:item.message.time/30*225+'px'}" @tap="playRecord(item.message.voicePath)">
								<image src="../../static/images/chatTool/sound.png" mode=""></image>
								<text>{{item.message.time}}"</text>
							</view>
							<!-- 位置 -->
							<view class="msg_map" v-if="item.type==3" @tap="openMap(item.message)">
								<view class="map_info">
									<view class="name">{{item.message.name}}</view>
									<view class="address">{{item.message.address}}</view>
								</view>
								<!-- 未解决 -->
								<!-- <map :latitude="item.message.latitude" :longitude="item.message.longitude" class="map" :markers="markLocation(item.message)"></map> -->
								<image src="../../static/images/img/map.png" mode="widthFix" class="map"></image>
							</view>
						</view>
						<view class="msg msg_right" v-else>
							<image :src="imgUrl" mode="" class="head_pic"></image>
							<view class="msg_info" v-if="item.type==0">{{item.message}}</view>
							<image :src="item.message" mode="aspectFill" v-if="item.type==1" class="msg_img" @tap="previewImg(item.message)"></image>
							<view class="msg_info msg_voice" v-if="item.type==2" :style="{width:item.message.time/30*225+'px'}" @tap="playRecord(item.message.voicePath)">
								<image src="../../static/images/chatTool/sound.png" mode=""></image>
								<text>{{item.message.time}}"</text>
							</view>
							<view class="msg_map" v-if="item.type==3" @tap="openMap(item.message)">
								<view class="map_info">
									<view class="name">{{item.message.name}}</view>
									<view class="address">{{item.message.address}}</view>
								</view>
								<!-- 未解决 -->
								<!-- <map :latitude="item.message.latitude" :longitude="item.message.longitude" class="map" :markers="markLocation(item.message)"></map> -->
								<image src="../../static/images/img/map.png" mode="widthFix" class="map"></image>
							</view>
						</view>
					</view>
				</view>
			</view>
		</scroll-view>
		<chat-tool @newMsg="newMsg" @getHeight="getHeight" ref="tool"></chat-tool>
	</view>
</template>

<script>
	import {
		formatChatTime
	} from '../../commons/js/myFunc.js';
	import {
		request
	} from '../../request/index.js'
	import chatTool from '../../components/chatTool/chatTool.vue';
	const innerAudioContext = uni.createInnerAudioContext();
	export default {
		data() {
			return {
				uid: '', //自己id
				token: '',
				imgUrl: '',
				myName: '',
				fid:'',
				fimgUrl:'',
				name:'',
				//刷新动画
				animationData: {},
				//加载页数
				page:0,
				pageSize:10,
				//底部顶起时动态改变padding
				dynamicPadding: 75,
				// 滚动定位的目标
				scrollTarget: '',
				message:[],  //消息队列
				loading:null ,//加载动画
				loadFlag:false ,//加载隐藏
				scrollAnimation:false  ,//是否开启滚动动画
				imgsPath:[]  //预览图片列表

			};
		},
		components: {
			chatTool,
		},
		/*未解决的map标签的mark属性
		computed: {
			markLocation() {
				return function(e) {
					let setting = [
						{
							latitude: e.latitude,
							longitude: e.longitude,
							iconPath: '../../static/images/chatTool/mapLocation.png',
							width:25,
							height:25
						}
					];
					return setting;
				}
			}
		},
		*/
		onLoad(e) {
			this.fid = e.id;
			this.name = e.name;
			this.fimg = e.img;
			this.getStorage();
			this.getMsgs();
			this.recevieMsg()
			//socket模块 state表示位置0在首页，1在聊天页（用于后台判断数据存放的未读和已读）需要在离开聊天时再次调用
			this.socketJoin(this.uid,1)
		},
		
		methods: {
			//socket模块
			socketJoin(uid,state){
				this.socket.emit('login',uid,state)
			},
			//上传消息
			sendMsg(msgs,fromId,toId){
				this.socket.emit('handleMsg',msgs,fromId,toId)
			},
			//接收消息
			recevieMsg(){
				this.socket.on('dealMsg',(msgs,id,t)=>{
					//判断发送者，防止多人给自己发消息会信息错位 (此方法后端发送两次fromId不同)
					//(后面的判断主要是优化首页时自己给自己发消息会发送两次解决 t=1为好友发送)
					if(id == this.fid&&t==1){
						console.log(2)
						if(msgs.type==2||msgs.type==3){
							msgs.message=JSON.parse(msgs.message)
						}
						this.scrollAnimation=true;
						//发送图片则添加到预览队列
						if (msgs.type == 1) {
							this.imgsPath.push(msgs.message)
						}
						this.message.push(msgs);
						this.message.map((v, i) => {
							let delay = 0;
							if (i > 0) {
								delay = new Date(v.time) - new Date(this.message[i - 1].time);
								if (delay < 1000 * 60 * 5) {
									v.time = this.message[i - 1].time
								}
							}
						})
						//定位到最新消息
						this.$nextTick(function() {
							this.scrollTarget = 'msg-' + this.message[this.message.length - 1].id
						}) 
					}
				})
				
			},
			//获取缓存信息
			getStorage() {
				if (uni.getStorageSync('identity')) {
					let {
						id,
						imgUrl,
						token,
						name
					} = uni.getStorageSync('identity');
					this.uid = id;
					this.imgUrl = this.baseUrl + imgUrl;
					this.token = token;
					this.myName = name;
				} else {
					uni.reLaunch({
						url: '../login/login'
					})
				}
			},
			toBack() {
				this.socketJoin(this.uid,0)
				uni.navigateBack({
					delta: 1
				})
			},
			//请求消息
			getMsgs(){
				request({
					url: '/chat/msgdata',
					data: {
						uid:this.uid,
						fid:this.fid,
						token:this.token,
						page:this.page,
						pageSize:this.pageSize
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						let message = res.data.result.reverse();
						let _imgsPath=[];
						message.forEach(v=>{
							if(v.type==1){
								_imgsPath.push(this.baseUrl+v.imgUrl)
							}
							if(v.type==2||v.type==3){
								v.message=JSON.parse(v.message)
							}
						})
						this.imgsPath = _imgsPath.concat(this.imgsPath)
						this.message=message.concat(this.message) 
						if(message.length==this.pageSize){
							this.page++
						}else{
							this.page = -1
						}
						// 将五分钟内的时间取为相同,然后在标签渲染时筛选相同时间隐藏
						this.message.map((v, i) => {
							let delay = 0;
							if (i > 0) {
								delay = new Date(v.time) - new Date(this.message[i - 1].time);
								if (delay < 1000 * 60 * 5) {
									v.time = this.message[i - 1].time
								}
							}
						})
						this.$nextTick(function() {
							this.scrollTarget = 'msg-' + message[message.length - 1].id
						})
						//关闭动画
						this.loadFlag=false;
						clearInterval(this.loading);
					}else if(status==300){
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {
						
					}
				})
			},
			//下拉刷新
			 onLoading(){
				 //禁止刷新（没有数据或者重复刷新）
				 if(this.page!=-1&&this.loadFlag==false){
					 this.loadFlag=true;
					 var animation = uni.createAnimation({
					   duration: 1000,
					     timingFunction: 'step-start',
					 })
					 			
					 this.animation = animation;
					 setTimeout(()=>{
						  this.getMsgs()
					 },2000)
					
					 let a=1;
					 this.loading = setInterval(function() {
					   animation.rotate(a*30).step()
					   this.animationData = animation.export()
					   a++;
					 }.bind(this), 100)
				 }
			  },
			//预览图片
			previewImg(tapUrl) {
				//判断点击了哪一张，将索引值传给current
				let index = 0;
				this.imgsPath.forEach((v, i) => {
					if (v == tapUrl) {
						index = i
					}
				});
				uni.previewImage({
					current: index,
					urls: this.imgsPath,
					longPressActions: {
						itemList: ['发送给朋友', '保存图片', '收藏'],
						success: function(data) {
							console.log('选中了第' + (data.tapIndex + 1) + '个按钮,第' + (data.index + 1) + '张图片');
						},
						fail: function(err) {
							console.log(err.errMsg);
						}
					}
				});
			},
			//接受组件传来的新消息
			newMsg(e) {
				this.scrollAnimation=true;
				const {
					message,
					type
				} = e;
				//发送图片则添加到预览队列
				if (type == 1) {
					this.imgsPath.push(message)
				}

				let msgs = {
					id:this.message.length,
					fromId: this.uid,
					imgUrl: this.imgUrl,
					message,
					type, //内容类型 0：文字 1：图片 2：音频 3：位置
					time: new Date()
				};
				
				this.message.push(msgs);
				this.message.map((v, i) => {
					let delay = 0;
					if (i > 0) {
						delay = new Date(v.time) - new Date(this.message[i - 1].time);
						if (delay < 1000 * 60 * 5) {
							v.time = this.message[i - 1].time
						}
					}
				})
				//定位到最新消息
				this.$nextTick(function() {
					this.scrollTarget = 'msg-' + this.message[this.message.length - 1].id
				}) 
				//这里切记深拷贝
				let copyMsg = JSON.parse(JSON.stringify(msgs))
				if(copyMsg.type==2||copyMsg.type==3){
					copyMsg.message = JSON.stringify(copyMsg.message)
				}
				//发送至服务器
 				this.sendMsg(copyMsg,this.uid,this.fid)
			},
			// 动态改变padding值,防止消息被弹起的表情页或add页覆盖
			getHeight(e) {
				this.dynamicPadding = 25 + e;
				this.scrollBottom()
			},
			//顶起时滚动
			scrollBottom() {
				this.scrollAnimation=true;
				this.scrollTarget = '';
				this.$nextTick(function() {
					this.scrollTarget = 'msg-' + this.message[this.message.length - 1].id
				})
			},
			//点击其他地方收起chatTool
			hideAll() {
				this.$refs.tool.addShow = false;
				this.$refs.tool.emojiShow = false;
			},
			//播放音频
			playRecord(src) {
				innerAudioContext.src = src;
				innerAudioContext.play();
			},
			//查看地图
			openMap(e){
				uni.openLocation({
				    latitude: e.latitude,
				    longitude: e.longitude,
					name:e.name,
					address:e.address
				});
			}
		},
		filters: {
			formatChatTime
		}
	}
</script>

<style lang="scss">
	.content {
		//*2 解决页面滑动不流畅的问题
		position: fixed;
		z-index: 10;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		//解决窗体沉浸式
		padding-top: var(--status-bar-height);
		height: 100vh;
		width: 100%;
	}

	.top_bar {
		position: fixed;
		z-index: 99;
		top: 0;
		left: 0;
		width: 100%;
		height: 88rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		// background: $uni-bg-color;
		background: #F4F4F4;
		border-bottom: 1rpx solid $uni-border-color;
		padding-top: var(--status-bar-height);
		box-sizing: content-box;

		image {
			z-index: 1;
			width: 50rpx;
			height: 50rpx;
		}

		.top_bar_left {
			margin-left: 32rpx;

		}

		.top_bar_right {
			margin-right: 32rpx;
			width: 68rpx;
			height: 68rpx;

			image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
			}
		}


	}

	.main {
		padding-top: 88rpx;
		padding-bottom: var(--status-bar-height);
		width: 100%;
		height: 100%;
		background: #F4F4F4;

		.chat_main {
			padding-left: $uni-spacing-col-base;
			padding-right: $uni-spacing-col-base;
			padding-top: 40rpx;
			// padding-bottom: 150rpx;
			display: flex;
			flex-direction: column;
			.loading{
				margin-top:25rpx ;
				display: flex;
				justify-content: center;
				align-items: center;
				image{
					width: 60rpx;
					height: 60rpx;
				}
			}

			.chat_list {
				.chat_content {
					display: flex;
					flex-direction: column;
					align-items: center;

					.chat_time {
						margin-top: 40rpx;
						font-size: $uni-font-size-sm;
						color: $uni-text-color-disable;
						line-height: 34rpx;
					}

					.msg {
						margin-top: 40rpx;
						display: flex;

						.head_pic {
							width: 80rpx;
							height: 80rpx;
							border-radius: 10rpx;
						}

						.msg_info {
							max-width: 480rpx;
							min-width: 80rpx;
							min-height: 80rpx;
							padding: 18rpx 10rpx 18rpx 15rpx;
							line-height: 44rpx;
							font-size: $uni-font-size-lg;
							display: flex;
							justify-content: center;
							align-items: center;
						}

						.msg_voice {
							max-width: 450rpx;
							min-width: 110rpx;
							justify-content: flex-start;
							font-size: 28rpx;

							image {
								width: 35rpx;
								height: 35rpx;
								margin-right: 10rpx;
							}
						}

						.msg_img {
							max-width: 400rpx;
							max-height: 400rpx;
							border-radius: $uni-border-radius-base;
						}
						.msg_map{
							background-color: #FFFFFF;
							width: 480rpx;
							height: 284rpx;
							overflow: hidden;
							.map_info{
								line-height: 44rpx;
								padding: 18rpx 20rpx 10rpx;
								.name{
									font-size: $uni-font-size-lg;
									display: -webkit-box;
									-webkit-box-orient: vertical;
									-webkit-line-clamp: 1;
									overflow: hidden;
								}
								.address{
									font-size: $uni-font-size-sm;
									color: $uni-text-color-disable;
									display: -webkit-box;
									-webkit-box-orient: vertical;
									-webkit-line-clamp: 1;
									overflow: hidden;
								}
							}
							.map{
								width: 480rpx;
								height: 200rpx;
							}
							
						}
					}
					

					.msg_left {
						align-self: flex-start;
						flex-direction: row;

						.msg_info {
							margin-left: 16rpx;
							background: #FFFFFF;
							border-radius: 0 10rpx 10rpx 10rpx;
						}
						.msg_map{
							margin-left: 16rpx;
							border-radius: 0 10rpx 10rpx 10rpx;
						}

						.msg_img {
							margin-left: 16rpx;

						}
					}

					.msg_right {
						align-self: flex-end;
						flex-direction: row-reverse;

						.msg_info {
							margin-right: 16rpx;
							background: $uni-color-primary;
							border-radius: 10rpx 0 10rpx 10rpx;
						}
						.msg_map{
							margin-right: 16rpx;
							border-radius: 10rpx 0 10rpx 10rpx;
						}

						.msg_voice {
							flex-direction: row-reverse;

							image {
								transform: rotate(180deg);
								margin-right: 0;
								margin-left: 10rpx;
							}
						}

						.msg_img {
							margin-right: 16rpx;
						}
					}
				}
			}
		}
	}
</style>
