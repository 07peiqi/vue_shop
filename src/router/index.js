import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import home from '../components/home'

Vue.use(VueRouter)

const routes = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/Login', component: Login },
    { path: '/home', component: home }
  ]
})

const router = new VueRouter({
  routes
})

// 挂在路由导航守卫
router.beforeEach((to, from, next) => {
  //  to  表示将要访问的路径
  //  from  表示从哪个路径跳转而来
  //  next  是一个函数，表示放行
  // next() 直接放行   next（'/lpgin')  强制跳转到相应的页面
  if (to.path === '/login') return next()
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('login')
  next()
})
export default router
