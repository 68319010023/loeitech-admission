<template>
  <div><!-- ✅ root wrapper -->

    <!-- Header -->
    <div class="bg-white shadow-lg border-b border-emerald-100">
      <div class="max-w-7xl mx-auto px-6 py-8">
        <div class="flex items-center justify-between">
          <div>
            <h1 class="text-4xl font-bold text-gray-900 flex items-center">
              <div
                class="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                <User class="w-6 h-6 text-white" />
              </div>
              ข้อมูลผู้สมัคร
            </h1>
            <p class="text-gray-600 mt-3 text-lg">เลือกและดาวน์โหลดข้อมูลนักเรียนในรูปแบบไฟล์</p>
          </div>
          <div class="flex items-center space-x-3">
            <div class="flex items-center bg-emerald-50 px-4 py-2 rounded-lg">
              <div class="w-3 h-3 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>
              <span class="text-emerald-700 font-medium">ระบบพร้อมใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="p-4 space-y-4">

      <!-- Export Controls Card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">

        <!-- Row 1: ชื่อ + ปุ่ม Export -->
        <div class="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 class="text-xl font-bold text-gray-800">ส่งออกข้อมูล</h1>
            <p class="text-sm text-gray-400">วิทยาลัยเทคนิคเลย</p>
          </div>

          <div class="flex items-center gap-2 flex-wrap">
            <div class="flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-lg">
              <div class="w-2 h-2 bg-green-500 rounded-full"></div>
              <span class="text-sm text-green-700 font-semibold">{{ selectedIds.length }} รายการ</span>
            </div>

            <button v-if="selectedExportType === 'students'" @click="exportPDF"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-md shadow-red-200
                     hover:shadow-lg hover:shadow-red-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export PDF
            </button>

            <button v-if="selectedExportType === 'students'" @click="exportSelected()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ที่เลือก
            </button>

            <button v-if="selectedExportType === 'students'" @click="exportAll()" :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
                     hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ทั้งหมด
            </button>

            <button v-if="selectedExportType === 'payments'" @click="exportPaymentsListPDF()"
              :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export รายชื่อผู้ชำระเงิน
            </button>

            <button v-if="selectedExportType === 'orders'" @click="exportOrdersListPDF()"
              :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-emerald-400 to-green-500 text-white shadow-md shadow-green-200
                     hover:shadow-lg hover:shadow-green-300 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export สรุปยอดการสั่งซื้อ
            </button>

            <button v-if="selectedExportType === 'payments'" @click="openPaymentSlipOnly()"
             :disabled="ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
                     hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ใบแสดงการชำระเงิน
            </button>

            <button v-if="selectedExportType === 'orders'" @click="exportCombinedOrdersPDF()"
              :disabled="selectedIds.length === 0 || ocrProgress.running" class="group flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                     bg-gradient-to-r from-gray-600 to-gray-800 text-white shadow-md shadow-gray-300
                     hover:shadow-lg hover:shadow-gray-400 hover:-translate-y-0.5
                     disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0">
              <Download class="w-4 h-4 group-hover:animate-bounce" />
              Export ใบรายการ
            </button>
          </div>
        </div>

        <!-- Row 2: ประเภท -->
        <p class="text-sm text-gray-500">เลือกประเภทข้อมูลและเลือกรายชื่อที่ต้องการส่งออก</p>
        <div class="flex gap-2 flex-wrap">
          <button v-for="item in exportItems" :key="item.type"
            @click="selectedExportType = selectedExportType === item.type ? '' : item.type; selectedIds = []" :class="[
              'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition',
              selectedExportType === item.type
                ? 'bg-green-500 text-white border-green-500'
                : 'bg-white text-gray-600 border-gray-200 hover:border-green-400'
            ]">
            <component :is="item.icon" class="w-4 h-4" />
            {{ item.label }}
          </button>
        </div>

        <!-- Row 3: Filters -->
        <div class="flex flex-col sm:flex-row gap-2">
          <div class="relative flex-1">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="exportSearch" type="text" placeholder="ค้นหาชื่อ-สกุล..."
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
          <div class="relative">
            <select v-model="selectedCurFilter"
              class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[120px] text-gray-700">
              <option value="">ทุกหลักสูตร</option>
              <option value="ปวช">ปวช</option>
              <option value="ปวส">ปวส</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div class="relative">
            <Filter class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <select v-model="selectedBranch"
              class="pl-9 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[160px] text-gray-700">
              <option value="">ทุกสาขาวิชา</option>
              <option v-for="b in allBranches" :key="b" :value="b">{{ b }}</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div v-if="!selectedExportType" class="relative">
            <select v-model="selectedStatus"
              class="pl-4 pr-8 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none bg-white appearance-none cursor-pointer min-w-[140px] text-gray-700">
              <option value="">ทุกสถานะ</option>
              <option value="pending_payment">สมัครใหม่</option>
              <option value="pending_approve">รอตรวจสอบ</option>
              <option value="enrolled">มอบตัวแล้ว</option>
            </select>
            <ChevronDown
              class="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
          </div>
          <div v-if="selectedExportType === 'students'" class="relative">
            <Calendar class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input v-model="studentDateSearch" type="text" placeholder="วัน/เดือน/ปี"
              class="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:border-green-400 focus:outline-none" />
          </div>
        </div>
      </div>

      <!-- Badge filter -->
      <div
        v-if="selectedBranch || selectedCurFilter || selectedStatus || (selectedExportType === 'payments' && paymentDateFilter) || (selectedExportType === 'orders' && orderDateFilter)"
        class="flex items-center gap-2 flex-wrap">
        <span class="text-xs text-gray-400">กรองโดย:</span>
        <span v-if="selectedCurFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full border border-blue-200">
          {{ selectedCurFilter }}
          <button @click="selectedCurFilter = ''" class="hover:text-blue-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedBranch"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
          สาขา: {{ selectedBranch }}
          <button @click="selectedBranch = ''" class="hover:text-green-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedStatus"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full border border-purple-200">
          สถานะ: {{ getStatusLabel(selectedStatus) }}
          <button @click="selectedStatus = ''" class="hover:text-purple-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedExportType === 'payments' && paymentDateFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full border border-orange-200">
          วันที่ชำระ : {{ paymentDateFilter }}
          <button @click="paymentDateFilter = ''" class="hover:text-orange-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span v-if="selectedExportType === 'orders' && orderDateFilter"
          class="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-200">
          วันที่ชำระ : {{ orderDateFilter }}
          <button @click="orderDateFilter = ''" class="hover:text-indigo-900">
            <X class="w-3 h-3" />
          </button>
        </span>
        <span class="text-xs text-gray-400">พบ {{ filteredExportData.length }} รายการ</span>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="text-center py-12 text-gray-400">
        <div class="inline-block w-6 h-6 border-2 border-green-400 border-t-transparent rounded-full animate-spin mb-2">
        </div>
        <p class="text-sm">กำลังโหลดข้อมูล...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <p class="text-red-400 text-sm">{{ error }}</p>
        <button @click="fetchApplicants" class="mt-2 text-sm text-green-600 underline">ลองใหม่</button>
      </div>

      <!-- Child Tables -->
      <template v-else>

        <!-- หน้าแรก: ตารางแบบ inline -->
        <div v-if="!selectedExportType" class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table class="w-full text-sm">
            <thead class="bg-gray-50 text-gray-500">
              <tr>
                <th class="px-4 py-3 text-center w-10">
                  <input type="checkbox" @change="toggleAll" :checked="isAllSelected" />
                </th>
                <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
                <th class="px-4 py-3 text-left">หลักสูตร</th>
                <th class="px-4 py-3 text-left">สาขาวิชา</th>
                <th class="px-4 py-3 text-center">สถานะ</th>
                <th class="px-4 py-3 text-left">เบอร์โทร</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-50">
              <tr v-for="row in paginatedData" :key="row.ลำดับ"
                :class="['cursor-pointer hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']"
                @click="openInfoModal(row)">
                <td class="px-4 py-3 text-center" @click.stop>
                  <input type="checkbox" :value="row.ลำดับ" :checked="selectedIds.includes(row.ลำดับ)" @change="() => {
                    const idx = selectedIds.indexOf(row.ลำดับ)
                    if (idx === -1) selectedIds.push(row.ลำดับ)
                    else selectedIds.splice(idx, 1)
                  }" />
                </td>
                <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
                <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
                <td class="px-4 py-3">
                  <span
                    class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
                    {{ row.สาขาวิชา }}
                  </span>
                </td>
                <td class="px-4 py-3 text-center">
                  <span :class="[
                    'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
                    row.สถานะ === 'enrolled' ? 'bg-green-50 text-green-700 border border-green-200' :
                      row.สถานะ === 'paid' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                        row.สถานะ === 'pending_approve' ? 'bg-yellow-50 text-yellow-700 border border-yellow-200' :
                          'bg-gray-50 text-gray-500 border border-gray-200'
                  ]">
                    {{
                      row.สถานะ === 'enrolled' ? '✓ มอบตัวแล้ว' :
                        row.สถานะ === 'paid' ? '✅ พร้อมมอบตัว' :
                          row.สถานะ === 'pending_approve' ? '⏳ รอตรวจสอบ' : '📋 สมัครใหม่'
                    }}
                  </span>
                </td>
                <td class="px-4 py-3 text-gray-600">{{ row.เบอร์โทร || '-' }}</td>
              </tr>
              <tr v-if="paginatedData.length === 0">
                <td colspan="6" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- ประเภทอื่นๆ -->
        <StudentsTable v-else-if="selectedExportType === 'students'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected"
          @update:date-search="studentDateSearch = $event" />
        <PaymentsTable v-else-if="selectedExportType === 'payments'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected" />
        <OrdersTable v-else-if="selectedExportType === 'orders'" :data="paginatedData" :selected-ids="selectedIds"
          @update:selected-ids="selectedIds = $event" @toggle-all="toggleAll" :is-all-selected="isAllSelected"
          @generate-pdf="handleGeneratePDF" />

      </template>

      <!-- Pagination -->
      <div v-if="totalPages > 1"
        class="flex items-center justify-between bg-white rounded-2xl border border-gray-100 shadow-sm px-4 py-2">
        <p class="text-xs text-gray-400">
          แสดง
          <span class="font-semibold text-green-600">{{ (currentPage - 1) * pageSize + 1 }}</span>
          <span class="text-gray-300 mx-0.5">—</span>
          <span class="font-semibold text-green-600">{{ Math.min(currentPage * pageSize, filteredExportData.length)
            }}</span>
          จาก
          <span class="font-semibold text-gray-700">{{ filteredExportData.length }}</span> รายการ
        </p>
        <div class="flex items-center gap-1">
          <button @click="currentPage = 1" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">«</button>
          <button @click="currentPage--" :disabled="currentPage === 1"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">‹</button>
          <template v-for="p in totalPages" :key="p">
            <button v-if="p === 1 || p === totalPages || (p >= currentPage - 1 && p <= currentPage + 1)"
              @click="currentPage = p" :class="[
                'w-8 h-8 flex items-center justify-center rounded-xl text-sm font-semibold transition-all duration-150',
                currentPage === p
                  ? 'bg-green-500 text-white shadow-sm shadow-green-200'
                  : 'text-gray-500 hover:bg-green-50 hover:text-green-600'
              ]">{{ p }}</button>
            <span v-else-if="p === currentPage - 2 || p === currentPage + 2"
              class="w-6 text-center text-gray-300 text-xs select-none">···</span>
          </template>
          <button @click="currentPage++" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">›</button>
          <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
            class="w-8 h-8 flex items-center justify-center rounded-xl text-sm text-gray-400 hover:bg-green-50 hover:text-green-600 disabled:opacity-20 disabled:cursor-not-allowed transition-all duration-150">»</button>
        </div>
      </div>

      <!-- OCR Progress Modal -->
      <div v-if="ocrProgress.running" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div class="bg-white rounded-2xl shadow-xl p-6 w-80 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 border-2 border-green-400 border-t-transparent rounded-full animate-spin flex-shrink-0">
            </div>
            <div>
              <p class="text-sm font-semibold text-gray-700">กำลังประมวลผล...</p>
              <p class="text-xs text-gray-400">{{ ocrProgress.name }}</p>
            </div>
          </div>
          <div class="w-full bg-gray-100 rounded-full h-2">
            <div class="bg-green-400 h-2 rounded-full transition-all duration-300"
              :style="{ width: `${(ocrProgress.current / ocrProgress.total) * 100}%` }"></div>
          </div>
          <p class="text-xs text-gray-400 text-right">{{ ocrProgress.current }} / {{ ocrProgress.total }}</p>
        </div>
      </div>

    </div><!-- ✅ ปิด div.p-4 -->

    <!-- Info Modal -->
    <Teleport to="body">
      <div v-if="infoModal.open" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
        @click.self="infoModal.open = false">
        <div class="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden flex flex-col"
          style="max-height: 90vh">
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
          <div class="overflow-y-auto flex-1 px-5 py-4 space-y-4">
            <div v-if="infoModal.loading" class="flex items-center justify-center py-10 text-gray-400">
              <div class="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin mr-2">
              </div>
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
            <p class="text-xs text-gray-400">
              วันที่สมัคร: {{ infoModal.data ? new Date(infoModal.data.created_at).toLocaleDateString('th-TH') : '-' }}
            </p>
            <div class="flex gap-2">
              <button @click="infoModal.open = false"
                class="px-4 py-2 text-sm text-gray-500 hover:bg-gray-200 rounded-xl transition font-semibold">
                ปิด
              </button>

              <button v-if="infoModal.status === 'pending_payment'" @click="openPaymentSlipOnly"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-sm font-semibold transition">
                <FileText class="w-4 h-4" /> ใบแจ้งชำระเงิน
              </button>

              <button v-else-if="infoModal.status === 'pending_approve'" @click="openDocModalFromInfo"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl text-sm font-semibold transition">
                <Eye class="w-4 h-4" /> รายละเอียดการสมัคร
              </button>

              <button v-else-if="infoModal.status === 'paid'" @click="openDocModalFromInfo"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition">
                <Eye class="w-4 h-4" /> รายละเอียดการสมัคร
              </button>

              <button v-else-if="infoModal.status === 'enrolled'" @click="printEnrollmentCert"
                class="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl text-sm font-semibold transition">
                <BookCheck class="w-4 h-4" /> เอกสารมอบตัว
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

  </div><!-- ✅ ปิด root div -->
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, h } from 'vue'
import { apiService } from '@/utils/api'

