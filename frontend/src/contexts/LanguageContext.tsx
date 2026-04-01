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
    ocrInput: 'ถ่ายรูปบัตรประชาชน',
    ocrInputDesc: 'อัตโนมัติด้วย OCR',
    ocrTip: 'คำแนะนำ: อัปโหลดรูปบัตรประชาชนที่ชัดเจน ระบบจะอ่านข้อมูลและกรอกให้โดยอัตโนมัติ',
    
    // Personal Info
    personalInfo: 'ข้อมูลส่วนตัว',
    firstName: 'ชื่อ',
    lastName: 'นามสกุล',
    idCardNumber: 'เลขบัตรประชาชน',
    birthDate: 'วันเกิด',
    gender: 'เพศ',
    male: 'ชาย',
    female: 'หญิง',
    address: 'ที่อยู่',
    phone: 'เบอร์โทรศัพท์',
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
    ocrProcessing: 'กำลังประมวลผล OCR...'
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
    ocrInput: 'Scan ID Card',
    ocrInputDesc: 'Automatic with OCR',
    ocrTip: 'Tip: Upload a clear ID card image, the system will read and fill the data automatically',
    
    // Personal Info
    personalInfo: 'Personal Information',
    firstName: 'First Name',
    lastName: 'Last Name',
    idCardNumber: 'ID Card Number',
    birthDate: 'Birth Date',
    gender: 'Gender',
    male: 'Male',
    female: 'Female',
    address: 'Address',
    phone: 'Phone Number',
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
    ocrProcessing: 'Processing OCR...'
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
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
