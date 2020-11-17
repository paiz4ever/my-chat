<template>
	<view class="add_friend" :animation="animationData1">
		<view class="info_name">{{nickName?nickName:info.name}}</view>
		<textarea :value="'你好我是'+myName+'!!!'" maxlength="100" />
		<view class="add_btn">
			<button class="btn_close" @tap="addFrAnimate">取消</button>
			<button class="btn_send">发送</button>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				
			};
		},
		mounted(){
			this.height=uni.getSystemInfoSync().windowHeight;
			this.topHeight=uni.getSystemInfoSync().statusBarHeight
		},
	}
</script>

<style lang="scss">

</style>
