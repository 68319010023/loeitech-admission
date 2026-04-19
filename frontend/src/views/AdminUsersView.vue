<template>
  <div class="bg-white shadow-lg border-b border-emerald-100">
    <div class="max-w-7xl mx-auto px-6 py-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-4xl font-bold text-gray-900 flex items-center">
            <div
              class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
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

 <div class="p-4 space-y-4 ">

    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
  
  <!-- Row 1: ชื่อ + ปุ่ม Export -->
  <div class="flex items-center justify-between flex-wrap gap-3">
    <div>
      <h1 class="text-xl font-bold text-gray-800">ส่งออกข้อมูล</h1>
      <p class="text-sm text-gray-400">วิทยาลัยเทคนิคเลย</p>
    </div>

    <div class="flex items-center gap-2 flex-wrap">
      <!-- จำนวนที่เลือก -->
      <div class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
        <div class="w-2 h-2 bg-green-500 rounded-full"></div>
        <span class="text-sm text-green-700 font-semibold">{{ selectedIds.length }} รายการ</span>
      </div>

      <button
        v-if="selectedExportType === 'students'"
        @click="exportPDF"
        :disabled="selectedIds.length === 0 || ocrProgress.running"
        class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
               bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md shadow-red-200
               hover:shadow-lg hover:shadow-red-300 hover:-translate-y-0.5
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
        <Download class="w-4 h-4 group-hover:animate-bounce" />
        Export PDF
      </button>

      <button
        @click="exportSelected"
        :disabled="selectedIds.length === 0 || ocrProgress.running"
        class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
               bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
               hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
        <Download class="w-4 h-4 group-hover:animate-bounce" />
        Export ที่เลือก
      </button>

      <button
        @click="exportAll"
        :disabled="ocrProgress.running"
        class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
               bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
               hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
               disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
        <Download class="w-4 h-4 group-hover:animate-bounce" />
        Export ทั้งหมด
      </button>
    </div>
  </div>

  <!-- Row 2: ประเภท -->
  <p class="text-sm text-gray-500">เลือกประเภทข้อมูลและเลือกรายชื่อที่ต้องการส่งออก</p>
  <div class="flex gap-2 flex-wrap">
    <button v-for="item in exportItems" :key="item.type" @click="selectedExportType = item.type; selectedIds = []"
      :class="[
        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition',
        selectedExportType === item.type
          ? 'bg-green-500 text-white border-green-500'
          : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
      ]">
      <component :is="item.icon" class="w-4 h-4" />
      {{ item.label }}
    </button>
  </div>
  <div class="flex flex-col sm:flex-row gap-2">
    <div class="relative flex-1">
      <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <input v-model="exportSearch" type="text" placeholder="ค้นหาชื่อ-สกุล..."
        class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
    </div>
    <div class="relative">
      <select v-model="selectedCurFilter"
        class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[120px] text-gray-700">
        <option value="">ทุกหลักสูตร</option>
        <option value="ปวช">ปวช</option>
        <option value="ปวส">ปวส</option>
      </select>
      <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
    <div class="relative">
      <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
      <select v-model="selectedBranch"
        class="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px] text-gray-700">
        <option value="">ทุกสาขาวิชา</option>
        <option v-for="b in allBranches" :key="b" :value="b">{{ b }}</option>
      </select>
      <ChevronDown class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
    <button v-if="exportSearch || selectedBranch || selectedCurFilter"
      @click="exportSearch = ''; selectedBranch = ''; selectedCurFilter = ''"
      class="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-sm font-semibold bg-gray-100 text-gray-500 hover:bg-gray-200 transition whitespace-nowrap">
      <X class="w-3.5 h-3.5" /> ล้าง
    </button>
  </div>

