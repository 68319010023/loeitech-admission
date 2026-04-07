<template>
  <div class="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
    <!-- Header Section -->
    <div class="bg-white shadow-sm border-b border-emerald-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 flex items-center">
              <div class="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center mr-3">
                <Cog6ToothIcon class="w-5 h-5 text-white" />
              </div>
              ตั้งค่าเเผนการรับสมัครนักศึกษา
            </h1>
            <p class="text-gray-600 mt-2">จัดการข้อมูลพื้นฐานของระบบรับสมัครนักเรียนนักศึกษา</p>
          </div>
          <div class="flex items-center space-x-2 text-sm text-gray-500">
            <div class="flex items-center">
              <div class="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              ระบบพร้อมใช้งาน
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-6 py-8">
      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <AcademicCapIcon class="w-6 h-6 text-emerald-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">หลักสูตรทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalCurriculums }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <BuildingOffice2Icon class="w-6 h-6 text-emerald-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">สาขาวิชาทั้งหมด</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalDivisions }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
          <div class="flex items-center">
            <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CalendarDaysIcon class="w-6 h-6 text-emerald-600" />
            </div>
            <div class="ml-4">
              <p class="text-sm text-gray-600">แผนรับสมัคร</p>
              <p class="text-2xl font-bold text-gray-900">{{ stats.totalAdmissionPlans }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Navigation -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
        <div class="border-b border-gray-200">
          <nav class="flex space-x-1 px-6" aria-label="Tabs">
            <button
              v-for="tab in tabs"
              :key="tab.key"
              @click="activeTab = tab.key"
              :class="[
                'flex items-center px-4 py-3 text-sm font-medium rounded-t-lg transition-all duration-200',
                activeTab === tab.key
                  ? 'bg-emerald-50 text-emerald-700 border-b-2 border-emerald-500'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              ]"
            >
              <component :is="tab.icon" class="w-5 h-5 mr-2" />
              {{ tab.label }}
              <span v-if="tab.count" class="ml-2 px-2 py-1 text-xs rounded-full" 
                :class="activeTab === tab.key ? 'bg-emerald-200 text-emerald-800' : 'bg-gray-200 text-gray-600'">
                {{ tab.count }}
              </span>
            </button>
          </nav>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <transition name="fade" mode="out-in">
            <component :is="getTabComponent()" @refresh="fetchStats" />
          </transition>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  AcademicCapIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  Cog6ToothIcon
} from '@heroicons/vue/24/outline'
import CurriculumsManager from '@/components/admin/CurriculumsManager.vue'
import DivisionsManager from '@/components/admin/DivisionsManager.vue'
import AdmissionPlanManager from '@/components/admin/AdmissionPlanManager.vue'
import { apiService } from '@/utils/api'

const activeTab = ref('curriculums')

const stats = ref({
  totalDivisions: 0,
  totalCurriculums: 0,
  totalAdmissionPlans: 0
})

const tabs = computed(() => [
  { key: 'curriculums', label: 'หลักสูตร', icon: AcademicCapIcon, count: stats.value.totalCurriculums },
  { key: 'divisions', label: 'สาขาวิชา', icon: BuildingOffice2Icon, count: stats.value.totalDivisions },
  { key: 'admission_plan', label: 'แผนรับสมัคร', icon: CalendarDaysIcon, count: stats.value.totalAdmissionPlans }
])

const getTabComponent = () => {
  switch (activeTab.value) {
    case 'curriculums':
      return CurriculumsManager
    case 'divisions':
      return DivisionsManager
    case 'admission_plan':
      return AdmissionPlanManager
    default:
      return CurriculumsManager
  }
}

const fetchStats = async () => {
  try {
    const [curriculumsRes, divisionsRes, admissionPlansRes] = await Promise.all([
      apiService.getCurriculums(),
      apiService.getDivisions(),
      apiService.getAdmissionPlans()
    ])
    
    stats.value = {
      totalCurriculums: curriculumsRes.data.length,
      totalDivisions: divisionsRes.data.length,
      totalAdmissionPlans: admissionPlansRes.data.length
    }
  } catch (error) {
    console.error('Error fetching stats:', error)
  }
}

onMounted(() => {
  fetchStats()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>