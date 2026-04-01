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
            <input v-model="form.idCard" type="text" inputmode="numeric" placeholder="เลขประจำตัวประชาชน 13 หลัก" maxlength="13" class="input-field" @keydown="blockNonDigit" />
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
            <textarea v-model="form.address" placeholder="บ้านเลขที่ หมู่ที่ ถนน ตำบล อำเภอ จังหวัด" rows="3" class="input-field resize-none" />
          </div>
          <div>
            <label class="text-sm text-gray-600 mb-1 block">เบอร์โทรศัพท์ *</label>
            <input v-model="form.phone" type="text" inputmode="numeric" placeholder="0XX-XXX-XXXX" maxlength="12" class="input-field" @keydown="blockNonDigit" @input="formatPhone" />
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
      <select v-model="form.prevLevel" class="input-field" @change="form.courseType = 0; form.branch = 0">
        <option value="">เลือกวุฒิการศึกษา</option>
        <option value="m3">มัธยมศึกษาตอนต้น (ม.3)</option>
        <option value="m6">มัธยมศึกษาตอนปลาย (ม.6)</option>
        <option value="pvc">ประกาศนียบัตรวิชาชีพ (ปวช.)</option>
      </select>
    </div>
    <div>
      <label class="text-sm text-gray-600 mb-1 block">ปีที่จบการศึกษา *</label>
      <input v-model="form.prevYear" type="text" inputmode="numeric" placeholder="พ.ศ. เช่น 2567" maxlength="4" class="input-field" @keydown="blockNonDigit" />
    </div>
    <div>
      <label class="text-sm text-gray-600 mb-1 block">เกรดเฉลี่ย (GPA) *</label>
      <input v-model="form.gpa" type="text" inputmode="decimal" placeholder="เช่น 3.50" class="input-field" />
    </div>

    <!-- แสดงหลักสูตรที่สมัครได้ -->
    <div v-if="form.prevLevel" class="col-span-2 p-4 rounded-xl border"
      :class="form.prevLevel === 'm3' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'">
      <p class="text-sm font-medium mb-1" :class="form.prevLevel === 'm3' ? 'text-blue-700' : 'text-emerald-700'">
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

      <!-- เลือกประเภทหลักฐาน -->
      <div class="grid grid-cols-3 gap-3 mb-4">
        <div v-for="doc in docTypes" :key="doc.id"
          @click="form.docType = doc.id; form.eduFront = null; form.eduFrontPreview = ''; form.eduBack = null; form.eduBackPreview = ''"
          class="border-2 rounded-xl p-3 cursor-pointer transition-all text-center"
          :class="form.docType === doc.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-emerald-300'">
          <p class="text-xl mb-1">{{ doc.icon }}</p>
          <p class="text-xs font-medium text-gray-700">{{ doc.name }}</p>
        </div>
      </div>

      <!-- ช่องอัพโหลด -->
      <div v-if="form.docType" :class="form.docType === 'certificate' ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1'">
        <!-- ด้านหน้า (ทุกประเภท) -->
        <div>
          <label class="text-sm text-gray-600 mb-1 block">
            {{ form.docType === 'certificate' ? 'ด้านหน้า *' : 'อัพโหลดเอกสาร *' }}
          </label>
          <label class="upload-box" :class="form.eduFront ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
            <input type="file" accept="image/*" class="hidden" @change="handleUpload('eduFront', $event)" />
            <div v-if="!form.eduFrontPreview" class="flex flex-col items-center gap-2 text-gray-400">
              <PhotoIcon class="w-8 h-8" />
              <span class="text-xs">คลิกเพื่ออัพโหลด</span>
            </div>
            <img v-else :src="form.eduFrontPreview" class="w-full h-full object-contain rounded-xl" />
          </label>
        </div>
        <!-- ด้านหลัง (เฉพาะ ป.พ.) -->
        <div v-if="form.docType === 'certificate'">
          <label class="text-sm text-gray-600 mb-1 block">ด้านหลัง *</label>
          <label class="upload-box" :class="form.eduBack ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'">
            <input type="file" accept="image/*" class="hidden" @change="handleUpload('eduBack', $event)" />
            <div v-if="!form.eduBackPreview" class="flex flex-col items-center gap-2 text-gray-400">
              <PhotoIcon class="w-8 h-8" />
              <span class="text-xs">คลิกเพื่ออัพโหลด</span>
            </div>
            <img v-else :src="form.eduBackPreview" class="w-full h-full object-contain rounded-xl" />
          </label>
        </div>
      </div>
    </div>
  </div>
  <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณากรอกข้อมูลและอัพโหลดหลักฐานให้ครบทุกช่อง</p>
