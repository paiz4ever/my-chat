<template>
	<view class="content">
		<!-- 顶部 -->
		<view class="registration_bar">
			<view class="registration_bar_left">
			</view>
			<view class="registration_bar_right" @tap="toLogin">
				登录
			</view>
		</view>
		<view class="main">
			<!-- 图标 -->
			<view class="logo">
				<image src="../../static/images/index/logo.png" mode=""></image>
			</view>
			<!-- 注册表单 -->
			<view class="logon_form">
				<view class="logon_title">注册</view>
				<view class="logon_input">
					<view class="input_box">
						<input type="text" placeholder="请输入用户名" placeholder-style="color:#b5b5b5;font-weight:300" v-model="nameInput"
						 @input="nameCheck" />
						<view class="warn" v-if="nameFlag==1">用户名已存在</view>
						<view class="warn" v-if="nameFlag==2">无效用户名</view>
						<image src="../../static/images/index/right.png" v-if="nameFlag==3"></image>
					</view>
					<view class="input_box">
						<input type="text" placeholder="请输入邮箱地址" placeholder-style="color:#b5b5b5;font-weight:300" v-model="emailInput"
						 @input="emailCheck" />
						<view class="warn" v-if="emailFlag==1">邮箱已存在</view>
						<view class="warn" v-if="emailFlag==2">无效的邮箱</view>
						<image src="../../static/images/index/right.png" v-if="emailFlag==3"></image>
					</view>
					<view class="input_box">
						<input type="text" :password="isPwd" placeholder="请输入密码" placeholder-style="color:#b5b5b5;font-weight:300"
						 v-model="pwdInput" @input="pwdCheck" />
						<image :src="pwdSrc" class="pwd_icon" @touchstart.prevent="iconChange"></image>
					</view>
				</view>
				<button type="default" :disabled="btnFlag" @tap="logon" :class="{legal:btnFlag}">注册</button>
			</view>
		</view>
	</view>

</template>

<script>
	import {
		request
	} from '../../request/index.js'
	import {
		debounce
	} from '../../commons/js/myFunc.js';
	export default {
		data() {
			return {
				nameInput: '', //用户名输入
				nameFlag: 0, //用户名标识
				emailInput: '', //邮箱名输入
				emailFlag: 0, //邮箱名标识
				pwdInput: '', //密码输入
				pwdFlag: 0, //密码标识
				isPwd: true, //密码框type
				pwdSrc: '../../static/images/index/pwd1.png', //睁眼闭眼图标
				btnFlag: true //注册按钮标识
			}
		},
		methods: {
			//转至登录页
			toLogin() {
				uni.reLaunch({
					url: '../login/login'
				})
			},
			// 密码图标切换
			iconChange() {
				this.pwdSrc = this.pwdSrc.indexOf('pwd1') != -1 ? this.pwdSrc.replace('1', '2') : this.pwdSrc.replace('2', '1');
				this.isPwd = this.pwdSrc.indexOf('pwd1') != -1 ? true : false;
			},
			//用户名合法性
			nameCheck:debounce(function() {
				if (this.nameInput.trim().length > 1) {
					request({
						url: '/signup/judge',
						data: {
							data: this.nameInput,
							type: 'name',
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							let exist = res.data.result;
							if (exist == 0) {
								this.nameFlag = 3
							} else {
								this.nameFlag = 1
							}
						} else if (status == 500) {
							uni.showToast({
								title: '服务器出错啦',
								icon: 'none',
								duration: 2000
							});
						}
					})
				} else if (this.nameInput.length == 0) {
					this.nameFlag = 0
				} else {
					this.nameFlag = 2
				}
			},500),
			//邮箱合法性
			emailCheck:debounce(function() {
				let reg = /^([a-zA-Z]|[0-9])(\w|\-)+@[a-zA-Z0-9]+\.([a-zA-Z]{2,4})$/;
				if (reg.test(this.emailInput)) {
					request({
						url: '/signup/judge',
						data: {
							data: this.emailInput,
							type: 'email',
						},
						method: 'POST',
					}).then(res => {
						let status = res.data.status;
						if (status == 200) {
							let exist = res.data.result;
							if (exist == 0) {
								this.emailFlag = 3
							} else {
								this.emailFlag = 1
							}
						} else if (status == 500) {
							uni.showToast({
								title: '服务器出错啦!',
								icon: 'none',
								duration: 2000
							});
						}
					})
				} else if (this.emailInput.length > 0) {
					this.emailFlag = 2
				} else {
					this.emailFlag = 0
				}

			},1000),
			//密码合法性
			pwdCheck() {
				if (this.pwdInput.length >= 6) {
					this.pwdFlag = 1
				} else {
					this.pwdFlag = 0
				}
			},
			//注册
			logon() {
				request({
					url: '/signup/add',
					data: {
						name: this.nameInput,
						email: this.emailInput,
						pwd: this.pwdInput
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						uni.showToast({
							title: '注册成功!',
							icon: 'success',
							duration: 1500,
							success: () => {
								setTimeout(()=>{
									uni.reLaunch({
										url: '../login/login?userName=' + this.nameInput
									})
								},2000)
							}
						});
					} else if (status == 500) {
						uni.showToast({
							title: '注册失败!',
							icon: 'none',
							duration: 2000
						});
					}
				})
			}
		},
		computed: {
			// 标识
			allFlag() {
				const {
					nameFlag,
					pwdFlag,
					emailFlag
				} = this
				return {
					nameFlag,
					pwdFlag,
					emailFlag
				}
			}
		},
		watch: {
			//监听标识 控制按钮
			allFlag(v) {
				if (v.nameFlag == 3 && v.emailFlag == 3 && v.pwdFlag == 1) {
					this.btnFlag = false
				} else {
					this.btnFlag = true
				}
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

	.registration_bar {
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


		.registration_bar_left {
			padding-left: 32rpx;
			width: 120rpx;

			image {
				width: 50rpx;
				height: 50rpx;
			}
		}

		.registration_bar_right {
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

		.logon_form {
			padding: 0 62rpx;

			.logon_title {
				font-size: 56rpx;
				font-weight: 500;
				color: $uni-text-color;
				line-height: 80rpx;
			}

			.logon_input {
				margin-top: 8rpx;

				.input_box {
					position: relative;

					.warn {
						position: absolute;
						top: 44rpx;
						right: 0;
						font-size: $uni-font-size-sm;
						font-weight: 500;
						color: $uni-color-warning;
					}

					input {
						height: 88rpx;
						padding-top: 40rpx;
						font-size: $uni-font-size-lg;
						line-height: 88rpx;
						color: $uni-text-color;
						border-bottom: 1rpx solid $uni-border-color;
					}

					image {
						position: absolute;
						top: 44rpx;
						right: 0;
						width: 42rpx;
						height: 42rpx;
					}
				}
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

			.legal {
				background: rgba(39, 40, 50, 0.2);
				color: $uni-text-color-inverse
			}
		}
	}
</style>
