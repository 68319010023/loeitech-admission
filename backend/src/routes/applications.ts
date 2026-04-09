import { Router } from 'express'
import {
  getCurriculums,
  getDivisions,
  getExpenses,
  getAdmissionPlan,
  createApplication,
  checkStatus,
  getStats,
} from '../controllers/applicationController'
import { upload } from '../middleware/upload'

const router = Router()

// ข้อมูลสำหรับฟอร์มสมัคร
router.get('/curriculums', getCurriculums)
router.get('/divisions', getDivisions)
router.get('/expenses', getExpenses)
router.get('/admission-plan', getAdmissionPlan)

// ส่งใบสมัคร
router.post('/', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'edu_front', maxCount: 1 },
  { name: 'edu_back', maxCount: 1 },
]), createApplication)

// ตรวจสอบสถานะ
router.get('/check/:idCard', checkStatus)

// สถิติ
router.get('/stats', getStats)

export default router