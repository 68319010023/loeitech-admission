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
    <div>
      <h1 class="text-xl font-bold text-gray-800">ส่งออกข้อมูล</h1>
      <p class="text-sm text-gray-400">วิทยาลัยเทคนิคเลย</p>
    </div>

    <p class="text-sm text-gray-500">เลือกประเภทข้อมูลและเลือกรายชื่อที่ต้องการส่งออก</p>

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

    <div class="flex flex-col sm:flex-row gap-2">
      <div class="relative flex-1">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          v-model="exportSearch"
          type="text"
          placeholder="ค้นหาชื่อ-สกุล..."
          class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none"
        />
      </div>
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
      <button
        v-if="exportSearch || selectedBranch || selectedCurFilter"
        @click="exportSearch = ''; selectedBranch = ''; selectedCurFilter = ''"
        class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition whitespace-nowrap"
      >
        <X class="w-3.5 h-3.5" /> ล้าง
      </button>
    </div>

    <div v-if="selectedBranch || selectedCurFilter" class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-gray-400">กรองโดย:</span>
      <span v-if="selectedCurFilter" class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
        {{ selectedCurFilter }}
        <button @click="selectedCurFilter = ''" class="hover:text-blue-900"><X class="w-3 h-3" /></button>
      </span>
      <span v-if="selectedBranch" class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
        สาขา: {{ selectedBranch }}
        <button @click="selectedBranch = ''" class="hover:text-green-900"><X class="w-3 h-3" /></button>
      </span>
      <span class="text-xs text-gray-400">พบ {{ filteredExportData.length }} รายการ</span>
    </div>

    <div v-if="isLoading" class="text-center py-12 text-gray-400">
      <div class="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2"></div>
      <p class="text-sm">กำลังโหลดข้อมูล...</p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-red-400 text-sm">{{ error }}</p>
      <button @click="fetchApplicants" class="mt-2 text-sm text-green-600 underline">ลองใหม่</button>
    </div>

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
            <th v-if="selectedExportType === 'payments'" class="px-4 py-3 text-left">สถานะการชำระเงิน</th>
            <th v-if="selectedExportType === 'students'" class="px-4 py-3 text-center">ดูเอกสาร</th>
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
            <td class="px-4 py-3 text-gray-800">
                {{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}
            </td>
            <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
            <td class="px-4 py-3">
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                {{ row.สาขาวิชา }}
              </span>
            </td>
            <td v-if="selectedExportType === 'payments'" class="px-4 py-3">
              <span 
                :class="[
                  'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                  row.วันที่ชำระ === 'ยังไม่ชำระ' 
                    ? 'bg-red-50 text-red-700' 
                    : 'bg-green-50 text-green-700'
                ]"
              >
                {{ row.วันที่ชำระ === 'ยังไม่ชำระ' ? 'ยังไม่ชำระ' : 'ชำระแล้ว' }}
              </span>
            </td>
            <td v-if="selectedExportType === 'students'" class="px-4 py-3 text-center">
              <button
                @click="showDocuments(row.ลำดับ)"
                class="inline-flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                title="คลิกเพื่อดูเอกสารทั้งหมด"
              >
                <Eye class="w-4 h-4" />
                ดูเอกสาร
              </button>
            </td>
          </tr>
          <tr v-if="filteredExportData.length === 0">
            <td :colspan="getColumnCount()" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="ocrProgress.running" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">กำลังอ่านบัตรประชาชน...</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ ocrProgress.current }} / {{ ocrProgress.total }} รายการ</p>
          </div>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div
            class="bg-green-500 h-2 rounded-full transition-all"
            :style="{ width: ocrProgress.total > 0 ? (ocrProgress.current / ocrProgress.total * 100) + '%' : '0%' }"
          ></div>
        </div>
        <p class="text-xs text-gray-400 text-center">{{ ocrProgress.name }}</p>
      </div>
    </div>

    <div class="flex items-center justify-between">
      <p class="text-sm text-gray-400">
        เลือกแล้ว <span class="font-semibold text-green-600">{{ selectedIds.length }}</span> รายการ
      </p>
      <div class="flex gap-2">
        <button
          @click="exportSelected"
          :disabled="selectedIds.length === 0 || ocrProgress.running"
          class="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
        >
          <Download class="w-4 h-4" /> Export ที่เลือก
        </button>
        <button
          @click="exportAll"
          :disabled="ocrProgress.running"
          class="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
        >
          <Download class="w-4 h-4" /> Export ทั้งหมด
        </button>
      </div>
    </div>

    <div v-if="showDocumentsModal" class="fixed inset-0 bg-gray-500/50 flex items-center justify-center z-50">
      <div class="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] overflow-hidden">
        <div class="border-b border-gray-200 px-6 py-4">
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold text-gray-900">เอกสารทั้งหมดของผู้สมัคร</h3>
            <button 
              @click="closeDocumentsModal"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div class="px-6 py-4">
          <div class="mb-4 p-4 bg-gray-50 rounded-lg">
            <p class="text-sm font-medium text-gray-900">
              {{ selectedApplicant?.prefix }} {{ selectedApplicant?.full_name }}
            </p>
            <p class="text-xs text-gray-500">
              เลขบัตรประชาชน: {{ selectedApplicant?.id_card_number }}
            </p>
          </div>
          
          <div v-if="documentsLoading" class="text-center py-8">
            <div class="inline-block w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin mb-2"></div>
            <p class="text-sm text-gray-400">กำลังโหลดเอกสาร...</p>
          </div>
          
          <div v-else-if="documentsError" class="text-center py-8">
            <p class="text-sm text-red-400">{{ documentsError }}</p>
            <button 
              @click="loadDocuments(selectedApplicantId)"
              class="mt-2 text-sm text-blue-600 hover:text-blue-800"
            >
              ลองใหม่
            </button>
          </div>
          
          <div v-else class="space-y-3 max-h-[50vh] overflow-y-auto">
            <div 
              v-for="doc in documents" 
              :key="doc.doc_id"
              class="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div class="flex-1">
                <p class="text-sm font-medium text-gray-900">{{ getDocumentTypeName(doc.doc_type) }}</p>
                <p class="text-xs text-gray-400">
                  ขนาด: {{ formatFileSize(doc.file_size) }} • 
                  อัพโหลดเมื่อ: {{ formatDate(doc.uploaded_at) }}
                </p>
              </div>
              <div class="flex items-center gap-2">
                <button
                  @click="viewDocument(doc)"
                  class="flex items-center gap-2 px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                  title="คลิกเพื่อดูเอกสาร"
                >
                  <Eye class="w-4 h-4" />
                  ดู
                </button>
                <button
                  @click="downloadDocument(doc)"
                  :disabled="downloadingDocs.includes(doc.doc_id)"
                  class="flex items-center gap-2 px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-lg text-sm font-medium transition-colors"
                  title="คลิกเพื่อดาวน์โหลดเอกสาร"
                >
                  <div v-if="downloadingDocs.includes(doc.doc_id)" class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <Download v-else class="w-4 h-4" />
                  {{ downloadingDocs.includes(doc.doc_id) ? 'กำลังดาวน์โหลด...' : 'ดาวน์โหลด' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { apiService } from '@/utils/api'
import {
  Download, CreditCard, ShoppingBag,
  Users, Search, Filter, ChevronDown, X, User, Eye,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'

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

// State สำหรับ modal เอกสาร
const showDocumentsModal = ref(false)
const selectedApplicantId = ref('')
const selectedApplicant = ref<any>(null)
const documents = ref<any[]>([])
const documentsLoading = ref(false)
const documentsError = ref('')
const downloadingDocs = ref<string[]>([])

// OCR progress
const ocrProgress = ref({
  running: false,
  current: 0,
  total: 0,
  name: '',
})

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
      ลำดับ:         a.app_id,
      คำนำหน้า:      a.prefix,
      ชื่อ_นามสกุล: a.full_name,
      หลักสูตร:      a.curriculum.cur_shortname,
      สาขาวิชา:      a.division.div_name,
    }
    if (selectedExportType.value === 'students') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        เบอร์โทร:       a.phone,
        อีเมล:           a.email,
        สถานะ:           a.status,
        วันที่สมัคร:     new Date(a.created_at).toLocaleDateString('th-TH'),
        _idFrontUrl:    a.id_front_url ?? '',
      }
    }
    if (selectedExportType.value === 'payments') {
      const isPaid = a.status === 'paid' || a.status === 'enrolled';
      return {
        ...base,
        ยอดชำระ:                a.payment?.total_amount ?? '-',
        วันที่ชำระ:              isPaid
                                  ? (a.payment?.paid_at 
                                     ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
                                     : new Date(a.updated_at).toLocaleDateString('th-TH'))
                                  : 'ยังไม่ชำระ',
        หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
        _idFrontUrl:             a.id_front_url ?? '',
      }
    }
    return {
      ...base,
      ยอดชำระ:                a.payment?.total_amount ?? '-',
      หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
      _idFrontUrl:             a.id_front_url ?? '',
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

// ─── OCR ─────────────────────────────────────────────────────

async function runOCRFromUrl(imageUrl: string): Promise<Record<string, string>> {
  if (!imageUrl) return {}
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'tha+eng', {
      logger: () => {}
    })
    return parseThaiIDText(text)
  } catch {
    return {}
  }
}

