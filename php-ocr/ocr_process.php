<?php
/**
 * OCR Process for Thai ID Card using EasyOCR
 * This script processes uploaded ID card images and extracts text information
 */

header('Content-Type: application/json; charset=utf-8');

// Check if image path is provided
if ($argc < 2) {
    echo json_encode(['error' => 'Image path is required']);
    exit(1);
}

$imagePath = $argv[1];

// Validate file exists
if (!file_exists($imagePath)) {
    echo json_encode(['error' => 'Image file not found']);
    exit(1);
}

// Validate file type
$allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
$imageInfo = getimagesize($imagePath);
if (!$imageInfo || !in_array($imageInfo['mime'], $allowedTypes)) {
    echo json_encode(['error' => 'Invalid image type. Only JPEG and PNG are allowed']);
    exit(1);
}

try {
    // Create Python script for OCR processing
    $pythonScript = createPythonOCRScript();
    
    // Execute Python OCR script
    $result = executePythonOCR($pythonScript, $imagePath);
    
    // Parse and format the result
    $formattedResult = formatOCRResult($result);
    
    // Clean up temporary Python script
    if (file_exists($pythonScript)) {
        unlink($pythonScript);
    }
    
    echo json_encode($formattedResult, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    echo json_encode(['error' => 'OCR processing failed: ' . $e->getMessage()]);
    exit(1);
}

/**
 * Create temporary Python script for OCR processing
 */
function createPythonOCRScript() {
    $scriptContent = '
import sys
import json
import re
from datetime import datetime

try:
    import easyocr
    import cv2
    import numpy as np
except ImportError as e:
    print(json.dumps({"error": f"Missing required Python library: {str(e)}"}))
    sys.exit(1)

def process_id_card(image_path):
    """Process Thai ID card and extract information"""
    
    try:
        # Initialize EasyOCR reader for Thai and English
        reader = easyocr.Reader(["th", "en"])
        
        # Read image
        image = cv2.imread(image_path)
        if image is None:
            return {"error": "Cannot read image file"}
        
        # Perform OCR
        results = reader.readtext(image)
        
        # Extract and process text
        extracted_data = {
            "id_number": None,
            "name": None,
            "last_name": None,
            "birth_date": None,
            "address": None,
            "issue_date": None,
            "expiry_date": None,
            "raw_text": []
        }
        
        id_number_pattern = r"\\d{13}"
        name_pattern = r"ชื่อ ([\\u0E00-\\u0E7F]+)"
        lastname_pattern = r"นามสกุล ([\\u0E00-\\u0E7F]+)"
        birth_date_pattern = r"เกิด (\\d{1,2})[\\s/]+(\\d{1,2})[\\s/]+(\\d{4})"
        
        for (bbox, text, confidence) in results:
            extracted_data["raw_text"].append({
                "text": text,
                "confidence": confidence
            })
            
            # Extract ID number
            if not extracted_data["id_number"]:
                id_match = re.search(id_number_pattern, text)
                if id_match and len(id_match.group()) == 13:
                    extracted_data["id_number"] = id_match.group()
            
            # Extract name
            if not extracted_data["name"]:
                name_match = re.search(name_pattern, text)
                if name_match:
                    extracted_data["name"] = name_match.group(1)
            
            # Extract last name
            if not extracted_data["last_name"]:
                lastname_match = re.search(lastname_pattern, text)
                if lastname_match:
                    extracted_data["last_name"] = lastname_match.group(1)
            
            # Extract birth date
            if not extracted_data["birth_date"]:
                birth_match = re.search(birth_date_pattern, text)
                if birth_match:
                    day = birth_match.group(1).zfill(2)
                    month = birth_match.group(2).zfill(2)
                    year = str(int(birth_match.group(3)) - 543)  # Convert Buddhist year to Christian year
                    extracted_data["birth_date"] = f"{year}-{month}-{day}"
        
        return extracted_data
        
    except Exception as e:
        return {"error": f"OCR processing error: {str(e)}"}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Image path is required"}))
        sys.exit(1)
    
    image_path = sys.argv[1]
    result = process_id_card(image_path)
    print(json.dumps(result, ensure_ascii=False))
';
    
    $scriptPath = sys_get_temp_dir() . '/ocr_processor_' . uniqid() . '.py';
    file_put_contents($scriptPath, $scriptContent);
    
    return $scriptPath;
}

/**
 * Execute Python OCR script
 */
function executePythonOCR($scriptPath, $imagePath) {
    $command = "python3 \"$scriptPath\" \"$imagePath\" 2>&1";
    
    // Try python3 first, then python
    $output = shell_exec($command);
    if ($output === null) {
        $command = "python \"$scriptPath\" \"$imagePath\" 2>&1";
        $output = shell_exec($command);
    }
    
    if ($output === null) {
        throw new Exception("Python is not available on this system");
    }
    
    return $output;
}

/**
 * Format and validate OCR result
 */
function formatOCRResult($result) {
    $data = json_decode($result, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return [
            'error' => 'Invalid OCR result format',
            'raw_output' => $result
        ];
    }
    
    if (isset($data['error'])) {
        return $data;
    }
    
    // Validate Thai ID number
    if (isset($data['id_number']) && $data['id_number']) {
        $data['id_number_valid'] = validateThaiID($data['id_number']);
    }
    
    // Format full name
    if (isset($data['name']) && isset($data['last_name'])) {
        $data['full_name'] = trim($data['name'] . ' ' . $data['last_name']);
    }
    
    // Add processing timestamp
    $data['processed_at'] = date('Y-m-d H:i:s');
    
    return $data;
}

/**
 * Validate Thai ID number checksum
 */
function validateThaiID($id) {
    if (strlen($id) !== 13 || !ctype_digit($id)) {
        return false;
    }
    
    $sum = 0;
    for ($i = 0; $i < 12; $i++) {
        $sum += (int) $id[$i] * (13 - $i);
    }
    
    $checksum = (11 - ($sum % 11)) % 10;
    
    return $checksum == (int) $id[12];
}
?>
