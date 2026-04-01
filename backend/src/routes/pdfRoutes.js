const express = require('express');
const router = express.Router();
const pdfController = require('../controllers/pdfController');
const authMiddleware = require('../middleware/auth');

// PDF generation routes
router.post('/application', authMiddleware, pdfController.generateApplicationPDF);
router.post('/payment-slip', authMiddleware, pdfController.generatePaymentPDF);
router.get('/download/:type/:id', authMiddleware, pdfController.downloadPDF);

module.exports = router;