function parseThaiIDText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}
  const idMatch = text.replace(/[\s\-]/g, '').match(/\d{13}/)
  if (idMatch) result['OCR_เลขบัตร'] = idMatch[0]
  const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Mrs.', 'Miss']
  for (const line of lines) {
    for (const prefix of prefixes) {
      if (line.startsWith(prefix)) {
        result['OCR_คำนำหน้า'] = prefix
        result['OCR_ชื่อ_นามสกุล'] = line.slice(prefix.length).trim()
        break
      }
    }
    if (result['OCR_คำนำหน้า']) break
  }
  return result
}

// ─── Export ──────────────────────────────────────────────────

const sheetNames: Record<string, string> = {
  students: 'ประวัตินักเรียน',
  payments: 'การชำระค่าการศึกษา',
  orders:   'การสั่งซื้อเครื่องแบบ',
}
const fileNames: Record<string, string> = {
  students: 'ประวัตินักเรียน.xlsx',
  payments: 'การชำระค่าการศึกษา.xlsx',
  orders:   'การสั่งซื้อเครื่องแบบ.xlsx',
}

async function buildExportData(rows: any[]): Promise<object[]> {
  ocrProgress.value = { running: true, current: 0, total: rows.length, name: '' }
  const result: object[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    ocrProgress.value.current = i + 1
    ocrProgress.value.name = `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`
    const ocrData = await runOCRFromUrl(row._idFrontUrl || '')
    const cleanRow = Object.fromEntries(
      Object.entries(row).filter(([key]) => !key.startsWith('_'))
    )
    result.push({ ...cleanRow, ...ocrData })
  }
  ocrProgress.value.running = false
  return result
}

