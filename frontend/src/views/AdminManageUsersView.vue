<template>
  <div class="max-w-7xl mx-auto animate-fadeIn">
    <!-- Header with gradient -->
    <div class="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 p-8 shadow-xl">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="relative z-10">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
            <UserGroupIcon class="w-7 h-7 text-white" />
          </div>
          <h1 class="text-3xl font-bold text-white">จัดการสมาชิก</h1>
        </div>
        <p class="text-white/90 text-lg">จัดการข้อมูลเจ้าหน้าที่ในระบบ</p>
        <div class="mt-4 flex items-center gap-6">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-white/60 rounded-full animate-pulse"></div>
            <span class="text-white/80 text-sm">ทั้งหมด {{ users.length }} คน</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-emerald-300 rounded-full"></div>
            <span class="text-white/80 text-sm">Admin {{ users.filter(u => u.role === 'admin').length }} คน</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 bg-blue-300 rounded-full"></div>
            <span class="text-white/80 text-sm">Staff {{ users.filter(u => u.role === 'staff').length }} คน</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Actions Bar -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100/50 p-6 mb-6 backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div class="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
        <div class="flex flex-col sm:flex-row gap-4 flex-1 w-full lg:w-auto">
          <!-- Search -->
          <div class="relative flex-1 lg:max-w-md">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon class="h-5 w-5 text-gray-400" />
            </div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="ค้นหาชื่อผู้ใช้..."
              class="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 hover:bg-white"
            />
          </div>
          
          <!-- Filter by Role -->
          <select
            v-model="selectedRole"
            class="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50/50 hover:bg-white cursor-pointer"
          >
            <option value="">ทุกบทบาท</option>
            <option value="admin">Admin</option>
            <option value="staff">Staff</option>
          </select>
        </div>
        
        <!-- Add User Button -->
        <button
          @click="showAddModal = true"
          class="px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <PlusIcon class="h-5 w-5" />
          <span class="font-medium">เพิ่มสมาชิก</span>
        </button>
      </div>
    </div>

    <!-- Users Table -->
    <div class="bg-white rounded-2xl shadow-lg border border-gray-100/50 overflow-hidden backdrop-blur-sm hover:shadow-xl transition-all duration-300">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-100">
          <thead class="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <UserIcon class="w-4 h-4" />
                  ชื่อผู้ใช้
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <ShieldCheckIcon class="w-4 h-4" />
                  บทบาท
                </div>
              </th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center gap-2">
                  <CalendarIcon class="w-4 h-4" />
                  วันที่สร้าง
                </div>
              </th>
              <th class="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                <div class="flex items-center justify-end gap-2">
                  <CogIcon class="w-4 h-4" />
                  จัดการ
                </div>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-50">
            <tr v-if="filteredUsers.length === 0">
              <td colspan="4" class="px-6 py-16 text-center">
                <div class="flex flex-col items-center gap-4">
                  <div class="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <UserGroupIcon class="w-10 h-10 text-gray-400" />
                  </div>
                  <div>
                    <p class="text-gray-500 font-medium mb-1">ไม่พบข้อมูลสมาชิก</p>
                    <p class="text-gray-400 text-sm">ลองปรับเงื่อนไขการค้นหาหรือเพิ่มสมาชิกใหม่</p>
                  </div>
                  <button
                    @click="showAddModal = true"
                    class="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors flex items-center gap-2"
                  >
                    <PlusIcon class="h-4 w-4" />
                    เพิ่มสมาชิกใหม่
                  </button>
                </div>
              </td>
            </tr>
            <tr v-for="(user, index) in filteredUsers" :key="user.id" 
                class="hover:bg-gradient-to-r hover:from-emerald-50 hover:to-teal-50 transition-all duration-200 cursor-pointer group animate-slideUp"
                :style="{ animationDelay: `${index * 50}ms` }">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-semibold shadow-md group-hover:scale-110 transition-transform">
                    {{ user.username.charAt(0).toUpperCase() }}
                  </div>
                  <div>
                    <div class="text-sm font-semibold text-gray-900">{{ user.username }}</div>
                    <div class="text-xs text-gray-500 font-mono">{{ user.id.slice(0, 8) }}...</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="[
                    'inline-flex px-3 py-1 text-xs font-semibold rounded-full shadow-sm transition-all duration-200 hover:scale-105',
                    user.role === 'admin' 
                      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border border-purple-300' 
                      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border border-blue-300'
                  ]"
                >
                  <ShieldCheckIcon v-if="user.role === 'admin'" class="w-3 h-3 mr-1" />
                  <UserIcon v-else class="w-3 h-3 mr-1" />
                  {{ user.role === 'admin' ? 'Admin' : 'Staff' }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-2 text-sm text-gray-600">
                  <CalendarIcon class="w-4 h-4 text-gray-400" />
                  <span>{{ formatDate(user.created_at) }}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right">
                <div class="flex items-center justify-end gap-2">
                  <button
                    @click="editUser(user)"
                    class="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-all duration-200 flex items-center gap-1 text-sm font-medium hover:scale-105"
                  >
                    <PencilIcon class="h-3 w-3" />
                    แก้ไข
                  </button>
                  <button
                    @click="deleteUser(user)"
                    class="px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-all duration-200 flex items-center gap-1 text-sm font-medium hover:scale-105"
                  >
                    <TrashIcon class="h-3 w-3" />
                    ลบ
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add/Edit User Modal -->
    <div v-if="showAddModal || showEditModal" class="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div class="border-b border-gray-200 px-6 py-4">
          <h3 class="text-lg font-medium text-gray-900">
            {{ showAddModal ? 'เพิ่มสมาชิกใหม่' : 'แก้ไขข้อมูลสมาชิก' }}
          </h3>
        </div>
        
        <form @submit.prevent="saveUser" class="p-6">
          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                ชื่อผู้ใช้
              </label>
              <input
                v-model="userForm.username"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                placeholder="กรอกชื่อผู้ใช้"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                รหัสผ่าน
              </label>
              <input
                v-model="userForm.password"
                type="password"
                :required="showAddModal"
                :placeholder="showEditModal ? 'ปล่อยว่างหากไม่ต้องการเปลี่ยน' : 'กรอกรหัสผ่าน'"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                บทบาท
              </label>
              <select
                v-model="userForm.role"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                <option value="">เลือกบทบาท</option>
                <option value="admin">Admin</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          
          <div class="flex gap-3 mt-6">
            <button
              type="submit"
              class="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              บันทึก
            </button>
            <button
              type="button"
              @click="closeModal"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div v-if="showDeleteModal" class="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
        <div class="p-6">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
              <TrashIcon class="w-6 h-6 text-red-500" />
            </div>
            <div>
              <p class="text-gray-900 font-medium">
                คุณต้องการลบสมาชิก <span class="text-red-600 font-bold">"{{ selectedUser?.username }}"</span> ใช่หรือไม่?
              </p>
              <p class="text-sm text-gray-500 mt-1">ข้อมูลทั้งหมดของสมาชิกนี้จะถูกลบออกจากระบบถาวร</p>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button
              @click="confirmDelete"
              class="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              ลบข้อมูล
            </button>
            <button
              @click="showDeleteModal = false"
              class="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  CalendarIcon,
  CogIcon,
  PencilIcon,
  TrashIcon,
  UserPlusIcon,
  LockClosedIcon,
  ExclamationTriangleIcon
} from '@heroicons/vue/24/outline'

