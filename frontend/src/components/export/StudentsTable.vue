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
          <th class="px-4 py-3 text-center">สถานะ</th>
          <th class="px-4 py-3 text-left">เบอร์โทร</th>
          <th class="px-4 py-3 text-center">เอกสาร</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="row in data"
          :key="row.ลำดับ"
          :class="['cursor-pointer hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']"
          @click="openInfoModal(row)"
        >
          <td class="px-4 py-3 text-center" @click.stop>
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
          <td class="px-4 py-3 text-center">
            <span :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
              row.สถานะ === 'enrolled'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : row.สถานะ === 'paid'
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : row.สถานะ === 'pending_approve'
                    ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                    : 'bg-gray-50 text-gray-500 border border-gray-200'
            ]">
              {{
                row.สถานะ === 'enrolled' ? '✓ มอบตัวแล้ว' :
                row.สถานะ === 'paid' ? '✅ พร้อมมอบตัว' :
                row.สถานะ === 'pending_approve' ? '⏳ รอตรวจสอบ' : '📋 สมัครใหม่'
              }}
            </span>
          </td>
          <td class="px-4 py-3 text-gray-600 text-sm">{{ row.เบอร์โทร || '-' }}</td>
          <td class="px-4 py-3 text-center" @click.stop>
            <button @click="openDocModal(row)"
              class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg text-xs font-semibold transition">
              <Eye class="w-3.5 h-3.5" /> ดูรูป
            </button>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td colspan="7" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- ─── Info Modal (กดแถว) ─────────────────────────────────── -->
  <Teleport to="body">
    <div v-if="infoModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      @click.self="infoModal.open = false">
      <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col"
        style="max-height: 90vh">

        <!-- Header -->
        <div class="flex items-center justify-between px-5 py-4 border-b border-gray-100 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <User class="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p class="font-bold text-gray-800 text-base">{{ infoModal.name }}</p>
              <span :class="[
                'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold mt-0.5',
                infoModal.status === 'enrolled' ? 'bg-green-50 text-green-700' :
                infoModal.status === 'paid' ? 'bg-blue-50 text-blue-700' :
                infoModal.status === 'pending_approve' ? 'bg-yellow-50 text-yellow-700' :
                'bg-gray-50 text-gray-500'
              ]">
                {{
                  infoModal.status === 'enrolled' ? '✓ มอบตัวแล้ว' :
                  infoModal.status === 'paid' ? '✅ พร้อมมอบตัว' :
                  infoModal.status === 'pending_approve' ? '⏳ รอตรวจสอบ' : '📋 สมัครใหม่'
                }}
              </span>
            </div>
          </div>
          <button @click="infoModal.open = false" class="p-2 hover:bg-gray-100 rounded-lg transition">
            <X class="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <!-- Body -->
        <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div v-if="infoModal.loading" class="flex items-center justify-center py-10 text-gray-400">
            <div class="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2"></div>
            <span class="text-sm">กำลังโหลด...</span>
          </div>

          <template v-else-if="infoModal.data">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ข้อมูลส่วนตัว</p>
              <div class="grid grid-cols-2 gap-3">
                <InfoField label="ชื่อ-สกุล" :value="`${infoModal.data.prefix}${infoModal.data.full_name}`" />
                <InfoField label="เลขบัตรประชาชน" :value="infoModal.data.id_card_number" />
                <InfoField label="เบอร์โทร" :value="infoModal.data.phone" />
                <InfoField label="อีเมล" :value="infoModal.data.email" />
                <InfoField label="ที่อยู่" :value="infoModal.data.address" class="col-span-2" />
              </div>
            </div>

            <div class="border-t border-gray-100"></div>

            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">หลักสูตรที่สมัคร</p>
              <div class="grid grid-cols-2 gap-3">
                <InfoField label="หลักสูตร" :value="infoModal.data.cur_name" />
                <InfoField label="สาขาวิชา" :value="infoModal.data.div_name" />
              </div>
            </div>

            <div class="border-t border-gray-100"></div>

            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">ประวัติการศึกษา</p>
              <div class="grid grid-cols-2 gap-3">
                <InfoField label="สถานศึกษาเดิม" :value="infoModal.data.prev_school" />
                <InfoField label="วุฒิการศึกษา" :value="prevLevelLabel(infoModal.data.prev_level)" />
                <InfoField label="ปีที่จบ" :value="infoModal.data.prev_year" />
                <InfoField label="เกรดเฉลี่ย (GPA)" :value="infoModal.data.gpa" />
              </div>
            </div>

            <div class="border-t border-gray-100"></div>

            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">การชำระเงิน</p>
              <div class="grid grid-cols-2 gap-3">
                <InfoField label="ยอดที่ต้องชำระ"
                  :value="infoModal.data.total_amount ? `${Number(infoModal.data.total_amount).toLocaleString()} บาท` : '-'" />
                <InfoField label="วันที่ชำระ"
                  :value="infoModal.data.paid_at ? new Date(infoModal.data.paid_at).toLocaleDateString('th-TH') : 'ยังไม่ชำระ'" />
              </div>
            </div>
          </template>
        </div>

        <!-- Footer -->
        <div class="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50 flex-shrink-0">
          <p class="text-xs text-gray-400">วันที่สมัคร: {{ infoModal.data ? new Date(infoModal.data.created_at).toLocaleDateString('th-TH') : '-' }}</p>
          <div class="flex gap-2">
            <button @click="infoModal.open = false"
              class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-xl transition font-semibold">
              ปิด
            </button>
            <button v-if="infoModal.status === 'pending_payment'"
              @click="openDocModalFromInfo"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition">
              <FileText class="w-4 h-4" /> ใบแจ้งชำระเงิน
            </button>
            <button v-else-if="infoModal.status === 'pending_approve' || infoModal.status === 'paid'"
              @click="openDocModalFromInfo"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
              <Eye class="w-4 h-4" /> รายละเอียดการสมัคร
            </button>
            <button v-else-if="infoModal.status === 'enrolled'"
              @click="openDocModalFromInfo"
              class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition">
              <BookCheck class="w-4 h-4" /> เอกสารมอบตัว
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- ─── Doc Modal ────────────────────────────────────────────── -->
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

        <!-- Body -->
        <div class="flex flex-1 overflow-hidden">
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
          <div class="flex-1 flex items-center justify-center bg-gray-50 p-4 overflow-auto">
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
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { h } from 'vue'
import { Eye, ExternalLink, X, FileText, BookCheck, User } from 'lucide-vue-next'
import { apiService } from '@/utils/api'
import api from '@/services/httpClient'

