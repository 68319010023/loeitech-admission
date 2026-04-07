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
  deleteCurriculum
} from '../controllers/curriculumController'
import {
  getDivisions,
  createDivision,
  updateDivision,
  deleteDivision
} from '../controllers/divisionController'

const router = Router()

// Curriculum routes
router.get('/curriculums', getCurriculums)
router.post('/curriculums', createCurriculum)
router.put('/curriculums/:id', updateCurriculum)
router.delete('/curriculums/:id', deleteCurriculum)

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

export default router