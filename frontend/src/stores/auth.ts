import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', () => {
  const isAuthenticated = ref(false)
  const user = ref(null)

  const login = (userData: any) => {
    isAuthenticated.value = true
    user.value = userData
    // เก็บ token หรือข้อมูลการ login ใน localStorage ถ้าต้องการ
    localStorage.setItem('isAuthenticated', 'true')
  }

  const logout = () => {
    isAuthenticated.value = false
    user.value = null
    // ลบข้อมูลจาก localStorage
    localStorage.removeItem('isAuthenticated')
    localStorage.removeItem('user')
  }

  const checkAuth = () => {
    const auth = localStorage.getItem('isAuthenticated')
    isAuthenticated.value = auth === 'true'
  }

  // ตรวจสอบสถานะการ login เมื่อโหลด store
  checkAuth()

  return {
    isAuthenticated,
    user,
    login,
    logout,
    checkAuth
  }
})
