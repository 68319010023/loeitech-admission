<template>
  <div class="max-w-4xl mx-auto">

    

    <div class="bg-white rounded-2xl shadow-sm p-8">
      
      <!-- Document List -->
      <div class="mb-8">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> โปรดเตรียมภาพถ่ายเอกสาร ให้พร้อม
        </h2>
        <div class="space-y-4">
          <!-- Document Item 1 -->
          <div class="flex items-start space-x-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200">
            <div class="flex-shrink-0 w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">1</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">
                สำเนาทะเบียนบ้านของตนเอง
              </h3>
              <p class="text-gray-600 text-sm">
                 เตรียมสำเนาทะเบียนบ้านของนักเรียนโดยต้องเป็นเอกสารที่ชัดเจนและสมบูรณ์
              </p>
            </div>
          </div>

          <!-- Document Item 2 -->
          <div class="flex items-start space-x-4 p-4 bg-green-50 rounded-xl border border-green-200">
            <div class="flex-shrink-0 w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">2</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">
                 สำเนาทะเบียนบ้านของบิดา-มารดา
              </h3>
              <p class="text-gray-600 text-sm">
                เตรียมสำเนาทะเบียนบ้านของบิดาหรือมารดา หรือผู้ปกครองที่รับผิดชอบ

              </p>
            </div>
          </div>

          <!-- Document Item 3 -->
          <div class="flex items-start space-x-4 p-4 bg-teal-50 rounded-xl border border-teal-200">
            <div class="flex-shrink-0 w-10 h-10 bg-teal-600 rounded-full flex items-center justify-center">
              <span class="text-white font-bold">3</span>
            </div>
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-gray-800 mb-1">
                สลิปการโอนชำระค่าบำรุงการศึกษาและเครื่องแบบ
              </h3>
              <p class="text-gray-600 text-sm">
                กรุณาเตรียมสลิปการโอนเงินที่แสดงการชำระค่าบำรุงการศึกษาและค่าเครื่องแบบให้เรียบร้อย
              </p>
            </div>
          </div>
        </div>

        <!-- Important Notice -->
      
      </div>

      <!-- Divider -->
      <div class="border-t border-gray-200"></div>

      <!-- ID Card Input Section -->
      <div class="mt-8">
        <h3 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
          <UserIcon class="w-5 h-5 text-emerald-500" /> ข้อมูลส่วนตัว
        </h3>
        <div class="space-y-4">
          <div>
            <label for="idCard" class="block text-sm font-medium text-gray-700 mb-2">
              เลขบัตรประชาชน (13 หลัก)
            </label>
            <input 
              type="text" 
              id="idCard"
              maxlength="13"
              pattern="[0-9]*"
              inputmode="numeric"
              placeholder="กรอกเลขบัตรประชาชน"
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors duration-200"
              @input="validateIdCard"
            />
            <p v-if="errorMessage" class="mt-2 text-sm text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- Submit Button -->
          <div class="flex justify-center mt-6">
            <button 
              @click="handleSubmit"
              :disabled="!isValidIdCard"
              class="px-8 py-3 bg-emerald-500 text-white font-semibold rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
            >
              มอบตัว
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  DocumentTextIcon,
  UserIcon,
  DocumentArrowUpIcon,
  BanknotesIcon,
  CheckCircleIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'
import api from '@/services/api' // ← เพิ่ม
 
const router = useRouter()
 
const idCard = ref('')
const errorMessage = ref('')
const isValidIdCard = ref(false)
const isLoading = ref(false) // ← เพิ่ม
 
const validateIdCard = (event) => {
  const value = event.target.value
 
  if (!/^\d*$/.test(value)) {
    event.target.value = value.replace(/\D/g, '')
    return
  }
 
  idCard.value = event.target.value
 
  if (value.length === 0) {
    errorMessage.value = ''
    isValidIdCard.value = false
  } else if (value.length < 13) {
    errorMessage.value = 'กรุณากรอกเลขบัตรประชาชนให้ครบ 13 หลัก'
    isValidIdCard.value = false
  } else if (value.length === 13) {
    errorMessage.value = ''
    isValidIdCard.value = true
  }
}
 
// ← แก้ handleSubmit ให้เชื่อม API
const handleSubmit = async () => {
  if (!isValidIdCard.value) return
 
  isLoading.value = true
  errorMessage.value = ''
 
  try {
    await api.post('/enrollments/confirm', {
      idCard: idCard.value
    })
    router.push('/success')
  } catch (error) {
    if (error.response?.status === 404) {
      errorMessage.value = 'ไม่พบข้อมูลการสมัครในระบบ'
    } else if (error.response?.status === 400) {
      errorMessage.value = error.response.data.message || 'ไม่สามารถมอบตัวได้'
    } else {
      errorMessage.value = 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง'
    }
  } finally {
    isLoading.value = false
  }
}
</script>