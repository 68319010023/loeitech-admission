<template>
  <div class="space-y-8">
    <!-- Welcome Section -->
    <div class="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
      <h1 class="text-3xl font-bold mb-4">ยินดีต้อนรับสู่ระบบรับสมัครนักเรียนนักศึกษา</h1>
      <p class="text-lg text-green-50 mb-6">
        วิทยาลัยเทคนิคเลย - ปีการศึกษา 2566
      </p>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="bg-white/20 backdrop-blur rounded-xl p-4">
          <div class="text-3xl font-bold">150</div>
          <div class="text-sm text-green-100">ผู้สมัครทั้งหมด</div>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-xl p-4">
          <div class="text-3xl font-bold">120</div>
          <div class="text-sm text-green-100">มอบตัวแล้ว</div>
        </div>
        <div class="bg-white/20 backdrop-blur rounded-xl p-4">
          <div class="text-3xl font-bold">30</div>
          <div class="text-sm text-green-100">รอดำเนินการ</div>
        </div>
      </div>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">กรอกใบสมัคร</h3>
            <p class="text-sm text-gray-600">สมัครเป็นนักเรียนนักศึกษาใหม่</p>
          </div>
        </div>
        <RouterLink 
          to="/register"
          class="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          สมัครเลย
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </RouterLink>
      </div>

      <div class="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div class="flex items-center gap-4 mb-4">
          <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-800">มอบตัว</h3>
            <p class="text-sm text-gray-600">ยืนยันการเข้าศึกษา</p>
          </div>
        </div>
        <RouterLink 
          to="/status"
          class="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          มอบตัว
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
          </svg>
        </RouterLink>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="bg-white rounded-xl shadow-lg p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">กิจกรรมล่าสุด</h2>
      <div class="space-y-3">
        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">นายสมชาย ใจดี มอบตัวเรียบร้อยแล้ว</p>
            <p class="text-xs text-gray-500">2 นาทีที่แล้ว</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">นางสาวสมศรี รักดี สมัครเรียนสาขาคอมพิวเตอร์</p>
            <p class="text-xs text-gray-500">15 นาทีที่แล้ว</p>
          </div>
        </div>
        <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
          <div class="w-2 h-2 bg-green-500 rounded-full"></div>
          <div class="flex-1">
            <p class="text-sm font-medium text-gray-800">นายวิชัย มีชัย อัปโหลดเอกสารเรียบร้อย</p>
            <p class="text-xs text-gray-500">1 ชั่วโมงที่แล้ว</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Important Information -->
    <div class="bg-amber-50 border border-amber-200 rounded-xl p-6">
      <div class="flex gap-4">
        <div class="flex-shrink-0">
          <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
        </div>
        <div>
          <h3 class="text-lg font-semibold text-amber-800 mb-2">ข้อมูลสำคัญ</h3>
          <ul class="text-sm text-amber-700 space-y-1">
            <li>• รับสมัครนักเรียนนักศึกษาประจำปีการศึกษา 2566</li>
            <li>• กำหนดการมอบตัว: 1-15 เมษายน 2566</li>
            <li>• สอบสัมภาษณ์: 20-25 เมษายน 2566</li>
            <li>• ประกาศผล: 30 เมษายน 2566</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// สามารถเพิ่ม logic สำหรับดึงข้อมูลจาก backend ได้ที่นี่
</script>