</div>

    <!-- Badge filter -->
    <div v-if="selectedBranch || selectedCurFilter" class="flex items-center gap-2 flex-wrap">
      <span class="text-xs text-gray-400">กรองโดย:</span>
      <span v-if="selectedCurFilter"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
        {{ selectedCurFilter }}
        <button @click="selectedCurFilter = ''" class="hover:text-blue-900">
          <X class="w-3 h-3" />
        </button>
      </span>
      <span v-if="selectedBranch"
        class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
        สาขา: {{ selectedBranch }}
        <button @click="selectedBranch = ''" class="hover:text-green-900">
          <X class="w-3 h-3" />
        </button>
      </span>
      <span class="text-xs text-gray-400">พบ {{ filteredExportData.length }} รายการ</span>
    </div>

    <!-- Loading fetch -->
    <div v-if="isLoading" class="text-center py-12 text-gray-400">
      <div class="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2">
      </div>
      <p class="text-sm">กำลังโหลดข้อมูล...</p>
    </div>

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
            <th v-if="selectedExportType === 'payments' || selectedExportType === 'orders'"
              class="px-4 py-3 text-center">สถานะ</th>
            <th v-if="selectedExportType === 'payments' || selectedExportType === 'orders'"
              class="px-4 py-3 text-center">สลิป</th>
            <th v-if="selectedExportType === 'students'" class="px-4 py-3 text-center">เอกสาร</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-50">
          <tr v-for="row in paginatedData" :key="row.ลำดับ"
            :class="['hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']">
            <td class="px-4 py-3 text-center">
              <input type="checkbox" :value="row.ลำดับ" v-model="selectedIds" />
            </td>
            <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
            <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
            <td class="px-4 py-3">
              <span
                class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                {{ row.สาขาวิชา }}
              </span>
            </td>
            <!-- ✅ สถานะชำระ -->
            <td v-if="selectedExportType === 'payments' || selectedExportType === 'orders'"
              class="px-4 py-3 text-center">
              <span :class="[
                'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                row._isPaid
                  ? 'bg-green-50 text-green-700 border border-green-200'
                  : 'bg-red-50 text-red-500 border border-red-200'
              ]">
                {{ row._isPaid ? '✓ ชำระแล้ว' : '✗ ยังไม่ชำระ' }}
              </span>
            </td>
            <!-- ✅ ปุ่มดูสลิป -->
            <td v-if="selectedExportType === 'payments' || selectedExportType === 'orders'"
              class="px-4 py-3 text-center">
              <button v-if="row._slipUrl"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition">
                <Eye class="w-3.5 h-3.5" /> ดูสลิป
              </button>
              <span v-else class="text-xs text-gray-300">-</span>
            </td>
            <!-- ✅ ปุ่มดูรูป -->
            <td v-if="selectedExportType === 'students'" class="px-4 py-3 text-center">
              <button @click="openDocModal(row)"
                class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition">
                <Eye class="w-3.5 h-3.5" /> ดูรูป
              </button>
            </td>
          </tr>
          <tr v-if="filteredExportData.length === 0">
            <td :colspan="selectedExportType === 'students' ? 5 : selectedExportType === 'payments' ? 6 : 4"
              class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- ✅ Document Modal -->
    <Teleport to="body">
      <div v-if="docModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="docModal.open = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col"
          style="max-height: 90vh">

          <!-- Header -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <p class="font-bold text-gray-800 text-base">{{ docModal.name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">เอกสารที่อัพโหลด {{ docModal.documents.length }} รายการ</p>
            </div>
            <button @click="docModal.open = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>

          <!-- Body: sidebar + image -->
          <div class="flex flex-1 overflow-hidden">

            <!-- Sidebar Tabs -->
            <div class="w-36 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-gray-50">
              <button v-for="doc in docModal.documents" :key="doc.doc_type"
                @click="docModal.activeTab = doc.doc_type; docModal.imgError = false" :class="[
                  'w-full flex flex-col items-center gap-1.5 px-2 py-3 text-center transition border-l-2',
                  docModal.activeTab === doc.doc_type
                    ? 'text-blue-600 border-blue-500 bg-white font-semibold'
                    : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100'
                ]">
                <span class="text-2xl">{{ docTypeIcon(doc.doc_type) }}</span>
                <span class="text-xs leading-tight">{{ docTypeShortLabel(doc.doc_type) }}</span>
              </button>
            </div>

            <!-- Image Area -->
            <div class="flex-1 flex items-center justify-center bg-gray-50 p-4 overflow-auto">
              <div v-if="docModal.imgLoading" class="flex flex-col items-center gap-3 text-gray-400">
                <div class="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm">กำลังโหลด...</p>
              </div>
              <template v-else-if="currentDocUrl && !docModal.imgError">
                <img :src="currentDocUrl" class="max-w-full max-h-full rounded-xl object-contain shadow-md"
                  style="max-height: 60vh" @error="docModal.imgError = true" />
              </template>
              <div v-else-if="docModal.imgError" class="flex flex-col items-center gap-2 text-gray-400">
                <span class="text-4xl">🖼️</span>
                <p class="text-sm">ไม่สามารถโหลดรูปได้</p>
              </div>
              <p v-else class="text-gray-400 text-sm">ไม่มีเอกสาร</p>
            </div>

          </div>
          <!-- Footer -->
          <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <p class="text-xs text-gray-400 flex items-center gap-1.5">
              <span>{{ docTypeIcon(docModal.activeTab) }}</span>
              <span>{{ docTypeShortLabel(docModal.activeTab) }}</span>
            </p>
            <div class="flex gap-2">
              <button @click="docModal.open = false"
                class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-xl transition font-semibold">
                ปิด
              </button>
              <button @click="openInNewTab"
                class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
                <ExternalLink class="w-4 h-4" /> เปิดในแท็บใหม่
              </button>
            </div>
          </div>

        </div>
      </div>
    </Teleport>

<!-- Pagination -->
<div v-if="totalPages > 1" class="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-2">
  <p class="text-xs text-gray-400">
   แสดง 
<span class="font-semibold text-green-600">{{ (currentPage - 1) * pageSize + 1 }}</span>
<span class="text-gray-300 mx-0.5">—</span>
<span class="font-semibold text-green-600">{{ Math.min(currentPage * pageSize, filteredExportData.length) }}</span>
จาก
<span class="font-semibold text-gray-700">{{ filteredExportData.length }}</span> รายการ
  </p>
  <div class="flex items-center gap-1">
    <button @click="currentPage = 1" :disabled="currentPage === 1"
      class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">
      «
    </button>
    <button @click="currentPage--" :disabled="currentPage === 1"
      class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">
      ‹
    </button>

    <template v-for="p in totalPages" :key="p">
      <button
        v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
        @click="currentPage = p"
        :class="[
          'w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150',
          currentPage === p
            ? 'bg-green-500 text-white shadow-sm shadow-green-200'
            : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
        ]">
        {{ p }}
      </button>
      <span
        v-else-if="p === currentPage - 2 || p === currentPage + 2"
        class="w-6 text-center text-gray-300 text-xs select-none">
        ···
      </span>
    </template>

    <button @click="currentPage++" :disabled="currentPage === totalPages"
      class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">
      ›
    </button>
    <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
      class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">
      »
    </button>
  </div>
