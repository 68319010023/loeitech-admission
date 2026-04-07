<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-800">จัดการค่าใช้จ่าย</h2>
      <button
        @click="showAddModal = true"
        class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
      >
        <PlusIcon class="w-5 h-5 inline-block mr-1" />
        เพิ่มรายการค่าใช้จ่าย
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายการ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
            <th class="w-24 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
            <th class="w-32 px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="expense in expenses" :key="expense.exp_id">
            <td class="px-6 py-4 text-sm text-gray-900 text-center">
              <div class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">{{ expenses.indexOf(expense) + 1 }}</div>
            </td>
            <td class="px-6 py-4 text-sm text-gray-900">
              <div>
                <div class="font-medium">{{ expense.exp_name }}</div>
                <div class="text-gray-500 text-xs">{{ expense.exp_detail.substring(0, 50) }}...</div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ expense.curriculum?.cur_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">฿{{ expense.exp_cost.toLocaleString() }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
              <div v-if="expense.exp_img" class="text-center">
                <button @click="viewImage(expense.exp_img)" 
                   class="inline-flex items-center px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  ดูรูปภาพ
                </button>
              </div>
              <span v-else class="text-gray-400">ไม่มีรูป</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-center">
              <button @click="editExpense(expense)" class="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors mr-2">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="deleteExpense(expense.exp_id)" class="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
                <TrashIcon class="w-4 h-4" />
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ แก้ไข: ใช้ Teleport เพื่อ render modal ออกไปที่ body โดยตรง -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <!-- Backdrop -->
            <div class="fixed inset-0 transition-opacity z-[9998]" style="background-color: rgba(0, 0, 0, 0.3);"
            @click="closeModal"></div>

          <!-- Modal Container -->
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <!-- Modal Panel -->
            <div class="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full sm:max-w-lg z-[10000]">
              <form @submit.prevent="handleSubmit">
                <div class="bg-white px-6 pt-6 pb-4 rounded-t-lg">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">
                    {{ showAddModal ? 'เพิ่มรายการค่าใช้จ่าย' : 'แก้ไขรายการค่าใช้จ่าย' }}
                  </h3>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ชื่อรายการค่าใช้จ่าย</label>
                      <input
                        v-model="formData.exp_name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">รายละเอียด</label>
                      <textarea
                        v-model="formData.exp_detail"
                        rows="3"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      ></textarea>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">หลักสูตร</label>
                      <select
                        v-model="formData.cur_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      >
                        <option value="">เลือกหลักสูตร</option>
                        <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
                          {{ curriculum.cur_name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ราคาต่อหน่วย</label>
                      <input
                        v-model.number="formData.exp_cost"
                        type="number"
                        step="0.01"
                        min="0"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">รูปภาพ</label>
                      <input
                        type="file"
                        accept="image/*"
                        @change="handleImageUpload"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                      />
                      <div v-if="formData.exp_img || imagePreview" class="mt-2">
                        <img :src="imagePreview || formData.exp_img" alt="รูปภาพ" class="w-20 h-20 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                  >
                    {{ showAddModal ? 'เพิ่ม' : 'บันทึก' }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex justify-center rounded-lg border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showImageModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <!-- Backdrop -->
          <div class="fixed inset-0 transition-opacity z-[9998]" style="background-color: rgba(0, 0, 0, 0.8);"
               @click="closeImageModal"></div>

          <!-- Modal Container -->
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <!-- Modal Panel -->
            <div class="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full sm:max-w-4xl z-[10000]">
              <div class="bg-white rounded-lg overflow-hidden">
                <!-- Header -->
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 class="text-lg font-medium text-gray-900">ดูรูปภาพ</h3>
                  <button @click="closeImageModal" class="text-gray-400 hover:text-gray-500">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                  </button>
                </div>
                
                <!-- Image Content -->
                <div class="p-6">
                  <div class="flex justify-center">
                    <img :src="selectedImageUrl" alt="รูปภาพ" class="max-w-full max-h-96 object-contain rounded-lg shadow-lg">
                  </div>
                </div>
                
                <!-- Footer -->
                <div class="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-end">
                  <button @click="closeImageModal" 
                          class="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors">
                    ปิด
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import { apiService } from '@/utils/api'

const emit = defineEmits(['refresh'])

// Function to generate cache-busting URL
const getImageUrl = (imageUrl: string) => {
  if (!imageUrl) return imageUrl
  const timestamp = Date.now()
  const separator = imageUrl.includes('?') ? '&' : '?'
  return `${imageUrl}${separator}_t=${timestamp}`
}

interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
}

interface ExpenseDetail {
  exp_id: number
  exp_name: string
  exp_detail: string
  exp_img?: string
  cur_id: number
  exp_cost: number
  curriculum?: Curriculum
  created_at: string
}

const expenses = ref<ExpenseDetail[]>([])
const curriculums = ref<Curriculum[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const showImageModal = ref(false)
const selectedImageUrl = ref('')
const imagePreview = ref('')
const searchQuery = ref('')
const formData = ref({
  exp_id: 0,
  exp_name: '',
  exp_detail: '',
  exp_cost: 0,
  exp_img: '',
  cur_id: 0
})

const fetchExpenses = async () => {
  try {
    const response = await apiService.getExpenseDetails()
    expenses.value = response.data
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

const fetchCurriculums = async () => {
  try {
    const response = await apiService.getCurriculums()
    curriculums.value = response.data
  } catch (error) {
    console.error('Error fetching curriculums:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      await apiService.createExpenseDetail(formData.value)
    } else {
      await apiService.updateExpenseDetail(formData.value.exp_id!, formData.value)
    }
    await fetchExpenses()
    closeModal()
    emit('refresh')
  } catch (error) {
    console.error('Error saving expense:', error)
  }
}

const editExpense = (expense: ExpenseDetail) => {
  formData.value = { 
    exp_id: expense.exp_id,
    exp_name: expense.exp_name,
    exp_detail: expense.exp_detail,
    exp_img: expense.exp_img || '',
    cur_id: expense.cur_id,
    exp_cost: expense.exp_cost
  }
  showEditModal.value = true
}

const deleteExpense = async (id: number) => {
  if (confirm('คุณต้องการลบรายการค่าใช้จ่ายนี้ใช่หรือไม่?')) {
    try {
      const response = await apiService.deleteExpenseDetail(id)
      
      if (response.success) {
        // Success toast
        const toast = document.createElement('div')
        toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transform translate-x-full transition-all duration-500 ease-out'
        toast.innerHTML = `
          <div class="flex-shrink-0">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>
          <div class="flex-1">
            <p class="font-semibold">ลบรายการค่าใช้จ่ายสำเร็จแล้ว</p>
            <p class="text-sm opacity-90">ข้อมูลถูกลบจากระบบเรียบร้อย</p>
          </div>
        `
        document.body.appendChild(toast)
        
        // Animate in
        setTimeout(() => {
          toast.classList.remove('translate-x-full')
          toast.classList.add('translate-x-0')
        }, 100)
        
        // Remove after delay
        setTimeout(() => {
          toast.classList.add('translate-x-full', 'opacity-0')
          setTimeout(() => toast.remove(), 500)
        }, 4000)
      }
      
      await fetchExpenses()
      emit('refresh')
    } catch (error: any) {
      console.error('Error deleting expense:', error)
      
      // Error toast
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการลบรายการค่าใช้จ่าย'
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transform translate-x-full transition-all duration-500 ease-out'
      toast.innerHTML = `
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold">ไม่สามารถลบรายการค่าใช้จ่ายได้</p>
          <p class="text-sm opacity-90">${errorMessage}</p>
        </div>
      `
      document.body.appendChild(toast)
      
      // Animate in
      setTimeout(() => {
        toast.classList.remove('translate-x-full')
        toast.classList.add('translate-x-0')
      }, 100)
      
      // Remove after delay
      setTimeout(() => {
        toast.classList.add('translate-x-full', 'opacity-0')
        setTimeout(() => toast.remove(), 500)
      }, 6000)
    }
  }
}

const handleImageUpload = (e: Event) => {
  const file = (e.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      imagePreview.value = e.target?.result as string
      formData.value.exp_img = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  imagePreview.value = ''
  formData.value = {
    exp_id: 0,
    exp_name: '',
    exp_detail: '',
    exp_cost: 0,
    exp_img: '',
    cur_id: 0
  }
}

const closeImageModal = () => {
  showImageModal.value = false
  selectedImageUrl.value = ''
}

const viewImage = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl
  showImageModal.value = true
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

onMounted(() => {
  fetchCurriculums()
  fetchExpenses()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>