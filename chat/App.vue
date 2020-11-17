<script>
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<style>
	view,
	text,
	input,
	textarea {
		box-sizing: border-box;
	}

	button::after {
		border: none;
	}
</style>