</div>


    <Teleport to="body">
      <div v-if="slipModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="slipModal.open = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col"
          style="max-height: 90vh">
          <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
            <div>
              <p class="font-bold text-gray-800 text-base">สลิปการชำระเงิน</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ slipModal.name }}</p>
            </div>
            <button @click="slipModal.open = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
              <X class="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div class="flex-1 flex items-center justify-center p-4 bg-gray-50 overflow-auto">
            <img :src="slipModal.slipUrl" class="max-w-full rounded-xl object-contain shadow-md"
              style="max-height: 65vh" />
          </div>
          <div class="flex justify-end gap-2 px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
            <button @click="slipModal.open = false"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-xl font-semibold transition">ปิด</button>
            <button @click="() => window.open(slipModal.slipUrl, '_blank')"
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
              <ExternalLink class="w-4 h-4" /> เปิดในแท็บใหม่
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- OCR Progress Modal -->
    <div v-if="ocrProgress.running" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div class="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0">
          </div>
          <div>
            <p class="font-semibold text-gray-800 text-sm">กำลังอ่านบัตรประชาชน...</p>
            <p class="text-xs text-gray-400 mt-0.5">{{ ocrProgress.current }} / {{ ocrProgress.total }} รายการ</p>
          </div>
        </div>
        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-green-500 h-2 rounded-full transition-all"
            :style="{ width: ocrProgress.total > 0 ? (ocrProgress.current / ocrProgress.total * 100) + '%' : '0%' }">
          </div>
        </div>
        <p class="text-xs text-gray-400 text-center">{{ ocrProgress.name }}</p>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { apiService } from '@/utils/api'

const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3001'
const resolveUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const token = localStorage.getItem('auth_token')
  const sep = path.includes('?') ? '&' : '?'
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}
import {
  Download, CreditCard, ShoppingBag,
  Users, Search, Filter, ChevronDown, X, User,
  Eye, ExternalLink,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import jsPDF from 'jspdf'

const exportItems = [
  { label: 'ประวัตินักเรียน', icon: Users, type: 'students' },
  { label: 'การชำระค่าการศึกษา', icon: CreditCard, type: 'payments' },
  { label: 'การสั่งซื้อเครื่องแบบ', icon: ShoppingBag, type: 'orders' },
]


// ─── State ───────────────────────────────────────────────────
const applicants = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const selectedExportType = ref('students')
const exportSearch = ref('')
const selectedBranch = ref('')
const selectedCurFilter = ref('')
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(20)

// OCR progress
const ocrProgress = ref({
  running: false,
  current: 0,
  total: 0,
  name: '',
})



const docModal = ref({
  open: false,
  name: '',
  appId: '',
  documents: [] as { doc_type: string, file_url: string }[],
  activeTab: '' as string,
  imgError: false,
  imgLoading: false,
})

const slipModal = ref({
  open: false,
  name: '',
  slipUrl: '',
})

const openSlipModal = (row: any) => {
  slipModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    slipUrl: row._slipUrl,
  }
}

