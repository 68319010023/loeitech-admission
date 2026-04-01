// Mock data for development without Supabase
const mockStudents = [
  {
    id: '1',
    firstName: 'สมชาย',
    lastName: 'ใจดี',
    idCardNumber: '1234567890123',
    birthDate: '2000-01-15',
    gender: 'male',
    address: '123 ถนนสุขุมวิท กรุงเทพมหานคร',
    phone: '0812345678',
    email: 'somchai@email.com',
    educationLevel: 'ปวช',
    departmentId: '1',
    courseId: '1',
    schoolName: 'โรงเรียนตัวอย่าง',
    gpa: 3.5,
    parentName: 'บิดา สมชาย',
    parentPhone: '0823456789',
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    firstName: 'สมศรี',
    lastName: 'รักดี',
    idCardNumber: '9876543210987',
    birthDate: '2001-05-20',
    gender: 'female',
    address: '456 ถนนพระราม 4 กรุงเทพมหานคร',
    phone: '0898765432',
    email: 'somsri@email.com',
    educationLevel: 'ปวส',
    departmentId: '2',
    courseId: '2',
    schoolName: 'วิทยาลัยเทคนิคเลย',
    gpa: 3.8,
    parentName: 'มารดา สมศรี',
    parentPhone: '0876543210',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockDepartments = [
  {
    id: '1',
    name: 'แผนกช่างยนต์',
    description: 'การเรียนการสอนด้านช่างยนต์และเครื่องกล',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'แผนกช่างไฟฟ้า',
    description: 'การเรียนการสอนด้านช่างไฟฟ้าและอิเล็กทรอนิกส์',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'แผนกช่างก่อสร้าง',
    description: 'การเรียนการสอนด้านช่างก่อสร้างและสถาปัตยกรรม',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockCourses = [
  {
    id: '1',
    name: 'ช่างยนต์กลโรงงาน',
    departmentId: '1',
    educationLevel: 'ปวช',
    description: 'การเรียนการสอนด้านช่างยนต์กลโรงงาน',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'ช่างไฟฟ้ากำลัง',
    departmentId: '2',
    educationLevel: 'ปวส',
    description: 'การเรียนการสอนด้านช่างไฟฟ้ากำลัง',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'ช่างก่อสร้าง',
    departmentId: '3',
    educationLevel: 'ปวช',
    description: 'การเรียนการสอนด้านช่างก่อสร้าง',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockInventory = [
  {
    id: '1',
    name: 'ชุดยูนิฟอร์มนักเรียนชาย',
    description: 'ชุดยูนิฟอร์มนักเรียนชาย ขนาดต่างๆ',
    category: 'uniform',
    targetGroup: 'male',
    price: 500,
    stockQuantity: 100,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'ชุดยูนิฟอร์มนักเรียนหญิง',
    description: 'ชุดยูนิฟอร์มนักเรียนหญิง ขนาดต่างๆ',
    category: 'uniform',
    targetGroup: 'female',
    price: 550,
    stockQuantity: 80,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'กล่องเครื่องเขียน',
    description: 'กล่องเครื่องเขียนพลาสติก',
    category: 'stationery',
    targetGroup: 'all_students',
    price: 150,
    stockQuantity: 200,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

module.exports = {
  mockStudents,
  mockDepartments,
  mockCourses,
  mockInventory
};
