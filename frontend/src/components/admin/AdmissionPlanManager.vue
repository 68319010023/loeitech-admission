<template>
  <div>
    <div class="flex justify-between items-center mb-6">
      <h2 class="text-xl font-semibold text-gray-800">จัดการแผนรับสมัคร</h2>
      <button
        @click="showAddModal = true"
        class="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors"
      >
        <PlusIcon class="w-5 h-5 inline-block mr-1" />
        เพิ่มแผนรับสมัคร
      </button>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ปีการศึกษา</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">หลักสูตร</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สาขาวิชา</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จำนวนรับ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">สร้างเมื่อ</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">จัดการ</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="plan in admissionPlans" :key="plan.ap_id">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.ap_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.ap_years }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.curriculum?.cur_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.division?.div_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{{ plan.plan_num }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatDate(plan.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <button @click="editAdmissionPlan(plan)" class="text-emerald-600 hover:text-emerald-900 mr-3">
                <PencilIcon class="w-4 h-4" />
              </button>
              <button @click="deleteAdmissionPlan(plan.ap_id)" class="text-red-600 hover:text-red-900">
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
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="closeModal"
          ></div>

          <!-- Modal Container -->
          <div class="flex items-center justify-center min-h-screen px-4 py-8">
            <!-- Modal Panel -->
            <div class="relative bg-white rounded-lg text-left shadow-xl transform transition-all w-full sm:max-w-md z-[10000]">
              <form @submit.prevent="handleSubmit">
                <div class="bg-white px-6 pt-6 pb-4 rounded-t-lg">
                  <h3 class="text-lg font-bold text-gray-900 mb-4">
                    {{ showAddModal ? 'เพิ่มแผนรับสมัคร' : 'แก้ไขแผนรับสมัคร' }}
                  </h3>

                  <div class="space-y-4">
                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">ปีการศึกษา</label>
                      <input
                        v-model="formData.ap_years"
                        type="text"
                        placeholder="เช่น 2568"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      />
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">หลักสูตร</label>
                      <select
                        v-model="formData.cur_id"
                        @change="onCurriculumChange"
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
                      <label class="block text-gray-700 text-sm font-bold mb-2">สาขาวิชา</label>
                      <select
                        v-model="formData.div_id"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                        required
                      >
                        <option value="">เลือกสาขาวิชา</option>
                        <option v-for="division in filteredDivisions" :key="division.div_id" :value="division.div_id">
                          {{ division.div_name }}
                        </option>
                      </select>
                    </div>

                    <div>
                      <label class="block text-gray-700 text-sm font-bold mb-2">จำนวนที่เปิดรับสมัคร</label>
                      <input
                        v-model.number="formData.plan_num"
                        type="number"
                        min="1"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
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
import { ref, computed, onMounted } from 'vue'
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'

interface Curriculum {
  cur_id: number
  cur_name: string
  cur_shortname: string
}

interface Division {
  div_id: number
  div_name: string
  cur_id: number
}

interface AdmissionPlan {
  ap_id: number
  ap_years: string
  div_id: number
  cur_id: number
  plan_num: number
  curriculum?: Curriculum
  division?: Division
  created_at: string
}

const admissionPlans = ref<AdmissionPlan[]>([])
const curriculums = ref<Curriculum[]>([])
const divisions = ref<Division[]>([])
const showAddModal = ref(false)
const showEditModal = ref(false)
const formData = ref({
  ap_id: 0,
  ap_years: '',
  div_id: 0,
  cur_id: 0,
  plan_num: 0
})

const filteredDivisions = computed(() => {
  if (!formData.value.cur_id) return []
  return divisions.value.filter(division => division.cur_id === formData.value.cur_id)
})

const fetchAdmissionPlans = async () => {
  try {
    const mockData: AdmissionPlan[] = [
      { 
        ap_id: 1, 
        ap_years: '2568', 
        div_id: 1, 
        cur_id: 1, 
        plan_num: 40,
        curriculum: { cur_id: 1, cur_name: 'ประกาศนียบัตรวิชาชีพ', cur_shortname: 'ปวช' },
        division: { div_id: 1, div_name: 'คอมพิวเตอร์ธุรกิจ', cur_id: 1 },
        created_at: '2024-01-01T00:00:00Z' 
      }
    ]
    admissionPlans.value = mockData
  } catch (error) {
    console.error('Error fetching admission plans:', error)
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

const fetchDivisions = async () => {
  try {
    const mockData: Division[] = [
      { div_id: 1, div_name: 'คอมพิวเตอร์ธุรกิจ', cur_id: 1 },
      { div_id: 2, div_name: 'เทคโนโลยีสารสนเทศ', cur_id: 1 },
      { div_id: 3, div_name: 'ช่างไฟฟ้า', cur_id: 1 }
    ]
    divisions.value = mockData
  } catch (error) {
    console.error('Error fetching divisions:', error)
  }
}

const onCurriculumChange = () => {
  formData.value.div_id = 0
}

const handleSubmit = async () => {
  try {
    if (showAddModal.value) {
      console.log('Adding admission plan:', formData.value)
    } else {
      console.log('Updating admission plan:', formData.value)
    }
    await fetchAdmissionPlans()
    closeModal()
  } catch (error) {
    console.error('Error saving admission plan:', error)
  }
}

const editAdmissionPlan = (plan: AdmissionPlan) => {
  formData.value = { 
    ap_id: plan.ap_id,
    ap_years: plan.ap_years,
    div_id: plan.div_id,
    cur_id: plan.cur_id,
    plan_num: plan.plan_num
  }
  showEditModal.value = true
}

const deleteAdmissionPlan = async (id: number) => {
  if (confirm('คุณต้องการลบแผนรับสมัครนี้ใช่หรือไม่?')) {
    try {
      console.log('Deleting admission plan:', id)
      await fetchAdmissionPlans()
    } catch (error) {
      console.error('Error deleting admission plan:', error)
    }
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  formData.value = {
    ap_id: 0,
    ap_years: '',
    div_id: 0,
    cur_id: 0,
    plan_num: 0
  }
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH')
}

onMounted(() => {
  fetchCurriculums()
  fetchDivisions()
  fetchAdmissionPlans()
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