const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const authMiddleware = require('../middleware/auth');

// Public routes
router.post('/register', studentController.register);
router.post('/verify-status', studentController.verifyStatus);
router.get('/departments', studentController.getDepartments);
router.get('/courses', studentController.getCourses);

// Protected routes (require authentication)
router.get('/profile', authMiddleware, studentController.getProfile);
router.put('/profile', authMiddleware, studentController.updateProfile);
router.post('/orders', authMiddleware, studentController.createOrder);
router.get('/orders', authMiddleware, studentController.getOrders);
router.post('/payment', authMiddleware, studentController.uploadPaymentSlip);
router.get('/payment-status', authMiddleware, studentController.getPaymentStatus);

// PDF generation
router.get('/application-pdf/:id', studentController.getApplicationPDF);
router.get('/payment-pdf/:id', studentController.getPaymentPDF);

module.exports = router;
