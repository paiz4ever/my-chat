<template>
	<view class="tool">
		<view class="chat_bar">
			<view class="bar_btn" @tap="voiceOn">
				<image src="../../static/images/chatTool/voice.png" v-show="voiceShow" @tap="voiceTap"></image>
				<image src="../../static/images/chatTool/keyboard.png" v-show="!voiceShow" @tap="keyboardTap"></image>
			</view>
			<!-- <textarea auto-height fixed cursor-spacing="20" v-show="voiceShow" v-model="inputMsg" @input="submit"/> -->
			<!-- 真机测试中  confirm-type只有search有效 -->
			<input type="text" cursor-spacing="20" v-show="voiceShow" v-model="inputMsg" @confirm="submit" confirm-type="send"
			 :focus="isFocus" />
			<view class="btn_record" v-show="!voiceShow" @touchstart="recordStart" @touchend="recordEnd" @touchmove="cancel">
				按住说话
			</view>
			<view class="bar_btn" @tap="emojiOn">
				<image src="../../static/images/chatTool/look.png" mode=""></image>
			</view>
			<view class="bar_btn" @tap="addOn">
				<image src="../../static/images/index/add.png" mode=""></image>
			</view>
		</view>
		<view class="emoji" v-show="emojiShow">
			<emoji-list @getEmoji="getEmoji"></emoji-list>
			<view class="emoji_btn">
				<view class="delate_btn" @tap="delate">
					<image src="../../static/images/chatTool/emojiDelate.png" mode=""></image>
				</view>
				<view class="send_btn" @tap="submit">发送</view>
			</view>
		</view>
		<view class="add" v-show="addShow">
			<view class="add_list">
				<view class="add_item" @tap="submitImg('album')">
					<view class="add_img">
						<image src="../../static/images/chatTool/album.png" mode=""></image>
					</view>
					<view class="title">相册</view>
				</view>
				<view class="add_item" @tap="submitImg('camera')">
					<view class="add_img">
						<image src="../../static/images/chatTool/shot.png" mode=""></image>
					</view>
					<view class="title">拍摄</view>
				</view>
				<view class="add_item" @tap="getLocation">
					<view class="add_img">
						<image src="../../static/images/chatTool/location.png" mode=""></image>
					</view>
					<view class="title">位置</view>
				</view>
				<view class="add_item">
					<view class="add_img">
						<image src="../../static/images/chatTool/file.png" mode=""></image>
					</view>
					<view class="title">文件</view>
				</view>
				<view class="add_item">
					<view class="add_img">
						<image src="../../static/images/chatTool/card.png" mode=""></image>
					</view>
					<view class="title">名片</view>
				</view>
			</view>
		</view>
		<view class="voice_mask" v-show="maskShow">
			<view class="record_length_bg">
				<view class="record_length" :style="{width:time/60*480+120+'rpx'}">
					{{time}}"
				</view>
			</view>
			<view class="record_cancel" :class="{cancel_on:cancel_flag}">
				<image src="../../static/images/chatTool/cancel.png" mode=""></image>
			</view>
			<view class="cancel_tip">滑至此处取消录音</view>
		</view>
	</view>
</template>

