<template>
  <div class="bg-white shadow-lg border-b border-emerald-100">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 flex items-center">
            <div class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
              <User class="w-6 h-6 text-white" />
            </div>
            ข้อมูลผู้ใช้
          </h1>
          <p class="text-gray-600 mt-3 text-lg">เลือกและดาวน์โหลดข้อมูลนักเรียนในรูปแบบไฟล์</p>
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

  <div class="p-4 space-y-4">

    <!-- Header -->
    <div>
      <h1 class="text-xl font-bold text-gray-800">ส่งออกข้อมูล</h1>
      <p class="text-sm text-gray-400">วิทยาลัยเทคนิคเลย</p>
    </div>

    <p class="text-sm text-gray-500">เลือกประเภทข้อมูลและเลือกรายชื่อที่ต้องการส่งออก</p>

    <!-- เลือกประเภท -->
    <div class="flex gap-2 flex-wrap">
      <button
        v-for="item in exportItems"
        :key="item.type"
        @click="selectedExportType = item.type; selectedIds = []"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition',
          selectedExportType === item.type
            ? 'bg-green-500 text-white border-green-500'
            : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
        ]"
      >
        <component :is="item.icon" class="w-4 h-4" />
        {{ item.label }}
      </button>
    </div>

    <!-- แถวค้นหา + กรองหลักสูตร + กรองสาขา -->
    <div class="flex flex-col sm:flex-row gap-2">

      <!-- ค้นหาชื่อ -->
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="exportSearch"
          type="text"
          placeholder="ค้นหาชื่อ-สกุล..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none"
        />
      </div>

      <!-- กรองหลักสูตร ปวช/ปวส -->
      <div class="relative">
        <select
          v-model="selectedCurFilter"
          class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[120px] text-gray-700"
        >
          <option value="">ทุกหลักสูตร</option>
          <option value="ปวช">ปวช</option>
          <option value="ปวส">ปวส</option>
        </select>
        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      <!-- กรองสาขาวิชา -->
      <div class="relative">
        <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <select
          v-model="selectedBranch"
          class="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px] text-gray-700"
        >
          <option value="">ทุกสาขาวิชา</option>
          <option v-for="b in allBranches" :key="b" :value="b">{{ b }}</option>
        </select>
        <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
      </div>

      <!-- ปุ่มล้าง filter -->
      <button
        v-if="exportSearch || selectedBranch || selectedCurFilter"
        @click="exportSearch = ''; selectedBranch = ''; selectedCurFilter = ''"
        class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition whitespace-nowrap"
      >
        <X class="w-3.5 h-3.5" /> ล้าง
      </button>
    </div>

    <!-- Badge แสดงสาขาที่กำลัง filter -->
    <div v-if="selectedBranch || selectedCurFilter" class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-gray-400">กรองโดย:</span>
      <span v-if="selectedCurFilter" class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
        {{ selectedCurFilter }}
        <button @click="selectedCurFilter = ''" class="hover:text-blue-900">
          <X class="w-3 h-3" />
        </button>
      </span>
      <span v-if="selectedBranch" class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
        สาขา: {{ selectedBranch }}
        <button @click="selectedBranch = ''" class="hover:text-green-900">
          <X class="w-3 h-3" />
        </button>
      </span>
      <span class="text-xs text-gray-400">พบ {{ filteredExportData.length }} รายการ</span>
    </div>

    <!-- Loading -->
    <div v-if="isLoading" class="text-center py-12 text-gray-400">
      <div class="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-sm">กำลังโหลดข้อมูล...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-400 text-sm">{{ error }}</p>
      <button @click="fetchApplicants" class="mt-2 text-sm text-green-600 underline">ลองใหม่</button>
    </div>

    <!-- ตาราง -->
    <div v-else class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <table class="w-full text-sm">
        <thead class="bg-gray-50 text-gray-500">
          <tr>
            <th class="px-4 py-3 text-center w-10">
              <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
            </th>
            <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
            <th class="px-4 py-3 text-left">หลักสูตร</th>
            <th class="px-4 py-3 text-left">สาขา</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr
            v-for="row in filteredExportData"
            :key="row.ลำดับ"
            :class="['hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']"
          >
            <td class="px-4 py-3 text-center">
              <input type="checkbox" :value="row.ลำดับ" v-model="selectedIds" />
            </td>
            <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
            <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                {{ row.สาขาวิชา }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredExportData.length === 0">
            <td colspan="4" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ปุ่ม Export -->
    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-400">
        เลือกแล้ว <span class="font-semibold text-green-600">{{ selectedIds.length }}</span> รายการ
      </p>
      <div class="flex gap-2">
        <button
          @click="exportSelected"
          :disabled="selectedIds.length === 0"
          class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
        >
          <Download class="w-4 h-4" /> Export ที่เลือก
        </button>
        <button
          @click="exportAll"
          class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl text-sm font-semibold transition"
        >
          <Download class="w-4 h-4" /> Export ทั้งหมด
        </button>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/utils/api'
import {
  Download, CreditCard, ShoppingBag,
  Users, Search, Filter, ChevronDown, X, User,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'

const exportItems = [
  { label: 'ประวัตินักเรียน', icon: Users, type: 'students' },
  { label: 'การชำระค่าการศึกษา', icon: CreditCard, type: 'payments' },
  { label: 'การสั่งซื้อเครื่องแบบ', icon: ShoppingBag, type: 'orders' },
]

// ─── State ───────────────────────────────────────────────────
const applicants         = ref<any[]>([])
const isLoading          = ref(false)
const error              = ref('')
const selectedExportType = ref('students')
const exportSearch       = ref('')
const selectedBranch     = ref('')
const selectedCurFilter  = ref('')
const selectedIds        = ref<string[]>([])

// ─── Fetch ───────────────────────────────────────────────────
const fetchApplicants = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await apiService.getApplicants()
    if (!res.success) throw new Error(res.message)
    applicants.value = res.data
  } catch (e: any) {
    error.value = e.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchApplicants())

// ─── Computed ─────────────────────────────────────────────────
const currentData = computed(() =>
  applicants.value.map(a => {
    const base = {
      ลำดับ:        a.app_id,
      คำนำหน้า:     a.prefix,
      ชื่อ_นามสกุล: a.full_name,
      หลักสูตร:     a.curriculum.cur_shortname,
      สาขาวิชา:     a.division.div_name,
    }
    if (selectedExportType.value === 'students') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        เบอร์โทร:       a.phone,
        อีเมล:          a.email,
        สถานะ:          a.status,
        วันที่สมัคร:    new Date(a.created_at).toLocaleDateString('th-TH'),
      }
    }
    if (selectedExportType.value === 'payments') {
      return {
        ...base,
        ยอดชำระ:               a.payment?.total_amount ?? '-',
        วันที่ชำระ:             a.payment?.paid_at
                                  ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
                                  : 'ยังไม่ชำระ',
        หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
      }
    }
    return {
      ...base,
      ยอดชำระ:               a.payment?.total_amount ?? '-',
      หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
    }
  })
)

