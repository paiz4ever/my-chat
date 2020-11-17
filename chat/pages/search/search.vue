<template>
	<view class="content">
		<view class="top_bar" v-show="addFlag">
			<view class="searchInput">
				<input type="text" placeholder="搜索用户/群组" placeholder-style="color:#b5b5b5;font-weight:300" v-model="searchMes"
				 @input="search" />
				<image src="../../static/images/index/search-grey.png" class="search"></image>
				<image src="../../static/images/index/delate.png" class="delate" @tap="clearInput"></image>
			</view>
			<view class="cancel" @tap="toBack">
				取消
			</view>
		</view>
		<view class="main" v-show="addFlag">
			<!-- 搜索结果1 -->
			<view class="search_box" v-if="this.searchList.length>0">
				<view class="search_title">
					用户
				</view>
				<view class="search_list">
					<view class="friend" v-for="(item,index) in searchList" :key="index" @tap="toUserHome(item)">
						<view class="friend_head">
							<image :src="item.imgUrl" mode=""></image>
						</view>
						<view class="friend_body">
							<view class="body_info">
								<view class="info_name">
									<view class="id" v-html="item.tagName"></view>
									<view class="email" v-html="item.email"></view>
								</view>
								<view class="info_btn" :class="{add:item.relationFlag==1?false:true}" v-if="item.relationFlag!=0" @tap.stop="item.relationFlag==2?addFrAnimate(0,item.name,item.imgUrl,item._id):toChat(item)">{{item.relationFlag==1?'发消息':'加好友'}}</view>
							</view>
						</view>
					</view>
				</view>
			</view>
			<!-- 搜索结果2 -->
			<!-- <view class="search_box">
				<view class="search_title">
					群组
				</view>
				<view class="search_list">
					<view class="friend">
						<view class="friend_head">
							<image src="../../static/images/img/07.jpg" mode=""></image>
						</view>
						<view class="friend_body">
							<view class="body_info">
								<view class="info_name">
									<view class="id">道人修仙群</view>
									<view class="email">2131234</view>
								</view>
								<view class="info_btn add">加入群</view>
							</view>
						</view>
					</view>
					<view class="friend">
						<view class="friend_head">
							<image src="../../static/images/img/08.jpg" mode=""></image>
						</view>
						<view class="friend_body">
							<view class="body_info">
								<view class="info_name">
									<view class="id">相亲相爱一家人</view>
									<view class="email">5287156</view>
								</view>
								<view class="info_btn">发消息</view>
							</view>
						</view>
					</view>

				</view>
			</view> -->
		</view>
		<!-- 添加好友动画弹框 -->
		<view class="add_friend" :animation="animationData1">
			<view class="add_img">
				<image :src="tipImg" mode=""></image>
			</view>
			<view class="info_name">{{tipName}}</view>
			<textarea maxlength="100" v-model='addStr' />
			<view class="add_btn">
				<button class="btn_close" @tap="addFrAnimate">取消</button>
				<button class="btn_send" @tap="addFriend">发送</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {
		request
	} from '../../request/index.js';
	import {
		debounce
	} from '../../commons/js/myFunc.js';
	export default {
		data() {
			return {
				uid: '',
				searchMes: '',
				token: '',
				myName: '',
				searchList: [],
				height:0,
				topHeight:0,
				width:0,
				animationData1:{},
				//设置文字隐藏
				addFlag:1,
				tipName:'',
				tipImg:'',
				addId:'',
				addStr:''
			};
		},
		onShow() {
			this.getStorage();
		},
		mounted(){
			this.height=uni.getSystemInfoSync().windowHeight;
			this.topHeight=uni.getSystemInfoSync().statusBarHeight
		},
		watch: {
			//当清空时清空列表
			searchMes() {
				if (this.searchMes.trim().length == 0) {
					this.searchList = []
				}
			},
		},
		methods: {
			addFrAnimate(val,name,img,id){
				this.addFlag=val;
				this.tipName=name;
				this.tipImg=img;
				this.addId=id;
				 var animation1 = uni.createAnimation({
				      duration: 300,
				        timingFunction: 'ease',
				    })
				let addHeight=this.height; //变动
					if(val==0){
						animation1.bottom(0).step();
					}else{
						animation1.bottom(-addHeight).step();
					}
				    
				    this.animationData1 = animation1.export();
			},
			toUserHome(v) {
				uni.navigateTo({
					url: '../userHome/userHome?id=' + v._id
				})
			},
			toChat(v) {
				uni.redirectTo({
					url: '../chatroom/chatroom?id=' + v._id
				})
			},
			clearInput() {
				this.searchMes = ''
			},
			//返回
			toBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			//获取缓存信息
			getStorage() {
				if (uni.getStorageSync('identity')) {
					let {
						id,
						token,
						name
					} = uni.getStorageSync('identity');
					this.uid = id;
					this.token = token;
					this.myName = name;
					this.addStr='你好我是'+this.myName+'~'
				} else {
					uni.reLaunch({
						url: '../login/login'
					})
				}

			},
			//搜索请求
			search: debounce(function() {
				if (this.searchMes.trim().length > 0) {
					request({
						url: '/search/user',
						data: {
							data: this.searchMes.trim(),
							token: this.token
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							this.searchList = res.data.result;
							let exp = eval('/' + this.searchMes.trim() + '/g')
							this.searchList.map(async v => {
								if(v._id==this.uid){
									v.relationFlag=0
								}else{
									//判断是否为好友并获取昵称(还需要res)
									let res = await request({
										        url: '/search/usercheck',
										        data: {
											        uid: this.uid,
											        fid: v._id,
										        },
										        method: 'POST',
									        })
									    let status = res.data.status;
									    if (status == 200) {
										//好友
										v.nickName = res.data.result.nickName;
										v.relationFlag = 1
									} else if (status == 300) {
										//token过期
										uni.reLaunch({
											url: '../login/login?name=' + this.myName
										})
									} else if (status == 400) {
										//非好友
										v.relationFlag = 2
									} else if (status == 500) {
										console.log('服务器出错')
									}
								}
								v.imgUrl = this.baseUrl + v.imgUrl;
								if(v.nickName){
									v.tagName =v.nickName+'('+ v.name.replace(exp, "<text style='color:#4AAAFF'>" + this.searchMes.trim() + "</text>")+')'
								}else{
									v.tagName = v.name.replace(exp, "<text style='color:#4AAAFF'>" + this.searchMes.trim() + "</text>")
								}
								
								v.email = v.email.replace(exp, "<text style='color:#4AAAFF'>" + this.searchMes.trim() + "</text>");
							})
						} else if (status == 300) {
							//token过期
							uni.reLaunch({
								url: '../login/login?name=' + this.myName
							})
						} else if (status == 500) {

						}
					})
				} else {
					this.searchList = [];
				}
			}, 500),
			/*
			获取关系 (异步原因放在上面函数里，详见开发问题9)
			 getRelation(v) {
				 	if (this.uid == v._id) {
				 		v.relationFlag = 0
				 	} else {
				 		request({
				 			url: '/search/usercheck',
				 			data: {
				 				uid: this.uid,
				 				fid: v._id,
				 			},
				 			method: 'POST',
				 		}).then(res => {
				 			let status = res.data.status;
				 			if (status == 200) {
				 				//好友
				 				v.nickName = res.data.result.nickName;
				 				v.relationFlag = 1
				 			} else if (status == 300) {
				 				//token过期
				 				uni.navigateTo({
				 					url: '../login/login?name=' + this.myName
				 				})
				 			} else if (status == 400) {
				 				//非好友
				 				v.relationFlag = 2
				 			} else if (status == 500) {
				 				console.log('服务器出错')
				 			}
				 		})
				 	}
			}
			*/
            //添加好友 发送键
			addFriend(){
				let defaultStr = '你好我是'+this.myName+'~';
				request({
					url: '/friend/addfriend',
					data: {
						uid:this.uid,
						fid:this.addId,
						token:this.token,
						msg:this.addStr.trim()?this.addStr:defaultStr
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						//收回弹框并并将addFlag置为1
						this.addFrAnimate(1);
						uni.showToast({
							title: '请求发送成功!',
							icon: 'success',
							duration: 1500,
						});
					}else if(status==300){
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
			}
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
		align-items: center;
		background: $uni-bg-color;
		// border-bottom: 1rpx solid $uni-border-color;
		padding-top: var(--status-bar-height);
		box-sizing: content-box;

		.searchInput {
			margin-left: 32rpx;
			position: relative;
			flex: 5;

			input {
				padding: 0 48rpx;
				background: #F3F4F6;
				border-radius: 28rpx;
				width: 100%;
				height: 60rpx;
			}

			image {
				position: absolute;
				top: 14rpx;
				width: 32rpx;
				height: 32rpx;

			}

			.search {
				left: 10rpx;

			}

			.delate {
				right: 10rpx;
			}
		}

		.cancel {
			flex: 1;
			display: flex;
			justify-content: center;
			align-items: center;
			font-size: $uni-font-size-base;
			color: $uni-text-color;
			font-weight: 500;
			box-sizing: border-box;
		}
	}

	.main {
		padding-top: 88rpx;
		width: 100%;

		.search_box {
			border-bottom: 15rpx solid $uni-border-color;

			.search_title {
				font-size: $uni-font-size-base;
				font-weight: 500;
				line-height: 60rpx;
				margin-left: 32rpx;
				color: $uni-text-color-grey;
				border-bottom: 1rpx solid $uni-border-color;

			}

			.search_list {

				.friend {
					width: 100%;
					height: 128rpx;
					display: flex;

					&:active {
						background-color: $uni-bg-color-grey;
					}

					&:last-child {
						.friend_body {
							border-bottom: 0rpx solid $uni-border-color;
						}
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
							// background-color: $uni-color-primary;
						}

					}

					.friend_body {
						flex: 1;
						height: 100%;
						border-bottom: 1rpx solid $uni-border-color;

						.body_info {
							display: flex;
							justify-content: space-between;
							align-items: center;
							padding-right: 32rpx;
							height: 100%;

							.info_name {
								display: flex;
								flex-direction: column;
								justify-content: center;
								color: rgba(39, 40, 50, 1);

								.id {
									font-size: 36rpx;
									font-family: PingFangSC-Regular;
									line-height: 40rpx;
								}

								.email {
									font-size: 24rpx;
									line-height: 30rpx;
								}
							}

							.info_btn {
								text-align: center;
								width: 120rpx;
								height: 48rpx;
								border-radius: 24rpx;
								line-height: 48rpx;
								font-size: $uni-font-size-sm;
								background: $uni-color-primary;
							}

							.add {
								background: rgba(74, 170, 255, 0.1);
								color: $uni-color-success;
							}
						}
					}
				}

			}
		}
	}
	
	.info_name {
		font-size: 52rpx;
		line-height: 74rpx;
		color: $uni-text-color;
	}
	
	.add_friend{
		display: flex;
		flex-direction: column;
		align-items: center;
		position: fixed;
		bottom: -100vh; //变动
		z-index: 1;
		width: 100%;
		height: 100vh; //变动
		background-color: rgba(255,255,255,1);
		border-radius: 40rpx 40rpx 0 0;
		padding: 168rpx 56rpx 0;
		//变动
		.add_img{
				width: 300rpx;
				height: 300rpx;
				border: 6rpx solid #fff;
				border-radius: $uni-border-radius-circle;
				overflow: hidden;
		        box-shadow: 0rpx 0rpx 40rpx 10rpx rgba(39,40,50,0.5);
				margin-bottom: 50rpx;
				image {
					width: 100%;
					height: 100%;
				}
			}
		textarea{
			margin-top: 40rpx;
			padding: 18rpx 22rpx;
			width: 100%;
			height: 420rpx;
			background-color: $uni-bg-color-grey;
			border-radius: $uni-border-radius-base;
			font-size: $uni-font-size-lg;
			color: $uni-text-color;
			line-height: 44rpx;
		}
		.add_btn{
			position: absolute;
			bottom:50rpx;
			width: 684rpx;
			height: 80rpx;
			display: flex;
			justify-content: space-between;
			button{
				height: 100%;
				border-radius: $uni-border-radius-sm;
				font-size: $uni-font-size-lg;
				color: $uni-text-color;
			}
			.btn_close{
				width: 172rpx;
				background: $uni-bg-color-hover
			}
			.btn_send{
				width: 480rpx;
				background: $uni-color-primary;
			}
		}
	}
</style>
