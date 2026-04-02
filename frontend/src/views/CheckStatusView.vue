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
        :disabled="idCard.length !== 13"
        class="w-full py-3 rounded-xl text-sm font-medium text-white transition-all"
        :class="idCard.length === 13 ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-gray-200 cursor-not-allowed text-gray-400'">
        ตรวจสอบสถานะ
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

              <!-- Timeline -->
              <div class="mt-4 pt-4 border-t border-gray-100">
                <p class="text-xs font-medium text-gray-500 mb-3">ความคืบหน้า</p>
                <div class="space-y-3">
                  <div v-for="(step, i) in timeline" :key="i" class="flex items-center gap-3">
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
                </div>
              </div>

              <!-- ถ้ายังไม่ชำระเงิน -->
              <div v-if="result.status === 'pending_payment'"
                class="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-xl text-xs text-orange-600">
                ⚠️ กรุณาชำระเงินและอัพโหลดสลิปก่อนวันที่ <strong>{{ result.dueDate }}</strong>
              </div>

              <!-- ปุ่มมอบตัว ถ้าชำระเงินแล้ว -->
              <RouterLink v-if="result.status === 'paid'" to="/enrollment"
                class="mt-3 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 transition-all">
                <ClipboardDocumentCheckIcon class="w-4 h-4" /> ดำเนินการมอบตัว
              </RouterLink>
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
import {
  MagnifyingGlassIcon, CheckIcon, ClipboardDocumentCheckIcon,
  ClockIcon, CheckBadgeIcon, BanknotesIcon, ExclamationCircleIcon
} from '@heroicons/vue/24/outline'

const idCard = ref('')
const result = ref<any>(null)
const notFound = ref(false)

// ข้อมูลตัวอย่าง
const mockData: Record<string, any> = {
  '1234567890123': {
    name: 'นาย ตัวอย่าง ข้อมูล',
    course: 'ปวช.',
    branch: 'เทคโนโลยีสารสนเทศ (IT)',
    appliedAt: '1 เม.ย. 2569',
    updatedAt: '2 เม.ย. 2569 10:30 น.',
    status: 'pending_payment',
    dueDate: '5 เม.ย. 2569',
  },
  '9876543210987': {
    name: 'นางสาว ตัวอย่าง สอง',
    course: 'ปวส.',
    branch: 'เทคนิคยานยนต์',
    appliedAt: '28 มี.ค. 2569',
    updatedAt: '1 เม.ย. 2569 14:20 น.',
    status: 'enrolled',
    dueDate: null,
  },
  '1111111111111': {
    name: 'นาย ตัวอย่าง สาม',
    course: 'ปวช.',
    branch: 'ช่างไฟฟ้า',
    appliedAt: '15 มี.ค. 2569',
    updatedAt: '30 มี.ค. 2569 09:15 น.',
    status: 'paid',
    dueDate: null,
  },
}

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

function checkStatus() {
  if (idCard.value.length !== 13) return
  result.value = null
  notFound.value = false

  const data = mockData[idCard.value]
  if (!data) { notFound.value = true; return }

  result.value = data

  const isPaid = data.status === 'paid' || data.status === 'enrolled'
  const isEnrolled = data.status === 'enrolled'

  timeline.value = [
    { label: 'กรอกใบสมัครเรียบร้อย', done: true, date: data.appliedAt },
    { label: 'ชำระเงินค่าสมัคร', done: isPaid, date: isPaid ? data.updatedAt : '' },
    { label: 'มอบตัวเสร็จสมบูรณ์', done: isEnrolled, date: isEnrolled ? data.updatedAt : '' },
  ]
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>