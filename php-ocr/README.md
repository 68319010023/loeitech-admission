# OCR Processing Dependencies

## Python Requirements
```bash
pip install easyocr opencv-python numpy
```

## Alternative: Install EasyOCR with GPU support
```bash
pip install easyocr[gpu] opencv-python numpy
```

## System Requirements
- Python 3.7 or higher
- Sufficient RAM (at least 4GB recommended)
- For GPU support: CUDA-compatible GPU

## Installation Commands

### Windows
```cmd
# Check Python version
python --version

# Install packages
pip install easyocr opencv-python numpy

# Or with specific versions
pip install easyocr==1.7.0 opencv-python==4.8.1.78 numpy==1.24.3
```

### Linux/Mac
```bash
# Check Python version
python3 --version

# Install packages
pip3 install easyocr opencv-python numpy

# Or with specific versions
pip3 install easyocr==1.7.0 opencv-python==4.8.1.78 numpy==1.24.3
```

## Testing OCR
```bash
# Test if EasyOCR is working
python3 -c "import easyocr; print('EasyOCR installed successfully')"
```

## Troubleshooting
1. If EasyOCR fails to download models, check internet connection
2. For better performance with Thai text, ensure sufficient system resources
3. GPU support requires CUDA toolkit and compatible GPU drivers
