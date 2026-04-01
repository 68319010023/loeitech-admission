const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');

// File upload routes
router.post('/image', authMiddleware, upload.single('image'), uploadController.uploadImage);
router.post('/document', authMiddleware, upload.single('document'), uploadController.uploadDocument);
router.post('/multiple', authMiddleware, upload.array('files', 5), uploadController.uploadMultiple);

// OCR processing (public - no auth required for initial registration)
router.post('/ocr/id-card', upload.single('image'), uploadController.processIdCardOCR);

// File serving
router.get('/:filename', uploadController.getFile);
router.delete('/:filename', authMiddleware, uploadController.deleteFile);

module.exports = router;