<script>
	import emojiList from './emojiList/emojiList.vue'
	import {
		formatFileTime
	} from '../../commons/js/myFunc.js'
	//录音管理
	const recorderManager = uni.getRecorderManager();
	export default {
		data() {
			return {
				voiceShow: true,
				emojiShow: false,
				addShow: false,
				maskShow:false,
				inputMsg: '',
				isFocus: false,
				//录音计时器
				voiceTimer: null,
				//录音事件
				time: 0,
				//取消录音标识符
				cancel_flag:false
			};
		},
		components: {
			emojiList
		},
		watch: {
			addShow() {
				this.$nextTick(function() {
					this.getToolHeight()
				});
			},
			voiceShow() {
				this.$nextTick(function() {
					this.getToolHeight()
				});
			},
			emojiShow() {
				this.$nextTick(function() {
					this.getToolHeight()
				});
			}
		},
		methods: {
			voiceOn() {
				this.voiceShow = !this.voiceShow
				this.emojiShow = false;
				this.addShow = false;

			},
			emojiOn() {
				this.emojiShow = !this.emojiShow;
				this.addShow = false;
				this.voiceShow = true
				/* 自动聚焦阻止键盘弹起 方案无效
				if(this.emojiShow==true){
					// this.isKeyboard=true
					uni.hideKeyboard()
					this.isFocus=true
					uni.hideKeyboard()
				}else{
					// this.isKeyboard=false
					this.isFocus=false
				}
				*/
			},
			addOn() {
				this.addShow = !this.addShow;
				this.emojiShow = false;
				this.voiceShow = true
			},
			// submit(e){
			// 	let checkCenter=e.detail.value.indexOf('\n')
			// 	if(this.inputMsg.length>0&&checkCenter!=-1){
			// 		this.$emit('newMsg',this.inputMsg)
			// 		this.inputMsg=''
			// 		}
			// },
			//发送文字
			submit() {
				if (this.inputMsg.length > 0) {
					this.$emit('newMsg', {
						message: this.inputMsg,
						type: 0
					})
					this.inputMsg = ''
				}
			},
			//表情页删除按钮
			delate() {
				if (this.inputMsg.length > 0) {
					this.inputMsg = this.inputMsg.substring(0, this.inputMsg.length - 2) //表情代码占两个字符
				}
			},
			//获取chatTool高度
			getToolHeight() {
				const query = uni.createSelectorQuery().in(this);
				query.select('.tool').boundingClientRect(data => {
					this.$emit('getHeight', data.height)
				}).exec();
			},
			//获取点击的表情
			getEmoji(e) {
				this.inputMsg += e;
			},
			//图片及拍照功能
			submitImg(method) {
				let sourceType = method;
				uni.chooseImage({
					count: 9, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: [sourceType], 
					success: (res) => {
						let url = formatFileTime(new Date());
						let tempFilePaths = res.tempFilePaths;
						tempFilePaths.forEach((v,i)=>{
							//上传
							uni.uploadFile({
							    url: this.baseUrl+'/files/upload', 
							    filePath: v,
							    name: 'file',
							    formData: {
							        url,
									//让文件名唯一
									name:Date.now()+i
							    },
							    success: (uploadFileRes) => {
									let path =this.baseUrl+ uploadFileRes.data
									this.$emit('newMsg', {
										message: path,
										type: 1
									})
							    }
							});
						})

					}
				});
			},
			//实现语音和输入切换时input聚焦
			keyboardTap() {
				this.isFocus = true;
			},
			voiceTap() {
				this.isFocus = false;
			},
			//音频处理
			//开始录音
			recordStart() {
				let i = 1;
				this.voiceTimer = setInterval(() => {
					this.maskShow=true;
					this.time = i;
					i++
					//最大60s
					if (i > 60) {
						clearInterval(this.voiceTimer)
					}
				}, 1000);
				recorderManager.start();
			},
			// 结束录音
			recordEnd() {
				clearInterval(this.voiceTimer);
				this.maskShow=false;
				recorderManager.stop();

				recorderManager.onStop((res) => {
					let url = formatFileTime(new Date());
					if (this.time < 1||this.cancel_flag) {
						//恢复标志位
						this.cancel_flag=false
						return false
					}
					//上传
					uni.uploadFile({
					    url: this.baseUrl+'/files/upload', 
					    filePath: res.tempFilePath,
					    name: 'file',
					    formData: {
					        url,
							//让文件名唯一
							name:Date.now()
					    },
					    success: (uploadFileRes) => {
							let path =this.baseUrl+ uploadFileRes.data
							this.$emit('newMsg', {
								message: {
									voicePath: path,
									time: this.time
								},
								type: 2
							});
							//重新置为0，解决快速点击重复上一次的时间
							this.time = 0
					    }
					});
					
					
				});
			},
			//取消录音
			cancel(e){
				//通过移动距离判断
				if(e.changedTouches[0].pageY>=717&&e.changedTouches[0].pageY<=764){
					this.cancel_flag=true
				}else{
					this.cancel_flag=false
				}
			},
			//选择位置
			getLocation(){
				uni.chooseLocation({
				    success: res=>{
						const {name,address,latitude,longitude}=res
				       this.$emit('newMsg', {
				       	message: {
				       		name,address,latitude,longitude
				       	},
				       	type: 3
				       });
				    }
				});
			}
		}
	}
</script>

