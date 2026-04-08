<template>
  <div class="max-w-4xl mx-auto">

    <!-- Stepper -->
    <div class="flex items-center justify-between mb-8">
      <div v-for="(step, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
        <div class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all"
            :class="currentStep > i ? 'bg-emerald-500 border-emerald-500 text-white'
              : currentStep === i ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 text-gray-300 bg-white'">
            <CheckIcon v-if="currentStep > i" class="w-4 h-4" />
            <component v-else :is="step.icon" class="w-4 h-4" />
          </div>
          <p class="text-xs mt-2 font-medium text-center" :class="currentStep >= i ? 'text-emerald-600' : 'text-gray-400'">{{ step.label }}</p>
          <p class="text-xs text-gray-400 text-center">{{ step.sub }}</p>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 mb-6 transition-all"
          :class="currentStep > i ? 'bg-emerald-500' : 'bg-gray-200'" />
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-8">

      <!-- Loading -->
      <div v-if="isLoadingData" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
        <span class="ml-3 text-gray-500">กำลังโหลดข้อมูล...</span>
      </div>

      <template v-else>

        <!-- Step 1: Document Upload -->
        <div v-if="currentStep === 0" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของตนเอง
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box" :class="selfHouseRegistration.front ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(selfHouseRegistration, 'front', $event)" />
                <div v-if="!selfHouseRegistration.frontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="selfHouseRegistration.frontPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box" :class="selfHouseRegistration.back ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(selfHouseRegistration, 'back', $event)" />
                <div v-if="!selfHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หลัง - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="selfHouseRegistration.backPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1 mt-6">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของบิดา
            <span class="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box" :class="fatherHouseRegistration.front ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(fatherHouseRegistration, 'front', $event)" />
                <div v-if="!fatherHouseRegistration.frontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="fatherHouseRegistration.frontPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box" :class="fatherHouseRegistration.back ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(fatherHouseRegistration, 'back', $event)" />
                <div v-if="!fatherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หลัง - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="fatherHouseRegistration.backPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1 mt-6">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของมารดา
            <span class="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box" :class="motherHouseRegistration.front ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(motherHouseRegistration, 'front', $event)" />
                <div v-if="!motherHouseRegistration.frontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="motherHouseRegistration.frontPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box" :class="motherHouseRegistration.back ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden" @change="handleUpload(motherHouseRegistration, 'back', $event)" />
                <div v-if="!motherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หลัง - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="motherHouseRegistration.backPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <div class="flex justify-between gap-4 mt-8">
            <button @click="goBack" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick" class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">ถัดไป</button>
          </div>
        </div>

        <!-- Step 2: Payment Slip -->
        <div v-if="currentStep === 1" class="mb-8">
          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-4">
            <BanknotesIcon class="w-5 h-5 text-emerald-500" /> อัปโหลดหลักฐานการชำระเงิน
          </h2>
          <div class="border border-gray-200 rounded-lg p-4 mb-6">
            <h3 class="font-semibold text-gray-700 mb-3">ข้อมูลการชำระเงิน</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p class="text-sm text-gray-500">ชื่อ-สกุล</p>
                <p class="font-medium text-gray-800">{{ userData.prefix }}{{ userData.fullName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
                <p class="font-medium text-gray-800">{{ userData.totalAmount.toLocaleString() }} บาท</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">หลักสูตร</p>
                <p class="font-medium text-gray-800">{{ userData.curName }}</p>
              </div>
              <div>
                <p class="text-sm text-gray-500">สาขา</p>
                <p class="font-medium text-gray-800">{{ userData.divName }}</p>
              </div>
            </div>
          </div>
          <h3 class="text-base font-semibold text-gray-700 mb-1">สลิปการโอนเงิน</h3>
          <label class="block">
            <div class="upload-box" :class="paymentSlip.front ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'" style="min-height: 300px;">
              <input type="file" accept="image/*" class="hidden" @change="handleUpload(paymentSlip, 'front', $event)" />
              <div v-if="!paymentSlip.frontPreview" class="flex flex-col items-center justify-center gap-3 text-gray-400 h-full">
                <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                  <PhotoIcon class="w-8 h-8" />
                </div>
                <div class="text-center">
                  <span class="text-sm font-medium">คลิกเพื่ออัปโหลดสลิป</span>
                  <p class="text-xs mt-1">รองรับไฟล์ JPG, PNG (สูงสุด 5MB)</p>
                </div>
              </div>
              <img v-else :src="paymentSlip.frontPreview" class="w-full h-full object-contain rounded-xl" />
            </div>
          </label>
          <div class="flex justify-between gap-4 mt-8">
            <button @click="goBackStep" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick" class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">ถัดไป</button>
          </div>
        </div>

        <!-- Step 3: Confirmation -->
        <div v-if="currentStep === 2" class="mb-8">
          <div class="text-center">
            <CheckCircleIcon class="w-16 h-16 text-emerald-500 mx-auto mb-4" />
            <h2 class="text-xl font-semibold text-gray-700 mb-2">ยืนยันข้อมูล</h2>
            <div class="bg-gray-50 rounded-lg p-6 mb-6 max-w-md mx-auto text-left">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p class="text-sm text-gray-500">ชื่อ-สกุล</p>
                  <p class="font-medium text-gray-800">{{ userData.prefix }}{{ userData.fullName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">ยอดที่ต้องชำระ</p>
                  <p class="font-medium text-gray-800">{{ userData.totalAmount.toLocaleString() }} บาท</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">หลักสูตร</p>
                  <p class="font-medium text-gray-800">{{ userData.curName }}</p>
                </div>
                <div>
                  <p class="text-sm text-gray-500">สาขา</p>
                  <p class="font-medium text-gray-800">{{ userData.divName }}</p>
                </div>
              </div>
            </div>
            <div class="bg-white border border-gray-200 rounded-lg p-6 mb-6">
              <h3 class="font-semibold text-gray-700 mb-4">เอกสารที่อัปโหลดทั้งหมด</h3>
              <div class="mb-6">
                <h4 class="text-sm font-medium text-gray-600 mb-2">สลิปการโอนเงิน</h4>
                <div v-if="paymentSlip.frontPreview" class="border border-gray-200 rounded-lg overflow-hidden">
                  <img :src="paymentSlip.frontPreview" class="w-full h-48 object-contain bg-gray-50" />
                </div>
                <div v-else class="border border-gray-200 rounded-lg h-48 flex items-center justify-center bg-gray-50">
                  <p class="text-gray-400">ไม่มีรูปภาพ</p>
                </div>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">ทะเบียนบ้านตนเอง</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <img v-if="selfHouseRegistration.frontPreview" :src="selfHouseRegistration.frontPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หน้า</p></div>
                    <img v-if="selfHouseRegistration.backPreview" :src="selfHouseRegistration.backPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หลัง</p></div>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">ทะเบียนบ้านบิดา</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <img v-if="fatherHouseRegistration.frontPreview" :src="fatherHouseRegistration.frontPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หน้า</p></div>
                    <img v-if="fatherHouseRegistration.backPreview" :src="fatherHouseRegistration.backPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หลัง</p></div>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">ทะเบียนบ้านมารดา</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <img v-if="motherHouseRegistration.frontPreview" :src="motherHouseRegistration.frontPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หน้า</p></div>
                    <img v-if="motherHouseRegistration.backPreview" :src="motherHouseRegistration.backPreview" class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50"><p class="text-xs text-gray-400">หลัง</p></div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-center gap-4">
              <button @click="goBackStep" class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
              <button @click="handleConfirmation" :disabled="isLoading" class="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors font-medium">
                {{ isLoading ? 'กำลังบันทึก...' : 'ยืนยันการมอบตัว' }}
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Modal -->
    <div v-if="showModal" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div class="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full mx-4 text-center">
        <p class="text-gray-700 font-medium mb-6">{{ modalMessage }}</p>
        <button @click="showModal = false" class="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">ตกลง</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DocumentArrowUpIcon, BanknotesIcon, CheckCircleIcon,
  CheckIcon, DocumentTextIcon, PhotoIcon
} from '@heroicons/vue/24/outline'
import jsPDF from 'jspdf'
import api from '@/services/api'

interface HouseDoc {
  front: File | null
  frontPreview: string
  back: File | null
  backPreview: string
}

interface UserData {
  fullName: string
  prefix: string
  curName: string
  divName: string
  totalAmount: number
}

const router = useRouter()
const route = useRoute()
const idCard = route.params.idCard as string  // ← รับจาก /enrollment/:idCard

const currentStep = ref(0)
const showModal = ref(false)
const modalMessage = ref('')
const isLoading = ref(false)
const isLoadingData = ref(true)

const userData = ref<UserData>({ fullName: '', prefix: '', curName: '', divName: '', totalAmount: 0 })

const createHouseDoc = (): HouseDoc => ({ front: null, frontPreview: '', back: null, backPreview: '' })
const selfHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const fatherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const motherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const paymentSlip = reactive<HouseDoc>(createHouseDoc())

const steps = [
  { label: 'อัปโหลดเอกสาร', sub: 'เอกสารประกอบการสมัคร', icon: DocumentArrowUpIcon },
  { label: 'หลักฐานการชำระเงิน', sub: 'สลิปการโอนเงิน', icon: BanknotesIcon },
  { label: 'ยืนยันข้อมูล', sub: 'มอบตัว', icon: CheckCircleIcon },
]

// ← ดึงข้อมูลจริงจาก DB
onMounted(async () => {
  if (!idCard) { router.push('/check-status'); return }
  try {
    const res = await api.get(`/applications/check/${idCard}`)
    const data = res.data?.data
    userData.value = {
      fullName: data.full_name,
      prefix: data.prefix,
      curName: data.cur_name,
      divName: data.div_name,
      totalAmount: Number(data.total_amount) || 0
    }
  } catch {
    modalMessage.value = 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่'
    showModal.value = true
    setTimeout(() => router.push('/check-status'), 2000)
  } finally {
    isLoadingData.value = false
  }
})

const isAllDocumentsUploaded = computed(() => {
  if (currentStep.value === 0) return selfHouseRegistration.front && selfHouseRegistration.back
  if (currentStep.value === 1) return paymentSlip.front
  return true
})

const handleUpload = (target: HouseDoc, side: 'front' | 'back', event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  target[side] = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (side === 'front') target.frontPreview = result
    else target.backPreview = result
  }
  reader.readAsDataURL(file)
}

const goBack = () => router.push('/check-status')
const goBackStep = () => { if (currentStep.value > 0) currentStep.value-- }

const handleNextClick = () => {
  if (!isAllDocumentsUploaded.value) {
    modalMessage.value = 'กรุณาอัปโหลดรูปภาพให้ครบทุกรายการก่อนดำเนินการต่อ'
    showModal.value = true
  } else {
    if (currentStep.value < steps.length - 1) currentStep.value++
  }
}

// ← บันทึก DB + Generate PDF
const handleConfirmation = async () => {
  console.log('idCard ที่ส่งไป:', idCard) 
  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('idCard', idCard)  // ← ส่ง idCard เสมอ
    if (selfHouseRegistration.front) formData.append('self_front', selfHouseRegistration.front)
    if (selfHouseRegistration.back) formData.append('self_back', selfHouseRegistration.back)
    if (fatherHouseRegistration.front) formData.append('father_front', fatherHouseRegistration.front)
    if (fatherHouseRegistration.back) formData.append('father_back', fatherHouseRegistration.back)
    if (motherHouseRegistration.front) formData.append('mother_front', motherHouseRegistration.front)
    if (motherHouseRegistration.back) formData.append('mother_back', motherHouseRegistration.back)
    if (paymentSlip.front) formData.append('payment_slip', paymentSlip.front)

    await api.post('/enrollments/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    await Promise.all([generateCertificatePDF(), generateUniformOrderPDF()])

    modalMessage.value = 'ยืนยันการมอบตัวเรียบร้อยแล้ว'
    showModal.value = true
    setTimeout(() => router.push('/success'), 2000)

  } catch (error: any) {
    console.log('error full:', error.response?.data)
    modalMessage.value = error.response?.data?.message || 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'
    showModal.value = true
  } finally {
    isLoading.value = false
  }
}

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

async function generateCertificatePDF() {
  const fontBase64 = await loadFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.setFont('THSarabun')
  doc.setFontSize(22)
  doc.text('ใบรับรองการมอบตัว', 105, 30, { align: 'center' })
  doc.setFontSize(16)
  doc.text(`${userData.value.prefix}${userData.value.fullName} สาขาวิชา ${userData.value.divName}`, 20, 45)
  doc.text('วิทยาลัยเทคนิคเลย ได้ชำระเงินเรียบร้อยแล้ว', 20, 55)
  doc.save(`ใบรับรอง-${userData.value.fullName}.pdf`)
}

async function generateUniformOrderPDF() {
  const fontBase64 = await loadFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.setFont('THSarabun')
  doc.setFontSize(22)
  doc.text('ใบสั่งซื้อเครื่องแบบนักเรียน', 105, 30, { align: 'center' })
  doc.setFontSize(16)
  doc.text(`ชื่อ-สกุล: ${userData.value.prefix}${userData.value.fullName}`, 20, 45)
  doc.text(`หลักสูตร: ${userData.value.curName}  สาขา: ${userData.value.divName}`, 20, 55)
  doc.save(`ใบสั่งซื้อเครื่องแบบ-${userData.value.fullName}.pdf`)
}
</script>