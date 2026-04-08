import { Router } from 'express'
import {
  getAdmissionPlans,
  createAdmissionPlan,
  updateAdmissionPlan,
  deleteAdmissionPlan
} from '../controllers/admissionPlanController'
import {
  getExpenseDetails,
  createExpenseDetail,
  updateExpenseDetail,
  deleteExpenseDetail
} from '../controllers/expenseDetailController'
import {
  getCurriculums,
  createCurriculum,
  updateCurriculum,
  deleteCurriculum,
  getCurriculumChildren   // ← เพิ่ม
} from '../controllers/curriculumController'
import {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision
} from '../controllers/divisionController'

import {
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/userController'
 

const router = Router()


// Curriculum routes
router.get('/curriculums', getCurriculums)
router.post('/curriculums', createCurriculum)
router.put('/curriculums/:id', updateCurriculum)
router.delete('/curriculums/:id', deleteCurriculum)
router.get('/curriculums/:id/children', getCurriculumChildren)  

// Division routes
router.get('/divisions', getDivisions)
router.post('/divisions', createDivision)
router.put('/divisions/:id', updateDivision)
router.delete('/divisions/:id', deleteDivision)

// Admission Plan routes
router.get('/admission-plan', getAdmissionPlans)
router.post('/admission-plan', createAdmissionPlan)
router.put('/admission-plan/:id', updateAdmissionPlan)
router.delete('/admission-plan/:id', deleteAdmissionPlan)

// Expense Detail routes
router.get('/expense-detail', getExpenseDetails)
router.post('/expense-detail', createExpenseDetail)
router.put('/expense-detail/:id', updateExpenseDetail)
router.delete('/expense-detail/:id', deleteExpenseDetail)

router.get('/users', getUsers)
router.post('/users', createUser)
router.put('/users/:id', updateUser)
router.delete('/users/:id', deleteUser)

export default router