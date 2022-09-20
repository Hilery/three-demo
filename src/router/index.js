import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/test'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/tokyo',
    name: 'Tokyo',
    component: () => import('../views/LittlestTokyo.vue')
  },
  {
    path: '/raycaster',
    name: 'raycaster',
    component: () => import('../views/Raycaster.vue')
  },
  {
    path: '/decals',
    name: 'decals',
    component: () => import('../views/Decals.vue')
  },
  {
    path: '/galaxy',
    name: 'galaxy',
    component: () => import('../views/Galaxy.vue')
  },
  {
    path: '/test',
    name: 'test',
    component: () => import('../views/Test.vue')
  }
]

const router = new VueRouter({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes
})

export default router
