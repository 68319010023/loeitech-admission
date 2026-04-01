<template>
  <div class="flex h-screen bg-gray-50">
    <!-- Sidebar -->
    <aside
      class="w-64 flex-shrink-0 flex flex-col"
      style="background: linear-gradient(to bottom, rgba(20, 184, 166, 0.9), rgba(101, 163, 13, 0.9))"
    >
      <!-- Logo -->
      <div class="p-6 border-b border-white/20">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <AcademicCapIcon class="w-6 h-6 text-white" />
          </div>
          <div>
            <p class="text-white font-semibold text-sm">วิทยาลัยเทคนิคเลย</p>
            <p class="text-white/70 text-xs">LoeiTech <br/> Online Admission System</p>
          </div>
        </div>
      </div>

      <!-- Menu -->
      <nav class="flex-1 p-4 space-y-1">
        <p class="text-white/50 text-xs font-medium px-3 py-2">เมนูหลัก</p>

        <RouterLink
          to="/register"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/register' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'"
        >
          <DocumentTextIcon class="w-5 h-5" />
          กรอกใบสมัคร
        </RouterLink>

        <RouterLink
          to="/status"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path === '/status' ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'"
        >
          <CheckCircleIcon class="w-5 h-5" />
          ตรวจสอบสถานะ
        </RouterLink>

        <p class="text-white/50 text-xs font-medium px-3 py-2 mt-4">เจ้าหน้าที่</p>

        <RouterLink
          to="/admin/users"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path.startsWith('/admin/users') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'"
        >
          <UserGroupIcon class="w-5 h-5" />
          จัดการผู้ใช้
        </RouterLink>

        <RouterLink
          to="/admin/settings"
          class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="$route.path.startsWith('/admin/settings') ? 'bg-white/20 text-white' : 'text-white hover:bg-white/10'"
        >
          <Cog6ToothIcon class="w-5 h-5" />
          ตั้งค่าระบบ
        </RouterLink>
      </nav>

      <!-- Footer -->
      <div class="p-4 border-t border-white/20">
        <button class="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white hover:bg-white/10 transition-all w-full">
          <ArrowRightOnRectangleIcon class="w-5 h-5" />
          ออกจากระบบ
        </button>
        <p class="text-white/40 text-xs text-center mt-3">© 2026 วิทยาลัยเทคนิคเลย</p>
      </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col overflow-hidden">
      <!-- Header -->
      <header class="bg-white border-b border-gray-200 px-8 py-4 flex items-center gap-4 shadow-2xl">
        <div class="w-20 h-20 bg-emerald-500 rounded-xl flex items-center justify-center">
          <span class="text-white font-bold text-sm">TC</span>
        </div>
        <div>
          <h1 class="text-xl font-semibold text-gray-800">ระบบรับสมัครนักเรียนนักศึกษา</h1>
          <p class="text-xl text-emerald-500">วิทยาลัยเทคนิคเลย</p>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 overflow-y-auto p-8">
        <RouterView />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  AcademicCapIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/vue/24/outline'
</script>