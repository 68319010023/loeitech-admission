<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500">
        <tr>
          <th class="px-4 py-3 text-center w-10">
            <input type="checkbox" @change="$emit('toggle-all')" :checked="isAllSelected" />
          </th>
          <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
          <th class="px-4 py-3 text-left">หลักสูตร</th>
          <th class="px-4 py-3 text-left">สาขาวิชา</th>
          <th class="px-4 py-3 text-left">วันที่มอบตัว</th>
          <th class="px-4 py-3 text-center">เอกสาร</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr v-for="row in filteredData" :key="row.ลำดับ"
          :class="['hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']">
          <td class="px-4 py-3 text-center">
            <input type="checkbox" :value="row.ลำดับ" :checked="selectedIds.includes(row.ลำดับ)"
              @change="toggleRow(row.ลำดับ)" />
          </td>
          <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
          <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {{ row.สาขาวิชา }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 text-sm">
            {{ row.enrolled_at ? new Date(row.enrolled_at).toLocaleDateString('th-TH') : '-' }}
          </td>
          <td class="px-4 py-3 text-center">
            <button @click="openDocModal({ ...row, _showAll: true })"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition">
              <Eye class="w-3.5 h-3.5" /> ดูรูป
            </button>
          </td>
        </tr>
        <tr v-if="filteredData.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
        </tr>
      </tbody>
    </table>
  </div>

  <Teleport to="body">
    <div v-if="docModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="docModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden flex flex-col"
        style="max-height: 90vh">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div>
            <p class="font-bold text-gray-800 text-base">{{ docModal.name }}</p>
            <p class="text-xs text-gray-400 mt-0.5">
              เอกสารที่อัพโหลด {{ docModal.documents.filter(d => !d.doc_type.startsWith('__')).length }} รายการ
            </p>
          </div>
          <button @click="docModal.open = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex flex-1 overflow-hidden">
          <!-- Sidebar -->
          <div class="w-36 flex-shrink-0 border-r border-gray-100 overflow-y-auto bg-gray-50">
            <button v-for="doc in docModal.documents" :key="doc.doc_type"
              @click="docModal.activeTab = doc.doc_type; docModal.imgError = false"
              :class="[
                'w-full flex flex-col items-center gap-1.5 px-2 py-3 text-center transition border-l-2',
                docModal.activeTab === doc.doc_type
                  ? 'text-blue-600 border-blue-500 bg-white font-semibold'
                  : 'text-gray-400 border-transparent hover:text-gray-600 hover:bg-gray-100'
              ]">
              <span class="text-2xl">{{ docTypeIcon(doc.doc_type) }}</span>
              <span class="text-xs leading-tight">{{ docTypeShortLabel(doc.doc_type) }}</span>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 flex items-center justify-center bg-gray-50 p-4 overflow-auto">

            <!-- Tab ใบรับรองการมอบตัว -->
            <div v-if="docModal.activeTab === '__certificate__'"
              class="flex flex-col items-center gap-4 text-center">
              <span class="text-6xl">📜</span>
              <p class="text-gray-700 font-semibold text-base">ใบรับรองการมอบตัว</p>
              <p class="text-gray-400 text-sm">กดปุ่มด้านล่างเพื่อดาวน์โหลด PDF</p>
              <button @click="downloadCertPDF" :disabled="downloading"
                class="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-semibold text-sm transition disabled:opacity-50">
                <span>⬇️</span>
                {{ downloading ? 'กำลังสร้าง PDF...' : 'ดาวน์โหลดใบรับรอง PDF' }}
              </button>
            </div>

            <!-- รูปเอกสารปกติ -->
            <template v-else>
              <div v-if="docModal.imgLoading" class="flex flex-col items-center gap-3 text-gray-400">
                <div class="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                <p class="text-sm">กำลังโหลด...</p>
              </div>
              <template v-else-if="blobUrl && !docModal.imgError">
                <img :src="blobUrl" class="max-w-full max-h-full rounded-xl object-contain shadow-md"
                  style="max-height: 60vh" @error="docModal.imgError = true" />
              </template>
              <div v-else-if="docModal.imgError" class="flex flex-col items-center gap-2 text-gray-400">
                <span class="text-4xl">🖼️</span>
                <p class="text-sm">ไม่สามารถโหลดรูปได้</p>
              </div>
              <p v-else class="text-gray-400 text-sm">ไม่มีเอกสาร</p>
            </template>

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
            <button v-if="docModal.activeTab !== '__certificate__'" @click="openInNewTab"
              class="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
              <ExternalLink class="w-4 h-4" /> เปิดในแท็บใหม่
            </button>
          </div>
        </div>

      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Eye, ExternalLink, X } from 'lucide-vue-next'
import { apiService } from '@/utils/api'
import jsPDF from 'jspdf'

// ─── Config ───────────────────────────────────────────────────────────────────

const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3001'

const resolveUrl = (path: string | null | undefined): string => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const token = localStorage.getItem('auth_token')
  const sep = path.includes('?') ? '&' : '?'
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}

