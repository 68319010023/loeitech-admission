import { Router } from 'express'
import {
  confirmEnrollment,
  getEnrollmentStatus,
} from '../controllers/enrollmentController'

const router = Router()

// มอบตัว
router.post('/confirm', confirmEnrollment)

// ตรวจสอบสถานะการมอบตัว
router.get('/status/:idCard', getEnrollmentStatus)

export default router