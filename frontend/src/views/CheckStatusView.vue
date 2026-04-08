<template>
  <div class="max-w-xl mx-auto">
    <div class="bg-white rounded-2xl shadow-sm p-8">
      <div class="flex flex-col items-center text-center mb-8">
        <div class="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mb-4">
          <MagnifyingGlassIcon class="w-7 h-7 text-emerald-600" />
        </div>
        <h1 class="text-lg font-semibold text-gray-800">ตรวจสอบสถานะการสมัคร</h1>
        <p class="text-sm text-gray-400 mt-1">กรอกเลขประจำตัวประชาชน 13 หลัก</p>
      </div>

      <!-- Input -->
      <div class="mb-4">
        <label class="text-sm text-gray-600 mb-1 block">เลขประจำตัวประชาชน *</label>
        <input
          v-model="idCard"
          type="text"
          inputmode="numeric"
          placeholder="X-XXXX-XXXXX-XX-X"
          maxlength="13"
          class="input-field text-center tracking-widest text-lg"
          @keydown="blockNonDigit"
          @keyup.enter="checkStatus"
        />
      </div>

      <button @click="checkStatus"
        :disabled="idCard.length !== 13 || isLoading"
        class="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
        :class="idCard.length === 13 && !isLoading
          ? 'bg-emerald-500 hover:bg-emerald-600'
          : 'bg-gray-200 cursor-not-allowed text-gray-400'">
        {{ isLoading ? 'กำลังตรวจสอบ...' : 'ตรวจสอบสถานะ' }}
      </button>

      <!-- ผลลัพธ์ -->
      <Transition name="fade">
        <div v-if="result" class="mt-6">
          <div class="border rounded-2xl overflow-hidden">

            <!-- Header status -->
            <div class="px-6 py-4 flex items-center gap-3"
              :class="statusStyle(result.status).bg">
              <div class="w-10 h-10 rounded-xl flex items-center justify-center"
                :class="statusStyle(result.status).iconBg">
                <component :is="statusStyle(result.status).icon" class="w-5 h-5"
                  :class="statusStyle(result.status).iconColor" />
              </div>
              <div>
                <p class="font-semibold text-sm" :class="statusStyle(result.status).textColor">
                  {{ statusStyle(result.status).label }}
                </p>
                <p class="text-xs opacity-70" :class="statusStyle(result.status).textColor">
                  อัพเดทล่าสุด: {{ result.updatedAt }}
                </p>
              </div>
              <span class="ml-auto text-xs px-3 py-1 rounded-full font-medium"
                :class="statusStyle(result.status).badge">
                {{ statusStyle(result.status).label }}
              </span>
            </div>

            <!-- ข้อมูล -->
            <div class="px-6 py-4 space-y-3">
              <div class="grid grid-cols-2 gap-3 text-sm">
                <div><p class="text-xs text-gray-400">ชื่อ - สกุล</p><p class="font-medium">{{ result.name }}</p></div>
                <div><p class="text-xs text-gray-400">หลักสูตร</p><p class="font-medium text-emerald-600">{{ result.course }}</p></div>
                <div><p class="text-xs text-gray-400">สาขาวิชา</p><p class="font-medium">{{ result.branch }}</p></div>
                <div><p class="text-xs text-gray-400">วันที่สมัคร</p><p class="font-medium">{{ result.appliedAt }}</p></div>
              </div>

              <!-- ค่าใช้จ่าย -->
              <div v-if="result.totalAmount" class="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                <p class="text-xs font-medium text-emerald-700 mb-2">ค่าใช้จ่ายทั้งหมด</p>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-emerald-600">จำนวนเงินที่ต้องชำระ</span>
                  <span class="text-lg font-bold text-emerald-700">{{ result.totalAmount?.toLocaleString() }} บาท</span>
                </div>
              </div>

              <!-- ⚠️ ยังไม่ชำระเงิน — แสดงวันกำหนดชำระ -->
              <div v-if="result.status === 'pending_payment' && result.dueDate"
                class="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <div class="flex items-start gap-2">
                  <ExclamationTriangleIcon class="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p class="text-xs font-medium text-orange-700">กรุณาชำระเงินภายในกำหนด</p>
                    <p class="text-xs text-orange-600 mt-0.5">
                      วันสิ้นสุดการชำระเงิน: <strong>{{ result.dueDate }}</strong>
                    </p>
                    <p class="text-xs text-orange-500 mt-0.5">
                      หากไม่ชำระภายในกำหนด จะถูกตัดสิทธิ์อัตโนมัติ
                    </p>
                  </div>
                </div>
              </div>

              <!-- Timeline + ปุ่ม -->
              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-500 mb-3">ความคืบหน้า</p>
                <div class="space-y-3">
                  <div v-for="(step, i) in timeline" :key="i">
                    <div class="flex items-center gap-3">
                      <div class="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                        :class="step.done ? 'bg-emerald-500' : 'bg-gray-100'">
                        <CheckIcon v-if="step.done" class="w-3 h-3 text-white" />
                        <span v-else class="w-2 h-2 rounded-full bg-gray-300 block" />
                      </div>
                      <p class="text-sm flex-1" :class="step.done ? 'text-gray-700' : 'text-gray-400'">
                        {{ step.label }}
                      </p>
                      <p class="text-xs text-gray-400">{{ step.date }}</p>
                    </div>

                    <!-- ปุ่มดาวน์โหลดใบแจ้งชำระเงิน — แสดงใต้ step ชำระเงิน ถ้ายังไม่ได้ชำระ -->
                    <div v-if="i === 1 && !step.done" class="mt-2 ml-9">
                      <button @click="downloadPaymentSlip"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-orange-500 text-white hover:bg-orange-600 transition-all">
                        <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                        ดาวน์โหลดใบแจ้งชำระเงิน
                      </button>
                    </div>

                    <!-- ลิงก์มอบตัว — แสดงใต้ step มอบตัว ถ้าชำระเงินแล้วแต่ยังไม่ได้มอบตัว -->
                    <div v-if="i === 2 && !step.done && result.status === 'paid'" class="mt-2 ml-9">
                      <RouterLink to="/enrollment"
                        class="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all">
                        <ClipboardDocumentCheckIcon class="w-3.5 h-3.5" />
                        ดำเนินการมอบตัว
                      </RouterLink>
                    </div>
                  </div>
                </div>
              </div>

              <!-- ปุ่มดาวน์โหลดใบรับรองการมอบตัว — แสดงเมื่อมอบตัวแล้ว -->
              <div v-if="result.status === 'enrolled'"
                class="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-sm font-medium text-emerald-700">🎉 มอบตัวเรียบร้อยแล้ว</p>
                    <p class="text-xs text-emerald-600 mt-0.5">สามารถดาวน์โหลดใบรับรองการมอบตัวได้เลย</p>
                  </div>
                  <button @click="downloadEnrollmentCert"
                    class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium bg-emerald-500 text-white hover:bg-emerald-600 transition-all flex-shrink-0 ml-3">
                    <ArrowDownTrayIcon class="w-3.5 h-3.5" />
                    ใบรับรองการมอบตัว
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </Transition>

      <!-- ไม่พบข้อมูล -->
      <Transition name="fade">
        <div v-if="notFound" class="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p class="text-sm font-medium text-red-600">ไม่พบข้อมูลการสมัคร</p>
          <p class="text-xs text-red-400 mt-1">กรุณาตรวจสอบเลขประจำตัวประชาชนอีกครั้ง</p>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { applicationService } from '../services/applicationService'
