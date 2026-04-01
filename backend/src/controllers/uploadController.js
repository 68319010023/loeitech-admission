const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const uploadController = {
  // Upload single image
  uploadImage: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = `/uploads/images/${req.file.filename}`;

      res.json({
        message: 'Image uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      });
    } catch (error) {
      console.error('Upload image error:', error);
      res.status(500).json({ error: 'Failed to upload image' });
    }
  },

  // Upload single document
  uploadDocument: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileUrl = `/uploads/documents/${req.file.filename}`;

      res.json({
        message: 'Document uploaded successfully',
        filename: req.file.filename,
        originalName: req.file.originalname,
        size: req.file.size,
        url: fileUrl
      });
    } catch (error) {
      console.error('Upload document error:', error);
      res.status(500).json({ error: 'Failed to upload document' });
    }
  },

  // Upload multiple files
  uploadMultiple: async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/uploads/${file.destination.split('/').pop()}/${file.filename}`
      }));

      res.json({
        message: 'Files uploaded successfully',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('Upload multiple error:', error);
      res.status(500).json({ error: 'Failed to upload files' });
    }
  },

  // Process ID card OCR using PHP
  processIdCardOCR: async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No image uploaded for OCR processing' });
      }

      const imagePath = req.file.path;
      const phpScriptPath = path.join(__dirname, '../../php-ocr/ocr_process.php');

      // Check if PHP script exists
      if (!fs.existsSync(phpScriptPath)) {
        return res.status(500).json({ error: 'OCR processing script not found' });
      }

      // Execute PHP OCR script
      exec(`php "${phpScriptPath}" "${imagePath}"`, { timeout: 30000 }, (error, stdout, stderr) => {
        if (error) {
          console.error('OCR execution error:', error);
          return res.status(500).json({ error: 'OCR processing failed' });
        }

        if (stderr) {
          console.error('OCR stderr:', stderr);
        }

        try {
          const result = JSON.parse(stdout);
          
          if (result.error) {
            return res.status(400).json({ error: result.error });
          }

          res.json({
            message: 'OCR processing completed',
            data: result,
            imageUrl: `/uploads/images/${req.file.filename}`
          });
        } catch (parseError) {
          console.error('OCR result parsing error:', parseError);
          res.status(500).json({ error: 'Failed to parse OCR result' });
        }
      });
    } catch (error) {
      console.error('OCR processing error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Get uploaded file
  getFile: async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security check - prevent directory traversal
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      // Try to find file in upload directories
      const possiblePaths = [
        path.join(__dirname, '../../uploads/images', filename),
        path.join(__dirname, '../../uploads/documents', filename),
        path.join(__dirname, '../../uploads/temp', filename)
      ];

      let filePath = null;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          filePath = possiblePath;
          break;
        }
      }

      if (!filePath) {
        return res.status(404).json({ error: 'File not found' });
      }

      // Send file
      res.sendFile(filePath);
    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Delete uploaded file
  deleteFile: async (req, res) => {
    try {
      const { filename } = req.params;
      
      // Security check
      if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
        return res.status(400).json({ error: 'Invalid filename' });
      }

      // Try to find and delete file
      const possiblePaths = [
        path.join(__dirname, '../../uploads/images', filename),
        path.join(__dirname, '../../uploads/documents', filename),
        path.join(__dirname, '../../uploads/temp', filename)
      ];

      let deleted = false;
      for (const possiblePath of possiblePaths) {
        if (fs.existsSync(possiblePath)) {
          fs.unlinkSync(possiblePath);
          deleted = true;
          break;
        }
      }

      if (!deleted) {
        return res.status(404).json({ error: 'File not found' });
      }

      res.json({ message: 'File deleted successfully' });
    } catch (error) {
      console.error('Delete file error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = uploadController;
