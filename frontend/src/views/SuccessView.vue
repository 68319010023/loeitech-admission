<template>
  <div class="max-w-4xl mx-auto">

    <!-- Stepper -->
    <div class="flex items-center justify-between mb-8">
      <div v-for="(step, i) in steps" :key="i" class="flex items-center" :class="i < steps.length - 1 ? 'flex-1' : ''">
        <div class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all" :class="currentStep > i ? 'bg-emerald-500 border-emerald-500 text-white'
            : currentStep === i ? 'bg-emerald-500 border-emerald-500 text-white'
              : 'border-gray-300 text-gray-300 bg-white'">
            <CheckIcon v-if="currentStep > i" class="w-4 h-4" />
            <component v-else :is="step.icon" class="w-4 h-4" />
          </div>
          <p class="text-xs mt-2 font-medium text-center"
            :class="currentStep >= i ? 'text-emerald-600' : 'text-gray-400'">{{ step.label }}</p>
          <p class="text-xs text-gray-400 text-center">{{ step.sub }}</p>
        </div>
        <div v-if="i < steps.length - 1" class="flex-1 h-0.5 mx-2 mb-6 transition-all"
          :class="currentStep > i ? 'bg-emerald-500' : 'bg-gray-200'" />
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm p-8">

      <!-- Loading -->
      <div v-if="isLoadingData" class="flex justify-center items-center py-20">
        <svg class="animate-spin h-8 w-8 text-emerald-500" xmlns="http://www.w3.org/2000/svg" fill="none"
          viewBox="0 0 24 24">
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
              <div class="upload-box"
                :class="selfHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(selfHouseRegistration, 'front', $event)" />
                <div v-if="!selfHouseRegistration.frontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="selfHouseRegistration.frontPreview" class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="selfHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(selfHouseRegistration, 'back', $event)" />
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
              <div class="upload-box"
                :class="fatherHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(fatherHouseRegistration, 'front', $event)" />
                <div v-if="!fatherHouseRegistration.frontPreview"
                  class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="fatherHouseRegistration.frontPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="fatherHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(fatherHouseRegistration, 'back', $event)" />
                <div v-if="!fatherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หลัง - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="fatherHouseRegistration.backPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-1 mt-6">
            <DocumentTextIcon class="w-5 h-5 text-emerald-500" /> สำเนาทะเบียนบ้านของมารดา
            <span class="text-xs text-gray-400 font-normal">(ไม่บังคับ)</span>
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label class="block">
              <div class="upload-box"
                :class="motherHouseRegistration.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(motherHouseRegistration, 'front', $event)" />
                <div v-if="!motherHouseRegistration.frontPreview"
                  class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หน้า - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="motherHouseRegistration.frontPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
            <label class="block">
              <div class="upload-box"
                :class="motherHouseRegistration.backPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                <input type="file" accept="image/*" class="hidden"
                  @change="handleUpload(motherHouseRegistration, 'back', $event)" />
                <div v-if="!motherHouseRegistration.backPreview" class="flex flex-col items-center gap-2 text-gray-400">
                  <PhotoIcon class="w-8 h-8" /><span class="text-xs">หลัง - คลิกเพื่ออัปโหลด</span>
                </div>
                <img v-else :src="motherHouseRegistration.backPreview"
                  class="w-full h-full object-contain rounded-xl" />
              </div>
            </label>
          </div>

          <div class="flex justify-between gap-4 mt-8">
            <button @click="goBack"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick"
              class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">ถัดไป</button>
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
            <div class="upload-box" :class="[
              paymentSlip.frontPreview ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200',
              isVerifyingSlip ? 'pointer-events-none opacity-60' : ''
            ]" style="min-height: 300px;">
              <input type="file" accept="image/*" class="hidden" @change="handleSlipUpload($event)" />
              <div v-if="!paymentSlip.frontPreview"
                class="flex flex-col items-center justify-center gap-3 text-gray-400 h-full">
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

          <!-- กำลังตรวจสอบ -->
          <div v-if="isVerifyingSlip"
            class="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div class="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
              <svg class="animate-spin h-5 w-5 text-emerald-600" xmlns="http://www.w3.org/2000/svg" fill="none"
                viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-emerald-700">กำลังตรวจสอบสลิป...</p>
              <p class="text-xs text-emerald-500 mt-0.5">กรุณารอสักครู่ ระบบกำลังยืนยันข้อมูล</p>
            </div>
          </div>

          <!-- ✅ สลิปผ่านแล้ว -->
          <div v-if="slipVerifyResult?.valid && !isVerifyingSlip"
            class="mt-4 flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 rounded-xl">
            <div class="w-9 h-9 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p class="text-sm font-semibold text-emerald-700">สลิปผ่านการตรวจสอบแล้ว</p>
              <p class="text-xs text-emerald-500 mt-0.5">ระบบได้บันทึกการชำระเงินเรียบร้อย</p>
            </div>
            <div class="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          </div>

          <div class="flex justify-between gap-4 mt-6">
            <button @click="goBackStep"
              class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
            <button @click="handleNextClick" :disabled="isVerifyingSlip"
              class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">ถัดไป</button>
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
                    <img v-if="selfHouseRegistration.frontPreview" :src="selfHouseRegistration.frontPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หน้า</p>
                    </div>
                    <img v-if="selfHouseRegistration.backPreview" :src="selfHouseRegistration.backPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หลัง</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">ทะเบียนบ้านบิดา</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <img v-if="fatherHouseRegistration.frontPreview" :src="fatherHouseRegistration.frontPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หน้า</p>
                    </div>
                    <img v-if="fatherHouseRegistration.backPreview" :src="fatherHouseRegistration.backPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หลัง</p>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 class="text-sm font-medium text-gray-600 mb-2">ทะเบียนบ้านมารดา</h4>
                  <div class="grid grid-cols-2 gap-2">
                    <img v-if="motherHouseRegistration.frontPreview" :src="motherHouseRegistration.frontPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หน้า</p>
                    </div>
                    <img v-if="motherHouseRegistration.backPreview" :src="motherHouseRegistration.backPreview"
                      class="w-full h-32 object-contain bg-gray-50 border rounded" />
                    <div v-else class="border rounded h-32 flex items-center justify-center bg-gray-50">
                      <p class="text-xs text-gray-400">หลัง</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex justify-center gap-4">
              <button @click="goBackStep"
                class="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium">ย้อนกลับ</button>
              <button @click="handleConfirmation" :disabled="isLoading"
                class="px-8 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 disabled:opacity-50 transition-colors font-medium">
                {{ isLoading ? 'กำลังบันทึก...' : 'ยืนยันการมอบตัว' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Step 4: Success -->
        <div v-if="currentStep === 3" class="mb-8">
          <div class="text-center py-8">
            <div class="relative w-28 h-28 mx-auto mb-6">
              <div class="absolute inset-0 bg-emerald-100 rounded-full animate-ping opacity-30"></div>
              <div class="relative w-28 h-28 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <CheckBadgeIcon class="w-14 h-14 text-white" />
              </div>
            </div>
            <h2 class="text-2xl font-bold text-gray-800 mb-2">การมอบตัวสำเร็จแล้ว! 🎉</h2>
            <p class="text-gray-500 mb-8">ระบบได้บันทึกข้อมูลการมอบตัวของคุณเรียบร้อยแล้ว</p>
            <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-6 max-w-md mx-auto text-left mb-6">
              <h3 class="text-sm font-semibold text-emerald-700 mb-3 uppercase tracking-wide">ข้อมูลผู้มอบตัว</h3>
              <div class="space-y-2">
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">ชื่อ-สกุล</span>
                  <span class="text-sm font-medium text-gray-800">{{ userData.prefix }}{{ userData.fullName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">หลักสูตร</span>
                  <span class="text-sm font-medium text-gray-800">{{ userData.curName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">สาขา</span>
                  <span class="text-sm font-medium text-gray-800">{{ userData.divName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-sm text-gray-500">ยอดที่ชำระ</span>
                  <span class="text-sm font-medium text-emerald-600">{{ userData.totalAmount.toLocaleString() }}
                    บาท</span>
                </div>
              </div>
            </div>
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 max-w-md mx-auto mb-8 text-left">
              <p class="text-sm font-semibold text-blue-700 mb-2">📄 เอกสารที่ดาวน์โหลดอัตโนมัติ</p>
              <ul class="text-sm text-blue-600 space-y-1">
                <li>✅ ใบรับรองการมอบตัว</li>
                <li>✅ ใบสั่งซื้อเครื่องแบบนักเรียน</li>
              </ul>
              <p class="text-xs text-blue-400 mt-2">หากไม่ได้รับไฟล์ กรุณากดปุ่มดาวน์โหลดซ้ำด้านล่าง</p>
            </div>
            <div class="flex flex-col sm:flex-row justify-center gap-3">
              <button @click="downloadPDFs"
                class="px-6 py-3 border border-emerald-500 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium flex items-center justify-center gap-2">
                <ArrowDownTrayIcon class="w-4 h-4" />
                ดาวน์โหลดเอกสาร PDF
              </button>
              <button @click="router.push('/check-status')"
                class="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors font-medium">
                กลับหน้าหลัก
              </button>
            </div>
          </div>
        </div>

      </template>
    </div>

    <!-- Toast -->
    <Teleport to="body">
      <transition name="toast">
        <div v-if="toast.show"
          class="fixed top-4 right-4 z-[99999] flex items-center space-x-3 px-6 py-4 rounded-xl shadow-2xl text-white"
          :class="toast.type === 'success' ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 'bg-gradient-to-r from-red-500 to-pink-600'">
          <svg v-if="toast.type === 'success'" class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          <svg v-else class="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <div>
            <p class="font-semibold">{{ toast.title }}</p>
            <p class="text-sm opacity-90">{{ toast.message }}</p>
          </div>
        </div>
      </transition>
    </Teleport>

  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import {
  DocumentArrowUpIcon, BanknotesIcon, CheckCircleIcon,
  CheckIcon, DocumentTextIcon, PhotoIcon, CheckBadgeIcon, ArrowDownTrayIcon
} from '@heroicons/vue/24/outline'
import jsPDF from 'jspdf'
import api from '@/services/httpClient.ts'

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
  status: string
}

interface SlipVerifyResult {
  valid: boolean
  amount?: number
  sender?: string
  receiver?: string
  date?: string
  message?: string
}

const router = useRouter()
const route = useRoute()
const idCard = route.params.idCard as string

const currentStep = ref(0)
const isLoading = ref(false)
const isLoadingData = ref(true)

const slipVerifyResult = ref<SlipVerifyResult | null>(null)
const isVerifyingSlip = ref(false)

const userData = ref<UserData>({ fullName: '', prefix: '', curName: '', divName: '', totalAmount: 0, status: '' })
const orderItems = ref<any[]>([])

const createHouseDoc = (): HouseDoc => ({ front: null, frontPreview: '', back: null, backPreview: '' })
const selfHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const fatherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const motherHouseRegistration = reactive<HouseDoc>(createHouseDoc())
const paymentSlip = reactive<HouseDoc>(createHouseDoc())

const steps = [
  { label: 'อัปโหลดเอกสาร', sub: 'เอกสารประกอบการสมัคร', icon: DocumentArrowUpIcon },
  { label: 'หลักฐานการชำระเงิน', sub: 'สลิปการโอนเงิน', icon: BanknotesIcon },
  { label: 'ยืนยันข้อมูล', sub: 'มอบตัว', icon: CheckCircleIcon },
  { label: 'เสร็จสิ้น', sub: 'สำเร็จ', icon: CheckBadgeIcon },
]

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
      totalAmount: Number(data.total_amount) || 0,
      status: data.status,
    }
    try {
      const orderRes = await api.get(`/enrollments/orders/${idCard}`)
      if (orderRes.data?.data) {
        orderItems.value = orderRes.data.data
        console.log('orderItems:', JSON.stringify(orderItems.value, null, 2))
      }
    } catch (e: any) {
      console.warn('ไม่พบข้อมูล orders:', e?.response?.status)
      orderItems.value = [] // ตารางจะว่าง แต่ไม่ crash
    }

    // โหลดรูปเดิมที่เคยอัปโหลดไว้
    if (data.self_front_url) selfHouseRegistration.frontPreview = data.self_front_url
    if (data.self_back_url) selfHouseRegistration.backPreview = data.self_back_url
    if (data.father_front_url) fatherHouseRegistration.frontPreview = data.father_front_url
    if (data.father_back_url) fatherHouseRegistration.backPreview = data.father_back_url
    if (data.mother_front_url) motherHouseRegistration.frontPreview = data.mother_front_url
    if (data.mother_back_url) motherHouseRegistration.backPreview = data.mother_back_url

    if (data.payment_slip_url) {
      paymentSlip.frontPreview = data.payment_slip_url
      slipVerifyResult.value = { valid: true }
    }

    if (data.status === 'paid') {
      currentStep.value = 2
    }
  } catch {
    showToast('error', 'โหลดข้อมูลไม่สำเร็จ', 'ไม่สามารถดึงข้อมูลได้ กรุณาลองใหม่')
    setTimeout(() => router.push('/check-status'), 2000)
  } finally {
    isLoadingData.value = false
  }
})

// ตรวจสอบว่าเอกสารครบก่อนไป step ถัดไป
const isAllDocumentsUploaded = computed(() => {
  if (currentStep.value === 0) {
    return !!(selfHouseRegistration.frontPreview && selfHouseRegistration.backPreview)
  }
  if (currentStep.value === 1) {
    // มีสลิปเดิม (ไม่ได้อัปใหม่) หรือ อัปใหม่แล้วผ่าน
    const hasExistingSlip = !!(paymentSlip.frontPreview && !paymentSlip.front)
    const hasNewVerifiedSlip = !!(paymentSlip.frontPreview && slipVerifyResult.value?.valid === true)
    return hasExistingSlip || hasNewVerifiedSlip
  }
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

// ✅ อัปสลิป → ตรวจ Slipok → ถ้าผ่าน status จะเป็น paid (backend จัดการ)
const handleSlipUpload = async (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return

  paymentSlip.front = file
  const reader = new FileReader()
  reader.onload = (e) => { paymentSlip.frontPreview = e.target?.result as string }
  reader.readAsDataURL(file)

  isVerifyingSlip.value = true
  slipVerifyResult.value = null

  try {
    const form = new FormData()
    form.append('slip', file)
    form.append('idCard', idCard)

    const res = await api.post('/enrollments/verify-slip', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    const result: SlipVerifyResult = res.data.data
    slipVerifyResult.value = result

    if (result.valid) {
      // ✅ อัปเดต status ใน local state เป็น paid ทันที
      userData.value.status = 'paid'
      showToast('success', 'สลิปถูกต้อง ✅', `ยอดโอน ${result.amount?.toLocaleString()} บาท`)
    } else {
      paymentSlip.front = null
      paymentSlip.frontPreview = ''
      slipVerifyResult.value = null
      showToast('error', 'สลิปไม่ถูกต้อง ❌', result.message || 'กรุณาอัปโหลดสลิปใหม่อีกครั้ง')
    }

  } catch {
    paymentSlip.front = null
    paymentSlip.frontPreview = ''
    slipVerifyResult.value = null
    showToast('error', 'ตรวจสอบไม่สำเร็จ', 'กรุณาลองใหม่อีกครั้ง')
  } finally {
    isVerifyingSlip.value = false
      ; (event.target as HTMLInputElement).value = ''
  }
}

const goBack = () => router.push('/check-status')
const goBackStep = () => { if (currentStep.value > 0) currentStep.value-- }

const handleNextClick = () => {
  if (!isAllDocumentsUploaded.value) {
    if (currentStep.value === 1 && paymentSlip.frontPreview && !slipVerifyResult.value?.valid) {
      showToast('error', 'สลิปยังไม่ผ่านการตรวจสอบ', 'กรุณารอผลการตรวจสอบหรืออัปโหลดสลิปใหม่')
    } else {
      showToast('error', 'อัปโหลดไม่ครบ', 'กรุณาอัปโหลดรูปภาพให้ครบทุกรายการก่อนดำเนินการต่อ')
    }
    return
  }
  if (currentStep.value < steps.length - 1) currentStep.value++
}

const handleConfirmation = async () => {
  isLoading.value = true
  try {
    const formData = new FormData()
    formData.append('idCard', idCard)

    if (selfHouseRegistration.front) formData.append('self_front', selfHouseRegistration.front)
    if (selfHouseRegistration.back) formData.append('self_back', selfHouseRegistration.back)
    if (fatherHouseRegistration.front) formData.append('father_front', fatherHouseRegistration.front)
    if (fatherHouseRegistration.back) formData.append('father_back', fatherHouseRegistration.back)
    if (motherHouseRegistration.front) formData.append('mother_front', motherHouseRegistration.front)
    if (motherHouseRegistration.back) formData.append('mother_back', motherHouseRegistration.back)
    if (paymentSlip.front) formData.append('payment_slip', paymentSlip.front)

    await api.post('/enrollments/confirm', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    // ✅ อัปเดต local status และ generate PDF เสมอ
    userData.value.status = 'enrolled'


    currentStep.value = 3

  } catch (error: any) {
    showToast('error', 'เกิดข้อผิดพลาด', error.response?.data?.message || 'ไม่สามารถบันทึกข้อมูลได้')
  } finally {
    isLoading.value = false
  }
}

const downloadPDFs = async () => {
  await generateCombinedPDF()
}


// --- เพิ่มโค้ดส่วนนี้เข้าไปครับ ---
const loadFont = async () => {
  try {
    // ดึงไฟล์จาก public/fonts/THSarabunNew.ttf
    const response = await fetch('/fonts/THSarabunNew.ttf');
    if (!response.ok) throw new Error('ไม่พบไฟล์ฟอนต์ในโฟลเดอร์ public');

    const blob = await response.blob();
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // แปลงเป็น Base64 string เพื่อส่งให้ jsPDF
        const base64String = (reader.result as string).split(',')[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Font loading error:', error);
    throw error;
  }
};


async function generateCombinedPDF() {
  try {
    const fontBase64 = await loadFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
    doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')

    const pageW = 210
    const margin = 20
    const contentW = pageW - margin * 2
    const now = new Date().toLocaleString('th-TH', { dateStyle: 'full', timeStyle: 'short' })
    const fullName = `${userData.value.prefix}${userData.value.fullName}`

    const setFont = (style: 'normal' | 'bold', size: number, color = '#111827') => {
      doc.setFont('THSarabun', style)
      doc.setFontSize(size)
      const hex = color.replace('#', '')
      const r = parseInt(hex.substring(0, 2), 16)
      const g = parseInt(hex.substring(2, 4), 16)
      const b = parseInt(hex.substring(4, 6), 16)
      doc.setTextColor(r, g, b)
    }

    // ── HEADER ────────────────────────────────────────────────────
    doc.setFillColor(5, 150, 105)
    doc.rect(0, 0, pageW, 32, 'F')

    setFont('bold', 18, '#ffffff')
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, 13, { align: 'center' })
    setFont('normal', 12, '#d1fae5')
    doc.text('ระบบรับสมัครนักเรียนนักศึกษาออนไลน์', pageW / 2, 22, { align: 'center' })

    doc.setFillColor(240, 253, 244)
    doc.rect(0, 32, pageW, 14, 'F')
    doc.setDrawColor(5, 150, 105)
    doc.setLineWidth(0.5)
    doc.line(0, 32, pageW, 32)
    doc.line(0, 46, pageW, 46)
    setFont('bold', 16, '#065f46')
    doc.text('เอกสารการมอบตัวนักเรียนนักศึกษา', pageW / 2, 42, { align: 'center' })

    // ── ส่วนที่ 1: ใบรับรองการมอบตัว ────────────────────────────
    let y = 54
    const col1 = margin + 5
    const col2 = margin + contentW / 2 + 5
    const labelColor = '#6b7280'
    const valueColor = '#111827'

    doc.setFillColor(5, 150, 105)
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F')
    setFont('bold', 13, '#ffffff')
    doc.text('ส่วนที่ 1  ใบรับรองการมอบตัว', margin + 4, y + 6.5)
    y += 14

    // กล่องข้อมูลนักเรียน
    doc.setFillColor(248, 250, 252)
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, 42, 3, 3, 'FD')

    setFont('normal', 10, labelColor); doc.text('ชื่อ-นามสกุล', col1, y + 8)
    setFont('bold', 13, valueColor); doc.text(fullName, col1, y + 16)

    setFont('normal', 10, labelColor); doc.text('วันที่มอบตัว', col2, y + 8)
    setFont('bold', 13, valueColor)
    doc.text(new Date().toLocaleDateString('th-TH', { dateStyle: 'long' }), col2, y + 16)

    doc.setDrawColor(229, 231, 235)
    doc.setLineWidth(0.2)
    doc.line(margin + 4, y + 21, margin + contentW - 4, y + 21)

    setFont('normal', 10, labelColor); doc.text('หลักสูตร', col1, y + 28)
    setFont('bold', 13, valueColor); doc.text(userData.value.curName, col1, y + 36)

    setFont('normal', 10, labelColor); doc.text('สาขาวิชา', col2, y + 28)
    setFont('bold', 13, valueColor); doc.text(userData.value.divName, col2, y + 36)
    y += 47

    // กล่องยอดชำระ
    doc.setFillColor(236, 253, 245)
    doc.setDrawColor(16, 185, 129)
    doc.setLineWidth(0.4)
    doc.roundedRect(margin, y, contentW, 14, 3, 3, 'FD')
    setFont('normal', 11, '#065f46')
    doc.text('ยอดชำระเงิน', col1, y + 9.5)
    setFont('bold', 14, '#065f46')
    doc.text(`${userData.value.totalAmount.toLocaleString()} บาท`, margin + contentW - 5, y + 9.5, { align: 'right' })
    y += 19

    // สถานะ
    doc.setFillColor(5, 150, 105)
    doc.circle(col1 + 2.5, y + 4, 2.5, 'F')
    setFont('bold', 12, '#065f46')
    doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์', col1 + 8, y + 6)
    y += 14

    // เส้นประแบ่ง
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.3)
    doc.setLineDashPattern([2, 2], 0)
    doc.line(margin, y, margin + contentW, y)
    doc.setLineDashPattern([], 0)
    y += 8

    // ── ส่วนที่ 2: ใบสั่งซื้อเครื่องแบบ ─────────────────────────
    doc.setFillColor(37, 99, 235)
    doc.roundedRect(margin, y, contentW, 9, 2, 2, 'F')
    setFont('bold', 13, '#ffffff')
    doc.text('ส่วนที่ 2  ใบสั่งซื้อเครื่องแบบนักเรียน', margin + 4, y + 6.5)
    y += 14

    // แถบข้อมูลนักเรียน
    doc.setFillColor(239, 246, 255)
    doc.setDrawColor(147, 197, 253)
    doc.setLineWidth(0.3)
    doc.roundedRect(margin, y, contentW, 12, 2, 2, 'FD')
    setFont('normal', 10, '#1e40af')
    doc.text(
      `ชื่อ: ${fullName}   |   หลักสูตร: ${userData.value.curName}   |   สาขา: ${userData.value.divName}`,
      margin + 4, y + 8
    )
    y += 17

    // ── ตารางเครื่องแบบ ───────────────────────────────────────────
    const headers = ['ลำดับ', 'รายการเครื่องแบบ', 'ขนาด', 'จำนวน', 'ราคา/หน่วย', 'รวม']
    const colWidths = [12, 58, 20, 18, 22, 22]
    const tableRowH = 9

    const uniformItems = orderItems.value.map((item: any) => ({
      name: item.item_name ?? '',
      size: item.size ?? '-',
      qty: String(item.quantity ?? ''),
      price: String(item.unit_price ?? ''),
      total: String(item.total_price ?? ''),
    }))

    const totalRows = uniformItems.length || 8

    // หัวตาราง
    doc.setFillColor(37, 99, 235)
    doc.rect(margin, y, contentW, tableRowH, 'F')
    setFont('bold', 11, '#ffffff')
    let cx = margin
    headers.forEach((h, i) => {
      doc.text(h, cx + colWidths[i] / 2, y + 6.5, { align: 'center' })
      cx += colWidths[i]
    })
    y += tableRowH

    // แถวข้อมูลว่าง
    for (let r = 0; r < totalRows; r++) {
      // ✅ แก้ไข: ternary ที่ถูกต้อง
      const isEven = r % 2 === 0
      doc.setFillColor(isEven ? 255 : 245, isEven ? 255 : 249, isEven ? 255 : 255)
      doc.rect(margin, y, contentW, tableRowH, 'F')
      doc.setDrawColor(209, 213, 219)
      doc.setLineWidth(0.2)
      doc.rect(margin, y, contentW, tableRowH, 'S')

      // เลขลำดับ + เส้นแบ่งคอลัมน์
      cx = margin
      const item = uniformItems[r] ?? { name: '', size: '', qty: '', price: '', total: '' }
      colWidths.forEach((w, i) => {
        if (i > 0) doc.line(cx, y, cx, y + tableRowH)
        setFont('normal', 11, '#374151')
        if (i === 0) doc.text(`${r + 1}`, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 1) doc.text(item.name, cx + 2, y + 6.2)
        else if (i === 2) doc.text(item.size, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 3) doc.text(item.qty, cx + w / 2, y + 6.2, { align: 'center' })
        else if (i === 4) doc.text(item.price, cx + w - 2, y + 6.2, { align: 'right' })
        else if (i === 5) doc.text(item.total, cx + w - 2, y + 6.2, { align: 'right' })
        cx += w
      })
      y += tableRowH
    }

    // แถวรวมทั้งสิ้น
    doc.setFillColor(239, 246, 255)
    doc.rect(margin, y, contentW, tableRowH, 'F')
    doc.setDrawColor(147, 197, 253)
    doc.rect(margin, y, contentW, tableRowH, 'S')
    // เส้นแบ่งช่องรวม
    const lastColX = margin + colWidths.slice(0, 5).reduce((a, b) => a + b, 0)  // ✅ เพิ่ม
    const grandTotal = uniformItems.reduce((sum, item) => {
      return sum + (Number(item.total) || 0)
    }, 0)

    setFont('bold', 12, '#1e40af')
    doc.text('รวมทั้งสิ้น', lastColX - 3, y + 6.2, { align: 'right' })
    doc.text(grandTotal.toLocaleString(), margin + contentW - 2, y + 6.2, { align: 'right' })
    y += tableRowH + 10

    // ── ลายเซ็น ──────────────────────────────────────────────────
    const sigW = (contentW - 10) / 2
    const drawSig = (x: number, label: string) => {
      doc.setDrawColor(156, 163, 175)
      doc.setLineWidth(0.3)
      doc.line(x + 10, y + 16, x + sigW - 10, y + 16)
      setFont('normal', 11, '#374151')
      doc.text(label, x + sigW / 2, y + 22, { align: 'center' })
      doc.text('วันที่ ......../......../..........', x + sigW / 2, y + 29, { align: 'center' })
    }
    drawSig(margin, 'ลายมือชื่อผู้ปกครอง')
    drawSig(margin + sigW + 10, 'ลายมือชื่อนักเรียน')
    y += 35

    // ── FOOTER ───────────────────────────────────────────────────
    doc.setFillColor(243, 244, 246)
    doc.rect(0, 282, pageW, 15, 'F')
    doc.setDrawColor(209, 213, 219)
    doc.setLineWidth(0.2)
    doc.line(0, 282, pageW, 282)
    setFont('normal', 9, '#9ca3af')
    doc.text(`พิมพ์เมื่อ: ${now}`, margin, 289)
    doc.text('วิทยาลัยเทคนิคเลย — เอกสารนี้ออกโดยระบบอัตโนมัติ', pageW / 2, 289, { align: 'center' })
    doc.text('หน้า 1/1', pageW - margin, 289, { align: 'right' })

    doc.save(`เอกสารมอบตัว-${fullName}.pdf`)

  } catch (err) {
    console.error(err)
    showToast('error', 'สร้าง PDF ไม่สำเร็จ', 'กรุณาตรวจสอบไฟล์ font ที่ public/fonts/THSarabunNew.ttf')
  }
}

const toast = ref({ show: false, type: 'success' as 'success' | 'error', title: '', message: '' })
let toastTimer: ReturnType<typeof setTimeout> | null = null

const showToast = (type: 'success' | 'error', title: string, message: string) => {
  if (toastTimer) clearTimeout(toastTimer)
  toast.value = { show: true, type, title, message }
  toastTimer = setTimeout(() => { toast.value.show = false }, 4000)
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s ease;
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}
</style>