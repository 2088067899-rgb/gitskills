import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from './views/MainLayout.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: () => import('./views/Login.vue') },
  { 
    path: '/campaign', 
    component: MainLayout,
    children: [
      { path: 'list', component: () => import('./views/CampaignManage.vue') }
    ]
  },
  { 
    path: '/user', 
    component: MainLayout,
    children: [
      { path: 'list', component: () => import('./views/UserManage.vue') }
    ]
  },
  { 
    path: '/commission', 
    component: MainLayout,
    children: [
      { path: 'list', component: () => import('./views/CommissionManage.vue') }
    ]
  },
  { 
    path: '/red-packet', 
    component: MainLayout,
    children: [
      { path: 'list', component: () => import('./views/RedPacketManage.vue') }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) {
    next('/login')
  } else if (to.path === '/login' && token) {
    next('/campaign/list')
  } else {
    next()
  }
})

export default router
