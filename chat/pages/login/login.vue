<template>
	<view class="content">
		<!-- 顶部 -->
		<view class="entry_bar">
			<view class="entry_bar_left" @tap="toBack">
				<image src="../../static/images/index/back.png" mode=""></image>
			</view>
			<view class="entry_bar_right" @tap="toRegister">
				注册
			</view>
		</view>
		<view class="main">
			<!-- 图标 -->
			<view class="logo">
				<image src="../../static/images/index/logo.png" mode=""></image>
			</view>
			<!-- 登录表单 -->
			<view class="login_form">
				<view class="login_title">登录</view>
				<view class="login_message">你好,欢迎使用卤蛋App!</view>
				<view class="login_input">
					<input type="text" placeholder="请输入用户名/邮箱" placeholder-style="color:#b5b5b5;font-weight:300" v-model="userName" @focus="hideTip">
					<input type="password" placeholder="请输入密码" placeholder-style="color:#b5b5b5;font-weight:300" v-model="userPwd" @focus="hideTip"/>
				</view>
				<view class="login_tip" v-show="tipFlag">用户名或密码错误!请重新输入。</view>
				<button type="default" @tap="login">登录</button>
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
				userName: '',       //用户名
				userPwd: '',         //密码
				tipFlag:false
			}
		},
		onLoad(e){
			if(e.userName){
				this.userName=e.userName;
				uni.showToast({
					title: '欢迎你！ '+e.userName,
					icon: 'none',
					duration: 2000
				});
			}else if(e.name){
				this.userName=e.name;
				uni.showToast({
					title: '请重新登陆',
					icon: 'none',
					duration: 2000
				});
			}
		},
		methods: {
			//返回
			toBack() {
				uni.navigateBack({
					delta: 1
				})
			},
			//跳转注册页
			toRegister() {
				uni.navigateTo({
					url: '../register/register'
				})
			},
			//隐藏tip
			hideTip(){
				this.tipFlag=false
			},
			//登录
			login() {
				if (this.userName && this.userPwd) {
					request({
						url: '/signin/check',
						data: {
							data:this.userName,
							pwd:this.userPwd
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							//登陆成功
							//本地存储用户信息
							let {id,name,imgUrl,token} = res.data.identity;
							uni.setStorageSync('identity',{id,name,imgUrl,token});
							//跳转到首页
							uni.showToast({
								title: '登录成功!',
								icon: 'success',
								mask:true,
								duration: 1500,
								success: () => {
									setTimeout(()=>{
										uni.reLaunch({
											url: '../index/index'
										})
									},2000)
								}
							});
						} else if(status==400){
							//用户名或密码匹配失败
							this.tipFlag=true;
							this.userPwd='';
						}else if (status == 500) {
							//服务器错误
							uni.showToast({
								title: '服务器出错啦!',
								icon: 'none',
								duration: 2000
							});
						}
					}).catch(err=>{
						console.log(err)
					})
				}
			},
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
	.entry_bar {
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
		padding-top: var(--status-bar-height);
		box-sizing: content-box;

		.entry_bar_left {
			padding-left: 32rpx;
			width: 120rpx;

			image {
				width: 50rpx;
				height: 50rpx;
			}
		}

		.entry_bar_right {
			margin-right: 58rpx;
			font-family: PingFangSC-Medium;
			font-size: 36rpx;
			font-weight: 500;
			color: $uni-text-color;
		}
	}
	
	.main {
		padding-top: 88rpx;
		width: 100%;
		.logo {
			width: 100%;
			height: 226rpx;
			display: flex;
			justify-content: center;
			align-items: center;
		
			image {
				width: 150rpx;
				height: 150rpx;
			}
		}
		
		.login_form {
			padding: 0 62rpx;
		
			.login_title {
				font-size: 56rpx;
				font-weight: 500;
				color: $uni-text-color;
				line-height: 80rpx;
			}
		
			.login_message {
				font-size: 40rpx;
				color: $uni-text-color-grey;
				line-height: 56rpx;
			}
		
			.login_input {
				margin-top: 8rpx;
		
				input {
					height: 88rpx;
					padding-top: 40rpx;
					font-size: $uni-font-size-lg;
					line-height: 88rpx;
					color: $uni-text-color;
					border-bottom: 1rpx solid $uni-border-color;
				}
			}
		
			.login_tip {
				float: left;
				font-size: $uni-font-size-sm;
				line-height: 50rpx;
				color: $uni-color-warning;
				font-weight: 500;
			}
		
			button {
				margin-top: 120rpx;
				width: 520rpx;
				height: 96rpx;
				background: $uni-color-primary;
				border-radius: 48rpx;
				font-size: $uni-font-size-lg;
				color: $uni-text-color;
				font-weight: 500;
				line-height: 96rpx;
			}
		}
	}

	
</style>