</div>

      <!-- Step 3: เลือกหลักสูตรและสาขา -->
      <div v-if="currentStep === 2">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <AcademicCapIcon class="w-5 h-5 text-emerald-500" /> เลือกสาขาวิชาที่ต้องการสมัคร
        </h2>

        <!-- Badge หลักสูตร (fix จากวุฒิ) -->
        <div class="mb-5 inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl text-sm font-medium">
          <AcademicCapIcon class="w-4 h-4" />
          หลักสูตร: {{ fixedCourseLabel }}
        </div>

        <div class="grid grid-cols-1 gap-3">
          <div v-for="branch in availableBranches" :key="branch.id"
            @click="!branch.full && (form.branch = branch.id)"
            class="flex items-center justify-between border-2 rounded-xl px-5 py-4 transition-all"
            :class="branch.full
              ? 'border-gray-100 bg-gray-50 cursor-not-allowed opacity-60'
              : form.branch === branch.id
                ? 'border-emerald-500 bg-emerald-50 cursor-pointer'
                : 'border-gray-200 hover:border-emerald-300 cursor-pointer'">
            <div class="flex items-center gap-4">
              <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                :class="form.branch === branch.id ? 'bg-emerald-500' : branch.full ? 'bg-gray-200' : 'bg-gray-100'">
                <component :is="branch.icon" class="w-4 h-4" :class="form.branch === branch.id ? 'text-white' : 'text-gray-400'" />
              </div>
              <div>
                <p class="font-medium text-sm text-gray-800">{{ branch.name }}</p>
                <p class="text-xs text-gray-400 mt-0.5">{{ branch.desc }}</p>
              </div>
            </div>
            <div class="flex-shrink-0 ml-4">
              <span v-if="branch.full"
                class="px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-600">เต็ม</span>
              <span v-else
                class="px-3 py-1 rounded-full text-xs font-medium"
                :class="branch.remaining <= 5 ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'">
                ว่าง {{ branch.remaining }} ที่นั่ง
              </span>
            </div>
          </div>
        </div>
        <p v-if="showError" class="text-red-500 text-sm mt-4">⚠️ กรุณาเลือกสาขาวิชาก่อนดำเนินการต่อ</p>
      </div>

      <!-- Step 4: เครื่องแบบและอุปกรณ์ -->
      <div v-if="currentStep === 3">
        <h2 class="text-lg font-semibold text-gray-700 flex items-center gap-2 mb-6">
          <ShoppingBagIcon class="w-5 h-5 text-emerald-500" /> สั่งเครื่องแบบและอุปกรณ์การเรียน
        </h2>
        <p class="text-sm font-medium text-gray-600 mb-3">เครื่องแบบนักเรียน</p>
        <div class="space-y-3 mb-6">
          <div v-for="item in uniformItems" :key="item.id"
            class="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
              <p class="text-xs text-gray-400">{{ item.price.toLocaleString() }} บาท / ชิ้น</p>
            </div>
            <div class="flex items-center gap-3">
              <select v-if="item.hasSizes" v-model="form.uniform[item.id].size" class="input-field !w-20 !py-1.5 text-xs">
                <option value="">ไซส์</option>
                <option v-for="s in ['XS','S','M','L','XL','XXL']" :key="s">{{ s }}</option>
              </select>
              <div class="flex items-center gap-2">
                <button @click="changeQty('uniform', item.id, -1)"
                  class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg leading-none">−</button>
                <span class="w-6 text-center text-sm font-medium">{{ form.uniform[item.id].qty }}</span>
                <button @click="changeQty('uniform', item.id, 1)"
                  class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 text-lg leading-none">+</button>
              </div>
            </div>
          </div>
        </div>
        <p class="text-sm font-medium text-gray-600 mb-3">อุปกรณ์การเรียน</p>
        <div class="space-y-3">
          <div v-for="item in equipmentItems" :key="item.id"
            class="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3">
            <div>
              <p class="text-sm font-medium text-gray-800">{{ item.name }}</p>
              <p class="text-xs text-gray-400">{{ item.price.toLocaleString() }} บาท / ชิ้น</p>
            </div>
            <div class="flex items-center gap-2">
              <button @click="changeQty('equipment', item.id, -1)"
                class="w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-lg leading-none">−</button>
              <span class="w-6 text-center text-sm font-medium">{{ form.equipment[item.id].qty }}</span>
              <button @click="changeQty('equipment', item.id, 1)"
                class="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center text-white hover:bg-emerald-600 text-lg leading-none">+</button>
            </div>
          </div>
        </div>
        <!-- ยอดรวม -->
        <div v-if="totalPrice > 0" class="mt-4 flex justify-end">
          <div class="bg-emerald-50 border border-emerald-200 rounded-xl px-5 py-3 flex items-center gap-4">
            <p class="text-sm text-gray-600">ยอดรวมเครื่องแบบ/อุปกรณ์</p>
            <p class="text-lg font-semibold text-emerald-600">{{ totalPrice.toLocaleString() }} บาท</p>
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
              <div><p class="text-xs text-gray-400">สาขาวิชา</p><p class="font-medium text-emerald-600">{{ availableBranches.find(b => b.id === form.branch)?.name }}</p></div>
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
              <p class="text-xs text-gray-400 mt-0.5">รวมค่าเครื่องแบบและอุปกรณ์</p>
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
        <button v-else @click="submitForm"
          class="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 text-white text-sm hover:bg-emerald-600 transition-all">
          <PrinterIcon class="w-4 h-4" /> ยืนยันและปริ้นท์ใบชำระเงิน
        </button>
      </div>
    </div>
    <ConfirmToast
  :show="showConfirm"
  @confirm="onConfirmed"
  @cancel="showConfirm = false"