import { exportPaymentPDF } from '../utils/exportPaymentPDF'
import jsPDF from 'jspdf'
import {
  MagnifyingGlassIcon, CheckIcon, ClipboardDocumentCheckIcon,
  ClockIcon, CheckBadgeIcon, BanknotesIcon, ExclamationTriangleIcon,
  ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'

const idCard = ref('')
const result = ref<any>(null)
const notFound = ref(false)
const isLoading = ref(false)

const statusConfig: Record<string, any> = {
  pending_payment: {
    label: 'รอชำระเงิน',
    bg: 'bg-orange-50',
    iconBg: 'bg-orange-100',
    iconColor: 'text-orange-500',
    textColor: 'text-orange-700',
    badge: 'bg-orange-100 text-orange-600',
    icon: BanknotesIcon,
  },
  paid: {
    label: 'ชำระเงินแล้ว รอมอบตัว',
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-500',
    textColor: 'text-blue-700',
    badge: 'bg-blue-100 text-blue-600',
    icon: ClockIcon,
  },
  enrolled: {
    label: 'มอบตัวแล้ว',
    bg: 'bg-emerald-50',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-500',
    textColor: 'text-emerald-700',
    badge: 'bg-emerald-100 text-emerald-600',
    icon: CheckBadgeIcon,
  },
}

const timeline = ref<any[]>([])

function statusStyle(status: string) {
  return statusConfig[status] || statusConfig['pending_payment']
}

function blockNonDigit(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
}

async function checkStatus() {
  if (idCard.value.length !== 13) return
  result.value = null
  notFound.value = false
  isLoading.value = true

  try {
    const res = await applicationService.checkStatus(idCard.value)
    const data = res.data.data

    result.value = {
      name: `${data.prefix} ${data.full_name}`,
      course: data.cur_name,
      branch: data.div_name,
      appliedAt: formatDate(data.created_at),
      updatedAt: formatDate(data.updated_at),
      status: data.status,
      dueDate: data.due_date ? formatDate(data.due_date) : null,
      totalAmount: data.total_amount,
      requiredAmount: data.required_amount,
      paidAt: data.paid_at ? formatDate(data.paid_at) : null,
      enrolledAt: data.enrolled_at ? formatDate(data.enrolled_at) : null,
      // เก็บข้อมูลดิบไว้สำหรับ export PDF
      raw: data,
    }

    const isPaid = data.status === 'paid' || data.status === 'enrolled'
    const isEnrolled = data.status === 'enrolled'

    timeline.value = [
      {
        label: 'กรอกใบสมัครเรียบร้อย',
        done: true,
        date: formatDate(data.created_at),
      },
      {
        label: 'ชำระเงินค่าสมัคร',
        done: isPaid,
        date: isPaid ? (data.paid_at ? formatDate(data.paid_at) : '') : '',
      },
      {
        label: 'มอบตัวเสร็จสมบูรณ์',
        done: isEnrolled,
        date: isEnrolled ? (data.enrolled_at ? formatDate(data.enrolled_at) : '') : '',
      },
    ]
  } catch (err: any) {
    if (err.response?.status === 404) {
      notFound.value = true
    } else {
      console.error('Error checking status:', err)
      alert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
    }
  } finally {
    isLoading.value = false
  }
}

// ดาวน์โหลดใบแจ้งชำระเงิน
async function downloadPaymentSlip() {
  if (!result.value) return
  await exportPaymentPDF({
    prefix: result.value.raw.prefix,
    fullName: result.value.raw.full_name,
    idCard: idCard.value,
    phone: result.value.raw.phone,
    courseLabel: result.value.course,
    branchName: result.value.branch,
    totalPrice: result.value.totalAmount,
  })
}

// ดาวน์โหลดใบรับรองการมอบตัว
async function downloadEnrollmentCert() {
  if (!result.value) return

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageW = 210
  let y = 25

  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text('Enrollment Confirmation Certificate', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(13)
  doc.setFont('helvetica', 'normal')
  doc.text('Loei Technical College - Online Admission System', pageW / 2, y, { align: 'center' })
  y += 12

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(15, y, pageW - 15, y)
  y += 12

  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('This is to certify that', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(16)
  doc.text(result.value.name, pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(`ID Card: ${idCard.value}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(12)
  doc.text('has successfully completed enrollment at', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont('helvetica', 'bold')
  doc.text(`${result.value.course} — ${result.value.branch}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(11)
  doc.text(`Enrollment Date: ${result.value.enrolledAt || result.value.updatedAt}`, pageW / 2, y, { align: 'center' })
  y += 20

  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('Status: ENROLLED', pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 25

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`Generated: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save(`enrollment-cert-${idCard.value}.pdf`)
}

function formatDate(dateString: string) {
  if (!dateString) return ''
  const date = new Date(dateString)
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear() + 543
  const time = date.toTimeString().slice(0, 5)
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
    'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.']
  return `${day} ${monthNames[month - 1]} ${year} ${time}`
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>