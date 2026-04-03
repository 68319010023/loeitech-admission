
const mockCurriculums = [
  {
    cur_id: 1,
    cur_name: 'ประกาศนียบัตรวิชาชีพ',
    cur_shortname: 'ปวช',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    cur_id: 2,
    cur_name: 'ประกาศนียบัตรวิชาชีพชั้นสูง',
    cur_shortname: 'ปวส',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];


const mockDivisions = [
  {
    div_id: 1,
    div_name: 'คอมพิวเตอร์ธุรกิจ',
    cur_id: 1, // ปวช
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 2,
    div_name: 'ช่างไฟฟ้า',
    cur_id: 1, // ปวช
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 3,
    div_name: 'ช่างกลโรงงาน',
    cur_id: 1, // ปวช
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 4,
    div_name: 'ช่างยนต์',
    cur_id: 1, // ปวช
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 5,
    div_name: 'การบัญชี',
    cur_id: 1, // ปวช
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 6,
    div_name: 'เทคโนโลยีสารสนเทศ',
    cur_id: 2, // ปวส
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 7,
    div_name: 'คอมพิวเตอร์ธุรกิจ',
    cur_id: 2, // ปวส
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    div_id: 8,
    div_name: 'ช่างไฟฟ้ากำลัง',
    cur_id: 2, // ปวส
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================
// admission_plan (แผนรับสมัคร)
// ============================================================
const mockAdmissionPlans = [
  { ap_id: 1, ap_years: '2568', div_id: 1, cur_id: 1, plan_num: 30 },
  { ap_id: 2, ap_years: '2568', div_id: 2, cur_id: 1, plan_num: 30 },
  { ap_id: 3, ap_years: '2568', div_id: 3, cur_id: 1, plan_num: 30 },
  { ap_id: 4, ap_years: '2568', div_id: 4, cur_id: 1, plan_num: 30 },
  { ap_id: 5, ap_years: '2568', div_id: 5, cur_id: 1, plan_num: 30 },
  { ap_id: 6, ap_years: '2568', div_id: 6, cur_id: 2, plan_num: 20 },
  { ap_id: 7, ap_years: '2568', div_id: 7, cur_id: 2, plan_num: 20 },
  { ap_id: 8, ap_years: '2568', div_id: 8, cur_id: 2, plan_num: 20 }
];

// ============================================================
// expense_detail (ค่าใช้จ่าย)
// ============================================================
const mockExpenseDetails = [
  {
    exp_id: 1,
    exp_name: 'ค่าธรรมเนียมการเรียน ปวช',
    exp_detail: 'ค่าธรรมเนียมประจำภาคเรียน สำหรับนักศึกษา ปวช',
    exp_img: null,
    cur_id: 1,
    exp_cost: 2000.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    exp_id: 2,
    exp_name: 'ค่าธรรมเนียมการเรียน ปวส',
    exp_detail: 'ค่าธรรมเนียมประจำภาคเรียน สำหรับนักศึกษา ปวส',
    exp_img: null,
    cur_id: 2,
    exp_cost: 2500.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    exp_id: 3,
    exp_name: 'ค่าประกันอุบัติเหตุ',
    exp_detail: 'ค่าประกันอุบัติเหตุประจำปี สำหรับนักศึกษา ปวช',
    exp_img: null,
    cur_id: 1,
    exp_cost: 100.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    exp_id: 4,
    exp_name: 'ค่าประกันอุบัติเหตุ',
    exp_detail: 'ค่าประกันอุบัติเหตุประจำปี สำหรับนักศึกษา ปวส',
    exp_img: null,
    cur_id: 2,
    exp_cost: 100.00,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================
// students (นักศึกษา) — เปลี่ยน educationLevel/departmentId/courseId
//                        เป็น cur_id / div_id
// ============================================================
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
    cur_id: 1,       // ปวช  (แทน educationLevel: 'ปวช')
    div_id: 4,       // ช่างยนต์ (แทน departmentId + courseId เดิม)
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
    cur_id: 2,       // ปวส  (แทน educationLevel: 'ปวส')
    div_id: 8,       // ช่างไฟฟ้ากำลัง (แทน departmentId + courseId เดิม)
    schoolName: 'วิทยาลัยเทคนิคเลย',
    gpa: 3.8,
    parentName: 'มารดา สมศรี',
    parentPhone: '0876543210',
    status: 'approved',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================
// inventory (สินค้าคลัง) — เพิ่ม cur_id แทน educationLevel
// ============================================================
const mockInventory = [
  {
    id: '1',
    name: 'ชุดยูนิฟอร์มนักเรียนชาย',
    description: 'ชุดยูนิฟอร์มนักเรียนชาย ขนาดต่างๆ',
    category: 'uniform',
    targetGroup: 'male',
    cur_id: null,    // null = ทุกระดับ
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
    cur_id: null,    // null = ทุกระดับ
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
    cur_id: null,    // null = ทุกระดับ
    price: 150,
    stockQuantity: 200,
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// ============================================================
// Helper functions — ใช้แทน join ใน frontend
// ============================================================

/** หา curriculum จาก cur_id */
const getCurriculum = (cur_id) =>
  mockCurriculums.find(c => c.cur_id === cur_id);

/** หา division จาก div_id */
const getDivision = (div_id) =>
  mockDivisions.find(d => d.div_id === div_id);

/** หา divisions ทั้งหมดของ curriculum */
const getDivisionsByCurriculum = (cur_id) =>
  mockDivisions.filter(d => d.cur_id === cur_id);

/** หา expense_details ของ curriculum */
const getExpensesByCurriculum = (cur_id) =>
  mockExpenseDetails.filter(e => e.cur_id === cur_id);

/** หา admission_plan ของปีการศึกษา */
const getAdmissionPlanByYear = (ap_years) =>
  mockAdmissionPlans.filter(p => p.ap_years === ap_years);

module.exports = {
  mockCurriculums,
  mockDivisions,
  mockAdmissionPlans,
  mockExpenseDetails,
  mockStudents,
  mockInventory,
  // helpers
  getCurriculum,
  getDivision,
  getDivisionsByCurriculum,
  getExpensesByCurriculum,
  getAdmissionPlanByYear
};