/>
  </div>
</template>

<script setup lang="ts">

import { ref, reactive, computed } from 'vue'
import {
  UserIcon, CheckIcon, PhotoIcon, PrinterIcon, AcademicCapIcon,
  BuildingLibraryIcon, ShoppingBagIcon, WrenchScrewdriverIcon,
  BoltIcon, CpuChipIcon, ComputerDesktopIcon, BeakerIcon,
  CogIcon, HomeModernIcon, SparklesIcon, CircleStackIcon
} from '@heroicons/vue/24/outline'

import ConfirmToast from '../components/ConfirmToast.vue'
import { exportPaymentPDF } from '../utils/exportPaymentPDF'

const currentStep = ref(0)
const showError = ref(false)
const showConfirm = ref(false)

const steps = [
  { label: 'ข้อมูลส่วนตัว', sub: 'กรอกข้อมูลส่วนตัว', icon: UserIcon },
  { label: 'ประวัติการศึกษา', sub: 'วุฒิการศึกษาเดิม', icon: BuildingLibraryIcon },
  { label: 'เลือกสาขา', sub: 'สาขาวิชาที่สมัคร', icon: AcademicCapIcon },
  { label: 'เครื่องแบบ/อุปกรณ์', sub: 'สั่งซื้อล่วงหน้า', icon: ShoppingBagIcon },
  { label: 'ยืนยัน/ปริ้นท์', sub: 'ตรวจสอบและพิมพ์', icon: PrinterIcon },
]


// เพิ่มใน docTypes
const docTypes = [
  { id: 'certificate', name: 'วุฒิการศึกษา (ป.พ.)', icon: '📄' },
  { id: 'letter', name: 'หนังสือรับรองการเป็นนักเรียน', icon: '📃' },
  { id: 'studentcard', name: 'บัตรนักเรียน', icon: '🪪' },
]
// สาขา ปวช.
const pvcBranches = [
  { id: 101, name: 'ช่างยนต์', desc: 'ปวช. สาขาช่างยนต์', icon: WrenchScrewdriverIcon, remaining: 15, full: false },
  { id: 102, name: 'ช่างกลโรงงาน', desc: 'ปวช. สาขาช่างกล', icon: CogIcon, remaining: 8, full: false },
  { id: 103, name: 'ช่างเชื่อมโลหะ', desc: 'ปวช. สาขาเชื่อมโลหะ', icon: BeakerIcon, remaining: 0, full: true },
  { id: 104, name: 'ช่างไฟฟ้า', desc: 'ปวช. สาขาช่างไฟฟ้า', icon: BoltIcon, remaining: 20, full: false },
  { id: 105, name: 'ช่างอิเล็กทรอนิกส์', desc: 'ปวช. สาขาอิเล็กทรอนิกส์', icon: CircleStackIcon, remaining: 5, full: false },
  { id: 106, name: 'เมคคาทรอนิกส์', desc: 'ปวช. สาขาเมคคาทรอนิกส์', icon: CogIcon, remaining: 12, full: false },
  { id: 107, name: 'ช่างก่อสร้าง', desc: 'ปวช. สาขาก่อสร้าง', icon: HomeModernIcon, remaining: 0, full: true },
  { id: 108, name: 'โยธา', desc: 'ปวช. สาขาโยธา', icon: HomeModernIcon, remaining: 7, full: false },
  { id: 109, name: 'สถาปัตยกรรม', desc: 'ปวช. สาขาสถาปัตยกรรม', icon: HomeModernIcon, remaining: 10, full: false },
  { id: 110, name: 'เทคโนโลยีสารสนเทศ (IT)', desc: 'ปวช. สาขาไอที', icon: ComputerDesktopIcon, remaining: 3, full: false },
  { id: 111, name: 'เทคโนโลยีคอมพิวเตอร์', desc: 'ปวช. สาขาคอมพิวเตอร์', icon: CpuChipIcon, remaining: 18, full: false },
  { id: 112, name: 'เทคโนโลยีปัญญาประดิษฐ์ (AI)', desc: 'ปวช. สาขา AI', icon: SparklesIcon, remaining: 0, full: true },
]