// ─── Props / Emits ────────────────────────────────────────────────────────────

const props = defineProps<{
  data: any[]
  selectedIds: string[]
  isAllSelected: boolean
}>()

const emit = defineEmits<{
  'update:selected-ids': [ids: string[]]
  'toggle-all': []
  'update:date-search': [val: string]
}>()

// ─── Table ────────────────────────────────────────────────────────────────────

const dateSearch = ref('')
watch(dateSearch, (val) => emit('update:date-search', val))

const filteredData = computed(() => props.data)

const toggleRow = (id: string) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selected-ids', current)
}

// ─── Modal state ──────────────────────────────────────────────────────────────

const docModal = ref<{
  open: boolean
  name: string
  appId: string
  rowData: any
  documents: { doc_type: string; file_url: string }[]
  activeTab: string
  imgError: boolean
  imgLoading: boolean
}>({
  open: false,
  name: '',
  appId: '',
  rowData: null,
  documents: [],
  activeTab: '',
  imgError: false,
  imgLoading: false,
})

const blobUrl = ref<string>('')
const downloading = ref(false)

// ─── URL helpers ──────────────────────────────────────────────────────────────

const currentDocUrl = computed(() =>
  resolveUrl(docModal.value.documents.find(d => d.doc_type === docModal.value.activeTab)?.file_url)
)

const openInNewTab = () => {
  if (currentDocUrl.value) window.open(currentDocUrl.value, '_blank')
}

// ─── Open modal ───────────────────────────────────────────────────────────────

const openDocModal = async (row: any) => {
  docModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    appId: row.ลำดับ,
    rowData: row,
    documents: [],
    activeTab: '',
    imgError: false,
    imgLoading: false,
  }
  try {
    const res = await apiService.getApplicantDocuments(row.ลำดับ)
    if (res.success) {
      let docs = res.data.documents as { doc_type: string; file_url: string }[]
      docs = docs.filter((d: any) => d.doc_type !== 'payment_slip')
      docModal.value.documents = docs.filter((d: any, i: number, self: any[]) =>
        i === self.findIndex((t: any) => t.doc_type === d.doc_type)
      )
      docModal.value.documents.push({ doc_type: '__certificate__', file_url: '' })
      docModal.value.activeTab = docModal.value.documents[0]?.doc_type || ''
    }
  } catch (e) {
    console.error('โหลดเอกสารไม่สำเร็จ', e)
  }
}

// ─── Icon / Label maps ────────────────────────────────────────────────────────

const docTypeIcon = (type: string): string => ({
  id_front: '🪪', id_back: '🪪',
  edu_front: '📄', edu_back: '📄',
  letter_front: '📋', letter_back: '📋',
  certificate_front: '📋', certificate_back: '📋',
  student_card_front: '🎓', student_card_back: '🎓',
  studentcard_front: '🎓', studentcard_back: '🎓',
  self_house_front: '🏠', self_house_back: '🏠',
  father_house_front: '👨', father_house_back: '👨',
  mother_house_front: '👩', mother_house_back: '👩',
  payment_slip: '💸',
  __certificate__: '📜',
} as Record<string, string>)[type] ?? '📎'

const docTypeShortLabel = (type: string): string => ({
  id_front: 'บัตรหน้า', id_back: 'บัตรหลัง',
  edu_front: 'วุฒิการศึกษา', edu_back: 'วุฒิการศึกษาหลัง',
  letter_front: 'หนังสือรับรอง', letter_back: 'หนังสือรับรองหลัง',
  certificate_front: 'ใบรับรอง', certificate_back: 'ใบรับรองหลัง',
  student_card_front: 'บัตรนักเรียน', student_card_back: 'บัตรนักเรียนหลัง',
  studentcard_front: 'บัตรนักเรียน', studentcard_back: 'บัตรนักเรียนหลัง',
  self_house_front: 'สำเนาทะเบียนบ้าน (หน้า)', self_house_back: 'สำเนาทะเบียนบ้าน (หลัง)',
  father_house_front: 'สำเนาทะเบียนบ้านของบิดา (หน้า)', father_house_back: 'สำเนาทะเบียนบ้านของบิดา (หลัง)',
  mother_house_front: 'สำเนาทะเบียนบ้านของมารดา (หน้า)', mother_house_back: 'สำเนาทะเบียนบ้านของมารดา (หลัง)',
  payment_slip: 'สลิปโอนเงิน',
  __certificate__: 'ใบรับรองมอบตัว',
} as Record<string, string>)[type] ?? type

// ─── Watch: โหลดรูปเมื่อเปลี่ยน tab ─────────────────────────────────────────

