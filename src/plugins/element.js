import Vue from 'vue'
import { Button, Form, FormItem, Input, Message } from 'element-ui'

Vue.use(Button)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
// Vue.use(Message)

// 弹窗组件需要挂载到Vue中
Vue.prototype.$message = Message
