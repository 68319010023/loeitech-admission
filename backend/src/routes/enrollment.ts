import { Router } from 'express'
import {
  confirmEnrollment,
  getEnrollmentStatus,
  getOnsiteEnrollments,
  upsertOnsiteEnrollment,
  getEnrollmentSummary,
} from '../controllers/enrollmentController'
import { upload } from '../middleware/upload'


const router = Router()

// มอบตัว + อัปโหลดเอกสาร
router.post('/confirm', upload.fields([
  { name: 'self_front',   maxCount: 1 },
  { name: 'self_back',    maxCount: 1 },
  { name: 'father_front', maxCount: 1 },
  { name: 'father_back',  maxCount: 1 },
  { name: 'mother_front', maxCount: 1 },
  { name: 'mother_back',  maxCount: 1 },
  { name: 'payment_slip', maxCount: 1 },
]), confirmEnrollment)

// ตรวจสอบสถานะ
router.get('/status/:idCard', getEnrollmentStatus)

// เพิ่ม route onsite
router.get('/onsite', getOnsiteEnrollments)
router.post('/onsite', upsertOnsiteEnrollment)
router.get('/summary', getEnrollmentSummary)

export default router