import {
  Download, CreditCard, ShoppingBag,
  Users, Search, Filter, ChevronDown, X, User, Eye, FileText, BookCheck, Calendar,
} from 'lucide-vue-next'
import * as XLSX from 'xlsx'
import Tesseract from 'tesseract.js'
import jsPDF from 'jspdf'

import StudentsTable from '@/components/export/StudentsTable.vue'
import PaymentsTable from '@/components/export/PaymentsTable.vue'
import OrdersTable from '@/components/export/OrdersTable.vue'

import api from '@/services/httpClient'
import { exportPaymentPDF } from '@/utils/exportPaymentPDF'

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

const studentDateSearch = ref('')


// ─── Info Modal state ─────────────────────────────────────────
const infoModal = ref({
  open: false,
  name: '',
  status: '',
  appId: '' as any,
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
    appId: row.ลำดับ,
    loading: true,
    data: null,
  }
  try {
    const res = await api.get(`/applications/check/${row.เลขบัตรประชาชน}`)
    infoModal.value.data = res.data?.data
  } catch (e) {
    console.error('โหลดข้อมูลไม่สำเร็จ', e)
  } finally {
    infoModal.value.loading = false
  }
}

const API_BASE = (import.meta.env.VITE_API_URL as string)?.replace(/\/api$/, '') || 'http://localhost:3001'
const resolveUrl = (path: string | null | undefined) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  const token = localStorage.getItem('auth_token')
  const sep = path.includes('?') ? '&' : '?'
  return `${API_BASE}${path}${token ? `${sep}token=${encodeURIComponent(token)}` : ''}`
}

const exportItems = [
  { label: 'ประวัตินักเรียน', icon: Users, type: 'students' },
  { label: 'ค่าบำรุงการศึกษา', icon: CreditCard, type: 'payments' },
  { label: 'เครื่องแบบและอุปกรณ์', icon: ShoppingBag, type: 'orders' },
]

// ─── State ───────────────────────────────────────────────────
const applicants = ref<any[]>([])
const isLoading = ref(false)
const error = ref('')
const selectedExportType = ref('')
const exportSearch = ref('')
const selectedBranch = ref('')
const selectedCurFilter = ref('')
const selectedStatus = ref('')
const selectedIds = ref<string[]>([])
const currentPage = ref(1)
const pageSize = ref(20)
const paymentAmountFilter = ref('')
const paymentDateFilter = ref('')
const orderDateFilter = ref('')

const ocrProgress = ref({
  running: false,
  current: 0,
  total: 0,
  name: '',
})

