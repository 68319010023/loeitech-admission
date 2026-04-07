<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center">
          <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
            <BuildingOffice2Icon class="w-5 h-5 text-emerald-600" />
          </div>
          จัดการสาขาวิชา
        </h2>
        <p class="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลสาขาวิชาต่างๆ</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        เพิ่มสาขาวิชาใหม่
      </button>
    </div>

    <!-- Search and Filter -->
    <div class="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <div class="relative">
            <MagnifyingGlassIcon class="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาชื่อสาขาวิชา"
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <div class="sm:w-48">
          <select
            v-model="selectedAbbreviation"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
          >
            <option value="">ทั้งหมด</option>
            <option value="ปวช">ปวช</option>
            <option value="ปวส">ปวส</option>
          </select>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span>พบ {{ filteredDivisions.length }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อสาขาวิชา</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="division in filteredDivisions" :key="division.div_id" 
                class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  {{ division.div_id }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ division.div_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-medium text-gray-800 rounded-full">
                  {{ division.curriculum?.cur_shortname }}
                </span>
                <div class="text-xs text-gray-500 mt-1">{{ division.curriculum?.cur_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    @click="editDivision(division)"
                    class="inline-flex items-center px-3 py-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-100 transition-colors"
                    title="แก้ไข"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteDivision(division.div_id)"
                    class="inline-flex items-center px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    title="ลบ"
                  >
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Empty State -->
      <div v-if="filteredDivisions.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <BuildingOffice2Icon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลสาขาวิชา</h3>
        <p class="text-gray-500 mb-4">ยังไม่มีข้อมูลสาขาวิชาในระบบ หรือค้นหาไม่พบ</p>
        <button
          @click="showAddModal = true"
          class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          เพิ่มสาขาวิชาแรก
        </button>
      </div>
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
                  <div class="mb-4">
                    <h3 class="text-lg font-bold text-gray-900 flex items-center">
                      <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
                        <component :is="showAddModal ? PlusIcon : PencilIcon" class="w-5 h-5 text-emerald-600" />
                      </div>
                      {{ showAddModal ? 'เพิ่มสาขาวิชาใหม่' : 'แก้ไขสาขาวิชา' }}
                    </h3>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อสาขาวิชา</label>
                      <input
                        v-model="formData.div_name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="เช่น คอมพิวเตอร์ธุรกิจ"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">หลักสูตร</label>
                      <select
                        v-model="formData.cur_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      >
                        <option value="">เลือกหลักสูตร</option>
                        <option v-for="curriculum in curriculums" :key="curriculum.cur_id" :value="curriculum.cur_id">
                          {{ curriculum.cur_name }} ({{ curriculum.cur_shortname }})
                        </option>
                      </select>
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                  >
                    {{ showAddModal ? 'เพิ่มสาขาวิชา' : 'บันทึกการแก้ไข' }}
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
import { ref, computed, onMounted } from 'vue'
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  BuildingOffice2Icon,
  MagnifyingGlassIcon,
  HashtagIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'
import { apiService } from '@/utils/api'

interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
}

interface Division {
  div_id: number
  div_name: string
  cur_id: number
  curriculum?: Curriculum
  created_at: string
}

const divisions = ref<Division[]>([])
const curriculums = ref<Curriculum[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const selectedAbbreviation = ref('')
const formData = ref({
  div_id: 0,
  div_name: '',
  cur_id: 0
})

const filteredDivisions = computed(() => {
  let filtered = divisions.value
  
  // Filter by abbreviation
  if (selectedAbbreviation.value) {
    filtered = filtered.filter(division => 
      division.curriculum?.cur_shortname === selectedAbbreviation.value
    )
  }
  
  // Filter by search query (only division name)
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(division => 
      division.div_name.toLowerCase().includes(query)
    )
  }
  
  return filtered
})

const fetchDivisions = async () => {
  try {
    const response = await apiService.getDivisions()
    divisions.value = response.data
  } catch (error) {
    console.error('Error fetching divisions:', error)
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
      await apiService.createDivision(formData.value)
    } else {
      await apiService.updateDivision(formData.value.div_id!, formData.value)
    }
    await fetchDivisions()
    closeModal()
  } catch (error) {
    console.error('Error saving division:', error)
  }
}

const editDivision = (division: Division) => {
  formData.value = { 
    div_id: division.div_id,
    div_name: division.div_name,
    cur_id: division.cur_id
  }
  showEditModal.value = true
}

const deleteDivision = async (id: number) => {
  if (confirm('คุณต้องการลบสาขาวิชานี้ใช่หรือไม่?')) {
    try {
      const response = await apiService.deleteDivision(id)
      
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
            <p class="font-semibold">ลบสาขาวิชาสำเร็จแล้ว</p>
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
      
      await fetchDivisions()
    } catch (error: any) {
      console.error('Error deleting division:', error)
      
      // Error toast
      const errorMessage = error?.message || 'เกิดข้อผิดพลาดในการลบสาขาวิชา'
      const toast = document.createElement('div')
      toast.className = 'fixed top-4 right-4 bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 flex items-center space-x-3 transform translate-x-full transition-all duration-500 ease-out'
      toast.innerHTML = `
        <div class="flex-shrink-0">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
          </svg>
        </div>
        <div class="flex-1">
          <p class="font-semibold">ไม่สามารถลบสาขาวิชาได้</p>
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

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    div_id: 0,
    div_name: '',
    cur_id: 0
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

onMounted(() => {
  fetchCurriculums()
  fetchDivisions()
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