function createFormattedWorksheet(data: any[], exportType: string) {
  if (exportType === 'students') return createStudentWorksheet(data)
  if (exportType === 'payments') return createPaymentWorksheet(data)
  if (exportType === 'orders') return createOrderWorksheet(data)
  return XLSX.utils.json_to_sheet(data)
}

function createStudentWorksheet(data: any[]) {
  const headers = [['ประวัตินักเรียน'], ['ลำดับ', 'คำนำหน้า', 'ชื่อ-นามสกุล', 'เลขบัตรประชาชน', 'เบอร์โทร', 'อีเมล', 'หลักสูตร', 'สาขาวิชา', 'สถานะ', 'วันที่สมัคร']]
  const formattedData = data.map(row => [row.ลำดับ || '-', row.คำนำหน้า || '-', row.ชื่อ_นามสกุล || '-', row.เลขบัตรประชาชน || row.OCR_เลขบัตร || '-', row.เบอร์โทร || '-', row.อีเมล || '-', row.หลักสูตร || '-', row.สาขาวิชา || '-', row.สถานะ || '-', row.วันที่สมัคร || '-'])
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...formattedData])
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]
  ws['!cols'] = [{ wch: 8 }, { wch: 12 }, { wch: 25 }, { wch: 20 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 }]
  return ws
}

function createPaymentWorksheet(data: any[]) {
  const headers = [['ข้อมูลผู้สมัคร', '', '', '', 'รายละเอียดการชำระ', '', '', ''], ['ลำดับ', 'ชื่อ-นามสกุล', 'หลักสูตร', 'สาขาวิชา', 'ยอดชำระ (บาท)', 'วันที่ชำระ', 'ช่องทาง', 'เลขที่ใบเสร็จ']]
  const formattedData = data.map(row => [row.ลำดับ || '-', (row.คำนำหน้า || '') + (row.ชื่อ_นามสกุล || ''), row.หลักสูตร || '-', row.สาขาวิชา || '-', row.ยอดชำระ === '-' ? '-' : (row.ยอดชำระ || 0), row.วันที่ชำระ || 'ยังไม่ชำระ', '-', row.หลักฐานการชำระ_ใบเสร็จ || '-'])
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...formattedData])
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }, { s: { r: 0, c: 4 }, e: { r: 0, c: 7 } }]
  ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 20 }]
  return ws
}

