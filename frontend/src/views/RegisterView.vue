<template>
  <div class="max-w-4xl mx-auto">

    <!-- Stepper -->
    <div class="flex items-center justify-between mb-8">
      <div v-for="(step, i) in steps" :key="i" class="flex items-center"
        :class="i < steps.length - 1 ? 'flex-1' : ''">
        <div class="flex flex-col items-center">
          <div class="w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all"
            :class="currentStep > i ? 'bg-emerald-500 border-emerald-500 text-white'
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

      <!-- Step 1: ข้อมูลส่วนตัว -->
      <div v-if="currentStep === 0">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <UserIcon class="w-5 h-5 text-emerald-500" /> ข้อมูลส่วนตัว
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <p class="text-sm font-medium text-gray-700 mb-3">อัพโหลดภาพบัตรประชาชน *</p>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="text-sm text-gray-600 mb-1 block">ด้านหน้า *</label>
                <label class="upload-box" :class="form.idFront ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                  <input type="file" accept="image/*" class="hidden" @change="handleUpload('idFront', $event)" />
                  <div v-if="!form.idFrontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.idFrontPreview" class="w-full h-full object-contain rounded-xl" />
                </label>
              </div>
              <div>
                <label class="text-sm text-gray-600 mb-1 block">ด้านหลัง *</label>
                <label class="upload-box" :class="form.idBack ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                  <input type="file" accept="image/*" class="hidden" @change="handleUpload('idBack', $event)" />
                  <div v-if="!form.idBackPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.idBackPreview" class="w-full h-full object-contain rounded-xl" />
                </label>
              </div>
            </div>
          </div>
          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">เลขประจำตัวประชาชน *</label>
            <input v-model="form.idCard" type="text" inputmode="numeric"
              placeholder="เลขประจำตัวประชาชน 13 หลัก" maxlength="13"
              class="input-field" @keydown="blockNonDigit" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">คำนำหน้าชื่อ *</label>
            <select v-model="form.prefix" class="input-field">
              <option value="">เลือกคำนำหน้า</option>
              <option>นาย</option><option>นาง</option><option>นางสาว</option>
              <option>เด็กชาย</option><option>เด็กหญิง</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">ชื่อ - สกุล ผู้สมัคร *</label>
            <input v-model="form.fullName" type="text" placeholder="ชื่อ - นามสกุล" class="input-field" />
          </div>
          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">ที่อยู่ *</label>
            <textarea v-model="form.address" placeholder="บ้านเลขที่ หมู่ที่ ถนน ตำบล อำเภอ จังหวัด"
              rows="3" class="input-field resize-none" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">เบอร์โทรศัพท์ *</label>
            <input v-model="form.phone" type="text" inputmode="numeric" placeholder="0XX-XXX-XXXX"
              maxlength="12" class="input-field" @keydown="blockNonDigit" @input="formatPhone" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">อีเมล *</label>
            <input v-model="form.email" type="email" placeholder="example@email.com" class="input-field" />
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณากรอกข้อมูลและอัพโหลดรูปให้ครบทุกช่อง</p>
      </div>

      <!-- Step 2: ประวัติการศึกษา -->
      <div v-if="currentStep === 1">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <BuildingLibraryIcon class="w-5 h-5 text-emerald-500" /> ประวัติการศึกษาเดิม
        </h2>
        <div class="grid grid-cols-2 gap-4">
          <div class="col-span-2">
            <label class="text-sm text-gray-600 mb-1 block">ชื่อสถานศึกษาเดิม *</label>
            <input v-model="form.prevSchool" type="text" placeholder="ชื่อโรงเรียน / สถาบัน" class="input-field" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">วุฒิการศึกษา *</label>
            <select v-model="form.prevLevel" class="input-field" @change="onPrevLevelChange">
              <option value="">เลือกวุฒิการศึกษา</option>
              <option value="m3">มัธยมศึกษาตอนต้น (ม.3)</option>
              <option value="m6">มัธยมศึกษาตอนปลาย (ม.6)</option>
              <option value="pvc">ประกาศนียบัตรวิชาชีพ (ปวช.)</option>
            </select>
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">ปีที่จบการศึกษา *</label>
            <input v-model="form.prevYear" type="text" inputmode="numeric" placeholder="พ.ศ. เช่น 2567"
              maxlength="4" class="input-field" @keydown="blockNonDigit" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">เกรดเฉลี่ย (GPA) *</label>
            <input v-model="form.gpa" type="text" inputmode="decimal" placeholder="เช่น 3.50" class="input-field" />
          </div>

          <!-- แสดงหลักสูตรที่สมัครได้ -->
          <div v-if="form.prevLevel" class="col-span-2 p-4 rounded-xl border"
            :class="form.prevLevel === 'm3' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'">
            <p class="text-sm font-medium mb-1"
              :class="form.prevLevel === 'm3' ? 'text-blue-700' : 'text-emerald-700'">
              📋 หลักสูตรที่สามารถสมัครได้
            </p>
            <p class="text-sm" :class="form.prevLevel === 'm3' ? 'text-blue-600' : 'text-emerald-600'">
              <span v-if="form.prevLevel === 'm3'">✅ ประกาศนียบัตรวิชาชีพ (ปวช.) เท่านั้น</span>
              <span v-else-if="form.prevLevel === 'm6'">✅ ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) — ทุกสาขาที่รับผู้จบ ม.6</span>
              <span v-else-if="form.prevLevel === 'pvc'">✅ ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.) — ทุกสาขา</span>
            </p>
          </div>

          <!-- อัพโหลดหลักฐานการศึกษา -->
          <div class="col-span-2 mt-2">
            <p class="text-sm font-medium text-gray-700 mb-3">หลักฐานการศึกษา *</p>
            <div class="grid grid-cols-3 gap-3 mb-4">
              <div v-for="doc in docTypes" :key="doc.id"
                @click="form.docType = doc.id; form.eduFront = null; form.eduFrontPreview = ''; form.eduBack = null; form.eduBackPreview = ''"
                class="border-2 rounded-xl p-3 cursor-pointer transition-all text-center"
                :class="form.docType === doc.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'">
                <p class="text-xl mb-1">{{ doc.icon }}</p>
                <p class="text-xs font-medium text-gray-700">{{ doc.name }}</p>
              </div>
            </div>
            <div v-if="form.docType"
              :class="form.docType === 'certificate' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">
              <div>
                <label class="text-sm text-gray-600 mb-1 block">
                  {{ form.docType === 'certificate' ? 'ด้านหน้า *' : 'อัพโหลดเอกสาร *' }}
                </label>
                <label class="upload-box" :class="form.eduFront ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                  <input type="file" accept="image/*" class="hidden" @change="handleUpload('eduFront', $event)" />
                  <div v-if="!form.eduFrontPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.eduFrontPreview" class="w-full h-full object-contain rounded-xl" />
                </label>
              </div>
              <div v-if="form.docType === 'certificate'">
                <label class="text-sm text-gray-600 mb-1 block">ด้านหลัง *</label>
                <label class="upload-box" :class="form.eduBack ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
                  <input type="file" accept="image/*" class="hidden" @change="handleUpload('eduBack', $event)" />
                  <div v-if="!form.eduBackPreview" class="flex flex-col items-center gap-2 text-gray-400">
                    <PhotoIcon class="w-8 h-8" /><span class="text-xs">คลิกเพื่ออัพโหลด</span>
                  </div>
                  <img v-else :src="form.eduBackPreview" class="w-full h-full object-contain rounded-xl" />
                </label>
              </div>
            </div>
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณากรอกข้อมูลและอัพโหลดหลักฐานให้ครบทุกช่อง</p>
      </div>

      <!-- Step 3: เลือกสาขา -->
      <div v-if="currentStep === 2">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <AcademicCapIcon class="w-5 h-5 text-emerald-500" /> เลือกสาขาวิชาที่ต้องการสมัคร
        </h2>

        <div class="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
          <AcademicCapIcon class="w-4 h-4" />
          หลักสูตร: {{ fixedCourseLabel }}
        </div>

        <div v-if="isLoading" class="text-center py-8 text-gray-400">กำลังโหลดข้อมูล...</div>

        <div v-else-if="admissionPlans.length === 0" class="text-center py-8 text-gray-400">
          ไม่พบข้อมูลสาขาวิชา กรุณาตรวจสอบวุฒิการศึกษา
        </div>

        <div v-else class="grid grid-cols-1 gap-3">
          <div v-for="plan in admissionPlans" :key="plan.ap_id"
            @click="Number(plan.remaining) > 0 && selectPlan(plan.ap_id, plan.cur_id)"
            class="flex items-center justify-between border-2 rounded-xl px-5 py-4 transition-all"
            :class="Number(plan.remaining) <= 0
              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              : form.apId === plan.ap_id
                ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                : 'border-gray-200 hover:border-emerald-300 cursor-pointer'">
            <div>
              <p class="font-medium text-sm text-gray-800">{{ plan.div_name }}</p>
              <p class="text-xs text-gray-400 mt-0.5">{{ plan.cur_name }}</p>
            </div>
            <span v-if="Number(plan.remaining) <= 0"
              class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">เต็ม</span>
            <span v-else class="px-3 py-1 rounded-full text-xs font-medium"
              :class="Number(plan.remaining) <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'">
              ว่าง {{ plan.remaining }} ที่นั่ง
            </span>
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณาเลือกสาขาวิชาก่อนดำเนินการต่อ</p>
      </div>

      <!-- Step 4: ค่าใช้จ่าย -->
      <div v-if="currentStep === 3">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <ShoppingBagIcon class="w-5 h-5 text-emerald-500" /> รายการค่าใช้จ่าย
        </h2>

        <div v-if="expenses.length === 0" class="text-center py-8 text-gray-400">
          ไม่พบรายการค่าใช้จ่าย
        </div>

        <div v-else class="space-y-3">
          <div v-for="exp in expenses" :key="exp.exp_id"
            class="flex items-center justify-between border rounded-xl px-4 py-3"
            :class="exp.payment_type === 'บังคับจ่าย' ? 'border-gray-200 bg-gray-50' : 'border-gray-200'">

            <!-- ชื่อรายการ + ราคา -->
            <div class="flex items-center gap-3">
              <div class="w-2 h-2 rounded-full flex-shrink-0"
                :class="exp.payment_type === 'บังคับจ่าย' ? 'bg-red-400' : 'bg-emerald-400'" />
              <div>
                <p class="text-sm font-medium text-gray-800">{{ exp.exp_name }}</p>
                <p class="text-xs text-gray-400">
                  {{ exp.exp_cost.toLocaleString() }} บาท
                  <span class="ml-1 px-1.5 py-0.5 rounded text-xs"
                    :class="exp.payment_type === 'บังคับจ่าย' ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'">
                    {{ exp.payment_type }}
                  </span>
                </p>
              </div>
            </div>

            <!-- บังคับจ่าย: แสดงแค่ราคา -->
            <div v-if="exp.payment_type === 'บังคับจ่าย'"
              class="text-sm font-semibold text-gray-700">
              {{ exp.exp_cost.toLocaleString() }} บาท
            </div>

            <!-- ไม่บังคับ: มีตัวเลือกจำนวน -->
            <div v-else class="flex items-center gap-3">
              <select
                v-if="exp.exp_name.includes('เครื่องแบบ') || exp.exp_name.includes('กางเกง') || exp.exp_name.includes('รองเท้า') || exp.exp_name.includes('เสื้อ')"
                v-model="form.expenseOrders[exp.exp_id].size"
                class="input-field !w-20 !py-1.5 text-xs">
                <option value="">ไซส์</option>
                <option v-for="s in ['XS','S','M','L','XL','XXL']" :key="s">{{ s }}</option>
              </select>
              <div class="flex items-center gap-2">
                <button @click="changeQty(exp.exp_id, -1)"
                  class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg leading-none">−</button>
                <span class="w-6 text-center text-sm font-medium">{{ form.expenseOrders[exp.exp_id]?.qty ?? 1 }}</span>
                <button @click="changeQty(exp.exp_id, 1)"
                  class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 text-lg leading-none">+</button>
              </div>
            </div>
          </div>
        </div>

        <!-- ยอดรวม -->
        <div class="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-2">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">ยอดบังคับจ่าย</span>
            <span class="font-medium text-red-600">{{ requiredTotal.toLocaleString() }} บาท</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">รายการเพิ่มเติม</span>
            <span class="font-medium text-gray-600">{{ (totalPrice - requiredTotal).toLocaleString() }} บาท</span>
          </div>
          <div class="flex justify-between border-t border-emerald-200 pt-2 mt-1">
            <span class="font-semibold text-gray-700">ยอดรวมทั้งหมด</span>
            <span class="text-lg font-bold text-emerald-600">{{ totalPrice.toLocaleString() }} บาท</span>
          </div>
        </div>
      </div>

      <!-- Step 5: ยืนยันและปริ้นท์ -->
      <div v-if="currentStep === 4">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <PrinterIcon class="w-5 h-5 text-emerald-500" /> ยืนยันข้อมูลและใบชำระเงิน
        </h2>
        <div class="space-y-4 text-sm">
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ข้อมูลส่วนตัว</p>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-400">ชื่อ - สกุล</p><p class="font-medium">{{ form.prefix }} {{ form.fullName }}</p></div>
              <div><p class="text-xs text-gray-400">เลขบัตรประชาชน</p><p class="font-medium">{{ form.idCard }}</p></div>
              <div><p class="text-xs text-gray-400">โทรศัพท์</p><p class="font-medium">{{ form.phone }}</p></div>
              <div><p class="text-xs text-gray-400">อีเมล</p><p class="font-medium">{{ form.email }}</p></div>
              <div class="col-span-2"><p class="text-xs text-gray-400">ที่อยู่</p><p class="font-medium">{{ form.address }}</p></div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">หลักสูตรและสาขาวิชา</p>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-400">หลักสูตร</p><p class="font-medium text-emerald-600">{{ fixedCourseLabel }}</p></div>
              <div><p class="text-xs text-gray-400">สาขาวิชา</p><p class="font-medium text-emerald-600">{{ selectedPlan?.div_name || '-' }}</p></div>
            </div>
          </div>
          <div class="bg-gray-50 rounded-xl p-4">
            <p class="font-medium text-gray-700 mb-3">ประวัติการศึกษา</p>
            <div class="grid grid-cols-2 gap-3">
              <div><p class="text-xs text-gray-400">สถานศึกษาเดิม</p><p class="font-medium">{{ form.prevSchool }}</p></div>
              <div><p class="text-xs text-gray-400">วุฒิการศึกษา</p><p class="font-medium">{{ prevLevelLabel }}</p></div>
              <div><p class="text-xs text-gray-400">ปีที่จบ</p><p class="font-medium">{{ form.prevYear }}</p></div>
              <div><p class="text-xs text-gray-400">เกรดเฉลี่ย</p><p class="font-medium">{{ form.gpa }}</p></div>
            </div>
          </div>
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-gray-700">ยอดชำระทั้งหมด</p>
              <p class="text-xs text-gray-400 mt-0.5">รวมค่าใช้จ่ายทั้งหมด</p>
            </div>
            <p class="text-2xl font-semibold text-emerald-600">{{ totalPrice.toLocaleString() }} บาท</p>
          </div>
        </div>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between mt-8">
        <button v-if="currentStep > 0" @click="currentStep--; showError = false"
          class="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm hover:bg-gray-50 transition-all">
          ย้อนกลับ
        </button>
        <div v-else />
        <button v-if="currentStep < 4" @click="nextStep"
          class="px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all">
          ถัดไป
        </button>
        <button v-else @click="submitForm" :disabled="isSubmitting"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all disabled:opacity-50">
          <PrinterIcon class="w-4 h-4" />
          {{ isSubmitting ? 'กำลังบันทึก...' : 'ยืนยันและปริ้นท์ใบชำระเงิน' }}
        </button>
      </div>
    </div>

    <ConfirmToast :show="showConfirm" @confirm="onConfirmed" @cancel="showConfirm = false" />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { applicationService } from '../services/applicationService'
import { exportPaymentPDF } from '../utils/exportPaymentPDF'
import ConfirmToast from '../components/ConfirmToast.vue'
import {
  UserIcon, CheckIcon, PhotoIcon, PrinterIcon, AcademicCapIcon,
  BuildingLibraryIcon, ShoppingBagIcon,
} from '@heroicons/vue/24/outline'

const currentStep = ref(0)
const showError = ref(false)
const showConfirm = ref(false)
const isSubmitting = ref(false)
const isLoading = ref(false)

// ข้อมูลจาก API
const curriculums = ref<any[]>([])
const admissionPlans = ref<any[]>([])
const expenses = ref<any[]>([])

const steps = [
  { label: 'ข้อมูลส่วนตัว', sub: 'กรอกข้อมูลส่วนตัว', icon: UserIcon },
  { label: 'ประวัติการศึกษา', sub: 'วุฒิการศึกษาเดิม', icon: BuildingLibraryIcon },
  { label: 'เลือกสาขา', sub: 'สาขาวิชาที่สมัคร', icon: AcademicCapIcon },
  { label: 'ค่าใช้จ่าย', sub: 'รายการค่าใช้จ่าย', icon: ShoppingBagIcon },
  { label: 'ยืนยัน/ปริ้นท์', sub: 'ตรวจสอบและพิมพ์', icon: PrinterIcon },
]

const docTypes = [
  { id: 'certificate', name: 'วุฒิการศึกษา (ป.พ.)', icon: '📄' },
  { id: 'letter', name: 'หนังสือรับรองการเป็นนักเรียน', icon: '📃' },
  { id: 'studentcard', name: 'บัตรนักเรียน', icon: '🪪' },
]

const form = reactive({
  // Step 1
  prefix: '', fullName: '', idCard: '', address: '', phone: '', email: '',
  idFront: null as File | null, idBack: null as File | null,
  idFrontPreview: '', idBackPreview: '',
  // Step 2
  prevSchool: '', prevLevel: '', prevYear: '', gpa: '',
  docType: '',
  eduFront: null as File | null, eduFrontPreview: '',
  eduBack: null as File | null, eduBackPreview: '',
  // Step 3
  curId: 0, apId: 0,
  // Step 4
  expenseOrders: {} as Record<number, { qty: number; size: string }>,
})

// ===== Computed =====

const fixedCourseLabel = computed(() => {
  if (form.prevLevel === 'm3') return 'ประกาศนียบัตรวิชาชีพ (ปวช.)'
  return 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)'
})

const prevLevelLabel = computed(() => {
  const map: Record<string, string> = { m3: 'ม.3', m6: 'ม.6', pvc: 'ปวช.' }
  return map[form.prevLevel] || ''
})

const selectedPlan = computed(() =>
  admissionPlans.value.find(p => p.ap_id === form.apId)
)

const requiredExpenses = computed(() =>
  expenses.value.filter(e => e.payment_type === 'บังคับจ่าย')
)

// ยอดบังคับจ่าย (qty = 1 เสมอ)
const requiredTotal = computed(() =>
  requiredExpenses.value.reduce((sum, e) => sum + e.exp_cost, 0)
)

// ยอดรวมทั้งหมด
const totalPrice = computed(() => {
  let total = requiredTotal.value
  expenses.value
    .filter(e => e.payment_type !== 'บังคับจ่าย')
    .forEach(e => {
      const qty = form.expenseOrders[e.exp_id]?.qty || 0
      total += e.exp_cost * qty
    })
  return total
})

// ===== Functions =====

onMounted(async () => {
  try {
    const res = await applicationService.getCurriculums()
    curriculums.value = res.data.data
  } catch (err) {
    console.error('โหลดหลักสูตรไม่สำเร็จ', err)
  }
})

// เมื่อเปลี่ยนวุฒิการศึกษา → ดึงสาขาใหม่
async function onPrevLevelChange() {
  form.apId = 0
  form.curId = 0
  admissionPlans.value = []
  expenses.value = []

  if (!form.prevLevel) return
  isLoading.value = true
  try {
    const res = await applicationService.getAdmissionPlan(form.prevLevel, '2569')
    admissionPlans.value = res.data.data
  } catch (err) {
    console.error('โหลดสาขาไม่สำเร็จ', err)
  } finally {
    isLoading.value = false
  }
}

// เมื่อเลือกสาขา → ดึงค่าใช้จ่าย
function selectPlan(ap_id: number, cur_id: number) {
  form.apId = ap_id
  form.curId = cur_id
  loadExpenses(cur_id)
}

async function loadExpenses(curId: number) {
  try {
    const res = await applicationService.getExpenses(curId)
    expenses.value = res.data.data
    // init orders — default qty = 1 ทุกรายการ
    expenses.value.forEach(e => {
      if (!form.expenseOrders[e.exp_id]) {
        form.expenseOrders[e.exp_id] = { qty: 1, size: '' }
      }
    })
  } catch (err) {
    console.error('โหลดค่าใช้จ่ายไม่สำเร็จ', err)
  }
}

function changeQty(expId: number, delta: number) {
  const current = form.expenseOrders[expId]?.qty || 0
  form.expenseOrders[expId] = {
    ...form.expenseOrders[expId],
    qty: Math.max(0, current + delta),
  }
}

function blockNonDigit(e: KeyboardEvent) {
  const allowed = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab']
  if (!allowed.includes(e.key) && !/^\d$/.test(e.key)) e.preventDefault()
}

function formatPhone(e: Event) {
  const digits = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 3) form.phone = digits
  else if (digits.length <= 6) form.phone = digits.slice(0, 3) + '-' + digits.slice(3)
  else form.phone = digits.slice(0, 3) + '-' + digits.slice(3, 6) + '-' + digits.slice(6)
}

function handleUpload(field: 'idFront' | 'idBack' | 'eduFront' | 'eduBack', event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (!file) return
  form[field] = file
  const reader = new FileReader()
  reader.onload = (e) => {
    const result = e.target?.result as string
    if (field === 'idFront') form.idFrontPreview = result
    else if (field === 'idBack') form.idBackPreview = result
    else if (field === 'eduFront') form.eduFrontPreview = result
    else if (field === 'eduBack') form.eduBackPreview = result
  }
  reader.readAsDataURL(file)
}

function validateStep() {
  if (currentStep.value === 0) {
    return !!(form.prefix && form.fullName && form.idCard.length === 13
      && form.address && form.phone.replace(/\D/g, '').length === 10
      && form.email && form.idFront && form.idBack)
  }
  if (currentStep.value === 1) {
    const eduValid = form.docType && form.eduFront &&
      (form.docType !== 'certificate' || form.eduBack)
    return !!(form.prevSchool && form.prevLevel && form.prevYear && form.gpa && eduValid)
  }
  if (currentStep.value === 2) return !!form.apId
  return true
}

function nextStep() {
  showError.value = false
  if (!validateStep()) { showError.value = true; return }
  currentStep.value++
}

function submitForm() {
  showConfirm.value = true
}

async function onConfirmed() {
  showConfirm.value = false
  isSubmitting.value = true
  try {
    const fd = new FormData()
    fd.append('id_card_number', form.idCard)
    fd.append('prefix', form.prefix)
    fd.append('full_name', form.fullName)
    fd.append('address', form.address)
    fd.append('phone', form.phone)
    fd.append('email', form.email)
    if (form.idFront) fd.append('id_front', form.idFront)
    if (form.idBack) fd.append('id_back', form.idBack)
    fd.append('prev_school', form.prevSchool)
    fd.append('prev_level', form.prevLevel)
    fd.append('prev_year', form.prevYear)
    fd.append('gpa', form.gpa)
    fd.append('doc_type', form.docType)
    if (form.eduFront) fd.append('edu_front', form.eduFront)
    if (form.eduBack) fd.append('edu_back', form.eduBack)
    fd.append('cur_id', String(form.curId))
    fd.append('div_id', String(selectedPlan.value?.div_id || 0))
    fd.append('ap_id', String(form.apId))

    // รวม required (qty=1) + optional (ตามที่เลือก)
    const expenseList = expenses.value
      .filter(e => {
        if (e.payment_type === 'บังคับจ่าย') return true
        return (form.expenseOrders[e.exp_id]?.qty || 0) > 0
      })
      .map(e => ({
        exp_id: e.exp_id,
        quantity: e.payment_type === 'บังคับจ่าย' ? 1 : form.expenseOrders[e.exp_id].qty,
        size: form.expenseOrders[e.exp_id]?.size || null,
        unit_price: e.exp_cost,
        is_required: e.payment_type === 'บังคับจ่าย',
      }))
    fd.append('expenses', JSON.stringify(expenseList))

    const res = await applicationService.createApplication(fd)
    const { total_amount } = res.data.data

    await exportPaymentPDF({
      prefix: form.prefix,
      fullName: form.fullName,
      idCard: form.idCard,
      phone: form.phone,
      courseLabel: fixedCourseLabel.value,
      branchName: selectedPlan.value?.div_name || '-',
      totalPrice: total_amount,
    })

  } catch (err: any) {
    alert(err.response?.data?.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง')
  } finally {
    isSubmitting.value = false
  }
}
</script>
