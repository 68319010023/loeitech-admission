<?php
/**
 * Configuration file for OCR processing
 */

// OCR Processing Settings
define('OCR_TIMEOUT', 30); // seconds
define('OCR_CONFIDENCE_THRESHOLD', 0.6); // minimum confidence score

// File upload settings
define('MAX_FILE_SIZE', 10 * 1024 * 1024); // 10MB
define('ALLOWED_FILE_TYPES', ['image/jpeg', 'image/png', 'image/jpg']);

// Python executable paths (adjust according to your system)
$PYTHON_PATHS = [
    'python3',
    'python',
    'C:\\Python39\\python.exe',
    'C:\\Python310\\python.exe',
    'C:\\Python311\\python.exe',
    'C:\\Python312\\python.exe'
];

// Required Python packages
$REQUIRED_PACKAGES = [
    'easyocr',
    'opencv-python',
    'numpy'
];

// OCR Patterns for Thai ID Card
$ID_CARD_PATTERNS = [
    'id_number' => '/\\d{13}/',
    'name' => '/ชื่อ ([\\u0E00-\\u0E7F]+)/',
    'lastname' => '/นามสกุล ([\\u0E00-\\u0E7F]+)/',
    'birth_date' => '/เกิด (\\d{1,2})[\\s\\/]+(\\d{1,2})[\\s\\/]+(\\d{4})/',
    'address' => '/ที่อยู่ ([\\u0E00-\\u0E7F\\d\\s\\/\\-\\.]+)/',
    'issue_date' => '/ออก วันที่ (\\d{1,2})[\\s\\/]+(\\d{1,2})[\\s\\/]+(\\d{4})/',
    'expiry_date' => '/วันหมดอายุ (\\d{1,2})[\\s\\/]+(\\d{1,2})[\\s\\/]+(\\d{4})/'
];

// Error messages
$ERROR_MESSAGES = [
    'file_not_found' => 'ไฟล์รูปภาพไม่พบ',
    'invalid_file_type' => 'ประเภทไฟล์ไม่ถูกต้อง รองรับเฉพาะ JPEG และ PNG',
    'file_too_large' => 'ขนาดไฟล์ใหญ่เกินไป (สูงสุด 10MB)',
    'ocr_failed' => 'การอ่านข้อมูลจากรูปภาพล้มเหลว',
    'python_not_found' => 'ไม่พบ Python บนระบบ',
    'missing_packages' => 'ไม่พบ Python packages ที่จำเป็น',
    'invalid_id_format' => 'รูปแบบเลขบัตรประชาชนไม่ถูกต้อง'
];

// Return configuration as array for use in scripts
return [
    'timeout' => OCR_TIMEOUT,
    'confidence_threshold' => OCR_CONFIDENCE_THRESHOLD,
    'max_file_size' => MAX_FILE_SIZE,
    'allowed_types' => ALLOWED_FILE_TYPES,
    'python_paths' => $PYTHON_PATHS,
    'required_packages' => $REQUIRED_PACKAGES,
    'patterns' => $ID_CARD_PATTERNS,
    'error_messages' => $ERROR_MESSAGES
];
?>