function createOrderWorksheet(data: any[]) {
  const headers = [['การสั่งซื้อเครื่องแบบ'], ['ลำดับ', 'ชื่อ-นามสกุล', 'หลักสูตร', 'สาขาวิชา', 'เสื้อ (ตัว)', 'กางเกง/กระโปรง', 'ไซส์เสื้อ', 'ยอดรวม (บาท)', 'สถานะชำระ', 'สถานะจัดส่ง']]
  const formattedData = data.map(row => [row.ลำดับ || '-', (row.คำนำหน้า || '') + (row.ชื่อ_นามสกุล || ''), row.หลักสูตร || '-', row.สาขาวิชา || '-', '-', '-', '-', row.ยอดชำระ === '-' ? '-' : (row.ยอดชำระ || 0), row.วันที่ชำระ === 'ยังไม่ชำระ' ? 'ยังไม่ชำระ' : 'ชำระแล้ว', '-'])
  const ws = XLSX.utils.aoa_to_sheet([...headers, ...formattedData])
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }]
  ws['!cols'] = [{ wch: 8 }, { wch: 25 }, { wch: 10 }, { wch: 20 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 12 }, { wch: 12 }]
  return ws
}

async function doExport(rows: any[]) {
  const data = await buildExportData(rows)
  const ws = createFormattedWorksheet(data, selectedExportType.value)
  const wb = XLSX.utils.book_new()
  const exportType = selectedExportType.value || 'students'
  XLSX.utils.book_append_sheet(wb, ws, sheetNames[exportType])
  XLSX.writeFile(wb, fileNames[exportType])
}

const exportSelected = async () => {
  const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  await doExport(rows)
}

const exportAll = async () => {
  await doExport(filteredExportData.value)
}

// ─── Documents Functions ─────────────────────────────────────
const showDocuments = async (appId: string) => {
  selectedApplicantId.value = appId
  const applicantExists = applicants.value.find(a => a.app_id === appId)
  selectedApplicant.value = applicantExists || null
  showDocumentsModal.value = true
  await loadDocuments(appId)
}

const closeDocumentsModal = () => {
  showDocumentsModal.value = false
  selectedApplicantId.value = ''
  selectedApplicant.value = null
  documents.value = []
  documentsError.value = ''
}

const loadDocuments = async (appId: string) => {
  documentsLoading.value = true
  documentsError.value = ''
  try {
    const res = await apiService.getApplicantDocuments(appId)
    if (res.success) {
      documents.value = res.data.documents
      selectedApplicant.value = res.data.applicant
    } else {
      documentsError.value = res.message || 'ไม่สามารถโหลดเอกสารได้'
    }
  } catch (error: any) {
    documentsError.value = error.message || 'เกิดข้อผิดพลาดในการโหลดเอกสาร'
  } finally {
    documentsLoading.value = false
  }
}

const getDocumentTypeName = (docType: string) => {
  const typeNames: Record<string, string> = {
    'id_front': 'บัตรประชาชนด้านหน้า',
    'id_back': 'บัตรประชาชนด้านหลัง',
    'certificate_front': 'ใบรับรองด้านหน้า',
    'certificate_back': 'ใบรับรองด้านหลัง',
    'payment_slip': 'หลักฐานการชำระเงิน'
  }
  return typeNames[docType] || docType
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '-'
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
}

const formatDate = (dateString: string) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
}

const viewDocument = (doc: any) => window.open(doc.file_url, '_blank')

const downloadDocument = async (doc: any) => {
  downloadingDocs.value.push(doc.doc_id)
  try {
    const response = await fetch(doc.file_url)
    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = doc.file_name || 'document.jpg'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (error) {
    window.open(doc.file_url, '_blank')
  } finally {
    const index = downloadingDocs.value.indexOf(doc.doc_id)
    if (index > -1) downloadingDocs.value.splice(index, 1)
  }
}

const getColumnCount = () => {
  let count = 4
  if (selectedExportType.value === 'payments') count += 1
  if (selectedExportType.value === 'students') count += 1
  return count
}
</script>