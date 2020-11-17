// 格式化首页时间
export function formatIndexTime(t) {
	let oldTime = new Date(t);
	let nowTime = new Date();
	//获取过去时间戳及详情
	let oldTimeStamp = oldTime.getTime();
	let oldY = oldTime.getFullYear();
	let oldM = oldTime.getMonth() + 1;
	let oldD = oldTime.getDate()
	let oldH = oldTime.getHours();
	let oldMin = oldTime.getMinutes();
	let oldN = oldTime.getDay();
	// 获取现在时间戳
	let nowTimeStamp = nowTime.getTime();
	let nowY = nowTime.getFullYear();
	let diffTime = (nowTimeStamp - oldTimeStamp) / 1000;

	if (diffTime < 86400) {
		if ((oldTime.getHours()) <= 9) {
			oldH = " 0" + oldH;
		}
		if ((oldTime.getMinutes()) <= 9) {
			oldMin = "0" + oldMin;
		}
		return oldH + ':' + oldMin;
	} else if (diffTime < 86400 * 2) {
		return '昨天';
	} else if (diffTime < 86400 * 7) {
		let day = '';
		switch (oldN) {
			case 0:
				day = "星期天";
				break;
			case 1:
				day = "星期一";
				break;
			case 2:
				day = "星期二";
				break;
			case 3:
				day = "星期三";
				break;
			case 4:
				day = "星期四";
				break;
			case 5:
				day = "星期五";
				break;
			case 6:
				day = "星期六";
		}
		return day;
	} else {
		if (nowY == oldY) {
			return `${oldM}月${oldD}日`
		} else {
			return `${oldY}年${oldM}月${oldD}日`
		}
	}
};
//格式化聊天时间
export function formatChatTime(t) {
	let oldTime = new Date(t);
	let nowTime = new Date();
	//获取过去时间戳及详情
	let oldTimeStamp = oldTime.getTime();
	let oldY = oldTime.getFullYear();
	let oldM = oldTime.getMonth() + 1;
	let oldD = oldTime.getDate()
	let oldH = oldTime.getHours();
	let oldMin = oldTime.getMinutes();
	let oldN = oldTime.getDay();
	// 获取现在时间戳
	let nowTimeStamp = nowTime.getTime();
	let nowY = nowTime.getFullYear();
	let diffTime = (nowTimeStamp - oldTimeStamp) / 1000;

	if ((oldTime.getHours()) <= 9) {
		oldH = " 0" + oldH;
	}
	if ((oldTime.getMinutes()) <= 9) {
		oldMin = "0" + oldMin;
	}
	if (diffTime < 86400) {
		return oldH + ':' + oldMin;
	} else if (diffTime < 86400 * 2) {
		return '昨天' + ' ' + oldH + ':' + oldMin;
	} else {
		if (nowY == oldY) {
			return `${oldM}月${oldD}日 ${oldH}:${oldMin}`
		} else {
			return `${oldY}年${oldM}月${oldD}日  ${oldH}:${oldMin}`
		}
	}
}

//格式化文件时间
export function formatFileTime(t) {
	let time = new Date(t);
	let Y = time.getFullYear();
	let M = time.getMonth() + 1;
	let D = time.getDate();
	//处理时间
	if(M<10){
		M = '0'+M;
	}
	if(D<10){
		D= '0'+D
	}
	return ''+Y+M+D

}

//防抖函数
export function debounce(fn,delay) {
    var timer=null;
    return function() {
    //保存当前调用的dom对象
     var _this=this;
     //保存事件对象
     var args=arguments;
     clearTimeout(timer)
     timer=setTimeout(function() {
         fn.apply(_this,args)
     },delay)
    }

}