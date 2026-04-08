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

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-16">
      <div class="flex flex-col items-center gap-3">
        <div class="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 text-sm">กำลังโหลดข้อมูล...</p>
      </div>
    </div>

    <!-- Table -->
    <div v-else class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="w-16 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ลำดับ</th>
            <th class="w-64 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อรายการ</th>
            <th class="w-48 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร</th>
            <th class="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ราคา</th>
            <th class="w-40 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ประเภทการชำระ</th>
            <th class="w-32 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">รูปภาพ</th>
            <th class="w-36 px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="expenses.length === 0">
            <td colspan="7" class="px-4 py-16 text-center">
              <div class="flex flex-col items-center gap-3">
                <div class="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg class="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <p class="text-gray-500 text-sm">ไม่พบข้อมูลค่าใช้จ่าย</p>
              </div>
            </td>
          </tr>
          <tr
            v-for="(expense, index) in expenses"
            :key="expense.exp_id"
            class="hover:bg-gray-50 transition-colors"
          >
            <td class="px-4 py-3 text-sm text-gray-900 text-center">
              <div class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                {{ index + 1 }}
              </div>
            </td>
            <td class="px-4 py-3 text-sm text-gray-900">
              <div>
                <div class="font-medium">{{ expense.exp_name }}</div>
                <div class="text-gray-500 text-xs">
                  {{ expense.exp_detail.length > 50 ? expense.exp_detail.substring(0, 50) + '...' : expense.exp_detail }}
                </div>
              </div>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ expense.curriculum?.cur_name ?? '-' }}
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              {{ expense.exp_cost.toLocaleString() }} บาท
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm">
              <span
                :class="[
                  'inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full',
                  expense.payment_type === 'mandatory'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-gray-100 text-gray-600'
                ]"
              >
                {{ expense.payment_type === 'mandatory' ? 'บังคับชำระ' : 'ไม่บังคับชำระ' }}
              </span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
              <div v-if="expense.exp_img" class="text-center">
                <button
                  @click="viewImage(expense.exp_img!)"
                  class="inline-flex items-center px-3 py-1 bg-emerald-500 text-white text-xs rounded hover:bg-emerald-600 transition-colors"
                >
                  <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  ดูรูปภาพ
                </button>
              </div>
              <span v-else class="text-gray-400 text-xs">ไม่มีรูป</span>
            </td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-center">
              <div class="flex justify-center items-center gap-1">
                <button
                  @click="editExpense(expense)"
                  class="inline-flex items-center px-2 py-1.5 bg-emerald-50 text-emerald-600 rounded hover:bg-emerald-100 transition-colors"
                  title="แก้ไข"
                >
                  <PencilIcon class="w-3.5 h-3.5" />
                </button>
                <button
                  @click="openDeleteModal(expense)"
                  class="inline-flex items-center px-2 py-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                  title="ลบ"
                >
                  <TrashIcon class="w-3.5 h-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div
          v-if="toast.show"
          class="fixed top-4 right-4 z-[99999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white"
          :class="toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'"
        >
          <svg v-if="toast.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p class="font-semibold">{{ toast.title }}</p>
            <p class="text-sm opacity-90">{{ toast.message }}</p>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Add / Edit Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <div class="fixed inset-0 z-[9998]" style="background-color: rgba(0,0,0,0.3);" @click="closeModal"></div>
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <div class="relative bg-white rounded-lg shadow-xl w-full sm:max-w-lg z-[10000]">
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
                      <label class="block text-gray-700 text-sm font-bold mb-2">ประเภทการชำระเงิน</label>
                      <select
                        v-model="formData.payment_type"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      >
                        <option value="">เลือกประเภทการชำระเงิน</option>
                        <option value="mandatory">บังคับชำระ</option>
                        <option value="optional">ไม่บังคับชำระ</option>
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
                      <div v-if="imagePreview || formData.exp_img" class="mt-2">
                        <img :src="imagePreview || formData.exp_img" alt="รูปภาพ" class="w-20 h-20 object-cover rounded" />
                      </div>
                    </div>
                  </div>
                </div>
                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    :disabled="isSubmitting"
                    class="inline-flex justify-center rounded-lg px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {{ isSubmitting ? 'กำลังบันทึก...' : (showAddModal ? 'เพิ่ม' : 'บันทึก') }}
                  </button>
                  <button
                    type="button"
                    @click="closeModal"
                    class="inline-flex justify-center rounded-lg border border-gray-300 px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
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

    <!-- View Image Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="viewingImage" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/70" @click="viewingImage = ''"></div>
          <div class="relative z-[10000] max-w-2xl w-full">
            <button
              @click="viewingImage = ''"
              class="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img :src="viewingImage" alt="รูปภาพ" class="w-full rounded-xl shadow-2xl" />
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Delete Modal -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showDeleteModal" class="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div class="fixed inset-0 bg-black/40" @click="closeDeleteModal"></div>
          <div class="relative bg-white rounded-xl shadow-xl w-full max-w-md z-[10000]">
            <div class="p-6 border-b border-gray-100">
              <div class="flex items-center">
                <div class="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-3 flex-shrink-0">
                  <TrashIcon class="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 class="text-lg font-bold text-gray-900">ยืนยันการลบรายการค่าใช้จ่าย</h3>
                  <p class="text-sm text-gray-500 mt-0.5">{{ deletingExpense?.exp_name }}</p>
                </div>
              </div>
            </div>
            <div class="p-6 border-b border-gray-100">
              <p class="text-gray-600 text-sm">
                คุณต้องการลบรายการ
                <span class="font-semibold text-gray-900">{{ deletingExpense?.exp_name }}</span>
                ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>
            <div class="p-4 flex justify-end gap-3">
              <button
                @click="closeDeleteModal"
                class="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                @click="confirmDelete"
                :disabled="isDeleting"
                class="px-4 py-2 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors flex items-center disabled:opacity-50"
              >
                <TrashIcon class="w-4 h-4 mr-2" />
                {{ isDeleting ? 'กำลังลบ...' : 'ยืนยันการลบ' }}
              </button>
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
import { apiService } from '@/utils/api'

