import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../views/HomeView.vue') },
    { path: '/register', component: () => import('../views/RegisterView.vue') },
    { path: '/check-status', component: () => import('../views/CheckStatusView.vue') },
    { path: '/enrollment', component: () => import('../views/StatusView.vue') },
    { path: '/enrollment/:idCard', component: () => import('../views/SuccessView.vue') },
    { path: '/check-status', component: () => import('../views/CheckStatusView.vue') },

    { path: '/admin/users', component: () => import('../views/AdminUsersView.vue') },
    { path: '/admin/manage-users', component: () => import('../views/AdminManageUsersView.vue') },
    { path: '/admin/settings', component: () => import('../views/AdminSettingsView.vue') },
    { path: '/admin/expenses', component: () => import('../views/AdminExpensesView.vue') },
    { path: '/admin/onsite-enrollment', component: () => import('../views/OnsiteEnrollmentView.vue') },
  ],
})

export default router