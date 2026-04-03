<template>
  <div>
    <!-- Header -->
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
      <div>
        <h2 class="text-2xl font-bold text-gray-900 flex items-center">
          <div class="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mr-3">
            <AcademicCapIcon class="w-5 h-5 text-emerald-600" />
          </div>
          จัดการหลักสูตร
        </h2>
        <p class="text-gray-600 mt-1">เพิ่ม แก้ไข หรือลบข้อมูลหลักสูตรการศึกษา</p>
      </div>
      <button
        @click="showAddModal = true"
        class="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md flex items-center"
      >
        <PlusIcon class="w-5 h-5 mr-2" />
        เพิ่มหลักสูตรใหม่
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
              placeholder="ค้นหาชื่อหลักสูตรหรือชื่อย่อ..."
              class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>
        <div class="flex items-center space-x-2 text-sm text-gray-600">
          <span>พบ {{ filteredCurriculums.length }} รายการ</span>
        </div>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div class="flex items-center">
                  <HashtagIcon class="w-4 h-4 mr-1" />
                  ID
                </div>
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อหลักสูตร</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ชื่อย่อ</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สร้างเมื่อ</th>
              <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="curriculum in filteredCurriculums" :key="curriculum.cur_id" 
                class="hover:bg-gray-50 transition-colors">
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex items-center justify-center w-8 h-8 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium">
                  {{ curriculum.cur_id }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ curriculum.cur_name }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="inline-flex px-2 py-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full">
                  {{ curriculum.cur_shortname }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <div class="flex items-center">
                  <CalendarIcon class="w-4 h-4 mr-1" />
                  {{ formatDate(curriculum.created_at) }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <div class="flex items-center justify-center space-x-2">
                  <button
                    @click="editCurriculum(curriculum)"
                    class="inline-flex items-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                    title="แก้ไข"
                  >
                    <PencilIcon class="w-4 h-4" />
                  </button>
                  <button
                    @click="deleteCurriculum(curriculum.cur_id)"
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
      <div v-if="filteredCurriculums.length === 0" class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AcademicCapIcon class="w-8 h-8 text-gray-400" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">ไม่พบข้อมูลหลักสูตร</h3>
        <p class="text-gray-500 mb-4">ยังไม่มีข้อมูลหลักสูตรในระบบ หรือค้นหาไม่พบ</p>
        <button
          @click="showAddModal = true"
          class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
        >
          เพิ่มหลักสูตรแรก
        </button>
      </div>
    </div>

    <!-- ✅ แก้ไข: ใช้ Teleport เพื่อ render modal ออกไปที่ body โดยตรง -->
    <Teleport to="body">
      <transition name="modal">
        <div v-if="showAddModal || showEditModal" class="fixed inset-0 z-[9999] overflow-y-auto">
          <!-- Backdrop -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-[9998]"
            @click="closeModal"
          ></div>

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
                      {{ showAddModal ? 'เพิ่มหลักสูตรใหม่' : 'แก้ไขหลักสูตร' }}
                    </h3>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหลักสูตร</label>
                      <input
                        v-model="formData.cur_name"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="เช่น ประกาศนียบัตรวิชาชีพ"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อย่อ</label>
                      <input
                        v-model="formData.cur_shortname"
                        type="text"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        placeholder="เช่น ปวช"
                        required
                      />
                    </div>
                  </div>
                </div>

                <div class="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse gap-3">
                  <button
                    type="submit"
                    class="inline-flex justify-center rounded-lg border border-transparent shadow-sm px-4 py-2 bg-emerald-500 text-sm font-medium text-white hover:bg-emerald-600 transition-colors"
                  >
                    {{ showAddModal ? 'เพิ่มหลักสูตร' : 'บันทึกการแก้ไข' }}
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
  AcademicCapIcon,
  MagnifyingGlassIcon,
  HashtagIcon,
  CalendarIcon
} from '@heroicons/vue/24/outline'

interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
  created_at: string
}

const curriculums = ref<Curriculum[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')
const formData = ref({
  cur_id: 0,
  cur_name: '',
  cur_shortname: ''
})

const filteredCurriculums = computed(() => {
  if (!searchQuery.value) return curriculums.value
  const query = searchQuery.value.toLowerCase()
  return curriculums.value.filter(curriculum => 
    curriculum.cur_name.toLowerCase().includes(query) ||
    curriculum.cur_shortname.toLowerCase().includes(query)
  )
})

const fetchCurriculums = async () => {
  try {
    const mockData: Curriculum[] = [
      { cur_id: 1, cur_name: 'ประกาศนียบัตรวิชาชีพ', cur_shortname: 'ปวช', created_at: '2024-01-01T00:00:00Z' },
      { cur_id: 2, cur_name: 'ประกาศนียบัตรวิชาชีพชั้นสูง', cur_shortname: 'ปวส', created_at: '2024-01-01T00:00:00Z' }
    ]
    curriculums.value = mockData
  } catch (error) {
    console.error('Error fetching curriculums:', error)
  }
}

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      console.log('Adding curriculum:', formData.value)
    } else {
      console.log('Updating curriculum:', formData.value)
    }
    await fetchCurriculums()
    closeModal()
  } catch (error) {
    console.error('Error saving curriculum:', error)
  }
}

const editCurriculum = (curriculum: Curriculum) => {
  formData.value = { ...curriculum }
  showEditModal.value = true
}

const deleteCurriculum = async (id: number) => {
  if (confirm('คุณต้องการลบหลักสูตรนี้ใช่หรือไม่?')) {
    try {
      console.log('Deleting curriculum:', id)
      await fetchCurriculums()
    } catch (error) {
      console.error('Error deleting curriculum:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    cur_id: 0,
    cur_name: '',
    cur_shortname: ''
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

onMounted(() => {
  fetchCurriculums()
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