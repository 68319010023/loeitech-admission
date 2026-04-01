import React, { createContext, useContext, useState, ReactNode } from 'react';

// Language translations
const translations = {
  th: {
    // App Header
    systemTitle: 'ระบบรับสมัครนักเรียนนักศึกษา',
    collegeName: 'วิทยาลัยเทคนิคเลย',
    academicYear: '2566',
    
    // Sidebar
    fillApplication: 'กรอกใบสมัคร',
    checkStatus: 'ตรวจสอบสถานะ',
    manageUsers: 'จัดการผู้ใช้',
    systemSettings: 'ตั้งค่าระบบ',
    logout: 'ออกจากระบบ',
    mainMenu: 'เมนูหลัก',
    staff: 'เจ้าหน้าที่',
    copyright: '© 2026 วิทยาลัยเทคนิคเลย',
    systemDesc: 'Student Registration System',
    
    // Registration Form
    selectInputMethod: 'เลือกวิธีการกรอกข้อมูล',
    manualInput: 'กรอกข้อมูลด้วยตนเอง',
    manualInputDesc: 'กรอกข้อมูลส่วนตัวผ่านฟอร์ม',
    ocrInput: 'กรอกข้อมูลอัตโนมัติ',
    ocrInputDesc: 'อัตโนมัติด้วย OCR',
    ocrTip: 'อัปโหลดรูปบัตรประชาชนที่ชัดเจน ระบบจะอ่านข้อมูลและกรอกให้โดยอัตโนมัติ',
    
    // Personal Info
    personalInfo: 'ข้อมูลส่วนตัว',
    title: 'คำนำหน้าชื่อ',
    fullName: 'ชื่อ - สกุล ผู้สมัคร',
    idCardNumber: 'เลขประจำตัวประชาชน',
    address: 'ที่อยู่',
    province: 'จังหวัด',
    district: 'อำเภอ/เขต',
    subDistrict: 'ตำบล/แขวง',
    postalCode: 'รหัสไปรษณีย์',
    phone: 'เบอร์โทรศัพท์',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    birthDate: 'วันเกิด',
    gender: 'เพศ',
    male: 'ชาย',
    female: 'หญิง',
    email: 'อีเมล',
    
    // Education
    educationInfo: 'ข้อมูลการศึกษา',
    educationLevel: 'ระดับการศึกษา',
    department: 'แผนกวิชา',
    course: 'สาขาวิชา',
    schoolName: 'ชื่อโรงเรียน',
    gpa: 'เกรดเฉลี่ย',
    
    // Parent Info
    parentInfo: 'ข้อมูลผู้ปกครอง',
    parentName: 'ชื่อผู้ปกครอง',
    parentPhone: 'เบอร์โทรศัพท์ผู้ปกครอง',
    
    // Education History
    educationHistory: 'ข้อมูลประวัติการศึกษา',
    currentlyStudyingOrGraduatedFrom: 'ปัจจุบันกำลังศึกษาอยู่ หรือสำเร็จการศึกษาจาก',
    schoolInstitutionName: 'ชื่อสถานศึกษา',
    educationLevelClass: 'ระดับชั้น',
    
    // Placeholders
    selectTitle: 'เลือกคำนำหน้า',
    fullNamePlaceholder: 'ชื่อ - นามสกุล',
    idCardPlaceholder: 'เลขประจำตัวประชาชน 13 หลัก',
    addressPlaceholder: 'บ้านเลขที่ หมู่ที่ ถนน',
    districtPlaceholder: 'อำเภอ/เขต',
    subDistrictPlaceholder: 'ตำบล/แขวง',
    postalCodePlaceholder: 'รหัสไปรษณีย์',
    phonePlaceholder: 'เบอร์โทรศัพท์',
    emailPlaceholder: 'อีเมล',
    schoolNamePlaceholder: 'กรอกชื่อสถานศึกษา',
    
    // Documents
    documents: 'เอกสารแนบ',
    uploadIdCard: 'อัปโหลดรูปบัตรประชาชน',
    uploadEducation: 'อัปโหลดใบรับรองการศึกษา',
    uploadCertificate: 'อัปโหลดใบประกอบวิชาชีพ (ถ้ามี)',
    uploadStudentCard: 'อัปโหลดรูปบัตรนักเรียน/นักศึกษา (ถ้ามี)',
    
    // Actions
    submit: 'ส่งใบสมัคร',
    saveDraft: 'บันทึกฉบับร่าง',
    clearForm: 'ล้างฟอร์ม',
    
    // Messages
    registrationSuccess: 'สมัครเรียนสำเร็จแล้ว!',
    registrationFailed: 'การสมัครล้มเหลว',
    uploadFailed: 'การอัพโหลดไฟล์ล้มเหลว',
    processing: 'กำลังดำเนินการ...',
    ocrProcessing: 'กำลังประมวลผล OCR...',
    
    // Stepper
    stepperPersonalInfo: 'ข้อมูลผู้สมัคร',
    stepperFillPersonalInfo: 'กรอกข้อมูลส่วนตัวและอัปโหลดเอกสาร',
    stepperSelectDepartment: 'เลือกสาขา',
    stepperChooseDepartment: 'เลือกแผนกและสาขาที่ต้องการเรียน',
    stepperConfirmInfo: 'ยืนยันข้อมูล',
    stepperReviewConfirm: 'ตรวจสอบและยืนยันข้อมูลการสมัคร',
    
    // Status Check Page
    statusCheck: 'ตรวจสอบสถานะ',
    enterIdCard: 'กรอกเลขประจำตัวประชาชน',
    idCardRequired: 'กรุณากรอกเลขประจำตัวประชาชน',
    checkStatusBtn: 'ตรวจสอบสถานะ',
    noRegistrationFound: 'ไม่พบข้อมูลการสมัคร',
    registrationFound: 'พบข้อมูลการสมัคร',
    applicationStatus: 'สถานะการสมัคร',
    applicantInfo: 'ข้อมูลส่วนตัว',
    applicantEducation: 'ข้อมูลการศึกษา',
    submittedDate: 'วันที่สมัคร',
    lastUpdated: 'อัพเดตล่าสุด',
    statusPending: 'รอดำเนินการ',
    statusApproved: 'อนุมัติ',
    statusRejected: 'ปฏิเสธ',
    statusCompleted: 'เสร็จสมบูรณ์',
    printApplication: 'พิมพ์ใบสมัคร',
    backToHome: 'กลับหน้าหลัก',
    
    // OCR Upload Section
    uploadIdCardForOcr: 'อัปโหลดรูปบัตรประชาชนเพื่ออ่านข้อมูลอัตโนมัติ',
    clickToCaptureOrSelect: 'คลิกเพื่อถ่ายรูปหรือเลือกไฟล์',
    supportFiles: 'รองรับไฟล์ JPG, PNG ขนาดไม่เกิน 5MB',
    processingOcr: 'กำลังอ่านข้อมูลจากรูปบัตรประชาชน...',
    ocrSuccess: 'อัปโหลดสำเร็จแล้ว!',
    ocrCompleted: 'อ่านข้อมูลจากรูปภาพเรียบร้อยแล้ว',
    clickFrameToChange: 'คลิกที่กรอบเพื่อเลือกรูปใหม่',
    ocrError: 'การอ่านข้อมูลจากรูปภาพล้มเหลว กรุณาลองใหม่'
  },
  en: {
    // App Header
    systemTitle: 'Student Registration System',
    collegeName: 'Loei Technical College',
    academicYear: '2026',
    
    // Sidebar
    fillApplication: 'Fill Application',
    checkStatus: 'Check Status',
    manageUsers: 'Manage Users',
    systemSettings: 'System Settings',
    logout: 'Logout',
    mainMenu: 'Main Menu',
    staff: 'Staff',
    copyright: '© 2026 Loei Technical College',
    systemDesc: 'Student Registration System',
    
    // Registration Form
    selectInputMethod: 'Select Input Method',
    manualInput: 'Manual Input',
    manualInputDesc: 'Fill personal information through form',
    ocrInput: 'Automatic Input',
    ocrInputDesc: 'Automatic with OCR',
    ocrTip: 'Upload a clear ID card image, the system will read and fill the data automatically',
    
    // Personal Info
    personalInfo: 'Personal Information',
    title: 'Title',
    fullName: 'Full Name',
    idCardNumber: 'ID Card Number',
    address: 'Address',
    province: 'Province',
    district: 'District/Area',
    subDistrict: 'Sub-district/Sub-area',
    postalCode: 'Postal Code',
    phone: 'Phone Number',
    firstName: 'First Name',
    lastName: 'Last Name',
    birthDate: 'Birth Date',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    email: 'Email',
    
    // Education
    educationInfo: 'Education Information',
    educationLevel: 'Education Level',
    department: 'Department',
    course: 'Course',
    schoolName: 'School Name',
    gpa: 'GPA',
    
    // Parent Info
    parentInfo: 'Parent Information',
    parentName: 'Parent Name',
    parentPhone: 'Parent Phone',
    
    // Education History
    educationHistory: 'Education History',
    currentlyStudyingOrGraduatedFrom: 'Currently studying or graduated from',
    schoolInstitutionName: 'School/Institution Name',
    educationLevelClass: 'Education Level',
    
    // Placeholders
    selectTitle: 'Select Title',
    fullNamePlaceholder: 'First Name - Last Name',
    idCardPlaceholder: '13-digit ID Card Number',
    addressPlaceholder: 'House Number, Village, Street',
    districtPlaceholder: 'District/Area',
    subDistrictPlaceholder: 'Sub-district/Sub-area',
    postalCodePlaceholder: 'Postal Code',
    phonePlaceholder: 'Phone Number',
    emailPlaceholder: 'Email',
    schoolNamePlaceholder: 'Enter school name',
    
    // Documents
    documents: 'Documents',
    uploadIdCard: 'Upload ID Card',
    uploadEducation: 'Upload Education Certificate',
    uploadCertificate: 'Upload Professional Certificate (if any)',
    uploadStudentCard: 'Upload Student Card (if any)',
    
    // Actions
    submit: 'Submit Application',
    saveDraft: 'Save Draft',
    clearForm: 'Clear Form',
    
    // Messages
    registrationSuccess: 'Registration successful!',
    registrationFailed: 'Registration failed',
    uploadFailed: 'File upload failed',
    processing: 'Processing...',
    ocrProcessing: 'Processing OCR...',
    
    // Stepper
    stepperPersonalInfo: 'Applicant Information',
    stepperFillPersonalInfo: 'Fill personal information and upload documents',
    stepperSelectDepartment: 'Select Department',
    stepperChooseDepartment: 'Choose department and major to study',
    stepperConfirmInfo: 'Confirm Information',
    stepperReviewConfirm: 'Review and confirm application information',
    
    // Status Check Page
    statusCheck: 'Check Status',
    enterIdCard: 'Enter ID Card Number',
    idCardRequired: 'Please enter ID Card Number',
    checkStatusBtn: 'Check Status',
    noRegistrationFound: 'No registration found',
    registrationFound: 'Registration found',
    applicationStatus: 'Application Status',
    applicantInfo: 'Personal Information',
    applicantEducation: 'Education Information',
    submittedDate: 'Submitted Date',
    lastUpdated: 'Last Updated',
    statusPending: 'Pending',
    statusApproved: 'Approved',
    statusRejected: 'Rejected',
    statusCompleted: 'Completed',
    printApplication: 'Print Application',
    backToHome: 'Back to Home',
    
    // OCR Upload Section
    uploadIdCardForOcr: 'Upload ID card for automatic data reading',
    clickToCaptureOrSelect: 'Click to capture or select file',
    supportFiles: 'Supports JPG, PNG files up to 5MB',
    processingOcr: 'Reading data from ID card...',
    ocrSuccess: 'Upload successful!',
    ocrCompleted: 'Data reading completed',
    clickFrameToChange: 'Click frame to select new image',
    ocrError: 'Failed to read data from image, please try again'
  }
};

type Language = 'th' | 'en';
type TranslationKey = keyof typeof translations.th;

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

interface LanguageProviderProps {
  children: ReactNode;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('th');

  const t = (key: TranslationKey): string => {
    // Handle dynamic academic year
    if (key === 'academicYear') {
      const currentYear = new Date().getFullYear();
      return language === 'th' ? (currentYear + 543).toString() : currentYear.toString();
    }
    
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