// ✅ เปิด Modal
const openDocModal = async (row: any) => {
  docModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    appId: row.ลำดับ,
    documents: [],
    activeTab: '',
    imgError: false,
    imgLoading: true,
  }



  try {
    const res = await apiService.getApplicantDocuments(row.ลำดับ)
    if (res.success) {
      docModal.value.documents = res.data.documents
        .filter((d: any) => d.doc_type !== 'payment_slip')
        .filter((d: any, index: number, self: any[]) =>
          index === self.findIndex((t: any) => t.doc_type === d.doc_type)
        )

      docModal.value.activeTab = docModal.value.documents[0]?.doc_type || ''
    }
  } catch (e) {
    console.error('โหลดเอกสารไม่สำเร็จ', e)
  } finally {
    docModal.value.imgLoading = false
  }
}


const currentDocUrl = computed(() =>
  resolveUrl(docModal.value.documents.find(d => d.doc_type === docModal.value.activeTab)?.file_url)
)

// แปลง doc_type เป็นชื่อภาษาไทย
const docTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'id_front': '🪪',
    'id_back': '🪪',
    'edu_front': '📄',
    'edu_back': '📄',
    'letter_front': '📋',
    'letter_back': '📋',
    'certificate_front': '📋',
    'certificate_back': '📋',
    'student_card_front': '🎓',
    'student_card_back': '🎓',
    'studentcard_front': '🎓',
    'studentcard_back': '🎓',
    'self_house_front': '🏠',
    'self_house_back': '🏠',
    'father_house_front': '👨',
    'father_house_back': '👨',
    'mother_house_front': '👩',
    'mother_house_back': '👩',
  }
  return icons[type] || '📎'
}

const docTypeShortLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'id_front': 'บัตรหน้า',
    'id_back': 'บัตรหลัง',
    'edu_front': 'วุฒิการศึกษา',
    'edu_back': 'วุฒิการศึกษาหลัง',
    'letter_front': 'หนังสือรับรอง',
    'letter_back': 'หนังสือรับรองหลัง',
    'certificate_front': 'ใบรับรอง',
    'certificate_back': 'ใบรับรองหลัง',
    'student_card_front': 'บัตรนักเรียน',
    'student_card_back': 'บัตรนักเรียนหลัง',
    'studentcard_front': 'บัตรนักเรียน',
    'studentcard_back': 'บัตรนักเรียนหลัง',
    'self_house_front': 'สำเนาทะเบียนบ้าน (หน้า)',
    'self_house_back': 'สำเนาทะเบียนบ้าน (หลัง)',
    'father_house_front': 'สำเนาทะเบียนบ้านของบิดา (หน้า) ',
    'father_house_back': 'สำเนาทะเบียนบ้านของบิดา (หลัง)',
    'mother_house_front': 'สำเนาทะเบียนบ้านของมารดา (หน้า)',
    'mother_house_back': 'สำเนาทะเบียนบ้านของมารดา  (หลัง)',
  }
  return labels[type] || type
}

// ✅ เปิดในแท็บใหม่
const openInNewTab = () => {
  if (currentDocUrl.value) window.open(currentDocUrl.value, '_blank')
}

