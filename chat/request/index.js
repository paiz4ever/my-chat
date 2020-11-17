export const request = (parmas) => {
	//定义公共url
	const baseUrl = "http://192.168.1.2:3000"
	return new Promise((resolve, request) => {
		uni.request({
			...parmas,
			url: baseUrl + parmas.url,
			success: (res) => {
				resolve(res)
			},
			fail: (err) => {
				reject(err)
			},
		});
	})
}