// ─── Fetch ───────────────────────────────────────────────────
const fetchApplicants = async () => {
  isLoading.value = true
  error.value = ''
  try {
    const res = await apiService.getApplicants()
    if (!res.success) throw new Error(res.message)
    applicants.value = res.data
  } catch (e: any) {
    error.value = e.message || 'โหลดข้อมูลไม่สำเร็จ'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => fetchApplicants())

// ─── Computed ─────────────────────────────────────────────────
const currentData = computed(() =>
  applicants.value.map(a => {
    const base = {
      ลำดับ: a.app_id,
      คำนำหน้า: a.prefix,
      ชื่อ_นามสกุล: a.full_name,
      หลักสูตร: a.curriculum.cur_shortname,
      สาขาวิชา: a.division.div_name,
    }

    if (selectedExportType.value === '' || selectedExportType.value === 'students') {
      return {
        ...base,
        เลขบัตรประชาชน: a.id_card_number,
        เบอร์โทร: a.phone,
        อีเมล: a.email,
        สถานะ: a.status,
        วันที่สมัคร: new Date(a.created_at).toLocaleDateString('th-TH'),
        enrolled_at: a.enrolled_at ?? null,
        _idFrontUrl: resolveUrl(a.id_front_url),
        _idBackUrl: a.id_back_url || '',
        _eduFrontUrl: a.edu_front_url || '',
      }
    }

    if (selectedExportType.value === 'payments') {
      return {
        ...base,
        enrolled_at: a.enrolled_at ?? null,
        ยอดชำระ: a.payment?.total_amount ?? '-',
        วันที่ชำระ: a.payment?.paid_at
          ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
          : (a.status === 'enrolled' ? '-' : 'ยังไม่ชำระ'),
        หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
        _isPaid: a.status === 'paid' || a.status === 'enrolled',
        _idFrontUrl: resolveUrl(a.id_front_url),
        _slipUrl: a.payment?.slip_name
          ? resolveUrl(`/uploads/slips/${a.payment.slip_name}`)
          : '',
      }
    }

    // orders
    return {
      ...base,
      enrolled_at: a.enrolled_at ?? null,
      ยอดชำระ: a.payment?.total_amount ?? '-',
      หลักฐานการชำระ_ใบเสร็จ: a.payment?.slip_name ?? '-',
      วันที่ชำระ: a.payment?.paid_at
        ? new Date(a.payment.paid_at).toLocaleDateString('th-TH')
        : (a.status === 'enrolled' ? '-' : 'ยังไม่ชำระ'),
      _idFrontUrl: a.id_front_url ?? '',
      _isPaid: a.status === 'paid' || a.status === 'enrolled',
      _slipUrl: a.payment?.slip_name
        ? resolveUrl(`/uploads/slips/${a.payment.slip_name}`)
        : '',
    }
  })
)

const allBranches = computed(() => {
  const set = new Set(currentData.value.map(r => r.สาขาวิชา))
  return [...set].sort()
})

const filteredExportData = computed(() =>
  currentData.value.filter(row => {
    const fullDisplay = row.คำนำหน้า + row.ชื่อ_นามสกุล
    const matchName = !exportSearch.value || fullDisplay.includes(exportSearch.value)
    const matchBranch = !selectedBranch.value || row.สาขาวิชา === selectedBranch.value
    const matchCur = !selectedCurFilter.value || row.หลักสูตร.includes(selectedCurFilter.value)
    const matchStatus = selectedExportType.value === 'students'
      ? row.สถานะ === 'enrolled'
      : (!selectedStatus.value || (row.สถานะ && row.สถานะ === selectedStatus.value))

    let matchDate = true
    if (selectedExportType.value === 'payments' && paymentDateFilter.value) {
      matchDate = row.วันที่ชำระ && normalizeDateForSearch(row.วันที่ชำระ).includes(normalizeDateForSearch(paymentDateFilter.value))
    } else if (selectedExportType.value === 'orders' && orderDateFilter.value) {
      matchDate = row.วันที่ชำระ && normalizeDateForSearch(row.วันที่ชำระ).includes(normalizeDateForSearch(orderDateFilter.value))
    }

    const matchEnrolledDate = selectedExportType.value !== 'students' || !studentDateSearch.value
      ? true
      : (() => {
        if (!row.enrolled_at) return false
        const dateStr = new Date(row.enrolled_at).toLocaleDateString('th-TH')
        return dateStr.includes(studentDateSearch.value)
      })()

    return matchName && matchBranch && matchCur && matchStatus && matchDate && matchEnrolledDate
  }).sort((a, b) => {
    const statusOrder = { 'pending_approve': 1, 'pending_payment': 2, 'enrolled': 3 }
    const aStatus = statusOrder[a.สถานะ as keyof typeof statusOrder] || 999
    const bStatus = statusOrder[b.สถานะ as keyof typeof statusOrder] || 999
    return aStatus - bStatus
  })
)

const totalPages = computed(() => Math.ceil(filteredExportData.value.length / pageSize.value))

const paginatedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  return filteredExportData.value.slice(start, start + pageSize.value)
})

const isAllSelected = computed(() =>
  filteredExportData.value.length > 0 &&
  filteredExportData.value.every(r => selectedIds.value.includes(r.ลำดับ))
)

const toggleAll = () => {
  if (isAllSelected.value) {
    selectedIds.value = []
  } else {
    selectedIds.value = filteredExportData.value.map(r => r.ลำดับ)
  }
}

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'enrolled': 'มอบตัวแล้ว',
    'pending_payment': 'สมัครใหม่',
    'pending_approve': 'รอตรวจสอบ'
  }
  return labels[status] || status
}

watch([exportSearch, selectedBranch, selectedCurFilter, selectedStatus, paymentAmountFilter, orderDateFilter, selectedExportType], () => {
  currentPage.value = 1
})

const formatDateInput = (event: Event) => {
  const input = event.target as HTMLInputElement
  const currentValue = input.value

  if (currentValue.endsWith('/') && currentValue.length > 1) {
    const newValue = currentValue.slice(0, -1)
    if (selectedExportType.value === 'payments') {
      paymentDateFilter.value = newValue
    } else if (selectedExportType.value === 'orders') {
      orderDateFilter.value = newValue
    }
    return
  }

  let value = input.value.replace(/\D/g, '')

  if (value.length >= 2) {
    value = value.slice(0, 2) + '/' + value.slice(2)
  }
  if (value.length >= 5) {
    value = value.slice(0, 5) + '/' + value.slice(5, 9)
  }

  if (selectedExportType.value === 'payments') {
    paymentDateFilter.value = value
  } else if (selectedExportType.value === 'orders') {
    orderDateFilter.value = value
  }
}

const normalizeDateForSearch = (dateStr: string) => {
  if (!dateStr) return dateStr
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0')
    const month = parts[1].padStart(2, '0')
    const year = parts[2]
    return `${day}/${month}/${year}`
  }
  return dateStr
}

// ─── OCR ─────────────────────────────────────────────────────
async function runOCRFromUrl(imageUrl: string, mode: 'id' | 'edu' = 'id'): Promise<Record<string, string>> {
  if (!imageUrl) return {}
  try {
    const { data: { text } } = await Tesseract.recognize(imageUrl, 'tha+eng', { logger: () => { } })
    return mode === 'id' ? parseThaiIDText(text) : parseEduDocText(text)
  } catch {
    return {}
  }
}

function parseThaiIDText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}
  const idMatch = text.replace(/[\s\-]/g, '').match(/\d{13}/)
  if (idMatch) result['OCR_เลขบัตร'] = idMatch[0]
  const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง', 'Mr.', 'Mrs.', 'Miss']
  for (const line of lines) {
    for (const prefix of prefixes) {
      if (line.startsWith(prefix)) {
        result['OCR_คำนำหน้า'] = prefix
        result['OCR_ชื่อ_นามสกุล'] = line.slice(prefix.length).trim()
        break
      }
    }
    if (result['OCR_คำนำหน้า']) break
  }
  const engNameLine = lines.find(l => /^[A-Z\s]+$/.test(l) && l.length > 4)
  if (engNameLine) result['OCR_ชื่อ_ภาษาอังกฤษ'] = engNameLine.trim()
  const dobMatch = text.match(/(\d{1,2}[\s\/\-][A-Za-zก-ฮ]+\.?[\s\/\-]\d{4})/)
  if (dobMatch) result['OCR_วันเกิด'] = dobMatch[0].trim()
  const expMatch = text.match(/(?:หมดอายุ|Expiry Date?:?)\s*([\d\s\w\.]+)/i)
  if (expMatch) result['OCR_วันหมดอายุ'] = expMatch[1].trim()
  const addrKeywords = ['บ้านเลขที่', 'หมู่ที่', 'ถนน', 'ตำบล', 'แขวง', 'อำเภอ', 'เขต', 'จังหวัด']
  const addrLines = lines.filter(l => addrKeywords.some(kw => l.includes(kw)))
  if (addrLines.length > 0) result['OCR_ที่อยู่'] = addrLines.join(' ')
  result['OCR_ข้อความดิบ'] = text.replace(/\n/g, ' ').trim()
  return result
}

function parseEduDocText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}
  const schoolLine = lines.find(l => ['โรงเรียน', 'วิทยาลัย', 'มหาวิทยาลัย'].some(kw => l.includes(kw)))
  if (schoolLine) result['สถานศึกษาเดิม'] = schoolLine.trim()
  const eduPrefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']
  for (const line of lines) {
    if (eduPrefixes.some(p => line.startsWith(p))) { result['ชื่อ-สกุล'] = line.trim(); break }
  }
  const levelLine = lines.find(l => ['มัธยมศึกษาตอนต้น', 'มัธยมศึกษาตอนปลาย', 'ม.3', 'ม.6', 'ปวช', 'ปวส'].some(kw => l.includes(kw)))
  if (levelLine) result['วุฒิการศึกษา'] = levelLine.trim()
  const yearMatch = text.match(/25\d{2}/)
  if (yearMatch) result['ปีที่จบ'] = yearMatch[0]
  const gpaMatch = text.match(/[0-3]\.\d{2}|4\.00/)
  if (gpaMatch) result['GPA'] = gpaMatch[0]
  return result
}