// ─── Fetch ───────────────────────────────────────────────────
const fetchApplicants = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await apiService.getApplicants()
    if (!res.success) throw new Error(res.message)
    console.log('applicant raw:', JSON.stringify(res.data[0], null, 2))



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
      ลำดับ: a.app_id,
      คำนำหน้า: a.prefix,
      ชื่อ_นามสกุล: a.full_name,
      หลักสูตร: a.curriculum.cur_shortname,
      สาขาวิชา: a.division.div_name,
    }
    if (selectedExportType.value === 'students') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        เบอร์โทร: a.phone,
        อีเมล: a.email,
        สถานะ: a.status,
        วันที่สมัคร: new Date(a.created_at).toLocaleDateString('th-TH'),
        _idFrontUrl: resolveUrl(a.id_front_url),
        _idBackUrl: a.id_back_url || '',
        _eduFrontUrl: a.edu_front_url || '',
      }
    }
  if (selectedExportType.value === 'payments') {
      console.log('slip_url:', a.payment?.slip_url)
      return {
        ...base,
        ยอดชำระ: a.payment?.total_amount ?? '-',
        วันที่ชำระ: a.payment?.paid_at
          ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
          : 'ยังไม่ชำระ',
        หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
        _isPaid: a.status === 'paid' || a.status === 'enrolled',
        _idFrontUrl: resolveUrl(a.id_front_url),
        _slipUrl: a.payment?.slip_name
          ? resolveUrl(`/uploads/slips/${a.payment.slip_name}`)
          : '',
      }
    }
    // orders
    return {
      ...base,
      ยอดชำระ: a.payment?.total_amount ?? '-',
      หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
      _idFrontUrl: a.id_front_url ?? '',
      _isPaid: a.status === 'paid' || a.status === 'enrolled',
      _slipUrl: a.payment?.slip_name
        ? resolveUrl(`/uploads/slips/${a.payment.slip_name}`)
        : '',
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
    const matchName = !exportSearch.value || fullDisplay.includes(exportSearch.value)
    const matchBranch = !selectedBranch.value || row.สาขาวิชา === selectedBranch.value
    const matchCur = !selectedCurFilter.value || row.หลักสูตร.includes(selectedCurFilter.value)
    return matchName && matchBranch && matchCur
  })
)

const totalPages = computed(() => Math.ceil(filteredExportData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredExportData.value.slice(start, start + pageSize.value)
})

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
async function runOCRFromUrl(
  imageUrl: string,
  mode: 'id' | 'edu' = 'id'
): Promise<Record<string, string>> {
  if (!imageUrl) return {}
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'tha+eng', {
      logger: () => { }
    })
    return mode === 'id' ? parseThaiIDText(text) : parseEduDocText(text)
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

  const engNameLine = lines.find(l => /^[A-Z\s]+$/.test(l) && l.length > 4)
  if (engNameLine) result['OCR_ชื่อ_ภาษาอังกฤษ'] = engNameLine.trim()

  const dobMatch = text.match(/(\d{1,2}[\s\/\-][A-Za-zก-ฮ]+\.?[\s\/\-]\d{4})/)
  if (dobMatch) result['OCR_วันเกิด'] = dobMatch[0].trim()

  const expMatch = text.match(/(?:หมดอายุ|Expiry Date?:?)\s*([\d\s\w\.]+)/i)
  if (expMatch) result['OCR_วันหมดอายุ'] = expMatch[1].trim()

  const addrKeywords = ['บ้านเลขที่', 'หมู่ที่', 'ถนน', 'ตำบล', 'แขวง', 'อำเภอ', 'เขต', 'จังหวัด']
  const addrLines = lines.filter(l => addrKeywords.some(kw => l.includes(kw)))
  if (addrLines.length > 0) result['OCR_ที่อยู่'] = addrLines.join(' ')

  result['OCR_ข้อความดิบ'] = text.replace(/\n/g, ' ').trim()

  return result
}

function parseEduDocText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}

  const schoolLine = lines.find(l =>
    ['โรงเรียน', 'วิทยาลัย', 'มหาวิทยาลัย'].some(kw => l.includes(kw))
  )
  if (schoolLine) result['สถานศึกษาเดิม'] = schoolLine.trim()

  const eduPrefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']
  for (const line of lines) {
    if (eduPrefixes.some(p => line.startsWith(p))) {
      result['ชื่อ-สกุล'] = line.trim()
      break
    }
  }

  const levelLine = lines.find(l =>
    ['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย', 'ม.3', 'ม.6', 'ปวช', 'ปวส'].some(kw => l.includes(kw))
  )
  if (levelLine) result['วุฒิการศึกษา'] = levelLine.trim()

  const yearMatch = text.match(/25\d{2}/)
  if (yearMatch) result['ปีที่จบ'] = yearMatch[0]

  const gpaMatch = text.match(/[0-3]\.\d{2}|4\.00/)
  if (gpaMatch) result['GPA'] = gpaMatch[0]

  return result
}



// ─── Export ──────────────────────────────────────────────────
const sheetNames: Record<string, string> = {
  students: 'ข้อมูลนักเรียน',
  payments: 'การชำระเงิน',
  orders: 'การสั่งซื้อ',
}
const fileNames: Record<string, string> = {
  students: 'students_export.xlsx',
  payments: 'payments_export.xlsx',
  orders: 'orders_export.xlsx',
}

