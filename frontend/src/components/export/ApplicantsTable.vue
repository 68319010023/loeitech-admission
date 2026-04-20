<template>
  <div class="bg-white rounded-2xl border border-gray-100 overflow-hidden">
    <table class="w-full text-sm">
      <thead class="bg-gray-50 text-gray-500">
        <tr>
          <th class="px-4 py-3 text-center w-10">
            <input type="checkbox" @change="$emit('toggle-all')" :checked="isAllSelected" />
          </th>
          <th class="px-4 py-3 text-left">ชื่อ-สกุล</th>
          <th class="px-4 py-3 text-left">หลักสูตร</th>
          <th class="px-4 py-3 text-left">สาขา</th>
          <th class="px-4 py-3 text-center">สถานะ</th>
          <th class="px-4 py-3 text-center">เบอร์ติดต่อ</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="row in data"
          :key="row.ลำดับ"
          :class="['hover:bg-gray-50', selectedIds.includes(row.ลำดับ) ? 'bg-green-50/50' : '']">
          <td class="px-4 py-3 text-center">
            <input
              type="checkbox"
              :value="row.ลำดับ"
              :checked="selectedIds.includes(row.ลำดับ)"
              @change="toggleRow(row.ลำดับ)" />
          </td>
          <td class="px-4 py-3 text-gray-800">{{ row.คำนำหน้า }}{{ row.ชื่อ_นามสกุล }}</td>
          <td class="px-4 py-3 text-gray-500">{{ row.หลักสูตร }}</td>
          <td class="px-4 py-3">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700">
              {{ row.สาขาวิชา }}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <span :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold',
              row.สถานะ === 'enrolled'
                ? 'bg-green-50 text-green-700 border border-green-200'
                : row.สถานะ === 'pending_payment' || row.สถานะ === 'pending_approve'
                ? 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                : 'bg-red-50 text-red-500 border border-red-200'
            ]">
              {{
                row.สถานะ === 'enrolled' ? 'มอบตัวแล้ว'
                : row.สถานะ === 'pending_payment' ? 'สมัครใหม่'
                : row.สถานะ === 'pending_approve' ? 'รอตรวจสอบ'
                : '-'
              }}
            </span>
          </td>
          <td class="px-4 py-3 text-center">
            <span class="text-sm text-gray-700">{{ row.เบอร์โทร || '-' }}</span>
          </td>
        </tr>
        <tr v-if="data.length === 0">
          <td colspan="6" class="px-4 py-8 text-center text-gray-400">ไม่พบข้อมูล</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  data: any[]
  selectedIds: string[]
  isAllSelected: boolean
}>()

const emit = defineEmits<{
  'update:selected-ids': [ids: string[]]
  'toggle-all': []
}>()

const toggleRow = (id: string) => {
  const current = [...props.selectedIds]
  const idx = current.indexOf(id)
  if (idx === -1) current.push(id)
  else current.splice(idx, 1)
  emit('update:selected-ids', current)
}
</script>