// สาขา ปวส.
const pvsBranches = [
  { id: 201, name: 'เทคนิคยานยนต์', desc: 'ผู้จบ ม.6 หรือ ปวช.ต่างสาขา', icon: WrenchScrewdriverIcon, remaining: 10, full: false, forM6: true },
  { id: 202, name: 'เทคนิคยานยนต์', desc: 'ปวช.ตรงสาขา', icon: WrenchScrewdriverIcon, remaining: 0, full: true, forM6: false },
  { id: 203, name: 'เทคนิคยานยนต์ (ทวิภาคี)', desc: 'เฉพาะผู้จบ ปวช.ตรงสาขา', icon: WrenchScrewdriverIcon, remaining: 6, full: false, forM6: false },
  { id: 204, name: 'เทคนิคการผลิต', desc: 'ผู้จบ ม.6 หรือ ปวช.ต่างสาขา', icon: CogIcon, remaining: 8, full: false, forM6: true },
  { id: 205, name: 'เทคนิคการผลิต', desc: 'ปวช.ตรงสาขา', icon: CogIcon, remaining: 14, full: false, forM6: false },
  { id: 206, name: 'เทคนิคการผลิต (ทวิภาคี)', desc: 'เฉพาะผู้จบ ปวช.ตรงสาขา', icon: CogIcon, remaining: 0, full: true, forM6: false },
  { id: 207, name: 'เทคนิคโลหะ', desc: 'ผู้จบ ม.6 หรือ ปวช.ต่างสาขา', icon: BeakerIcon, remaining: 5, full: false, forM6: true },
  { id: 208, name: 'เทคนิคโลหะ', desc: 'ปวช.ตรงสาขา', icon: BeakerIcon, remaining: 9, full: false, forM6: false },
]

const uniformItems = [
  { id: 'shirt', name: 'เสื้อเครื่องแบบ', price: 350, hasSizes: true },
  { id: 'pants', name: 'กางเกง/กระโปรง', price: 300, hasSizes: true },
  { id: 'shoes', name: 'รองเท้า', price: 450, hasSizes: true },
]
const equipmentItems = [
  { id: 'bag', name: 'กระเป๋านักเรียน', price: 250 },
  { id: 'set', name: 'ชุดอุปกรณ์การเรียน', price: 180 },
]

const form = reactive({
  prefix: '', fullName: '', idCard: '', address: '', phone: '', email: '',
  idFront: null as File | null, idBack: null as File | null,
  idFrontPreview: '', idBackPreview: '',
  prevSchool: '', prevLevel: '', prevYear: '', gpa: '',
  courseType: 0, branch: 0,
  uniform: {
    shirt: { qty: 0, size: '' }, pants: { qty: 0, size: '' }, shoes: { qty: 0, size: '' },
  } as Record<string, { qty: number; size: string }>,
  equipment: {
    bag: { qty: 0 }, set: { qty: 0 },
  } as Record<string, { qty: number }>,
  docType: '',
eduFront: null as File | null,
eduFrontPreview: '',
eduBack: null as File | null,
eduBackPreview: '',
})

// หลักสูตรที่ fix จากวุฒิ
const fixedCourseLabel = computed(() => {
  if (form.prevLevel === 'm3') return 'ประกาศนียบัตรวิชาชีพ (ปวช.)'
  return 'ประกาศนียบัตรวิชาชีพชั้นสูง (ปวส.)'
})

const prevLevelLabel = computed(() => {
  const map: Record<string, string> = { m3: 'ม.3', m6: 'ม.6', pvc: 'ปวช.' }
  return map[form.prevLevel] || ''
})

// สาขาที่แสดงตามวุฒิ
const availableBranches = computed(() => {
  if (form.prevLevel === 'm3') return pvcBranches
  if (form.prevLevel === 'm6') return pvsBranches.filter(b => b.forM6)
  if (form.prevLevel === 'pvc') return pvsBranches
  return []
})

const totalPrice = computed(() => {
  let total = 0
  uniformItems.forEach(i => { total += i.price * (form.uniform[i.id]?.qty || 0) })
  equipmentItems.forEach(i => { total += i.price * (form.equipment[i.id]?.qty || 0) })
  return total
})

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

function changeQty(type: 'uniform' | 'equipment', id: string, delta: number) {
  const current = form[type][id].qty
  form[type][id].qty = Math.max(0, current + delta)
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
  if (currentStep.value === 2) return !!form.branch
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
  await exportPaymentPDF({
    prefix: form.prefix,
    fullName: form.fullName,
    idCard: form.idCard,
    phone: form.phone,
    courseLabel: fixedCourseLabel.value,
    branchName: availableBranches.value.find(b => b.id === form.branch)?.name || '-',
    totalPrice: totalPrice.value,
  })
}


</script>