async function buildExportData(rows: any[]): Promise<object[]> {
  ocrProgress.value = { running: true, current: 0, total: rows.length, name: '' }
  const result: object[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    ocrProgress.value.current = i + 1
    ocrProgress.value.name = `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`
    const idOcr = await runOCRFromUrl(row._idFrontUrl || '', 'id')
    const eduOcr = await runOCRFromUrl(row._eduFrontUrl || '', 'edu')
    const cleanRow = Object.fromEntries(
      Object.entries(row).filter(([key]) => !key.startsWith('_'))
    )
    result.push({ ...cleanRow, ...idOcr, ...eduOcr })
  }
  ocrProgress.value.running = false
  return result
}

async function doExport(rows: any[]) {
  const data = await buildExportData(rows)
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetNames[selectedExportType.value])
  XLSX.writeFile(wb, fileNames[selectedExportType.value])
}

const exportSelected = async () => {
  const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  await doExport(rows)
}

const exportAll = async () => {
  await doExport(filteredExportData.value)
}

// ─── Export PDF ───────────────────────────────────────────────
const exportPDF = async () => {
  if (selectedIds.value.length === 0) return
  if (selectedExportType.value !== 'students') return

  ocrProgress.value = { running: true, current: 0, total: selectedIds.value.length, name: 'กำลังเริ่มสร้าง...' }

  try {
    const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    if (rows.length === 0) throw new Error('ไม่พบข้อมูลที่เลือก')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`

      let ocrData = {}
      try {
        if (row._idFrontUrl) {
          ocrData = await runOCRFromUrl(row._idFrontUrl || '', 'id')
        }
      } catch (e) {
        console.warn('OCR failed for', row.ชื่อ_นามสกุล, e)
      }

      const studentData = { ...row, ...ocrData }
      await generateStudentPDF(studentData)
    }
  } catch (err) {
    console.error('❌ Error exporting PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

// ─── Font Loading ──────────────────────────────────────────────────
async function loadThaiFont(): Promise<string> {
  try {
    const response = await fetch('/fonts/THSarabunNew.ttf')
    if (!response.ok) throw new Error('Font file not found')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve((reader.result as string).split(',')[1])
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('❌ Load font error:', error)
    return ''
  }
}

// ─── PDF Generation ───────────────────────────────────────────────
async function generateStudentPDF(studentData: any) {
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }

    const pageW = 210
    const L = 15
    const R = 195
    let y = 0

    const f = (style: 'normal' | 'bold', size: number) => {
      doc.setFont('THSarabun', style)
      doc.setFontSize(size)
    }

    const put = (text: string | number | undefined, x: number, y: number) => {
      if (!text && text !== 0) return
      f('bold', 14)
      doc.text(String(text), x, y)
      f('normal', 14)
    }

    const box = (x: number, y: number, checked = false) => {
      doc.rect(x, y - 3.2, 3.5, 3.5)
      if (checked) doc.text('✓', x + 0.3, y - 0.1)
    }

    const charBoxes = (startX: number, y: number, value: string, count: number, w = 4.8) => {
      const clean = value.replace(/-/g, '')
      for (let i = 0; i < count; i++) {
        doc.rect(startX + i * w, y - 4, w, 5)
        if (clean[i]) {
          f('bold', 12)
          doc.text(clean[i], startX + i * w + 1.2, y - 0.3)
          f('normal', 14)
        }
      }
    }

    y = 16
    doc.rect(L, 8, 16, 16)
    f('bold', 15)
    doc.text('วิทยาลัยเทคนิคเลย  ปีการศึกษา 2569', 112, y, { align: 'center' })
    f('normal', 13)
    doc.text('ระดับ', 153, y)
    box(163, y, studentData.หลักสูตร?.includes('ปวช'))
    doc.text('ปวช.', 167, y)
    box(179, y, studentData.หลักสูตร?.includes('ปวส'))
    doc.text('ปวส.', 183, y)

    y += 7
    f('normal', 13)
    doc.text('มอบตัว วันที่ ........... เดือน .................................. พ.ศ. ..............', 112, y, { align: 'center' })

    y += 7
    f('bold', 16)
    doc.text('ใบมอบตัวและข้อมูลประวัติขึ้นทะเบียนนักเรียน นักศึกษา', pageW / 2, y, { align: 'center' })

    doc.rect(R - 26, 24, 26, 34)
    f('normal', 12)
    doc.text('ติดรูป', R - 13, 38, { align: 'center' })
    doc.text('1 นิ้ว', R - 13, 44, { align: 'center' })

    y += 7
    f('bold', 14)
    doc.text('ข้อมูลส่วนตัวของนักเรียน นักศึกษา', L, y)

    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y)
    doc.line(L + 17, y, L + 90, y)
    put(`${studentData.คำนำหน้า || ''}${studentData.ชื่อ_นามสกุล || ''}`, L + 18, y)
    doc.text('เพศ', L + 92, y)
    doc.line(L + 99, y, L + 112, y)
    put(studentData.เพศ, L + 100, y)
    doc.text('ชื่อเล่น', L + 114, y)
    doc.line(L + 125, y, R - 28, y)
    put(studentData.ชื่อเล่น, L + 126, y)

    y += 7
    doc.text('เลขบัตรประชาชน', L, y)
    const idRaw = (studentData.เลขบัตรประชาชน || '').replace(/-/g, '')
    const idGroups = [1, 4, 5, 2, 1]
    let ix = L + 32
    let ic = 0
    idGroups.forEach((g, gi) => {
      for (let i = 0; i < g; i++) {
        doc.rect(ix, y - 4, 4.8, 5)
        f('bold', 12); doc.text(idRaw[ic] || '', ix + 1.2, y - 0.3); f('normal', 14)
        ix += 4.8; ic++
      }
      if (gi < idGroups.length - 1) {
        doc.text('-', ix + 0.5, y - 0.5); ix += 3
      }
    })
    doc.text('เกิดวันที่', ix + 3, y)
    doc.line(ix + 16, y, ix + 24, y)
    doc.text('เดือน', ix + 25, y)
    doc.line(ix + 34, y, ix + 52, y)
    doc.text('พ.ศ.', ix + 53, y)
    doc.line(ix + 61, y, ix + 72, y)

    y += 7
    doc.text('เชื้อชาติ', L, y); doc.line(L + 14, y, L + 30, y); put(studentData.เชื้อชาติ, L + 15, y)
    doc.text('สัญชาติ', L + 32, y); doc.line(L + 43, y, L + 57, y); put(studentData.สัญชาติ, L + 44, y)
    doc.text('ศาสนา', L + 59, y); doc.line(L + 69, y, L + 83, y); put(studentData.ศาสนา, L + 70, y)
    doc.text('หมู่เลือด', L + 85, y); doc.line(L + 96, y, L + 105, y); put(studentData.หมู่เลือด, L + 97, y)
    doc.text('น้ำหนัก', L + 107, y); doc.line(L + 117, y, L + 126, y)
    doc.text('ก.ก.', L + 127, y)
    doc.text('ส่วนสูง', L + 133, y); doc.line(L + 142, y, L + 152, y)
    doc.text('ซ.ม.', L + 153, y)

    y += 7
    doc.text('จังหวัดที่เกิด', L, y)
    doc.line(L + 21, y, L + 60, y); put(studentData.จังหวัดที่เกิด, L + 22, y)
    doc.text('จำนวนพี่น้องทั้งหมด', L + 62, y); doc.line(L + 91, y, L + 98, y)
    doc.text('คน', L + 99, y)
    doc.text('จำนวนพี่น้องที่กำลังศึกษาอยู่', L + 104, y); doc.line(L + 140, y, L + 147, y)
    doc.text('คน', L + 148, y)

    y += 7
    doc.text('ความพิการ', L, y)
    box(L + 19, y, !studentData.ความพิการ); doc.text('ไม่พิการ', L + 24, y)
    doc.text('ความสามารถพิเศษ', L + 45, y)
    doc.line(L + 75, y, R - 28, y)

    y += 8
    f('bold', 14)
    doc.text('ข้อมูลที่อยู่  เลขรหัสประจำบ้าน (จำเป็นต้องกรอกให้ครบ)', L, y)
    charBoxes(L + 102, y, studentData.รหัสประจำบ้าน || '', 11, 4.8)

    y += 7
    f('normal', 14)
    doc.text('บ้านเลขที่', L, y); doc.line(L + 16, y, L + 32, y); put(studentData.บ้านเลขที่, L + 17, y)
    doc.text('หมู่', L + 34, y); doc.line(L + 40, y, L + 50, y); put(studentData.หมู่, L + 41, y)
    doc.text('ถนน', L + 52, y); doc.line(L + 59, y, L + 88, y)
    doc.text('ตำบล', L + 90, y); doc.line(L + 98, y, L + 120, y)
    doc.text('อำเภอ', L + 122, y); doc.line(L + 130, y, R - 28, y)

    y += 7
    doc.text('จังหวัด', L, y); doc.line(L + 13, y, L + 48, y); put(studentData.จังหวัด, L + 14, y)
    doc.text('รหัสไปรษณีย์', L + 50, y); doc.line(L + 70, y, L + 90, y); put(studentData.รหัสไปรษณีย์, L + 71, y)
    doc.text('เบอร์โทรศัพท์ที่ติดต่อได้', L + 92, y); doc.line(L + 120, y, R - 28, y); put(studentData.เบอร์โทร, L + 121, y)

    y += 8
    f('bold', 14)
    doc.text('ข้อมูลครอบครัว', L, y)

    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล บิดา', L, y); doc.line(L + 24, y, L + 88, y); put(studentData.ชื่อบิดา, L + 25, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)

    y += 6.5
    doc.text('อาชีพบิดา', L, y); doc.line(L + 16, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ บิดา', L + 116, y); doc.line(L + 143, y, R, y)

    y += 6.5
    doc.text('ชื่อ-สกุล มารดา', L, y); doc.line(L + 26, y, L + 88, y); put(studentData.ชื่อมารดา, L + 27, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)

    y += 6.5
    doc.text('อาชีพมารดา', L, y); doc.line(L + 18, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ มารดา', L + 116, y); doc.line(L + 145, y, R, y)

    y += 7
    doc.text('สถานภาพการสมรส บิดา/มารดา', L, y)
    box(L + 56, y); doc.text('อยู่ด้วยกัน', L + 61, y)
    box(L + 80, y); doc.text('แยกกันอยู่', L + 85, y)
    box(L + 103, y); doc.text('หย่าร้าง', L + 108, y)
    box(L + 123, y); doc.text('บิดา/มารดาแต่งงานใหม่', L + 128, y)
    box(L + 163, y); doc.text('บิดา/มารดาเสียชีวิต', L + 168, y)

    y += 8
    doc.text('ข้าพเจ้า (ชื่อผู้ปกครอง)', L, y)
    doc.line(L + 42, y, L + 120, y); put(studentData.ชื่อผู้ปกครอง, L + 43, y)
    doc.text('เกี่ยวข้องเป็น(กับนักเรียน)', L + 122, y)
    doc.line(L + 156, y, R, y)

    y += 6.5
    doc.text('เบอร์โทรศัพท์ที่ติดต่อผู้ปกครอง', L, y)
    doc.line(L + 60, y, L + 115, y)
    doc.text('ขอทำใบมอบตัวต่อผู้อำนวยการวิทยาลัยเทคนิคเลย  ดังนี้', L + 117, y)

    y += 6.5
    doc.text('นักศึกษาในความปกครองของข้าพเจ้าชื่อ', L, y)
    doc.line(L + 70, y, L + 130, y)
    doc.text('ชื่อเล่น', L + 132, y)
    doc.line(L + 143, y, R, y)

    y += 6
    f('normal', 13)
    doc.text('ข้าพเจ้า ขอรับเป็นผู้ปกครองและของรับรองว่าจะเป็นผู้คอยดูแลตักเตือนให้นักเรียนผู้นี้นักศึกษาเล่าเรียนอยู่เสมอ ให้มีความประพฤติ', L, y)
    y += 5.5
    doc.text('เรียบร้อยตามคำสั่งสอน ข้อบังคับ และระเบียบวินัยของวิทยาลัยฯ ทุกประการ โดยข้าพเจ้าขอรับผิดชอบค่าเล่าเรียน เครื่องแต่งกาย และอุปกรณ์', L, y)
    y += 5.5
    doc.text('การเรียนให้เพียงพอ ข้าพเจ้า ขอมอบ (ชื่อนักเรียน นักศึกษา)', L, y)
    doc.line(L + 108, y, R, y)
    y += 5.5
    doc.text('ให้เป็นนักเรียน นักศึกษา วิทยาลัยเทคนิคเลย ตั้งแต่บัดนี้เป็นต้นไป', L, y)

    y += 16
    f('normal', 14)
    doc.text('ลงชื่อ', L + 8, y)
    doc.line(L + 18, y, L + 78, y)
    doc.text('ผู้ปกครอง', L + 80, y)
    doc.text('ลงชื่อ', pageW / 2 + 10, y)
    doc.line(pageW / 2 + 20, y, pageW / 2 + 80, y)
    doc.text('นักเรียน/นักศึกษา', pageW / 2 + 82, y)

    y += 7
    doc.text('(', L + 18, y); doc.line(L + 22, y, L + 75, y); doc.text(')', L + 76, y)
    doc.text('(', pageW / 2 + 20, y); doc.line(pageW / 2 + 24, y, pageW / 2 + 78, y); doc.text(')', pageW / 2 + 79, y)

    doc.save(`ใบมอบตัว_${studentData.ชื่อ_นามสกุล || 'student'}.pdf`)
  } catch (err) {
    console.error('PDF Error:', err)
  }
}

watch([exportSearch, selectedBranch, selectedCurFilter, selectedExportType], () => {
  currentPage.value = 1
})

</script>