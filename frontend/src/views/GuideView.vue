<template>
  <div class="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-800 mb-4">คู่มือการสมัครเรียนและมอบตัว</h1>
      <p class="text-gray-600">คำแนะนำในการสมัครเรียนและมอบตัว</p>
    </div>

    <!-- PDF  -->
    <div class="space-y-6">
      <div class="bg-gray-50 p-6 rounded-lg border border-gray-200">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">เอกสารคู่มือ</h2>
        
        <!--  -->
        <div class="space-y-4">
          <div class="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300 hover:border-emerald-500 transition-colors">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <DocumentIcon class="w-6 h-6 text-emerald-600" />
              </div>
              <div>
                <h3 class="font-medium text-gray-800">คู่มือการสมัครเรียน</h3>
                <p class="text-sm text-gray-500">คู่มือการสมัครเรียน</p>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="viewPdf('คู่มือการสมัครเรียน.pdf')" 
                class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium">
                ดูรายละเอียด
              </button>
              <a href="/documents/คู่มือการสมัครเรียน.pdf" download
                class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium">
                ดาวน์โหลด
              </a>
            </div>
          </div>
        </div>
      </div>

      <!--  -->
      <div class="bg-blue-50 p-4 rounded-lg">
        <p class="text-sm text-blue-800">
          <strong>หมายเหตุ</strong> สามารถดาวน์โหลดเอกสารเพื่ออ่านข้อมูลเพิ่มเติมได้
        </p>
      </div>
    </div>

    <!-- PDF  -->
    <div v-if="showPdfModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="text-lg font-semibold">ดูเอกสาร</h3>
          <button @click="closePdfModal" class="text-gray-500 hover:text-gray-700">
            <XMarkIcon class="w-6 h-6" />
          </button>
        </div>
        <div class="p-4 overflow-auto" style="height: calc(90vh - 120px);">
          <iframe :src="pdfUrl" class="w-full h-full border-0" frameborder="0"></iframe>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { DocumentIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const showPdfModal = ref(false)
const pdfUrl = ref('')

const viewPdf = (filename: string) => {
  pdfUrl.value = `/documents/${filename}#toolbar=0&navpanes=0&scrollbar=0`
  showPdfModal.value = true
}

const closePdfModal = () => {
  showPdfModal.value = false
  pdfUrl.value = ''
}
</script>