function parseHouseRegText(text: string): Record<string, string> {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
  const result: Record<string, string> = {}

  // รหัสประจำบ้าน 11 หลัก
  const houseCodeMatch = text.replace(/[\s\-]/g, '').match(/\d{11}/)
  if (houseCodeMatch) result['รหัสประจำบ้าน'] = houseCodeMatch[0]

  // รายการที่อยู่
  const addrKeywords = ['บ้านเลขที่', 'หมู่ที่', 'ถนน', 'ตำบล', 'แขวง', 'อำเภอ', 'เขต', 'จังหวัด']
  const addrLines = lines.filter(l => addrKeywords.some(kw => l.includes(kw)))
  if (addrLines.length > 0) result['ที่อยู่'] = addrLines.join(' ')

  // ชื่อนามสกุลในทะเบียนบ้าน
  const prefixes = ['นาย', 'นาง', 'นางสาว', 'เด็กชาย', 'เด็กหญิง']
  const nameLines = lines.filter(l => prefixes.some(p => l.startsWith(p)))
  if (nameLines[0]) result['ชื่อเจ้าบ้าน'] = nameLines[0]
  if (nameLines[1]) result['ชื่อบิดา'] = nameLines[1]
  if (nameLines[2]) result['ชื่อมารดา'] = nameLines[2]

  // เลข 13 หลัก (เลขบัตรของคนในทะเบียนบ้าน)
  const idMatches = [...text.replace(/[\s\-]/g, '').matchAll(/\d{13}/g)]
  if (idMatches[0]) result['เลขบัตรเจ้าบ้าน'] = idMatches[0][0]
  if (idMatches[1]) result['เลขบัตรบิดา'] = idMatches[1][0]
  if (idMatches[2]) result['เลขบัตรมารดา'] = idMatches[2][0]

  return result
}

// ─── Export ──────────────────────────────────────────────────
const sheetNames: Record<string, string> = {
  applicants: 'ข้อมูลผู้สมัคร',
  students: 'ข้อมูลนักเรียน',
  payments: 'การชำระเงิน',
  orders: 'การสั่งซื้อ',
}
const fileNames: Record<string, string> = {
  applicants: 'applicants_export.xlsx',
  students: 'students_export.xlsx',
  payments: 'payments_export.xlsx',
  orders: 'orders_export.xlsx',
}

async function buildExportData(rows: any[], isExportAll = false): Promise<object[]> {
  ocrProgress.value = { running: true, current: 0, total: rows.length, name: '' }
  const result: object[] = []
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]
    ocrProgress.value.current = i + 1
    ocrProgress.value.name = `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`
    let dbData: Record<string, any> = {}
    try {
      const dbRes = await api.get(`/applications/check/${row.เลขบัตรประชาชน}`)
      const d = dbRes.data?.data
      if (d) {
        dbData = {
          วันเดือนปีเกิด: d.birth_date ? new Date(d.birth_date).toLocaleDateString('th-TH') : '',
          โรงเรียนเก่า: d.prev_school || '',
          วุฒิการศึกษาเดิม: d.prev_level || '',
          สาขาวิชาเดิม: d.prev_major || '',
          GPA: d.gpa || '',
        }
      }
    } catch { }

    result.push({ ...cleanRow, ...dbData, ...allOcr })
    if (isExportAll && !row._isPaid) {
      continue
    }

    let allOcr: Record<string, string> = {}
    if (selectedExportType.value !== 'payments') {
      try {
        const res = await apiService.getApplicantDocuments(row.ลำดับ)
        if (res.success) {
          const docs = res.data.documents as { doc_type: string; file_url: string }[]
          for (const doc of docs) {
            if (!doc.file_url) continue
            const url = resolveUrl(doc.file_url)
            let ocr: Record<string, string> = {}
            if (doc.doc_type.startsWith('id')) {
              ocr = await runOCRFromUrl(url, 'id')
            } else if (doc.doc_type.startsWith('edu')) {
              ocr = await runOCRFromUrl(url, 'edu')
            } else if (doc.doc_type.includes('house')) {
              const res2 = await fetch(url)
              const blob = await res2.blob()
              const imgUrl = URL.createObjectURL(blob)
              const { data: { text } } = await Tesseract.recognize(imgUrl, 'tha+eng', { logger: () => { } })
              ocr = parseHouseRegText(text)
            }
            Object.entries(ocr).forEach(([k, v]) => { allOcr[`${doc.doc_type}_${k}`] = v })
          }
        }
      } catch (e) {
        console.warn('OCR all docs failed for', row.ชื่อ_นามสกุล, e)
      }
    }

    if (selectedExportType.value === 'payments') {
      const paymentRow = {
        ลำดับ: row.ลำดับ,
        คำนำหน้า: row.คำนำหน้า,
        'ชื่อ-สกุล': row.ชื่อ_นามสกุล,
        หลักสูตร: row.หลักสูตร,
        สาขาวิชา: row.สาขาวิชา,
        วันที่ชำระ: row.วันที่ชำระ,
        ยอดรวม: row.ยอดชำระ
      }
      result.push({ ...paymentRow, ...allOcr })
    } else {
      const cleanRow = {
        ลำดับ: row.ลำดับ,
        คำนำหน้า: row.คำนำหน้า,
        ชื่อ_นามสกุล: row.ชื่อ_นามสกุล,
        หลักสูตร: row.หลักสูตร,
        สาขาวิชา: row.สาขาวิชา,
        เลขบัตรประชาชน: row.เลขบัตรประชาชน,
        เบอร์โทร: row.เบอร์โทร,
        อีเมล: row.อีเมล,
      }
      result.push({ ...cleanRow, ...allOcr })
    }
  }
  ocrProgress.value.running = false
  return result
}

async function doExport(rows: any[], isExportAll = false) {
  const data = await buildExportData(rows, isExportAll)
  const ws = XLSX.utils.json_to_sheet(data)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetNames[selectedExportType.value])
  XLSX.writeFile(wb, fileNames[selectedExportType.value])
}

const exportSelected = async () => {
  const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
  await doExport(rows, false)
}

const exportAll = async () => {
  await doExport(filteredExportData.value, true)
}

