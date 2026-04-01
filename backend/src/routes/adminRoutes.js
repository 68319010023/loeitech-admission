const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/auth');
const adminMiddleware = require('../middleware/admin');

// All admin routes require authentication and admin role
router.use(authMiddleware);
router.use(adminMiddleware);

// Department management
router.post('/departments', adminController.createDepartment);
router.get('/departments', adminController.getDepartments);
router.put('/departments/:id', adminController.updateDepartment);
router.delete('/departments/:id', adminController.deleteDepartment);

// Course management
router.post('/courses', adminController.createCourse);
router.get('/courses', adminController.getCourses);
router.put('/courses/:id', adminController.updateCourse);
router.delete('/courses/:id', adminController.deleteCourse);

// Student management
router.get('/students', adminController.getStudents);
router.get('/students/:id', adminController.getStudentById);
router.put('/students/:id/status', adminController.updateStudentStatus);

// Reports and summaries
router.get('/summary/applicants', adminController.getApplicantSummary);
router.get('/summary/payments', adminController.getPaymentSummary);
router.get('/summary/orders', adminController.getOrderSummary);
router.get('/export/students', adminController.exportStudents);

// User management
router.get('/users', adminController.getUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

module.exports = router;
