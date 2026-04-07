<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <!-- Header Section -->
    <div class="bg-white shadow-lg border-b border-emerald-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 flex items-center">
              <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <ReceiptPercentIcon class="w-6 h-6 text-white" />
              </div>
              จัดการค่าใช้จ่าย
            </h1>
            <p class="text-gray-600 mt-3 text-lg">จัดการข้อมูลค่าใช้จ่ายในระบบรับสมัครนักเรียนนักศึกษา</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-emerald-50 px-4 py-2 rounded-lg">
              <div class="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-emerald-700 font-medium">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">รายการค่าใช้จ่ายทั้งหมด</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalExpenses }}</p>
              <p class="text-xs text-emerald-600 mt-2 flex items-center">
                <span class="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                รายการ
              </p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <ReceiptPercentIcon class="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">ค่าธรรมเนียมเฉลี่ย</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.averageCost.toLocaleString() }}</p>
              <p class="text-xs text-emerald-600 mt-2 flex items-center">
                <span class="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                บาท/คน
              </p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <CurrencyDollarIcon class="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>
        
        <div class="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-600 font-medium">ค่าใช้จ่ายรวม</p>
              <p class="text-3xl font-bold text-gray-900 mt-2">{{ stats.totalCost.toLocaleString() }}</p>
              <p class="text-xs text-emerald-600 mt-2 flex items-center">
                <span class="w-2 h-2 bg-emerald-500 rounded-full mr-1"></span>
                บาท/ปี
              </p>
            </div>
            <div class="w-14 h-14 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-xl flex items-center justify-center">
              <BanknotesIcon class="w-7 h-7 text-emerald-600" />
            </div>
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="p-6">
          <ExpenseDetailManager @refresh="fetchStats" />
        </div>
      </div>

      
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import {
  ReceiptPercentIcon,
  CurrencyDollarIcon,
  BanknotesIcon
} from '@heroicons/vue/24/outline'
import ExpenseDetailManager from '@/components/admin/ExpenseDetailManager.vue'
import { apiService } from '@/utils/api'

const expenses = ref<any[]>([])

const stats = computed(() => {
  const totalExpenses = expenses.value.length
  const totalCost = expenses.value.reduce((sum, expense) => sum + expense.exp_cost, 0)
  const averageCost = totalExpenses > 0 ? totalCost / totalExpenses : 0
  
  return {
    totalExpenses,
    totalCost,
    averageCost
  }
})

const fetchStats = async () => {
  try {
    const response = await apiService.getExpenseDetails()
    expenses.value = response.data
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>
