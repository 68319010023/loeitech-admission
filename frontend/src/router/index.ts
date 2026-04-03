import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    // --- รวม Route ที่ต้องการเข้าด้วยกัน และลบเครื่องหมาย <<<<< ===== >>>>> ออกให้หมด ---
    { path: '/status', component: () => import('../views/StatusView.vue') },
    { path: '/success', component: () => import('../views/SuccessView.vue') },
    { path: '/enrollment', component: () => import('../views/StatusView.vue') },
    { path: '/check-status', component: () => import('../views/CheckStatusView.vue') },
    // --------------------------------------------------------------------------
    { path: '/admin/users', component: () => import('../views/AdminUsersView.vue') },
    { path: '/admin/settings', component: () => import('../views/AdminSettingsView.vue') },
    { path: '/admin/expenses', component: () => import('../views/AdminExpensesView.vue') },
  ],
})

export default router