import Vue from 'vue'
import App from './App'
//引入socket.io
import io from 'lib/weapp.socket.io.js'

Vue.config.productionTip = false
//服务器地址
Vue.prototype.baseUrl='http://192.168.1.2:3000'

Vue.prototype.socket = io('http://192.168.1.2:8082')

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
