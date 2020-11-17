<template>
	<view class="content">
		<view class="top_bar">
			<view class="top_bar_left" @tap="toBack">
				<image src="../../static/images/index/back.png" mode=""></image>
			</view>
			<view class="top_bar_center">
				好友请求
			</view>
			<view class="top_bar_right">
			</view>
		</view>
		<view class="main">
			<view class="request_list">
				<view class="requester" v-for="(item,index) in reqList" :key="index">
					<view class="req_top">
						<view class="btn reject" @tap="refuse(item,index)">
							拒绝
						</view>
						<view class="head">
							<image :src="item.imgUrl" mode=""></image>
						</view>
						<view class="btn agree" @tap="agree(item,index)">
							同意
						</view>
					</view>
					<view class="req_center">
						<view class="title">{{item.name}}</view>
						<view class="date">{{item.lastTime| formatIndexTime}}</view>
					</view>
					<view class="req_bottom">
						<text>留言：</text>
						<text>{{item.message}}</text>
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
				reqList: [],

			};
		},
		onShow() {
			this.getStorage();
			//获取好友列表
			this.getReqList()
		},
		methods: {
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
						this.reqList = res.data.result;
						this.reqList.map(async v => {
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
									v.message = res.data.result.message
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
						console.log(this.reqList)
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
			/* 不能用？
			test(v){
				request({
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
						v.message = res.data.result.message
					} else if (status == 300) {
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if (status == 500) {
				
					}
				})
			},
			*/
			refuse(v,i){
				uni.showModal({
				    title: '拒绝',
				    content: '直接拒绝"'+v.name+'"的好友请求',
					cancelText:'再想想',
					confirmText:'狠心拒绝',
					confirmColor:'#ff1842',
				    success: res=> {
				        if (res.confirm) {
				            request({
				            	url: '/friend/delatefriend',
				            	data: {
				            		uid:this.uid,
				            		fid:v.id,
				            		token:this.token,
				            	},
				            	method: 'POST',
				            }).then(res => {
				            	let status = res.data.status;
				            	if (status == 200) {
									//列表去掉该用户
				            		this.reqList.splice(i,1)
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
			},
			agree(v,i){
				request({
					url: '/friend/updatestate',
					data: {
						uid:this.uid,
						fid:v.id,
						token:this.token,
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						this.reqList.splice(i,1)
					}else if(status==300){
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
		padding: 88rpx 32rpx 0;
		width: 100%;

		.requester {
			box-shadow: 0rpx 24rpx 64rpx -8rpx rgba(0, 0, 0, 0.3);
			border-radius: $uni-border-radius-base;
			margin-top: 100rpx;
			padding: 20rpx 32rpx;

			.req_top {
				position: relative;
				display: flex;
				justify-content: space-between;

				.btn {
					width: 160rpx;
					height: 64rpx;
					border-radius: 32rpx;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				.reject {
					background: rgba(255, 93, 91, 0.1);
					color: $uni-color-warning;
				}

				.agree {
					color: $uni-text-color;
					background: $uni-color-primary;
				}

				.head {
					position: absolute;
					left: 50%;
					top: -72rpx;
					transform: translateX(-50%);

					image {
						width: 144rpx;
						height: 144rpx;
						border-radius: $uni-border-radius-circle;
					}
				}

			}

			.req_center {
				text-align: center;
				padding-top: 40rpx;

				.title {
					font-size: 36rpx;
					font-weight: 500;
					line-height: 50rpx;
				}

				.date {
					font-size: $uni-font-size-sm;
					color: $uni-text-color-disable;
					line-height: 34rpx;
				}
			}

			.req_bottom {
				margin-top: 20rpx;
				padding: 20rpx 32rpx;
				border-radius: $uni-border-radius-base;
				font-size: $uni-font-size-base;
				color: $uni-text-color;
				line-height: 40rpx;
				background: $uni-bg-color-grey;
			}
		}
	}
</style>
