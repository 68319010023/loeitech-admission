import { Router } from 'express'
import {
  getCurriculums,
  getDivisions,
  getExpenses,
  getAdmissionPlan,
  createApplication,
  checkStatus,
  getStats,
  checkDuplicateIdCard,
  getPendingApplicants,
} from '../controllers/applicationController'
import { ocrIdCard } from '../controllers/ocrController'
import { upload } from '../middleware/upload'

const router = Router()

// ข้อมูลสำหรับฟอร์มสมัคร
router.get('/curriculums', getCurriculums)
router.get('/divisions', getDivisions)
router.get('/expenses', getExpenses)
router.get('/admission-plan', getAdmissionPlan)
router.get('/pending', getPendingApplicants)

// OCR บัตรประชาชน (Gemini Vision)
router.post('/ocr-idcard', upload.single('image'), ocrIdCard)

// ส่งใบสมัคร
router.post('/', upload.fields([
  { name: 'id_front', maxCount: 1 },
  { name: 'id_back', maxCount: 1 },
  { name: 'edu_front', maxCount: 1 },
  { name: 'edu_back', maxCount: 1 },
]), createApplication)

// ตรวจสอบบัตรประชาชนซ้ำ
router.post('/check-duplicate', checkDuplicateIdCard)

// ตรวจสอบสถานะ
router.get('/check/:idCard', checkStatus)

// สถิติ
router.get('/stats', getStats)

export default router
