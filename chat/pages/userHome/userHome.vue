<template>
	<view class="content">
		<view class="top_bar">
			<view class="top_bar_left" @tap="returnData">
				<image src="../../static/images/index/back.png" mode=""></image>
			</view>
			<view class="top_bar_right" @tap="relationFlag==0?toInfo():toUserSetting()">
				<image src="../../static/images/index/more.png" mode=""></image>
			</view>
		</view>
		<view class="user_bg" @tap="addFrAnimate">
			<image :src="info.imgUrl" mode="aspectFill"></image>
		</view>
		<view class="main">
			<view class="msg_img" :animation="animationData2">
				<image :src="info.imgUrl" mode="" class="head"></image>
				<view class="sex" :class="info.sex">
					<image :src="'../../static/images/index/'+info.sex+'.png'" mode=""></image>
				</view>
			</view>
			<view class="msg_info" v-if="addFlag">
				<view class="info_name">{{nickName?nickName:info.name}}</view>
				<!-- <view class="info_tip">用户名:{{info.name}}</view> -->
				<view class="info_tip">邮箱:{{info.email}}</view>
				<view class="info_word">{{info.introduce}}</view>
			</view>
			<button type="default" hover-class="color:#000" @tap="addFrAnimate(0)" v-if="relationFlag==2">加为好友</button>
			<button type="default" hover-class="color:#000" v-if="relationFlag==1" @tap="toChat">发消息</button>
		</view>
		<view class="add_friend" :animation="animationData1">
			<view class="info_name">{{nickName?nickName:info.name}}</view>
			<textarea v-model="addStr" maxlength="100" />
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
	} from '../../request/index.js'
	export default {
		data() {
			return { 
				id:'',        //用户id(好友，非好友，自己)
				uid:'',       //自己id
				myName:'',     //自己名
				token:'',
				info:{},       //请求的信息
				nickName:'',   //昵称
				relationFlag:0,   //关系标识（0：自己 1：好友 2：陌生人）
				height:0,
				topHeight:0,
				// width:0,
				animationData1:{},
				animationData2:{},
				//设置文字隐藏
				addFlag:1,
				addStr:''
			};
		},
		onLoad(e){
			this.id=e.id;
		},
		onShow(){
			uni.$on("getData", res => {
			    this.info.imgUrl = res.imgUrl
			        // 清除监听
			    uni.$off('getData');
			})
			this.getStorage();
			this.getUserInfo();
			this.getRelation();
		},
		mounted(){
			this.height=uni.getSystemInfoSync().windowHeight;
			this.topHeight=uni.getSystemInfoSync().statusBarHeight
		},
		
		methods: {
			//返回上一页时刷新数据
			returnData(){
			    uni.$emit("getData",{imgUrl: this.info.imgUrl});
			    uni.navigateBack({
			    	delta: 1
			    })
			},
			toChat() {
				uni.navigateTo({
					url: '../chatroom/chatroom?id=' + this.id
				})
			},
			toUserSetting() {
				let nickName = '';
				if(this.nickName){
					nickName=this.nickName
				}else{
					nickName=this.info.name
				}
				uni.navigateTo({
					url: '../userSetting/userSetting?relation='+this.relationFlag+'&id='+this.id+'&nickName='+nickName
				})
			},
			toInfo() {
				uni.navigateTo({
					url: '../info/info?id='+this.id
				})
			},
			addFrAnimate(val){
				this.addFlag=val;
				 var animation1 = uni.createAnimation({
				      duration: 300,
				        timingFunction: 'ease',
				    })
				var animation2 = uni.createAnimation({
				     duration: 300,
				       timingFunction: 'ease',
				   })
				let addHeight=this.height*0.75;
				//调整头像的位置 适配
				let headHeight=this.height*0.25-120-74+60-this.topHeight
					if(val==0){
						animation1.bottom(0).step();
						animation2.width(120).height(120).top(headHeight).step()
					}else{
						animation1.bottom(-addHeight).step();
						animation2.width(200).height(200).top(0).step()
					}
				    
				    this.animationData1 = animation1.export();
					this.animationData2 = animation2.export()
			},
			//获取缓存信息
			getStorage() {
				if(uni.getStorageSync('identity')){
					let {
						id,
						token,
						name
					} = uni.getStorageSync('identity');
					this.uid = id;
					this.token = token;
					this.myName = name;
					this.addStr='你好我是'+this.myName+'~'
				}else{
					uni.reLaunch({
						url:'../login/login'
					})
				}
				
			},
			//获取用户详情(先获取好友昵称)
			getUserInfo(){
				request({
					url: '/user/detail',
					data: {
						id:this.id,
						token:this.token
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						this.info = res.data.result;
						this.info.imgUrl=this.baseUrl+this.info.imgUrl;
						if(!this.info.introduce){
							this.info.introduce = '这个人很懒，什么都没有留下~'
						}
					}else if(status==300){
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {
						
					}
				})
			},
			//获取关系
			getRelation(){
				if(this.uid==this.id){
					this.relationFlag= 0
				}else{
					request({
						url: '/search/usercheck',
						data: {
							uid:this.uid,
							fid:this.id,
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							//好友
							this.nickName = res.data.result.nickName;
							this.relationFlag= 1
						} else if(status==300){
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					}else if(status==400){
						//非好友
						this.relationFlag= 2
						}else if (status == 500) {
							console.log('服务器出错')
						}
					})
				}
			},
			//添加好友 发送键
			addFriend(){
				let defaultStr = '你好我是'+this.myName+'~';
				request({
					url: '/friend/addfriend',
					data: {
						uid:this.uid,
						fid:this.id,
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
		justify-content: space-between;
		align-items: center;
		// background: $uni-bg-color;
		padding-top: var(--status-bar-height);
		box-sizing: content-box;


		.top_bar_left {
			padding-left: 32rpx;
			width: 120rpx;
		}

		.top_bar_right {
			margin-right: 58rpx;
		}

		image {
			width: 50rpx;
			height: 50rpx;
		}
	}

	.user_bg {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;

		image {
			//去掉边缘露白
			position: absolute;
			top: -10rpx;
			left: -10rpx;
			width: 110%;
			height: 110%;
			filter: blur(30rpx);
			opacity: 0.5;
			z-index: -1;
		}
	}

	.main {
		padding-top: 88rpx;
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		

		.msg_img {
			margin-top: 60rpx;
			top: 0;
			width: 400rpx;
			height: 400rpx;
			border: 6rpx solid #fff;
			border-radius: 48rpx;
			overflow: hidden;
			position: relative;
z-index: 2;
box-shadow: 0rpx 36rpx 40rpx 0rpx rgba(39,40,50,0.5);
			.head {
				width: 100%;
				height: 100%;
				
			}

			.sex {
				position: absolute;
				right: 12rpx;
				bottom: 12rpx;
				width: 64rpx;
				height: 64rpx;
				border-radius: $uni-border-radius-circle;
				display: flex;
				justify-content: center;
				align-items: center;

				image {
					width: 32rpx;
					height: 32rpx;
				}
			}
			.female{
				background: rgba(255, 93, 91, 1);
			}
			
			.male{
				background: rgba(87,153,255,1);
			}
			
			.secret{
				background: rgba(39,40,50,1);
			}

		}

		.msg_info {
			display: flex;
			flex-direction: column;
			align-items: center;
			margin-top: 48rpx;
			color: $uni-text-color;
    z-index: 0;
			.info_tip {
				font-size: $uni-font-size-base;
				line-height: 40rpx;
			}

			.info_word {
				width: 552rpx;
				// text-indent: 57rpx;
				margin-top: 20rpx;
				line-height: 48rpx;
				font-size: $uni-font-size-base;
				display: -webkit-box;
				-webkit-box-orient: vertical;
				-webkit-line-clamp: 4;
				overflow: hidden;
			}
		}

		button {
			position: fixed;
			bottom: 50rpx;
			width: 684rpx;
			height: 80rpx;
			background: $uni-color-primary;
			border-radius: $uni-border-radius-sm;
			font-size: $uni-font-size-lg;
			color: $uni-text-color;
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
		bottom: -75vh;
		z-index: 1;
		width: 100%;
		height: 75vh;
		background-color: rgba(255,255,255,1);
		border-radius: 40rpx 40rpx 0 0;
		padding: 168rpx 56rpx 0;
		.info_name{
			align-self: flex-start;
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