const allBranches = computed(() => {
  const set = new Set(currentData.value.map(r => r.สาขาวิชา))
  return [...set].sort()
})

const filteredExportData = computed(() =>
  currentData.value.filter(row => {
    const fullDisplay = row.คำนำหน้า + row.ชื่อ_นามสกุล
    const matchName   = !exportSearch.value      || fullDisplay.includes(exportSearch.value)
    const matchBranch = !selectedBranch.value    || row.สาขาวิชา === selectedBranch.value
    const matchCur    = !selectedCurFilter.value || row.หลักสูตร.includes(selectedCurFilter.value)
    return matchName && matchBranch && matchCur
  })
)

const isAllSelected = computed(() =>
  filteredExportData.value.length > 0 &&
  filteredExportData.value.every(r => selectedIds.value.includes(r.ลำดับ))
)

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredExportData.value.map(r => r.ลำดับ)
  }
}

// ─── Export ──────────────────────────────────────────────────
const doExport = (data: object[]) => {
  const sheetNames: Record<string, string> = {
    students: 'ข้อมูลนักเรียน',
    payments: 'การชำระเงิน',
    orders:   'การสั่งซื้อ',
  }
  const fileNames: Record<string, string> = {
    students: 'students_export.xlsx',
    payments: 'payments_export.xlsx',
    orders:   'orders_export.xlsx',
  }
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetNames[selectedExportType.value])
  XLSX.writeFile(wb, fileNames[selectedExportType.value])
}

const exportSelected = () => {
  const data = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  doExport(data)
}

const exportAll = () => doExport(filteredExportData.value)
</script>