const exportPaymentsListPDF = async () => {
  if (selectedExportType.value !== 'payments') return
  ocrProgress.value = { running: true, current: 0, total: 1, name: 'กำลังเริ่มสร้าง...' }
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }

    const pageW = 210
    const pageH = 297
    const margin = 15
    const L = margin
    const R = pageW - margin
    let y = margin

    const setFont = (font: string, style: string, size: number) => {
      doc.setFont(font, style)
      doc.setFontSize(size)
    }

    setFont('THSarabun', 'bold', 18)
    doc.text('รายชื่อผู้ชำระเงินค่าบำรุงการศึกษา', pageW / 2, y, { align: 'center' })
    y += 10

    setFont('THSarabun', 'normal', 14)
    doc.text('วันที่________ถึงวันที่________', pageW / 2, y, { align: 'center' })
    y += 10

    const headers = ['ลำดับ', 'ชื่อ-สกุล', 'หลักสูตร', 'สาขาวิชา', 'วันที่ชำระ', 'ยอดรวม']
    const colWidths = [15, 60, 25, 40, 30, 25]
    let x = L

    setFont('THSarabun', 'bold', 12)
    headers.forEach((header, i) => {
      doc.text(header, x, y)
      x += colWidths[i]
    })
    y += 6

    doc.line(L, y, R, y)
    y += 4

    const rows = filteredExportData.value.filter(row => row._isPaid)
    rows.forEach((row, index) => {
      if (y > pageH - 30) {
        doc.addPage()
        y = margin
        setFont('THSarabun', 'bold', 12)
        x = L
        headers.forEach((header, i) => {
          doc.text(header, x, y)
          x += colWidths[i]
        })
        y += 6
        doc.line(L, y, R, y)
        y += 4
      }

      x = L
      const data = [
        String(index + 1),
        `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`,
        row.หลักสูตร || '',
        row.สาขาวิชา || '',
        row.วันที่ชำระ || '',
        row.ยอดชำระ || ''
      ]

      data.forEach((text, i) => {
        const textValue = String(text || '')
        if (i === 0 || /^\d+$/.test(textValue) || /^[a-zA-Z0-9\s\-\/]+$/.test(textValue)) {
          setFont('helvetica', 'normal', 11)
        } else {
          setFont('THSarabun', 'normal', 11)
        }
        if (textValue && textValue.trim() !== '') {
          doc.text(textValue, x, y)
        }
        x += colWidths[i]
      })
      y += 6
    })

    y += 10
    setFont('THSarabun', 'normal', 12)
    doc.text(`จำนวน ${rows.length} รายการ`, pageW / 2, y, { align: 'center' })

    const filename = `รายงานการชำระเงิน_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)

  } catch (err) {
    console.error('❌ Error exporting payments list PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

const exportOrdersListPDF = async () => {
  if (selectedExportType.value !== 'orders') return
  ocrProgress.value = { running: true, current: 0, total: 1, name: 'กำลังเริ่มสร้าง...' }
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }

    const pageW = 210
    const pageH = 297
    const margin = 15
    const L = margin
    const R = pageW - margin
    let y = margin

    const setFont = (font: string, style: string, size: number) => {
      doc.setFont(font, style)
      doc.setFontSize(size)
    }

    setFont('THSarabun', 'bold', 18)
    doc.text('ใบสรุปยอดการสั่งซื้อเครื่องแบบและอุปกรณ์', pageW / 2, y, { align: 'center' })
    y += 10

    setFont('THSarabun', 'normal', 14)
    doc.text('วันที่________ถึงวันที่________', pageW / 2, y, { align: 'center' })
    y += 10

    const headers = ['ลำดับ', 'ชื่อ-สกุล', 'หลักสูตร', 'สาขาวิชา', 'วันที่ชำระ', 'จำนวนเงิน']
    const colWidths = [15, 60, 25, 40, 30, 25]
    let x = L

    setFont('THSarabun', 'bold', 12)
    headers.forEach((header, i) => {
      doc.text(header, x, y)
      x += colWidths[i]
    })
    y += 6

    doc.line(L, y, R, y)
    y += 4

    const rows = filteredExportData.value.filter(row => row._isPaid)
    let totalAmount = 0

    rows.forEach((row, index) => {
      if (y > pageH - 30) {
        doc.addPage()
        y = margin
        setFont('THSarabun', 'bold', 12)
        x = L
        headers.forEach((header, i) => {
          doc.text(header, x, y)
          x += colWidths[i]
        })
        y += 6
        doc.line(L, y, R, y)
        y += 4
      }

      x = L
      const data = [
        String(index + 1),
        `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`,
        row.หลักสูตร || '',
        row.สาขาวิชา || '',
        row.วันที่ชำระ || '',
        row.ยอดชำระ || ''
      ]

      const amount = parseFloat(String(row.ยอดชำระ || '0').replace(/[^0-9.]/g, ''))
      totalAmount += amount

      data.forEach((text, i) => {
        const textValue = String(text || '')
        if (i === 0 || /^\d+$/.test(textValue) || /^[a-zA-Z0-9\s\-\/]+$/.test(textValue)) {
          setFont('helvetica', 'normal', 11)
        } else {
          setFont('THSarabun', 'normal', 11)
        }
        if (textValue && textValue.trim() !== '') {
          doc.text(textValue, x, y)
        }
        x += colWidths[i]
      })
      y += 6
    })

    y += 6
    doc.line(L, y, R, y)
    y += 6

    setFont('THSarabun', 'bold', 18)
    doc.text('รวม', L + 140, y)
    setFont('helvetica', 'bold', 12)
    doc.text(totalAmount.toFixed(2), L + 170, y)

    y += 10
    setFont('THSarabun', 'normal', 12)
    doc.text(`จำนวน ${rows.length} รายการ`, pageW / 2, y, { align: 'center' })

    const filename = `สรุปยอดการสั่งซื้อ_${new Date().toISOString().split('T')[0]}.pdf`
    doc.save(filename)

  } catch (err) {
    console.error('❌ Error exporting orders list PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

// ─── Export PDF ───────────────────────────────────────────────
const exportPDF = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกผู้ใช้ที่ต้องการ Export ก่อน')
    return
  }
  if (selectedExportType.value !== 'students' && selectedExportType.value !== 'payments') return
  ocrProgress.value = { running: true, current: 0, total: selectedIds.value.length, name: 'กำลังเริ่มสร้าง...' }
  try {
    const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    if (rows.length === 0) throw new Error('ไม่พบข้อมูลที่เลือก')
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`

      if (selectedExportType.value === 'students') {
        let ocrData = {}
        try {
          if (row._idFrontUrl) ocrData = await runOCRFromUrl(row._idFrontUrl || '', 'id')
        } catch (e) {
          console.warn('OCR failed for', row.ชื่อ_นามสกุล, e)
        }
        await generateStudentPDF({ ...row, ...ocrData })
      } else if (selectedExportType.value === 'payments') {
        await generatePaymentPDF(row)
      }
    }
  } catch (err) {
    console.error('❌ Error exporting PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

const exportCombinedOrdersPDF = async () => {
  if (selectedIds.value.length === 0) {
    alert('กรุณาเลือกผู้ใช้ที่ต้องการ Export ก่อน')
    return
  }
  if (selectedExportType.value !== 'orders') return

  ocrProgress.value = { running: true, current: 0, total: selectedIds.value.length, name: 'กำลังเริ่มสร้าง...' }
  try {
    const rows = currentData.value.filter(r => selectedIds.value.includes(r.ลำดับ))
    if (rows.length === 0) throw new Error('ไม่พบข้อมูลที่เลือก')

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      ocrProgress.value.current = i + 1
      ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
      await generateCombinedOrderPDF(row)
    }
  } catch (err) {
    console.error('❌ Error exporting combined orders PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

const handleGeneratePDF = async (row: any) => {
  ocrProgress.value = { running: true, current: 1, total: 1, name: 'กำลังเริ่มสร้าง...' }
  try {
    ocrProgress.value.name = `${row.คำนำหน้า || ''}${row.ชื่อ_นามสกุล || ''}`
    await generateCombinedOrderPDF(row)
  } catch (err) {
    console.error('❌ Error generating combined order PDF:', err)
  } finally {
    ocrProgress.value.running = false
  }
}

async function loadThaiFont(): Promise<string> {
  try {
    const response = await fetch('/fonts/THSarabunNew.ttf')
    if (!response.ok) throw new Error('Font file not found')
    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onloadend = () => resolve((reader.result as string).split(',')[1])
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('❌ Load font error:', error)
    return ''
  }
}

// ─── Doc Modal ────────────────────────────────────────────────
const docModal = ref({
  open: false,
  name: '',
  appId: '',
  status: '',
  slipApproved: null as boolean | null,
  documents: [] as { doc_type: string; file_url: string }[],
  activeTab: '' as string,
  imgError: false,
  imgLoading: false,
  enrolledData: null as any,
})

const blobUrl = ref<string>('')

const DOC_FILTER: Record<string, string[]> = {
  pending_payment: ['payment_slip'],
  pending_approve: [
    'payment_slip', 'id_front', 'id_back',
    'edu_front', 'edu_back', 'letter_front', 'letter_back',
  ],
  paid: [
    'payment_slip', 'id_front', 'id_back',
    'edu_front', 'edu_back', 'letter_front', 'letter_back',
  ],
  enrolled: [
    'self_house_front', 'self_house_back',
    'father_house_front', 'father_house_back',
    'mother_house_front', 'mother_house_back',
  ],
}

const openPaymentSlipOnly = async () => {
  infoModal.value.open = false
  const d = infoModal.value.data
  if (!d) return
  await exportPaymentPDF({
    prefix: d.prefix || '',
    fullName: d.full_name || '',
    idCard: d.id_card_number || '',
    phone: d.phone || '',
    courseLabel: d.cur_name || '',
    branchName: d.div_name || '',
    totalPrice: Number(d.total_amount) || 0,
    dueDate: d.due_date
      ? new Date(d.due_date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
      : '',
  })
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

async function loadFont(): Promise<string> {
  const res = await fetch('/fonts/THSarabunNew.ttf')
  const buffer = await res.arrayBuffer()
  const bytes = new Uint8Array(buffer)
  let binary = ''
  bytes.forEach(b => binary += String.fromCharCode(b))
  return btoa(binary)
}

const printEnrollmentCert = async () => {
  const d = docModal.value.enrolledData || infoModal.value.data || {}

  const fontBase64 = await loadFont()
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
  doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
  doc.setFont('THSarabun')

  const pageW = 210
  const margin = 15
  let y = 2

  try {
    const logoRes = await fetch('/src/assets/loeitech-logo.png')
    const logoBuffer = await logoRes.arrayBuffer()
    const logoBase64 = btoa(String.fromCharCode(...new Uint8Array(logoBuffer)))
    doc.addImage(logoBase64, 'PNG', pageW / 2 - 20, y, 40, 40)
    y += 45
  } catch (error) {
    console.error('Failed to load logo:', error)
  }

  doc.setFontSize(22)
  doc.setFont('THSarabun', 'bold')
  doc.text('ใบรับรองการมอบตัว', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(14)
  doc.setFont('THSarabun', 'normal')
  doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.8)
  doc.line(15, y, pageW - 15, y)
  y += 12

  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.text('ขอรับรองว่า', pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFontSize(18)
  doc.text(`${d.prefix}${d.full_name}`, pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFontSize(12)
  doc.setFont('THSarabun', 'normal')
  doc.text(`หมายเลขประจำตัว: ${d.id_card_number}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFontSize(13)
  doc.text('ได้ดำเนินการมอบตัวเป็นนักเรียนนักศึกษาเรียบร้อยแล้ว', pageW / 2, y, { align: 'center' })
  y += 8

  doc.setFont('THSarabun', 'bold')
  doc.text(`หลักสูตร: ${d.cur_name}`, pageW / 2, y, { align: 'center' })
  y += 7
  doc.text(`สาขาวิชา: ${d.div_name}`, pageW / 2, y, { align: 'center' })
  y += 12

  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  const enrolledAt = d.enrolled_at
    ? new Date(d.enrolled_at).toLocaleDateString('th-TH')
    : new Date(d.updated_at).toLocaleDateString('th-TH')
  doc.text(`วันที่มอบตัว: ${enrolledAt}`, pageW / 2, y, { align: 'center' })
  y += 10

  doc.setFillColor(240, 253, 244)
  doc.setDrawColor(16, 185, 130)
  doc.setLineWidth(0.5)
  doc.roundedRect(15, y, pageW - 30, 14, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(5, 150, 105)
  doc.text('สถานะ: มอบตัวเสร็จสมบูรณ์ ✓', pageW / 2, y + 9, { align: 'center' })
  doc.setTextColor(0, 0, 0)
  y += 19

  doc.setFillColor(255, 251, 235)
  doc.setDrawColor(251, 191, 36)
  doc.setLineWidth(0.4)
  doc.roundedRect(margin, y, pageW - margin * 2, 24, 3, 3, 'FD')
  doc.setFontSize(13)
  doc.setFont('THSarabun', 'bold')
  doc.setTextColor(146, 64, 14)
  doc.text('หมายเหตุ', margin + 4, y + 7)
  doc.setFont('THSarabun', 'normal')
  doc.setFontSize(12)
  doc.text('1. เอกสารนี้ไม่ใช่สัญญาการมอบตัวเป็น นักเรียน นักศึกษา', margin + 4, y + 14)
  doc.text('2. โปรดนำเอกสารนี้ พร้อมวุฒิการศึกษาเดิมติดต่อที่งานทะเบียน วิทยาลัยเทคนิคเลยในวันปฐมนิเทศ', margin + 4, y + 21)
  doc.setTextColor(0, 0, 0)
  y += 30

  doc.setFontSize(10)
  doc.setFont('THSarabun', 'normal')
  doc.setTextColor(150, 150, 150)
  doc.text(`พิมพ์เมื่อ: ${new Date().toLocaleString('th-TH')}`, pageW / 2, y, { align: 'center' })

  doc.save(`ใบรับรองการมอบตัว-${d.id_card_number}.pdf`)
}

const openDocModal = async (row: any) => {
  docModal.value = {
    open: true,
    name: `${row.คำนำหน้า}${row.ชื่อ_นามสกุล}`,
    appId: row.ลำดับ,
    status: row._showAll ? '' : (row.สถานะ || ''),
    slipApproved: null,
    documents: [],
    activeTab: '',
    imgError: false,
    imgLoading: false,
    enrolledData: null,
  }
  try {
    const res = await apiService.getApplicantDocuments(row.ลำดับ)
    if (res.success) {
      let docs = res.data.documents as { doc_type: string; file_url: string }[]
      docModal.value.enrolledData = res.data.applicant || null

      if (row._showAll) {
        docs = docs.filter((d: any) => d.doc_type !== 'payment_slip')
      } else if (row._filterByStatus && row.สถานะ) {
        const allowed = DOC_FILTER[row.สถานะ] ?? null
        if (allowed) docs = docs.filter((d: any) => allowed.includes(d.doc_type))
      }

      docModal.value.documents = docs.filter((d: any, i: number, self: any[]) =>
        i === self.findIndex((t: any) => t.doc_type === d.doc_type)
      )

      if (typeof res.data.slip_approved === 'boolean') {
        docModal.value.slipApproved = res.data.slip_approved
      }

      if (!row._showAll && row.สถานะ === 'pending_payment') {
        docModal.value.activeTab = docModal.value.documents.find(
          d => d.doc_type === 'payment_slip'
        )?.doc_type || '__no_slip__'
      } else if (!row._showAll && row.สถานะ === 'enrolled') {
        docModal.value.activeTab = '__enrollment_cert__'
      } else {
        docModal.value.activeTab = docModal.value.documents[0]?.doc_type || ''
      }
    }
  } catch (e) {
    console.error('โหลดเอกสารไม่สำเร็จ', e)
  }
}

const currentDocUrl = computed(() =>
  resolveUrl(docModal.value.documents.find(d => d.doc_type === docModal.value.activeTab)?.file_url)
)

watch(
  () => [docModal.value.activeTab, docModal.value.documents] as const,
  async ([tab]) => {
    blobUrl.value = ''
    if (!tab || tab.startsWith('__')) return
    const url = resolveUrl(
      docModal.value.documents.find(d => d.doc_type === tab)?.file_url
    )
    if (!url) return
    docModal.value.imgLoading = true
    docModal.value.imgError = false
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error('fetch failed')
      const blob = await res.blob()
      blobUrl.value = URL.createObjectURL(blob)
    } catch {
      docModal.value.imgError = true
    } finally {
      docModal.value.imgLoading = false
    }
  },
  { immediate: true, deep: true }
)

async function generateStudentPDF(studentData: any) {
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }
    const pageW = 210
    const L = 15
    const R = 195
    let y = 0
    const f = (style: 'normal' | 'bold', size: number) => { doc.setFont('THSarabun', style); doc.setFontSize(size) }
    const put = (text: string | number | undefined, x: number, y: number) => {
      if (!text && text !== 0) return
      f('bold', 14); doc.text(String(text), x, y); f('normal', 14)
    }
    const box = (x: number, y: number, checked = false) => {
      doc.rect(x, y - 3.2, 3.5, 3.5)
      if (checked) doc.text('✓', x + 0.3, y - 0.1)
    }
    const charBoxes = (startX: number, y: number, value: string, count: number, w = 4.8) => {
      const clean = value.replace(/-/g, '')
      for (let i = 0; i < count; i++) {
        doc.rect(startX + i * w, y - 4, w, 5)
        if (clean[i]) { f('bold', 12); doc.text(clean[i], startX + i * w + 1.2, y - 0.3); f('normal', 14) }
      }
    }
    y = 16
    doc.rect(L, 8, 16, 16)
    f('bold', 15)
    doc.text('วิทยาลัยเทคนิคเลย  ปีการศึกษา 2569', 112, y, { align: 'center' })
    f('normal', 13)
    doc.text('ระดับ', 153, y)
    box(163, y, studentData.หลักสูตร?.includes('ปวช'))
    doc.text('ปวช.', 167, y)
    box(179, y, studentData.หลักสูตร?.includes('ปวส'))
    doc.text('ปวส.', 183, y)
    y += 7
    f('normal', 13)
    doc.text('มอบตัว วันที่ ........... เดือน .................................. พ.ศ. ..............', 112, y, { align: 'center' })
    y += 7
    f('bold', 16)
    doc.text('ใบมอบตัวและข้อมูลประวัติขึ้นทะเบียนนักเรียน นักศึกษา', pageW / 2, y, { align: 'center' })
    doc.rect(R - 26, 24, 26, 34)
    f('normal', 12)
    doc.text('ติดรูป', R - 13, 38, { align: 'center' })
    doc.text('1 นิ้ว', R - 13, 44, { align: 'center' })
    y += 7
    f('bold', 14)
    doc.text('ข้อมูลส่วนตัวของนักเรียน นักศึกษา', L, y)
    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y); doc.line(L + 17, y, L + 90, y)
    put(`${studentData.คำนำหน้า || ''}${studentData.ชื่อ_นามสกุล || ''}`, L + 18, y)
    doc.text('เพศ', L + 92, y); doc.line(L + 99, y, L + 112, y); put(studentData.เพศ, L + 100, y)
    doc.text('ชื่อเล่น', L + 114, y); doc.line(L + 125, y, R - 28, y); put(studentData.ชื่อเล่น, L + 126, y)
    y += 7
    doc.text('เลขบัตรประชาชน', L, y)
    const idRaw = (studentData.เลขบัตรประชาชน || '').replace(/-/g, '')
    const idGroups = [1, 4, 5, 2, 1]
    let ix = L + 32; let ic = 0
    idGroups.forEach((g, gi) => {
      for (let i = 0; i < g; i++) {
        doc.rect(ix, y - 4, 4.8, 5)
        f('bold', 12); doc.text(idRaw[ic] || '', ix + 1.2, y - 0.3); f('normal', 14)
        ix += 4.8; ic++
      }
      if (gi < idGroups.length - 1) { doc.text('-', ix + 0.5, y - 0.5); ix += 3 }
    })
    doc.text('เกิดวันที่', ix + 3, y); doc.line(ix + 16, y, ix + 24, y)
    doc.text('เดือน', ix + 25, y); doc.line(ix + 34, y, ix + 52, y)
    doc.text('พ.ศ.', ix + 53, y); doc.line(ix + 61, y, ix + 72, y)
    y += 7
    doc.text('เชื้อชาติ', L, y); doc.line(L + 14, y, L + 30, y); put(studentData.เชื้อชาติ, L + 15, y)
    doc.text('สัญชาติ', L + 32, y); doc.line(L + 43, y, L + 57, y); put(studentData.สัญชาติ, L + 44, y)
    doc.text('ศาสนา', L + 59, y); doc.line(L + 69, y, L + 83, y); put(studentData.ศาสนา, L + 70, y)
    doc.text('หมู่เลือด', L + 85, y); doc.line(L + 96, y, L + 105, y); put(studentData.หมู่เลือด, L + 97, y)
    doc.text('น้ำหนัก', L + 107, y); doc.line(L + 117, y, L + 126, y)
    doc.text('ก.ก.', L + 127, y)
    doc.text('ส่วนสูง', L + 133, y); doc.line(L + 142, y, L + 152, y)
    doc.text('ซ.ม.', L + 153, y)
    y += 7
    doc.text('จังหวัดที่เกิด', L, y); doc.line(L + 21, y, L + 60, y); put(studentData.จังหวัดที่เกิด, L + 22, y)
    doc.text('จำนวนพี่น้องทั้งหมด', L + 62, y); doc.line(L + 91, y, L + 98, y)
    doc.text('คน', L + 99, y)
    doc.text('จำนวนพี่น้องที่กำลังศึกษาอยู่', L + 104, y); doc.line(L + 140, y, L + 147, y)
    doc.text('คน', L + 148, y)
    y += 7
    doc.text('ความพิการ', L, y)
    box(L + 19, y, !studentData.ความพิการ); doc.text('ไม่พิการ', L + 24, y)
    doc.text('ความสามารถพิเศษ', L + 45, y); doc.line(L + 75, y, R - 28, y)
    y += 8
    f('bold', 14)
    doc.text('ข้อมูลที่อยู่  เลขรหัสประจำบ้าน (จำเป็นต้องกรอกให้ครบ)', L, y)
    charBoxes(L + 102, y, studentData.รหัสประจำบ้าน || '', 11, 4.8)
    y += 7
    f('normal', 14)
    doc.text('บ้านเลขที่', L, y); doc.line(L + 16, y, L + 32, y); put(studentData.บ้านเลขที่, L + 17, y)
    doc.text('หมู่', L + 34, y); doc.line(L + 40, y, L + 50, y); put(studentData.หมู่, L + 41, y)
    doc.text('ถนน', L + 52, y); doc.line(L + 59, y, L + 88, y)
    doc.text('ตำบล', L + 90, y); doc.line(L + 98, y, L + 120, y)
    doc.text('อำเภอ', L + 122, y); doc.line(L + 130, y, R - 28, y)
    y += 7
    doc.text('จังหวัด', L, y); doc.line(L + 13, y, L + 48, y); put(studentData.จังหวัด, L + 14, y)
    doc.text('รหัสไปรษณีย์', L + 50, y); doc.line(L + 70, y, L + 90, y); put(studentData.รหัสไปรษณีย์, L + 71, y)
    doc.text('เบอร์โทรศัพท์ที่ติดต่อได้', L + 92, y); doc.line(L + 120, y, R - 28, y); put(studentData.เบอร์โทร, L + 121, y)
    y += 8
    f('bold', 14)
    doc.text('ข้อมูลครอบครัว', L, y)
    y += 7
    f('normal', 14)
    doc.text('ชื่อ-สกุล บิดา', L, y); doc.line(L + 24, y, L + 88, y); put(studentData.ชื่อบิดา, L + 25, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)
    y += 6.5
    doc.text('อาชีพบิดา', L, y); doc.line(L + 16, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ บิดา', L + 116, y); doc.line(L + 143, y, R, y)
    y += 6.5
    doc.text('ชื่อ-สกุล มารดา', L, y); doc.line(L + 26, y, L + 88, y); put(studentData.ชื่อมารดา, L + 27, y)
    doc.text('สถานภาพ', L + 90, y)
    box(L + 104, y); doc.text('มีชีวิต', L + 109, y)
    box(L + 122, y); doc.text('เสียชีวิต', L + 127, y)
    doc.text('ความพิการ', L + 140, y)
    box(L + 155, y); doc.text('พิการ', L + 160, y)
    box(L + 170, y); doc.text('ไม่พิการ', L + 175, y)
    y += 6.5
    doc.text('อาชีพมารดา', L, y); doc.line(L + 18, y, L + 60, y)
    doc.text('รายได้ต่อเดือน', L + 62, y); doc.line(L + 83, y, L + 108, y)
    doc.text('บาท', L + 110, y)
    doc.text('เบอร์โทรศัพท์ มารดา', L + 116, y); doc.line(L + 145, y, R, y)
    y += 7
    doc.text('สถานภาพการสมรส บิดา/มารดา', L, y)
    box(L + 56, y); doc.text('อยู่ด้วยกัน', L + 61, y)
    box(L + 80, y); doc.text('แยกกันอยู่', L + 85, y)
    box(L + 103, y); doc.text('หย่าร้าง', L + 108, y)
    box(L + 123, y); doc.text('บิดา/มารดาแต่งงานใหม่', L + 128, y)
    box(L + 163, y); doc.text('บิดา/มารดาเสียชีวิต', L + 168, y)
    y += 8
    doc.text('ข้าพเจ้า (ชื่อผู้ปกครอง)', L, y)
    doc.line(L + 42, y, L + 120, y); put(studentData.ชื่อผู้ปกครอง, L + 43, y)
    doc.text('เกี่ยวข้องเป็น(กับนักเรียน)', L + 122, y); doc.line(L + 156, y, R, y)
    y += 6.5
    doc.text('เบอร์โทรศัพท์ที่ติดต่อผู้ปกครอง', L, y); doc.line(L + 60, y, L + 115, y)
    doc.text('ขอทำใบมอบตัวต่อผู้อำนวยการวิทยาลัยเทคนิคเลย ดังนี้', L + 117, y)
    y += 6.5
    doc.text('นักศึกษาในความปกครองของข้าพเจ้าชื่อ', L, y)
    doc.line(L + 70, y, L + 130, y)
    doc.text('ชื่อเล่น', L + 132, y); doc.line(L + 143, y, R, y)
    y += 6
    f('normal', 13)
    doc.text('ข้าพเจ้า ขอรับเป็นผู้ปกครองและของรับรองว่าจะเป็นผู้คอยดูแลตักเตือนให้นักเรียนผู้นี้นักศึกษาเล่าเรียนอยู่เสมอ ให้มีความประพฤติ', L, y)
    y += 5.5
    doc.text('เรียบร้อยตามคำสั่งสอน ข้อบังคับ และระเบียบวินัยของวิทยาลัยฯ ทุกประการ โดยข้าพเจ้าขอรับผิดชอบค่าเล่าเรียน เครื่องแต่งกาย และอุปกรณ์', L, y)
    y += 5.5
    doc.text('การเรียนให้เพียงพอ ข้าพเจ้า ขอมอบ (ชื่อนักเรียน นักศึกษา)', L, y); doc.line(L + 108, y, R, y)
    y += 5.5
    doc.text('ให้เป็นนักเรียน นักศึกษา วิทยาลัยเทคนิคเลย ตั้งแต่บัดนี้เป็นต้นไป', L, y)
    y += 16
    f('normal', 14)
    doc.text('ลงชื่อ', L + 8, y); doc.line(L + 18, y, L + 78, y)
    doc.text('ผู้ปกครอง', L + 80, y)
    doc.text('ลงชื่อ', pageW / 2 + 10, y); doc.line(pageW / 2 + 20, y, pageW / 2 + 80, y)
    doc.text('นักเรียน/นักศึกษา', pageW / 2 + 82, y)
    y += 7
    doc.text('(', L + 18, y); doc.line(L + 22, y, L + 75, y); doc.text(')', L + 76, y)
    doc.text('(', pageW / 2 + 20, y); doc.line(pageW / 2 + 24, y, pageW / 2 + 78, y); doc.text(')', pageW / 2 + 79, y)
    doc.save(`ใบมอบตัว_${studentData.ชื่อ_นามสกุล || 'student'}.pdf`)
  } catch (err) {
    console.error('PDF Error:', err)
  }
}

async function generatePaymentPDF(paymentData: any) {
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }
    const pageW = 210
    const L = 15
    const R = 195
    let y = 0
    const f = (style: 'normal' | 'bold', size: number) => { doc.setFont('THSarabun', style); doc.setFontSize(size) }
    const put = (text: string | number | undefined, x: number, y: number) => {
      if (!text && text !== 0) return
      f('bold', 14); doc.text(String(text), x, y); f('normal', 14)
    }

    y = 16
    f('bold', 18)
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
    y += 8
    f('bold', 16)
    doc.text('ใบเสร็จรับเงินค่าบำรุงการศึกษา', pageW / 2, y, { align: 'center' })
    y += 10

    f('normal', 14)
    doc.text('เลขที่ใบเสร็จ', L, y)
    doc.line(L + 25, y, L + 60, y)
    doc.text('วันที่', L + 70, y)
    doc.line(L + 85, y, L + 120, y)
    y += 8

    f('bold', 14)
    doc.text('ข้อมูลนักเรียน', L, y)
    y += 7

    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y)
    doc.line(L + 20, y, L + 90, y)
    put(`${paymentData.คำนำหน้า || ''}${paymentData.ชื่อ_นามสกุล || ''}`, L + 21, y)
    y += 7

    doc.text('รหัสนักเรียน', L, y)
    doc.line(L + 20, y, L + 40, y)
    put(paymentData.ลำดับ, L + 21, y)
    doc.text('หลักสูตร', L + 50, y)
    doc.line(L + 65, y, L + 90, y)
    put(paymentData.หลักสูตร, L + 66, y)
    doc.text('สาขาวิชา', L + 100, y)
    doc.line(L + 115, y, R, y)
    put(paymentData.สาขาวิชา, L + 116, y)
    y += 10

    f('bold', 14)
    doc.text('รายการค่าบำรุงการศึกษา', L, y)
    y += 8

    f('bold', 12)
    doc.text('ลำดับ', L, y)
    doc.text('รายการ', L + 15, y)
    doc.text('จำนวนเงิน', L + 100, y)
    y += 6
    doc.line(L, y, R, y)
    y += 2

    f('normal', 12)
    doc.text('1', L, y)
    doc.text('ค่าบำรุงการศึกษา', L + 15, y)
    put(paymentData.ยอดชำระ, L + 100, y)
    y += 8

    doc.line(L, y, R, y)
    y += 6

    f('bold', 14)
    doc.text('รวมทั้งสิ้น', L + 70, y)
    put(paymentData.ยอดชำระ, L + 100, y)
    y += 10

    f('normal', 14)
    doc.text('วันที่ชำระเงิน', L, y)
    put(paymentData.วันที่ชำระ, L + 30, y)
    y += 8
    doc.text('หลักฐานการชำระ', L, y)
    put(paymentData.หลักฐานการชำระ_ใบเสร็จ, L + 30, y)
    y += 15

    f('normal', 12)
    doc.text('..................................................', pageW / 2, y, { align: 'center' })
    doc.text('ผู้รับเงิน', pageW / 2, y + 5, { align: 'center' })

    doc.save(`ใบเสร็จค่าบำรุง_${paymentData.ชื่อ_นามสกุล || 'payment'}.pdf`)
  } catch (err) {
    console.error('Payment PDF Error:', err)
  }
}

async function generateCombinedOrderPDF(orderData: any) {
  try {
    const fontBase64 = await loadThaiFont()
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
    if (fontBase64) {
      doc.addFileToVFS('THSarabunNew.ttf', fontBase64)
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'normal')
      doc.addFont('THSarabunNew.ttf', 'THSarabun', 'bold')
    }

    const pageW = 210
    const L = 15
    const R = 195
    let y = 15

    const f = (style: 'normal' | 'bold', size: number) => { doc.setFont('THSarabun', style); doc.setFontSize(size) }
    const put = (text: string | number | undefined, x: number, y: number) => {
      if (!text && text !== 0) return
      f('bold', 14); doc.text(String(text), x, y); f('normal', 14)
    }

    // หน้า 1: ใบแสดงการชำระเงิน
    f('bold', 18)
    doc.text('วิทยาลัยเทคนิคเลย', pageW / 2, y, { align: 'center' })
    y += 10

    f('bold', 16)
    doc.text('ใบเสร็จรับเงินค่าบำรุงการศึกษา', pageW / 2, y, { align: 'center' })
    y += 12

    f('normal', 14)
    doc.text('เลขที่ใบเสร็จ', L, y)
    doc.line(L + 30, y, L + 70, y)
    doc.text('วันที่', L + 80, y)
    doc.line(L + 100, y, L + 140, y)
    y += 10

    f('bold', 14)
    doc.text('ข้อมูลนักเรียน', L, y)
    y += 8

    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y)
    doc.line(L + 25, y, L + 100, y)
    put(`${orderData.คำนำหน้า || ''}${orderData.ชื่อ_นามสกุล || ''}`, L + 26, y)
    y += 8

    doc.text('รหัสนักเรียน', L, y)
    doc.line(L + 25, y, L + 50, y)
    put(orderData.ลำดับ, L + 26, y)
    doc.text('หลักสูตร', L + 60, y)
    doc.line(L + 75, y, L + 100, y)
    put(orderData.หลักสูตร, L + 76, y)
    doc.text('สาขาวิชา', L + 110, y)
    doc.line(L + 125, y, R, y)
    put(orderData.สาขาวิชา, L + 126, y)
    y += 12

    f('bold', 14)
    doc.text('รายการค่าบำรุงการศึกษา', L, y)
    y += 10

    f('bold', 12)
    doc.text('ลำดับ', L, y)
    doc.text('รายการ', L + 20, y)
    doc.text('จำนวนเงิน', L + 120, y)
    y += 7
    doc.line(L, y, R, y)
    y += 3

    f('normal', 12)
    doc.text('1', L, y)
    doc.text('ค่าบำรุงการศึกษา', L + 20, y)
    put(orderData.ยอดชำระ, L + 120, y)
    y += 10

    doc.line(L, y, R, y)
    y += 8

    f('bold', 14)
    doc.text('รวมทั้งสิ้น', L + 80, y)
    put(orderData.ยอดชำระ, L + 120, y)
    y += 12

    f('normal', 14)
    doc.text('วันที่ชำระเงิน', L, y)
    put(orderData.วันที่ชำระ, L + 40, y)
    y += 8
    doc.text('หลักฐานการชำระ', L, y)
    put(orderData.หลักฐานการชำระ_ใบเสร็จ, L + 40, y)
    y += 20

    f('normal', 12)
    doc.text('..................................................', pageW / 2, y, { align: 'center' })
    doc.text('ผู้รับเงิน', pageW / 2, y + 5, { align: 'center' })

    // หน้า 2: สลิป
    doc.addPage()
    y = 15

    f('bold', 18)
    doc.text('หลักฐานการชำระเงิน (สลิป)', pageW / 2, y, { align: 'center' })
    y += 15

    if (orderData._slipUrl) {
      try {
        doc.text('รูปสลิป:', L, y)
        y += 10
        doc.rect(L, y, 100, 80)
        doc.text('รูปสลิปจะปรากฏที่นี่', L + 50, y + 40, { align: 'center' })
        y += 90
      } catch (e) {
        console.warn('Failed to load slip image:', e)
        f('normal', 12)
        doc.text('ไม่สามารถโหลดรูปสลิปได้', L, y)
        y += 10
      }
    } else {
      f('normal', 12)
      doc.text('ไม่พบรูปสลิป', L, y)
      y += 10
    }

    // หน้า 3: ใบรายการสั่งซื้อเครื่องแบบ
    doc.addPage()
    y = 15

    f('bold', 18)
    doc.text('ใบรายการสั่งซื้อเครื่องแบบและอุปกรณ์', pageW / 2, y, { align: 'center' })
    y += 12

    f('normal', 14)
    doc.text('ชื่อ-สกุล', L, y)
    doc.line(L + 25, y, L + 100, y)
    put(`${orderData.คำนำหน้า || ''}${orderData.ชื่อ_นามสกุล || ''}`, L + 26, y)
    y += 8

    doc.text('รหัสนักเรียน', L, y)
    doc.line(L + 25, y, L + 50, y)
    put(orderData.ลำดับ, L + 26, y)
    doc.text('หลักสูตร', L + 60, y)
    doc.line(L + 75, y, L + 100, y)
    put(orderData.หลักสูตร, L + 76, y)
    doc.text('สาขาวิชา', L + 110, y)
    doc.line(L + 125, y, R, y)
    put(orderData.สาขาวิชา, L + 126, y)
    y += 12

    f('bold', 14)
    doc.text('รายการสั่งซื้อ', L, y)
    y += 10

    f('bold', 12)
    doc.text('ลำดับ', L, y)
    doc.text('รายการ', L + 20, y)
    doc.text('จำนวน', L + 80, y)
    doc.text('ราคา', L + 110, y)
    doc.text('รวม', L + 140, y)
    y += 7
    doc.line(L, y, R, y)
    y += 3

    f('normal', 12)
    doc.text('1', L, y)
    doc.text(orderData.รายการ || '-', L + 20, y)
    doc.text(orderData.จำนวน ? String(orderData.จำนวน) : '-', L + 80, y)
    doc.text(orderData.ราคา ? String(orderData.ราคา) : '-', L + 110, y)
    put(orderData.ยอดชำระ, L + 140, y)
    y += 10

    doc.line(L, y, R, y)
    y += 8

    f('bold', 14)
    doc.text('รวมทั้งสิ้น', L + 90, y)
    put(orderData.ยอดชำระ, L + 140, y)
    y += 12

    f('normal', 14)
    doc.text('วันที่สั่งซื้อ', L, y)
    doc.text(orderData.วันที่สั่งซื้อ ? String(orderData.วันที่สั่งซื้อ) : '-', L + 40, y)
    y += 8
    doc.text('วันที่ชำระเงิน', L, y)
    put(orderData.วันที่ชำระ, L + 40, y)
    y += 20

    f('normal', 12)
    doc.text('..................................................', pageW / 2, y, { align: 'center' })
    doc.text('ผู้สั่งซื้อ', pageW / 2, y + 5, { align: 'center' })

    const filename = `ใบรายการสั่งซื้อ_${orderData.ชื่อ_นามสกุล || 'order'}.pdf`
    doc.save(filename)

  } catch (err) {
    console.error('Combined Order PDF Error:', err)
  }
}
</script>