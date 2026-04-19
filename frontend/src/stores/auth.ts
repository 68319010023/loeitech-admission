import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref<any>(null)
  const token = ref<string | null>(null)

  const login = (userData: any) => {
    isAuthenticated.value = true
    user.value = userData
    token.value = userData.token || null
    localStorage.setItem('isAuthenticated', 'true')
    if (userData.token) localStorage.setItem('auth_token', userData.token)
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    token.value = null
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
    localStorage.removeItem('auth_token')
  }

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated')
    isAuthenticated.value = auth === 'true'
    token.value = localStorage.getItem('auth_token')
  }

  checkAuth()

  return {
    isAuthenticated,
    user,
    token,
    login,
    logout,
    checkAuth
  }
})
