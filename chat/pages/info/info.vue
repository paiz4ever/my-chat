<template>
	<view class="content">
		<view class="top_bar" v-show="addFlag">
			<view class="top_bar_left" @tap="returnData">
				<image src="../../static/images/index/back.png" mode=""></image>
			</view>
			<view class="top_bar_center">
				详细
			</view>
			<view class="top_bar_right">
			</view>
		</view>
		<view class="main" v-show="addFlag">
			<view class="info_base">
				<view class="part_list">
					<image-cropper :src="tempFilePath" @confirm="confirm" @cancel="cancel"></image-cropper>
					<view class="part head" @tap="upload">
						<view class="part_left">头像</view>
						<view class="part_center" >
							<!-- 使用v-if隐藏 -->
							<image :src="cropFilePath"  class="meslist_img"></image>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part" @tap="addFrAnimate(0,'introduce',info.introduce)">
						<view class="part_left" >签名</view>
						<view class="part_center">
							<view class="mssg">{{info.introduce}}</view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part" @tap="addFrAnimate(0,'name',info.name)">
						<view class="part_left"  >昵称</view>
						<view class="part_center">
							<view class="mssg">{{info.name}}</view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<picker @change="bindPickerChange" :value="index" :range="array">
						<view class="part">
							<view class="part_left">性别</view>
							<view class="part_center">
								<view class="mssg">
									{{array[index]}}
								</view>
							</view>
							<view class="part_right">
								<image src="../../static/images/index/forward.png" mode=""></image>
							</view>
						</view>
					</picker>
					<picker mode="date" :value="date" :start="startDate" :end="endDate" @change="bindDateChange">
						<view class="part">
							<view class="part_left">生日</view>
							<view class="part_center">
								<view class="mssg">{{date}}</view>
							</view>
							<view class="part_right">
								<image src="../../static/images/index/forward.png" mode=""></image>
							</view>
						</view>
					</picker>
					<view class="part">
						<view class="part_left">邮箱</view>
						<view class="part_center">
							<view class="mssg">{{info.email}}</view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
				</view>
				<view class="part_list">
					<view class="part">
						<view class="part_left">我的地址</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
					<view class="part">
						<view class="part_left">更多</view>
						<view class="part_center">
							<view class="mssg"></view>
						</view>
						<view class="part_right">
							<image src="../../static/images/index/forward.png" mode=""></image>
						</view>
					</view>
				</view>
			</view>
			<button type="default" @tap="toLogin">退出登录</button>
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
	import ImageCropper from "@/components/ling-imgcropper/ling-imgcropper.vue";
	import {request} from '../../request/index.js';
	export default {
		data() {
			return {
				id:'',  //url的id 与uid相同
				uid:'',
				myName:'', 
				token:'',
				info:{},
				array: ['男', '女', '保密'],
				index: 2,
				date: '保密',
				//裁剪
				tempFilePath: '',
				cropFilePath: '',
				headimg:'',
				
				height:0,
				topHeight:0,
				width:0,
				animationData1:{},
				//设置文字隐藏
				addFlag:1,
				tipName:'',
				modifyType:'', //点击的类型
				modifyStr:''   //输入字符串
			};
		},
		components:{ImageCropper},
		onLoad(e){
			this.id = e.id;
		},
		onShow(){
			this.getStorage();
			this.getUserInfo();
		},
		mounted(){
			this.height=uni.getSystemInfoSync().windowHeight;
			this.topHeight=uni.getSystemInfoSync().statusBarHeight
		},
		methods: {
			addFrAnimate(val,name,str){
				this.addFlag=val;
				this.modifyType=name;
				if(name == 'introduce'){
					this.tipName='个性签名';
				}else if(name=='name'){
					this.tipName='昵称';
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
			//返回上一页时刷新数据
			returnData(){
			    uni.$emit("getData",{imgUrl: this.cropFilePath});
			    uni.navigateBack({
			    	delta: 1
			    })
			},
			toLogin() {
				uni.reLaunch({
					url: '../login/login?name='+this.myName
				});
				uni.removeStorageSync('identity');
			},
			bindPickerChange: function(e) {
				if(this.index!=e.target.value){
					let sex = '';
					this.index = e.target.value;
					if(this.index == 2){
						sex = 'secret'
					}else if(this.index == 1){
						sex = 'female'
					}else{
						sex = 'male'
					}
					this.updateData(sex,'sex')
				}
				
			},
			bindDateChange: function(e) {
				if(this.date!=e.target.value){
					this.date = e.target.value;
					let birth = this.date;
					this.updateData(birth,'birth')
				}
				
				
			},
			getDate(type) {
				const date = new Date();
				let year = date.getFullYear();
				let month = date.getMonth() + 1;
				let day = date.getDate();

				if (type === 'start') {
					year = year - 60;
				} else if (type === 'end') {
					year = year + 2;
				}
				month = month > 9 ? month : '0' + month;;
				day = day > 9 ? day : '0' + day;
				return `${year}-${month}-${day}`;
			},
			//图片裁剪
			upload() {
				uni.chooseImage({
					count: 1, //默认9
					sizeType: ['original', 'compressed'], //可以指定是原图还是压缩图，默认二者都有
					sourceType: ['album','camera'], //从相册选择
					success: (res) => {
						this.tempFilePath = res.tempFilePaths.shift()
					}
				});
			},
			confirm(e) {
				this.tempFilePath = '';
				this.cropFilePath = e.detail.tempFilePath;
				this.headimg = e.detail.tempFilePath;
				//文件上传
				uni.uploadFile({
					url: this.baseUrl + '/files/upload',
					filePath: this.headimg,
					name: 'file',
					fileType: 'image',
					formData:{
						url:'user',
						name:this.id,
						token:this.token
					},
					success: (uploadFileRes) => {
						let path = uploadFileRes.data;
						let _identity=uni.getStorageSync('identity');
						_identity.imgUrl = path;
						uni.setStorageSync('identity',_identity);
						this.updateData(path,'imgUrl')
					},
					fail(e) {
						console.log("this is errormes " + e.message)
					}
				});
			},
			cancel() {
				console.log('canceled');
				this.tempFilePath = "";
			},
			//获取缓存信息
			getStorage() {
				if(uni.getStorageSync('identity')){
					let {
						id,
						imgUrl,
						token,
						name
					} = uni.getStorageSync('identity');
					this.uid = id;
					this.cropFilePath = this.baseUrl + imgUrl;
					this.token = token;
					this.myName=name;
				}else{
					uni.reLaunch({
						url:'../login/login'
					})
				}
			},
			//获取用户详情
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
							this.info.introduce = '快留下签名吧~'
						}
						if(this.info.sex=='secret'){
							this.index = 2
						}else if(this.info.sex=='female'){
							this.index = 1
						}else{
							this.index = 0
						}
						if(this.info.birth){
							this.date= this.info.birth
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
			//修改数据 同步到数据库
			updateData(data,type){
				request({
					url: '/user/update',
					data: {
						id:this.id,
						data,
						type,
						token:this.token,
						pwd:''   //不修改密码默认为空 后端根据type验证是否需要pwd
					},
					method: 'POST',
				}).then(res => {
					let status = res.data.status;
					if (status == 200) {
						uni.showToast({
							title: '更改成功!',
							icon: 'success',
							duration: 1500,
						});
					}else if(status==300){
						//token过期
						uni.reLaunch({
							url: '../login/login?name=' + this.myName
						})
					} else if(status==400){
						//未输入密码或密码错误
					}else if(status==402){
						//用户名重名(邮箱验证还未修改)
						uni.showToast({
							title: '不好意思重复了',
							icon: 'none',
							duration: 1500,
						});
					}else if (status == 500) {
						uni.showToast({
							title: '服务器错误',
							icon: 'none',
							duration: 1500,
						});
					}
				})
			},
			modify(){
				if(this.info[this.modifyType] != this.modifyStr){
					if(this.modifyType=='name'){
						let _identity=uni.getStorageSync('identity');
						_identity.name = this.modifyStr;
						uni.setStorageSync('identity',_identity);
					}
					 this.info[this.modifyType]= this.modifyStr
					this.updateData(this.info[this.modifyType],this.modifyType)
				}
				//关闭弹窗
				this.addFrAnimate(1);
			}
		},
		computed: {
			startDate() {
				return this.getDate('start');
			},
			endDate() {
				return this.getDate('end');
			}
		},
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



				&:not(:only-child):last-child {
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
