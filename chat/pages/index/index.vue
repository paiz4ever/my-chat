<template>
	<view class="content">
		<!-- 顶部栏 -->
		<view class="top_bar">
			<navigator class="top_bar_left" :url="'../userHome/userHome?id='+uid" hover-class="none">
				<image :src="imgUrl"></image>
			</navigator>
			<view class="top_bar_center">
				<image src="../../static/images/index/logo.png"></image>
			</view>
			<view class="top_bar_right">
				<view class="search">
					<image src="../../static/images/index/search.png" @tap="toSearch"></image>
				</view>
				<view class="add">
					<image src="../../static/images/index/add.png" mode=""></image>
				</view>
			</view>
		</view>
		<!-- <view class="refresh">
			<image src="../../static/images/index/refresh.png" mode=""></image>
			<view class="refresh_tip">下拉刷新</view>
		</view> -->
		<!-- 内容列表 -->
		<view class="main">
			<view class="apply" v-if="reqCount!=0">
				<!-- 单个内容 -->
				<view class="friend" @tap='toUserRequest'>
					<view class="friend_head">
						<text class="head_tip" v-if="reqCount!=0">{{reqCount}}</text>
						<image src="../../static/images/index/apply.png" mode=""></image>
					</view>
					<view class="friend_body">
						<view class="body_info">
							<view class="info_name">好友请求</view>
							<view class="info_time">{{reqTime|formatIndexTime}}</view>
						</view>
						<view class="body_message">
							你有新的好友请求！
						</view>
					</view>
				</view>
			</view>
			<view class="friends_list">
				<view class="friend" v-for="(item,index) in friendList" :key="index">
					<view class="friend_head" @tap="toUserHome(item.id)">
						<text class="head_tip" v-if="item.tip">{{item.tip}}</text>
						<image :src="item.imgUrl" mode=""></image>
					</view>
					<view class="friend_body" @tap="toChatroom(item,index)">
						<view class="body_info">
							<view class="info_name">{{item.nickName?item.nickName:item.name}}</view>
							<view class="info_time">{{item.lastTime|formatIndexTime}}</view>
						</view>
						<view class="body_message">
							{{item.message}}
						</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		formatIndexTime
	} from '../../commons/js/myFunc.js'
	import {
		request
	} from '../../request/index.js';
	export default {
		data() {
			return {
				uid: '', //自己id
				token: '',
				imgUrl: '',
				myName: '',
				friendList: [],
				reqCount: 0, //请求数
				reqTime: '', //最后请求时间
				excId:'',  //转去聊天界面的id
				// reqMsg:'你们是好友啦~快来聊天吧'  //通过好友请求的初次信息（放在后台处理，更新状态时添加新消息）
			}
		},
		onPullDownRefresh() {
			//获取好友列表
			this.getFriendList()
			//获取请求数
			this.getReqList()
			setTimeout(function() {
				uni.stopPullDownRefresh();
			}, 1000);
		},
		onLoad(){
			this.getStorage();
			//获取好友列表
			this.getFriendList()
			//获取请求数
			this.getReqList();
			//socket模块 state表示位置0在首页，1在聊天页（用于后台判断数据存放的未读和已读）
			this.socketJoin(this.uid,0)
			//socket模块
			this.recevieMsg()
		},
		onShow() {
			uni.$on("getData", res => {
				this.imgUrl = res.imgUrl
				// 清除监听
				uni.$off('getData');
			})
			this.excId='' //每次回到首页将排除项清空
		},
		methods: {
			//socket模块
			socketJoin(uid,state){
				this.socket.emit('login',uid,state)
			},
			//接收消息
			recevieMsg(){
				this.socket.on('dealMsg',(msgs,id,t)=>{
					let shortMsg = ''
					if(msgs.type==0){
						shortMsg = msgs.message	
					}else if(msgs.type==1){
						shortMsg = '[图片]'
					}else if(msgs.type==2){
						shortMsg = '[语音]'
					}else if(msgs.type==3){
						shortMsg = '[位置]'
					}
					this.friendList.forEach((v,i)=>{
						if(v.id == id){
							v.message = shortMsg
							v.lastTime = msgs.time
							if(t==1&&id!=this.excId){
								if(v.tip==undefined){
									console.log(3)
									v.tip=0
								}else if(v.tip==0){
									console.log(4)
								}else{
									console.log(5)
								}
								
								v.tip++
								console.log('1:'+v.tip)
								
							}
							this.friendList.splice(i,1)
							this.friendList.unshift(v)
						}
					})
				})
				
			},
			
			toUserHome(v) {
				uni.navigateTo({
					url: '../userHome/userHome?id=' + v
				})
			},
			toSearch() {
				uni.navigateTo({
					url: '../search/search'
				})
			},
			toUserRequest() {
				uni.navigateTo({
					url: '../userRequest/userRequest'
				})
			},
			toChatroom(v,i) {
				this.excId = v.id
				//更新数据库的未读
				this.updateTip(v.id);
				//更新socket的未读
				this.$set(this.friendList[i],'tip',0) //无效？
				this.$delete(this.friendList[i],'tip')
				let name = '';
				if(v.nickName){
					name=v.nickName
				}else{
					name=v.name
				}
				uni.navigateTo({
					url: '../chatroom/chatroom?id=' + v.id+'&name='+name+'&img='+v.imgUrl
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
			//获取列表
			getFriendList() {
				request({
					url: '/lists/getlist',
					data: {
						uid: this.uid,
						token: this.token,
						state: 0
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						this.friendList = res.data.result;
						this.friendList.map(async v => {
							//获取未读消息数
							await request({
								url: '/lists/getunread',
								data: {
									uid: this.uid,
									fid: v.id,
									token: this.token
								},
								method: 'POST',
							}).then(res => {
								let status = res.data.status;
								if (status == 200) {
									v.tip = res.data.result
								} else if (status == 300) {
									//token过期
									uni.reLaunch({
										url: '../login/login?name=' + this.myName
									})
								} else if (status == 500) {

								}
							})
							//获取最后消息
							await request({
								url: '/lists/getlastmsg',
								data: {
									uid: this.uid,
									fid: v.id,
									token: this.token
								},
								method: 'POST',
							}).then(res => {
								let status = res.data.status;
								if (status == 200) {
									let msg = res.data.result
									if(msg.type==0){
										v.message  = msg.message	
									}else if(msg.type==1){
										v.message = '[图片]'
									}else if(msg.type==2){
										v.message  = '[语音]'
									}else if(msg.type==3){
										v.message = '[位置]'
									}
									 
								} else if (status == 300) {
									//token过期
									uni.reLaunch({
										url: '../login/login?name=' + this.myName
									})
								} else if (status == 500) {

								}
							})
							v.imgUrl = this.baseUrl + v.imgUrl
						})
					} else if (status == 300) {
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {
						uni.showToast({
							title: '服务器出错啦!',
							icon: 'none',
							duration: 2000
						});
					}
				})
			},
			//获取请求列表
			getReqList() {
				request({
					url: '/lists/getlist',
					data: {
						uid: this.uid,
						token: this.token,
						state: 2
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						this.reqCount = res.data.result.length;
						if (this.reqCount > 0) {
							this.reqTime = res.data.result[0].lastTime
						}
					} else if (status == 300) {
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {
						uni.showToast({
							title: '服务器出错啦!',
							icon: 'none',
							duration: 2000
						});
					}
				})
			},
			//更新未读消息数
			updateTip(v) {
				request({
					url: '/lists/updatemsg',
					data: {
						uid: this.uid,
						fid: v,
						token: this.token,
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {

					} else if (status == 300) {
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {

					}
				})
			}
		},
		filters: {
			formatIndexTime,
		}
	}
</script>

<style lang="scss">
	.content {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		//解决窗体沉浸式
		padding-top: var(--status-bar-height);
	}

	.top_bar {
		position: fixed;
		z-index: 10;
		top: 0;
		left: 0;
		width: 100%;
		height: 88rpx;
		display: flex;
		justify-content: space-between;
		align-items: center;
		background: $uni-bg-color;
		border-bottom: 1rpx solid $uni-border-color;
		padding-top: var(--status-bar-height);
		box-sizing: content-box;

		.top_bar_left {
			width: 68rpx;
			height: 68rpx;
			margin-right: 88rpx;
			margin-left: $uni-spacing-col-base;

			image {
				width: 100%;
				height: 100%;
				border-radius: 8rpx;
			}
		}

		.top_bar_center {
			width: 72rpx;
			height: 72rpx;

			image {
				width: 100%;
				height: 100%;
			}
		}

		.top_bar_right {
			display: flex;
			margin-right: 12rpx;

			.search {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 88rpx;
				height: 88rpx;

				image {
					width: 52rpx;
					height: 52rpx;
				}
			}

			.add {
				display: flex;
				justify-content: center;
				align-items: center;
				width: 88rpx;
				height: 88rpx;

				image {
					width: 48rpx;
					height: 48rpx;
				}
			}

		}
	}

	.main {
		padding-top: 88rpx;
		width: 100%;

		.friend {
			width: 100%;
			height: 128rpx;
			display: flex;

			&:active {
				background-color: $uni-bg-color-grey;
			}

			.friend_head {
				position: relative;
				width: 160rpx;
				height: 128rpx;
				padding: 18rpx 32rpx 14rpx;

				image {
					width: 96rpx;
					height: 96rpx;
					border-radius: $uni-border-radius-base;
					background-color: $uni-color-primary;
				}

				.head_tip {
					padding: 0 5rpx;
					position: absolute;
					z-index: 1;
					top: 10rpx;
					right: 20rpx;
					height: 36rpx;
					min-width: 36rpx;
					text-align: center;
					line-height: 36rpx;
					background-color: $uni-color-warning;
					border-radius: 18rpx;
					font-size: $uni-font-size-sm;
					color: $uni-text-color-inverse;
				}
			}

			.friend_body {
				flex: 1;
				padding-top: 22rpx;
				border-bottom: 1rpx solid $uni-border-color;

				.body_info {
					display: flex;
					justify-content: space-between;
					align-items: center;
					padding-right: 32rpx;

					.info_name {
						font-size: 36rpx;
						font-family: PingFangSC-Regular;
						font-weight: 400;
						color: rgba(39, 40, 50, 1);
						line-height: 50rpx;
					}

					.info_time {
						font-size: $uni-font-size-sm;
						line-height: 34rpx;
						color: $uni-text-color-disable;
					}
				}

				.body_message {
					padding-right: 48rpx;
					font-size: $uni-font-size-base;
					color: $uni-text-color-grey;
					line-height: 40rpx;
					display: -webkit-box;
					-webkit-box-orient: vertical;
					-webkit-line-clamp: 1;
					overflow: hidden;
				}
			}
		}

	}
    //刷新
	// .refresh {
	// 	height: 100vh;
	// 	width: 100vw;
	// 	padding-top: 88rpx;
	// 	width: 100%;
	// 	display: flex;
	// 	flex-direction: column;
	// 	justify-content: center;
	// 	align-items: center;

	// 	image {
	// 		width: 40rpx;
	// 		height: 40rpx;
	// 	}

	// 	.refresh_tip {
	// 		padding-top: 10rpx;
	// 		font-size: $uni-font-size-base;
	// 		color: rgba(39, 40, 50, 0.4);
	// 		line-height: 40rpx;
	// 	}
	// }
</style>