// ── Interfaces ─────────────────────────────────────────
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
  payment_type?: string
  curriculum?: Curriculum
  created_at: string
}

// ── Emits ──────────────────────────────────────────────
const emit = defineEmits(['refresh'])

// ── State ──────────────────────────────────────────────
const expenses = ref<ExpenseDetail[]>([])
const curriculums = ref<Curriculum[]>([])
const isLoading = ref(false)
const isSubmitting = ref(false)
const isDeleting = ref(false)
const imagePreview = ref<string>('')
const viewingImage = ref<string>('')

const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const deletingExpense = ref<ExpenseDetail | null>(null)

const formData = ref({
  exp_id: 0,
  exp_name: '',
  exp_detail: '',
  exp_cost: 0,
  exp_img: '',
  cur_id: 0 as number | '',
  payment_type: ''
})

const toast = ref({
  show: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: ''
})
let toastTimer: ReturnType<typeof setTimeout> | null = null

// ── Toast ──────────────────────────────────────────────
const showToast = (type: 'success' | 'error', title: string, message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}

// ── Image ──────────────────────────────────────────────
const viewImage = (imageUrl: string) => {
  viewingImage.value = imageUrl
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

// ── Fetch ──────────────────────────────────────────────
const fetchExpenses = async () => {
  isLoading.value = true
  try {
    const response = await apiService.getExpenseDetails()
    expenses.value = response.data
  } catch (error) {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลค่าใช้จ่ายได้')
  } finally {
    isLoading.value = false
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

// ── Add / Edit ─────────────────────────────────────────
const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    if (showAddModal.value) {
      await apiService.createExpenseDetail(formData.value)
      showToast('success', 'เพิ่มรายการสำเร็จ', 'ข้อมูลถูกบันทึกเรียบร้อยแล้ว')
    } else {
      await apiService.updateExpenseDetail(formData.value.exp_id, formData.value)
      showToast('success', 'แก้ไขรายการสำเร็จ', 'ข้อมูลถูกอัปเดตเรียบร้อยแล้ว')
    }
    await fetchExpenses()
    emit('refresh')
    closeModal()
  } catch (error: any) {
    showToast('error', 'บันทึกไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isSubmitting.value = false
  }
}

const editExpense = (expense: ExpenseDetail) => {
  formData.value = {
    exp_id: expense.exp_id,
    exp_name: expense.exp_name,
    exp_detail: expense.exp_detail,
    exp_img: expense.exp_img || '',
    cur_id: expense.cur_id,
    exp_cost: expense.exp_cost,
    payment_type: expense.payment_type || ''
  }
  imagePreview.value = ''
  showEditModal.value = true
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
    cur_id: '',
    payment_type: ''
  }
}

// ── Delete ─────────────────────────────────────────────
const openDeleteModal = (expense: ExpenseDetail) => {
  deletingExpense.value = expense
  showDeleteModal.value = true
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  deletingExpense.value = null
}

const confirmDelete = async () => {
  if (!deletingExpense.value) return
  isDeleting.value = true
  try {
    await apiService.deleteExpenseDetail(deletingExpense.value.exp_id)
    showToast('success', 'ลบรายการสำเร็จ', 'ข้อมูลถูกลบจากระบบเรียบร้อยแล้ว')
    await fetchExpenses()
    emit('refresh')
    closeDeleteModal()
  } catch (error: any) {
    showToast('error', 'ลบไม่สำเร็จ', error?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
  } finally {
    isDeleting.value = false
  }
}

// ── Lifecycle ──────────────────────────────────────────
onMounted(() => {
  fetchCurriculums()
  fetchExpenses()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: all 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>