<style lang="scss">
	.tool {
		width: 100%;
		background: #F4F4F4;
		position: fixed;
		bottom: 0;
		border-top: 1rpx solid $uni-border-color;
		z-index: 99;

		.chat_bar {
			position: relative;
			width: 100%;
			display: flex;
			align-items: flex-end;
			padding: 14rpx 22rpx 20rpx 22rpx;
			z-index: 101;
			background: #F4F4F4;

			// textarea{
			// 	flex: 1;
			// 	box-sizing: content-box;
			// 	background: #FFFFFF;
			// 	border-radius: 10rpx;
			// 	padding: 14rpx;
			// 	margin: 0 20rpx;
			// 	max-height:160rpx ;
			// }
			input {
				flex: 1;
				box-sizing: content-box;
				background: #FFFFFF;
				border-radius: 10rpx;
				padding: 14rpx;
				margin: 0 20rpx;
				height: 100%;

			}

			.btn_record {
				flex: 1;
				display: flex;
				justify-content: center;
				align-items: center;
				background: #FFFFFF;
				border-radius: 10rpx;
				margin: 0 20rpx;
				padding: 14rpx;
			}

			.bar_btn {
				flex: 0;
				width: 56rpx;
				height: 72rpx;
				display: flex;
				justify-content: center;
				align-items: center;
				margin: 0 10rpx;

				image {
					width: 56rpx;
					height: 56rpx;

				}
			}

		}

		.emoji {
			width: 100%;
			height: 460rpx;
			background-color: rgba(236, 237, 238, 1);

			.emoji_btn {
				width: 220rpx;
				height: 100rpx;
				position: fixed;
				bottom: 0;
				right: 0;
				display: flex;
				justify-content: space-between;
				align-items: center;
				margin-right: 30rpx;

				.delate_btn {
					width: 100rpx;
					height: 70rpx;
					display: flex;
					justify-content: center;
					align-items: center;
					background-color: #FFFFFF;
					border-radius: 24rpx;

					image {
						width: 45%;
						height: 45%;
					}
				}

				.send_btn {
					width: 100rpx;
					height: 70rpx;
					font-size: 32rpx;
					line-height: 70rpx;
					text-align: center;
					background-color: rgba(255, 228, 49, 1);
					border-radius: 24rpx;
				}
			}

		}

		.add {
			width: 100%;
			height: 460rpx;
			background-color: rgba(236, 237, 238, 1);
			// bottom:env(safe-area-inset-bottom);
			padding: 0 20rpx;

			.add_list {
				display: flex;
				justify-content: flex-start;
				flex-wrap: wrap;

				.add_item {
					width: 25%;
					margin-top: 50rpx;
					// flex: auto;
					display: flex;
					flex-direction: column;
					align-items: center;

					.add_img {
						width: 110rpx;
						height: 110rpx;
						display: flex;
						justify-content: center;
						align-items: center;
						background-color: #FFFFFF;
						border-radius: 24rpx;

						image {
							width: 55%;
							height: 55%;
						}
					}

					.title {
						font-size: 24rpx;
						color: $uni-text-color-grey;
						line-height: 50rpx;
					}
				}
			}
		}
		.voice_mask {
			width: 100%;
			height: 100%;
			position: fixed;
			background-color: rgba(0, 0, 0, 0.4);
			top: 0;
			z-index: 100;
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
			.record_length_bg {
				position: relative;
				height: 84rpx;
				width: 600rpx;
				background-color: rgba(255,255,255,0.4);
				border-radius: 42rpx;
				.record_length{
					position: absolute;
					top: 0;
					left: 50%;
					transform: translateX(-50%);
					height: 84rpx;
					min-width: 120rpx;
					text-align: center;
					line-height: 84rpx;
					background-color: $uni-color-primary;
					color: $uni-text-color-inverse;
					border-radius: 42rpx;
				}
			}
		
			.record_cancel {
				position: absolute;
				bottom: 200rpx;
				width: 120rpx;
				height: 120rpx;
				border-radius: 60rpx;
				background-color: $uni-color-primary;
				display: flex;
				justify-content: center;
				align-items: center;
				image {
					color: $uni-text-color-inverse;
					width: 50%;
					height: 50%;
				}
			}
			.cancel_on{
				background-color: $uni-color-warning;
			}
			.cancel_tip{
				position: absolute;
				bottom: 140rpx;
				width: 100%;
				text-align: center;
				color: $uni-text-color-inverse;
				font-size: $uni-font-size-base;
			}
		}
}
		
		
	
	
</style>
