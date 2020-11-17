<template>
	<view class="content">
		<view class="top_bar" v-show="addFlag">
			<view class="top_bar_left" @tap="toBack">
				<image src="../../static/images/index/back.png" mode=""></image>
			</view>
			<view class="top_bar_center">
				资料设置
			</view>
			<view class="top_bar_right">
			</view>
		</view>
		<view class="main" v-show="addFlag">
			<view class="info_base">
				<view class="part_list" v-if="relationFlag==1?true:false">
					<view class="part" @tap="addFrAnimate(0,'nickName',nickName)">
						<view class="part_left">设置备注</view>
						<view class="part_center">
							<view class="mssg">{{nickName}}</view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part">
						<view class="part_left">朋友权限</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
				</view>
				<view class="part_list" v-if="relationFlag==1?true:false">
					<view class="part">
						<view class="part_left">推荐给朋友</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part">
						<view class="part_left">添加到桌面</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
				</view>
				<view class="part_list">
					<view class="part">
						<view class="part_left">加入黑名单</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part">
						<view class="part_left">投诉</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
				</view>
				<button type="default" v-if="relationFlag==1?true:false" @tap="delateFriend">删除</button>
			</view>
		</view>
		<!-- 修改信息动画弹框 -->
		<view class="add_friend" :animation="animationData1">
			<view class="info_name">{{tipName}}</view>
			<textarea maxlength="100" v-model='modifyStr'/>
			<view class="add_btn">
				<button class="btn_close" @tap="addFrAnimate">取消</button>
				<button class="btn_send" @tap="modify">修改</button>
			</view>
		</view>
	</view>
</template>

<script>
	import {request} from '../../request/index.js';
	export default {
		data() {
			return {
				id:'',
				relationFlag:0,
				uid:'',
				myName:'',
				token:'',
				nickName:'',
				
				height:0,
				topHeight:0,
				width:0,
				animationData1:{},
				//设置文字隐藏
				addFlag:1,
				tipName:'',
				modifyType:'', //点击的类型
				modifyStr:''   //输入字符串

			}
		},
		onLoad(e){
			if(e){
				this.relationFlag=e.relation
				this.nickName=e.nickName
				this.id=e.id
			}
			
		},
		onShow(){
			this.getStorage();
		},
		mounted(){
			this.height=uni.getSystemInfoSync().windowHeight;
			this.topHeight=uni.getSystemInfoSync().statusBarHeight
		},
		methods: {
			toBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			addFrAnimate(val,name,str){
				this.addFlag=val;
				this.modifyType=name;
				if(name == 'nickName'){
					this.tipName='好友昵称';
				}
				this.modifyStr=str;
				 var animation1 = uni.createAnimation({
				      duration: 300,
				        timingFunction: 'ease',
				    })
				let addHeight=this.height; //变动
					if(val==0){
						animation1.top(0).step();
					}else{
						animation1.top(-addHeight).step();
					}
				    
				    this.animationData1 = animation1.export();
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
				}else{
					uni.reLaunch({
						url:'../login/login'
					})
				}
				
			},
			modify(){
				if(this.nickName!=this.modifyStr){
					this.nickName=this.modifyStr;
					request({
						url: '/friend/upnickname',
						data: {
							uid:this.uid,
							fid:this.id,
							token:this.token,
							name:this.modifyStr
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							uni.showToast({
								title: '修改成功!',
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
				//收回弹框并并将addFlag置为1
				this.addFrAnimate(1);
			},
			delateFriend(){
				uni.showModal({
				    title: '删除好友',
				    content: '好友"'+this.nickName+'"将被删除！',
					cancelText:'不删了',
					confirmText:'狠心删除',
					confirmColor:'#ff1842',
				    success: res=> {
				        if (res.confirm) {
				            request({
				            	url: '/friend/delatefriend',
				            	data: {
				            		uid:this.uid,
				            		fid:this.id,
				            		token:this.token,
				            	},
				            	method: 'POST',
				            }).then(res => {
				            	let status = res.data.status;
				            	if (status == 200) {
				            		uni.showToast({
				            			title: '好友删除成功',
				            			icon: 'success',
				            			duration: 500,
				            			success: () => {
				            				setTimeout(()=>{
				            					uni.reLaunch({
				            						url: '../index/index'
				            					})
				            				},800)
				            			}
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
				});
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
		border-bottom: 1rpx solid $uni-border-color;
		padding-top: var(--status-bar-height);
		box-sizing: content-box;


		.top_bar_left {
			padding-left: 32rpx;
			width: 120rpx;
		}

		.top_bar_right {
			margin-right: 58rpx;
			width: 62rpx;
		}

		image {
			z-index: 1;
			width: 50rpx;
			height: 50rpx;
		}
	}

	.main {
		padding-top: 88rpx;
		width: 100%;

		.part_list {
			padding-left: 32rpx;
			width: 100%;
			border-bottom: 15rpx solid $uni-border-color;

			.part {
				display: flex;
				width: 100%;
				height: 112rpx;
				border-bottom: 1rpx solid $uni-border-color;
				

				&:last-child {
					border-bottom: none;
				}

				.part_left {
					flex: 2;
					display: flex;
					justify-content: flex-start;
					align-items: center;
				}

				.part_center {
					flex: 5;
					display: flex;
					justify-content: flex-end;
					align-items: center;

					.mssg {
						font-size: $uni-font-size-lg;
						color: $uni-text-color-grey;
						line-height: 44rpx;
						display: -webkit-box;
						-webkit-box-orient: vertical;
						-webkit-line-clamp: 1;
						overflow: hidden;
					}

					image {
						width: 104rpx;
						height: 104rpx;
						border-radius: $uni-border-radius-base;

					}
				}

				.part_right {
					flex: 1;
					display: flex;
					justify-content: center;
					align-items: center;

					image {
						width: 28rpx;
						height: 28rpx;
					}
				}
			}

			.head {
				box-sizing: content-box;
				height: 148rpx;
			}

		}

		button {
			position: fixed;
			bottom: 50rpx;
			left: 50%;
			transform: translateX(-50%);
			width: 684rpx;
			height: 80rpx;
			border-radius: $uni-border-radius-sm;
			font-size: $uni-font-size-lg;
			color: $uni-color-warning;
			font-weight: 500;
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
		top: -100vh; //变动
		z-index: 1;
		width: 100%;
		height: 100vh; //变动
		background-color: rgba(255,255,255,1);
		border-radius: 40rpx 40rpx 0 0;
		padding: 168rpx 56rpx 0;
		
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
