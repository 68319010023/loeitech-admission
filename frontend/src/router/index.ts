import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/status', component: () => import('../views/StatusView.vue') },
    { path: '/success', component: () => import('../views/SuccessView.vue') },
    { path: '/admin/users', component: () => import('../views/AdminUsersView.vue') },
    { path: '/admin/settings', component: () => import('../views/AdminSettingsView.vue') },
  ],
})

export default router
