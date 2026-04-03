const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');


router.post('/register',       studentController.register);
router.post('/verify-status',  studentController.verifyStatus);
router.get('/curriculums',     studentController.getCurriculums); 
router.get('/divisions',       studentController.getDivisions);     


router.get('/profile',         authMiddleware, studentController.getProfile);
router.put('/profile',         authMiddleware, studentController.updateProfile);
router.get('/expenses',        authMiddleware, studentController.getExpenseDetails); 
router.post('/orders',         authMiddleware, studentController.createOrder);
router.get('/orders',          authMiddleware, studentController.getOrders);
router.post('/payment',        authMiddleware, studentController.uploadPaymentSlip);
router.get('/payment-status',  authMiddleware, studentController.getPaymentStatus);


router.get('/application-pdf/:id', studentController.getApplicationPDF);
router.get('/payment-pdf/:id',     studentController.getPaymentPDF);

module.exports = router;