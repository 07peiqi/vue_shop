import Vue from 'vue'
import VueRouter from 'vue-router'
import Login from '../components/Login'
import home from '../components/home'
import welcome from '../components/welcome'
import User from '../components/User'

Vue.use(VueRouter)

const router = new VueRouter({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/Login', component: Login },
    {
      path: '/home',
      component: home,
      redirect: '/welcome',
      children: [
        {
          path: '/welcome', component: welcome
        },
        {
          path: '/users', component: User
        }]
    }
  ]
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