// ─── InfoField inline component ──────────────────────────────
const InfoField = {
  props: ['label', 'value'],
  setup(props: any) {
    return () => h('div', [
      h('p', { class: 'text-xs text-gray-400 mb-0.5' }, props.label),
      h('p', { class: 'text-sm font-medium text-gray-800' }, props.value || '-'),
    ])
  }
}

// ─── Utils ────────────────────────────────────────────────────
const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3001'
const resolveUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const token = localStorage.getItem('auth_token')
  const sep = path.includes('?') ? '&' : '?'
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}

// ─── Props / Emits ────────────────────────────────────────────
const props = defineProps<{
  data: any[]
  selectedIds: string[]
  isAllSelected: boolean
}>()

const emit = defineEmits<{
  'update:selected-ids': [ids: string[]]
  'toggle-all': []
}>()

const toggleRow = (id: string) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selected-ids', current)
}

// ─── Info Modal ───────────────────────────────────────────────
const infoModal = ref({
  open: false,
  name: '',
  status: '',
  idCard: '',
  appId: '',
  loading: false,
  data: null as any,
})

const prevLevelLabel = (level: string) => {
  const map: Record<string, string> = { m3: 'ม.3', m6: 'ม.6', pvc: 'ปวช.' }
  return map[level] || level || '-'
}

const openInfoModal = async (row: any) => {
  infoModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    status: row.สถานะ,
    idCard: row.เลขบัตรประชาชน || '',
    appId: row.ลำดับ,
    loading: true,
    data: null,
  }
  try {
    const res = await api.get(`/applications/check/${row.เลขบัตรประชาชน}`)
    infoModal.value.data = res.data?.data
  } catch (e) {
    console.error('โหลดข้อมูลนักเรียนไม่สำเร็จ', e)
  } finally {
    infoModal.value.loading = false
  }
}

// ─── Doc Modal ────────────────────────────────────────────────
const docModal = ref({
  open: false,
  name: '',
  appId: '',
  documents: [] as { doc_type: string; file_url: string }[],
  activeTab: '' as string,
  imgError: false,
  imgLoading: false,
})

