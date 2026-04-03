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
            <th class="w-20 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
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
              <div class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">{{ expense.exp_id }}</div>
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
                <a :href="expense.exp_img" target="_blank" rel="noopener noreferrer" 
                   class="inline-flex items-center px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors">
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                  </svg>
                  ดูรูปภาพ
                </a>
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

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
const imagePreview = ref<string>('')
const formData = ref({
  exp_id: 0,
  exp_name: '',
  exp_detail: '',
  exp_img: '',
  cur_id: 0,
  exp_cost: 0
})

const fetchExpenses = async () => {
  try {
    const mockData: ExpenseDetail[] = [
      { 
        exp_id: 1, 
        exp_name: 'ค่าเทอม', 
        exp_detail: 'ค่าเทอมการศึกษาประจำภาคการศึกษา', 
        exp_img: 'https://via.placeholder.com/150',
        cur_id: 1, 
        exp_cost: 15000,
        curriculum: { cur_id: 1, cur_name: 'ประกาศนียบัตรวิชาชีพ', cur_shortname: 'ปวช' },
        created_at: '2024-01-01T00:00:00Z' 
      },
      { 
        exp_id: 2, 
        exp_name: 'ค่าอุปกรณ์', 
        exp_detail: 'ค่าอุปกรณ์การเรียนและชุดพระราชทาน', 
        exp_img: 'https://via.placeholder.com/150',
        cur_id: 1, 
        exp_cost: 3000,
        curriculum: { cur_id: 1, cur_name: 'ประกาศนียบัตรวิชาชีพ', cur_shortname: 'ปวช' },
        created_at: '2024-01-01T00:00:00Z' 
      }
    ]
    expenses.value = mockData
  } catch (error) {
    console.error('Error fetching expenses:', error)
  }
}

const fetchCurriculums = async () => {
  try {
    const mockData: Curriculum[] = [
      { cur_id: 1, cur_name: 'ประกาศนียบัตรวิชาชีพ', cur_shortname: 'ปวช' },
      { cur_id: 2, cur_name: 'ประกาศนียบัตรวิชาชีพชั้นสูง', cur_shortname: 'ปวส' }
    ]
    curriculums.value = mockData
  } catch (error) {
    console.error('Error fetching curriculums:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      console.log('Adding expense:', formData.value)
    } else {
      console.log('Updating expense:', formData.value)
    }
    await fetchExpenses()
    closeModal()
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
      console.log('Deleting expense:', id)
      await fetchExpenses()
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }
}

const handleImageUpload = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
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
    exp_img: '',
    cur_id: 0,
    exp_cost: 0
  }
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