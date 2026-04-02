import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
<<<<<<< HEAD
    { path: '/status', component: () => import('../views/StatusView.vue') },
    { path: '/success', component: () => import('../views/SuccessView.vue') },
=======
    { path: '/enrollment', component: () => import('../views/StatusView.vue') },
    { path: '/check-status', component: () => import('../views/CheckStatusView.vue') },
>>>>>>> 038a70c8f15d2b577941898b3d3cf114ac603b76
    { path: '/admin/users', component: () => import('../views/AdminUsersView.vue') },
    { path: '/admin/settings', component: () => import('../views/AdminSettingsView.vue') },
  ],
})

export default router