const blobUrl = ref<string>('')

const currentDocUrl = computed(() =>
  resolveUrl(docModal.value.documents.find(d => d.doc_type === docModal.value.activeTab)?.file_url)
)

const openInNewTab = () => {
  if (currentDocUrl.value) window.open(currentDocUrl.value, '_blank')
}

watch(() => docModal.value.activeTab, async (newTab) => {
  if (blobUrl.value) { URL.revokeObjectURL(blobUrl.value); blobUrl.value = '' }
  const doc = docModal.value.documents.find(d => d.doc_type === newTab)
  if (!doc?.file_url) return
  docModal.value.imgLoading = true
  docModal.value.imgError = false
  try {
    blobUrl.value = await apiService.getBlob(resolveUrl(doc.file_url))
  } catch {
    docModal.value.imgError = true
  } finally {
    docModal.value.imgLoading = false
  }
})

// ─── DOC_FILTER ───────────────────────────────────────────────
const DOC_FILTER: Record<string, string[]> = {
  pending_payment: [],
  pending_approve: [
    'payment_slip',
    'id_front', 'id_back',
    'edu_front', 'edu_back',
    'letter_front', 'letter_back',
    'certificate_front', 'certificate_back',
    'student_card_front', 'student_card_back',
    'studentcard_front', 'studentcard_back',
  ],
  enrolled: [
    'self_house_front', 'self_house_back',
    'father_house_front', 'father_house_back',
    'mother_house_front', 'mother_house_back',
  ],
}

const openDocModalFromInfo = () => {
  infoModal.value.open = false
  openDocModal({
    ลำดับ: infoModal.value.appId,
    คำนำหน้า: '',
    ชื่อ_นามสกุล: infoModal.value.name,
    สถานะ: infoModal.value.status,
      _filterByStatus: true, 
  })
}

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
      const allowedTypes = row._filterByStatus && row.สถานะ
  ? (DOC_FILTER[row.สถานะ] ?? null)
  : null
      docModal.value.documents = res.data.documents
        .filter((d: any) => allowedTypes ? allowedTypes.includes(d.doc_type) : d.doc_type !== 'payment_slip')
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

// ─── Doc Type Helpers ─────────────────────────────────────────
const docTypeIcon = (type: string): string => {
  const icons: Record<string, string> = {
    'id_front': '🪪', 'id_back': '🪪',
    'edu_front': '📄', 'edu_back': '📄',
    'letter_front': '📋', 'letter_back': '📋',
    'certificate_front': '📋', 'certificate_back': '📋',
    'student_card_front': '🎓', 'student_card_back': '🎓',
    'studentcard_front': '🎓', 'studentcard_back': '🎓',
    'self_house_front': '🏠', 'self_house_back': '🏠',
    'father_house_front': '👨', 'father_house_back': '👨',
    'mother_house_front': '👩', 'mother_house_back': '👩',
    'payment_slip': '💸',
  }
  return icons[type] || '📎'
}

const docTypeShortLabel = (type: string): string => {
  const labels: Record<string, string> = {
    'id_front': 'บัตรหน้า', 'id_back': 'บัตรหลัง',
    'edu_front': 'วุฒิการศึกษา', 'edu_back': 'วุฒิการศึกษาหลัง',
    'letter_front': 'หนังสือรับรอง', 'letter_back': 'หนังสือรับรองหลัง',
    'certificate_front': 'ใบรับรอง', 'certificate_back': 'ใบรับรองหลัง',
    'student_card_front': 'บัตรนักเรียน', 'student_card_back': 'บัตรนักเรียนหลัง',
    'studentcard_front': 'บัตรนักเรียน', 'studentcard_back': 'บัตรนักเรียนหลัง',
    'self_house_front': 'สำเนาทะเบียนบ้าน (หน้า)', 'self_house_back': 'สำเนาทะเบียนบ้าน (หลัง)',
    'father_house_front': 'สำเนาทะเบียนบ้านของบิดา (หน้า)', 'father_house_back': 'สำเนาทะเบียนบ้านของบิดา (หลัง)',
    'mother_house_front': 'สำเนาทะเบียนบ้านของมารดา (หน้า)', 'mother_house_back': 'สำเนาทะเบียนบ้านของมารดา (หลัง)',
    'payment_slip': 'สลิปโอนเงิน',
  }
  return labels[type] || type
}
</script>