// Types
interface User {
  id: string
  username: string
  role: 'admin' | 'staff'
  created_at: string
}

// State
const users = ref<User[]>([])
const searchQuery = ref('')
const selectedRole = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showDeleteModal = ref(false)
const selectedUser = ref<User | null>(null)

// Form
const userForm = ref({
  username: '',
  password: '',
  role: '' as 'admin' | 'staff' | ''
})

// Computed
const filteredUsers = computed(() => {
  let filtered = users.value

  if (searchQuery.value) {
    filtered = filtered.filter(user =>
      user.username.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (selectedRole.value) {
    filtered = filtered.filter(user => user.role === selectedRole.value)
  }

  return filtered
})

// Methods
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const loadUsers = () => {
  // Mock data - ในอนาคตควรดึงจาก API
  users.value = [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'admin',
      role: 'admin',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'staff01',
      role: 'staff',
      created_at: '2024-02-20T14:15:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'staff02',
      role: 'staff',
      created_at: '2024-03-10T09:45:00Z'
    }
  ]
}

const editUser = (user: User) => {
  selectedUser.value = user
  userForm.value = {
    username: user.username,
    password: '',
    role: user.role
  }
  showEditModal.value = true
}

const deleteUser = (user: User) => {
  selectedUser.value = user
  showDeleteModal.value = true
}

const confirmDelete = () => {
  if (selectedUser.value) {
    users.value = users.value.filter(u => u.id !== selectedUser.value!.id)
    showDeleteModal.value = false
    selectedUser.value = null
  }
}

const saveUser = () => {
  if (showAddModal.value) {
    // Add new user
    const newUser: User = {
      id: crypto.randomUUID(),
      username: userForm.value.username,
      role: userForm.value.role as 'admin' | 'staff',
      created_at: new Date().toISOString()
    }
    users.value.push(newUser)
  } else if (showEditModal.value && selectedUser.value) {
    // Update existing user
    const index = users.value.findIndex(u => u.id === selectedUser.value!.id)
    if (index !== -1) {
      users.value[index] = {
        ...users.value[index],
        username: userForm.value.username,
        role: userForm.value.role as 'admin' | 'staff'
      }
    }
  }
  
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  selectedUser.value = null
  userForm.value = {
    username: '',
    password: '',
    role: ''
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<style scoped>
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out both;
}

/* Custom scrollbar */
.overflow-x-auto::-webkit-scrollbar {
  height: 6px;
}

.overflow-x-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb {
  background: #10b981;
  border-radius: 10px;
}

.overflow-x-auto::-webkit-scrollbar-thumb:hover {
  background: #059669;
}

/* Glassmorphism effect */
.backdrop-blur-sm {
  backdrop-filter: blur(4px);
}

/* Smooth transitions */
* {
  transition-property: all;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
