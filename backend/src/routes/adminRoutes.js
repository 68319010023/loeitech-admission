const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

router.use(authMiddleware);
router.use(adminMiddleware);


router.post('/curriculums',        adminController.createCurriculum);
router.get('/curriculums',         adminController.getCurriculums);
router.put('/curriculums/:id',     adminController.updateCurriculum);
router.delete('/curriculums/:id',  adminController.deleteCurriculum);


router.post('/divisions',          adminController.createDivision);
router.get('/divisions',           adminController.getDivisions);
router.put('/divisions/:id',       adminController.updateDivision);
router.delete('/divisions/:id',    adminController.deleteDivision);


router.post('/admission-plans',        adminController.createAdmissionPlan);
router.get('/admission-plans',         adminController.getAdmissionPlans);
router.put('/admission-plans/:id',     adminController.updateAdmissionPlan);
router.delete('/admission-plans/:id',  adminController.deleteAdmissionPlan);

router.post('/expenses',           adminController.createExpenseDetail);
router.get('/expenses',            adminController.getExpenseDetails);
router.put('/expenses/:id',        adminController.updateExpenseDetail);
router.delete('/expenses/:id',     adminController.deleteExpenseDetail);

router.get('/students',            adminController.getStudents);
router.get('/students/:id',        adminController.getStudentById);
router.put('/students/:id/status', adminController.updateStudentStatus);

router.get('/summary/applicants',  adminController.getApplicantSummary);
router.get('/summary/payments',    adminController.getPaymentSummary);
router.get('/summary/orders',      adminController.getOrderSummary);
router.get('/export/students',     adminController.exportStudents);

router.get('/users',               adminController.getUsers);
router.post('/users',              adminController.createUser);
router.put('/users/:id',           adminController.updateUser);
router.delete('/users/:id',        adminController.deleteUser);

module.exports = router;