watch(
  () => [docModal.value.activeTab, docModal.value.documents] as const,
  async ([tab]) => {
    // Revoke blob เก่าก่อนเสมอ
    if (blobUrl.value) {
      URL.revokeObjectURL(blobUrl.value)
      blobUrl.value = ''
    }

    if (!tab || tab.startsWith('__')) return

    const url = resolveUrl(
      docModal.value.documents.find(d => d.doc_type === tab)?.file_url
    )
    if (!url) return

    docModal.value.imgLoading = true
    docModal.value.imgError = false

    try {
      // Cache busting — บังคับ fetch ใหม่ทุกครั้ง
      const sep = url.includes('?') ? '&' : '?'
      const res = await fetch(`${url}${sep}_t=${Date.now()}`)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      blobUrl.value = URL.createObjectURL(blob)
    } catch {
      docModal.value.imgError = true
    } finally {
      docModal.value.imgLoading = false
    }
  },
  { immediate: true, deep: true }
)

// ─── Load font สำหรับ PDF ─────────────────────────────────────────────────────

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

// ─── Download PDF ใบรับรองการมอบตัว ──────────────────────────────────────────

async function downloadCertPDF() {
  if (!docModal.value.rowData) return
  downloading.value = true

  try {
    const row = docModal.value.rowData
    const d = {
      prefix: row.คำนำหน้า,
      full_name: row.ชื่อ_นามสกุล,
      id_card_number: row.เลขบัตรประชาชน ?? row.id_card_number ?? row.ลำดับ,
      cur_name: row.หลักสูตร,
      div_name: row.สาขาวิชา,
      enrolled_at: row.enrolled_at,
      updated_at: row.updated_at,
    }

    const fontBase64 = await loadFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')

    const pageW = 210
    const margin = 15
    let y = 2

    try {
      const logoRes = await fetch('/src/assets/loeitech-logo.png')
      const logoBuffer = await logoRes.arrayBuffer()
      const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
      doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
      y += 45
    } catch { y += 5 }

    doc.setFontSize(22); doc.setFont('THSarabun', 'bold')
    doc.text('ใบรับรองการมอบตัว', pageW / 2, y, { align: 'center' }); y += 8

    doc.setFontSize(14); doc.setFont('THSarabun', 'normal')
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' }); y += 10

    doc.setDrawColor(16, 185, 130); doc.setLineWidth(0.8)
    doc.line(15, y, pageW - 15, y); y += 12

    doc.setFontSize(13); doc.setFont('THSarabun', 'bold')
    doc.text('ขอรับรองว่า', pageW / 2, y, { align: 'center' }); y += 10

    doc.setFontSize(18)
    doc.text(`${d.prefix}${d.full_name}`, pageW / 2, y, { align: 'center' }); y += 8

    doc.setFontSize(12); doc.setFont('THSarabun', 'normal')
    doc.text(`หมายเลขประจำตัว: ${d.id_card_number}`, pageW / 2, y, { align: 'center' }); y += 12

    doc.setFontSize(13)
    doc.text('ได้ดำเนินการมอบตัวเป็นนักเรียนนักศึกษาเรียบร้อยแล้ว', pageW / 2, y, { align: 'center' }); y += 8

    doc.setFont('THSarabun', 'bold')
    doc.text(`หลักสูตร: ${d.cur_name}`, pageW / 2, y, { align: 'center' }); y += 7
    doc.text(`สาขาวิชา: ${d.div_name}`, pageW / 2, y, { align: 'center' }); y += 12

    doc.setFont('THSarabun', 'normal'); doc.setFontSize(12)
    const enrolledAt = d.enrolled_at
      ? new Date(d.enrolled_at).toLocaleDateString('th-TH')
      : new Date(d.updated_at).toLocaleDateString('th-TH')
    doc.text(`วันที่มอบตัว: ${enrolledAt}`, pageW / 2, y, { align: 'center' }); y += 10

    doc.setFillColor(240, 253, 244); doc.setDrawColor(16, 185, 130); doc.setLineWidth(0.5)
    doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
    doc.setFontSize(13); doc.setFont('THSarabun', 'bold'); doc.setTextColor(5, 150, 105)
    doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์ ✓', pageW / 2, y + 9, { align: 'center' })
    doc.setTextColor(0, 0, 0); y += 19

    doc.setFillColor(255, 251, 235); doc.setDrawColor(251, 191, 36); doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
    doc.setFontSize(13); doc.setFont('THSarabun', 'bold'); doc.setTextColor(146, 64, 14)
    doc.text('หมายเหตุ', margin + 4, y + 7)
    doc.setFont('THSarabun', 'normal'); doc.setFontSize(12)
    doc.text('1. เอกสารนี้ไม่ใช่สัญญาการมอบตัวเป็น นักเรียน นักศึกษา', margin + 4, y + 14)
    doc.text('2. โปรดนำเอกสารนี้ พร้อมวุฒิการศึกษาเดิมติดต่อที่งานทะเบียน วิทยาลัยเทคนิคเลยในวันปฐมนิเทศ', margin + 4, y + 21)
    doc.setTextColor(0, 0, 0); y += 30

    doc.setFontSize(10); doc.setFont('THSarabun', 'normal'); doc.setTextColor(150, 150, 150)
    doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

    doc.save(`ใบรับรองการมอบตัว-${d.id_card_number}.pdf`)
  } finally {
    downloading.value = false
  }
}
</script>