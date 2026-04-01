import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, User, Calendar, MapPin, Phone, Mail, GraduationCap, CreditCard, Edit3 } from 'lucide-react';
import { studentAPI, uploadAPI } from '../utils/api';
import { RegistrationData, Department, Course, OCRResult } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, currentStep = 1, onStepChange }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<RegistrationData>({
    firstName: '',
    lastName: '',
    idCardNumber: '',
    birthDate: '',
    gender: 'male',
    address: '',
    phone: '',
    email: '',
    educationLevel: 'ปวช',
    departmentId: '',
    courseId: '',
    schoolName: '',
    gpa: undefined,
    parentName: '',
    parentPhone: '',
    idCardImages: [],
    educationImages: [],
    certificateImages: [],
    studentCardImages: []
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrLoading, setOcrLoading] = useState(false);
  const [inputMode, setInputMode] = useState<'manual' | 'ocr'>('manual');
  const fileInputRefs = {
    idCard: useRef<HTMLInputElement>(null),
    education: useRef<HTMLInputElement>(null),
    certificate: useRef<HTMLInputElement>(null),
    studentCard: useRef<HTMLInputElement>(null)
  };

  React.useEffect(() => {
    fetchDepartments();
  }, []);

  React.useEffect(() => {
    if (formData.educationLevel && formData.departmentId) {
      fetchCourses();
    }
  }, [formData.educationLevel, formData.departmentId]);

  const fetchDepartments = async () => {
    try {
      const response = await studentAPI.getDepartments();
      setDepartments(response.data);
    } catch (error) {
      console.error('Failed to fetch departments:', error);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await studentAPI.getCourses({
        educationLevel: formData.educationLevel,
        departmentId: formData.departmentId
      });
      setCourses(response.data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: keyof typeof fileInputRefs) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const formData = new FormData();
    formData.append('image', file);

    try {
      setLoading(true);
      const response = await uploadAPI.uploadImage(formData);
      const uploadedFile = {
        url: response.data.url,
        fileName: response.data.filename
      };

      setFormData(prev => ({
        ...prev,
        [`${type}Images`]: [...prev[`${type}Images`], uploadedFile]
      }));

      // If it's an ID card and auto mode is enabled, process it
      if (type === 'idCard' && inputMode === 'ocr') {
        await processOCR(file);
      }
    } catch (error) {
      console.error('File upload failed:', error);
      alert('การอัพโหลดไฟล์ล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  const processOCR = async (file: File) => {
    try {
      setOcrLoading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await uploadAPI.processOCR(formData);
      const ocrResult: OCRResult = response.data.data;

      if (ocrResult.id_number) {
        setFormData(prev => ({
          ...prev,
          idCardNumber: ocrResult.id_number || ''
        }));
      }

      if (ocrResult.name) {
        setFormData(prev => ({
          ...prev,
          firstName: ocrResult.name || ''
        }));
      }

      if (ocrResult.last_name) {
        setFormData(prev => ({
          ...prev,
          lastName: ocrResult.last_name || ''
        }));
      }

      if (ocrResult.birth_date) {
        setFormData(prev => ({
          ...prev,
          birthDate: ocrResult.birth_date || ''
        }));
      }

      if (ocrResult.full_name) {
        const names = ocrResult.full_name.split(' ');
        if (names.length >= 2) {
          setFormData(prev => ({
            ...prev,
            firstName: names[0] || '',
            lastName: names.slice(1).join(' ') || ''
          }));
        }
      }

      alert('OCR อ่านข้อมูลจากบัตรประชาชนเรียบร้อยแล้ว');
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('การอ่านข้อมูลจากบัตรประชาชนล้มเหลว กรุณากรอกข้อมูลด้วยตนเอง');
    } finally {
      setOcrLoading(false);
    }
  };

  const removeImage = (type: keyof typeof fileInputRefs, index: number) => {
    setFormData(prev => ({
      ...prev,
      [`${type}Images`]: prev[`${type}Images`].filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.idCardNumber || 
        !formData.birthDate || !formData.phone || !formData.departmentId || !formData.courseId) {
      alert('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
      return;
    }

    if (formData.idCardImages.length === 0) {
      alert('กรุณาอัพโหลดรูปบัตรประชาชน');
      return;
    }

    setLoading(true);
    try {
      const response = await studentAPI.register(formData);
      localStorage.setItem('token', response.data.token);
      onSubmit(formData);
      alert('สมัครเรียนสำเร็จแล้ว!');
    } catch (error: any) {
      console.error('Registration failed:', error);
      alert(error.response?.data?.error || 'การสมัครล้มเหลว');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-bg py-8">
      <div className="max-w-5xl mx-auto px-6">
        <div className="card cute-shadow">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-3xl shadow-lg mb-4 float-animation">
              <span className="text-white font-bold text-2xl font-thai">TC</span>
            </div>
            <h1 className="text-4xl font-bold text-neutral-800 mb-3 font-thai">
              {t('systemTitle')}
            </h1>
            <h2 className="text-2xl text-center mb-2 text-primary-600 font-semibold font-thai">
              {t('collegeName')}
            </h2>
            <p className="text-neutral-600 font-thai">{t('academicYear')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Input Mode Selection */}
            <div className="glass-effect border border-primary-200 rounded-3xl p-8 mb-8">
              <h3 className="text-xl font-semibold text-primary-700 mb-6 text-center font-thai">
                {t('selectInputMethod')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button
                  type="button"
                  onClick={() => setInputMode('manual')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 font-thai ${
                    inputMode === 'manual'
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Edit3 className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{t('manualInput')}</h4>
                    <p className="text-sm text-neutral-600">{t('manualInputDesc')}</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('ocr')}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 font-thai ${
                    inputMode === 'ocr'
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-neutral-200 hover:border-primary-300 hover:bg-primary-50/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="font-semibold text-lg mb-2">{t('ocrInput')}</h4>
                    <p className="text-sm text-neutral-600">{t('ocrInputDesc')}</p>
                  </div>
                </button>
              </div>
              {inputMode === 'ocr' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>คำแนะนำ:</strong> {t('ocrTip')}
                  </p>
                </div>
              )}
            </div>

            {/* Personal Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                {t('personalInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('firstName')} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('lastName')} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('idCardNumber')} *
                  </label>
                  <input
                    type="text"
                    name="idCardNumber"
                    value={formData.idCardNumber}
                    onChange={handleInputChange}
                    className="input-field"
                    maxLength={13}
                    pattern="[0-9]{13}"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('birthDate')} *
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gender')} *
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="male">{t('male')}</option>
                    <option value="female">{t('female')}</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('phone')} *
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('address')}
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    rows={3}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('email')}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* Education Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <GraduationCap className="mr-2" size={20} />
                {t('educationInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('educationLevel')} *
                  </label>
                  <select
                    name="educationLevel"
                    value={formData.educationLevel}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="ปวช">ปวช</option>
                    <option value="ปวส">ปวส</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('course')} *
                  </label>
                  <select
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t('course')}</option>
                    {departments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('department')} *
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t('department')}</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('schoolName')}
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('gpa')} (GPA)
                  </label>
                  <input
                    type="number"
                    name="gpa"
                    value={formData.gpa || ''}
                    onChange={handleInputChange}
                    className="input-field"
                    min="0"
                    max="4"
                    step="0.01"
                  />
                </div>
              </div>
            </div>

            {/* Parent Information */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <User className="mr-2" size={20} />
                {t('parentInfo')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('parentName')}
                  </label>
                  <input
                    type="text"
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('parentPhone')}
                  </label>
                  <input
                    type="tel"
                    name="parentPhone"
                    value={formData.parentPhone}
                    onChange={handleInputChange}
                    className="input-field"
                  />
                </div>
              </div>
            </div>

            {/* File Uploads */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Upload className="mr-2" size={20} />
                {t('documents')}
              </h3>
              
              <div className="space-y-4">
                {/* ID Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadIdCard')} *
                  </label>
                  <input
                    ref={fileInputRefs.idCard}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'idCard')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.idCard.current?.click()}
                    className="btn-outline"
                    disabled={ocrLoading}
                  >
                    <Camera className="mr-2" size={16} />
                    {ocrLoading ? t('ocrProcessing') : t('uploadIdCard')}
                  </button>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.idCardImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`ID Card ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('idCard', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadEducation')}
                  </label>
                  <input
                    ref={fileInputRefs.education}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'education')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.education.current?.click()}
                    className="btn-outline"
                  >
                    <FileText className="mr-2" size={16} />
                    {t('uploadEducation')}
                  </button>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.educationImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`Education ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('education', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Certificate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadCertificate')}
                  </label>
                  <input
                    ref={fileInputRefs.certificate}
                    type="file"
                    accept="image/*,.pdf"
                    onChange={(e) => handleFileUpload(e, 'certificate')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.certificate.current?.click()}
                    className="btn-outline"
                  >
                    <FileText className="mr-2" size={16} />
                    {t('uploadCertificate')}
                  </button>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.certificateImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`Certificate ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('certificate', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Card */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('uploadStudentCard')}
                  </label>
                  <input
                    ref={fileInputRefs.studentCard}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'studentCard')}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRefs.studentCard.current?.click()}
                    className="btn-outline"
                  >
                    <CreditCard className="mr-2" size={16} />
                    {t('uploadStudentCard')}
                  </button>
                  <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
                    {formData.studentCardImages.map((img, index) => (
                      <div key={index} className="relative">
                        <img
                          src={img.url}
                          alt={`Student Card ${index + 1}`}
                          className="w-full h-24 object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage('studentCard', index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                type="button"
                onClick={() => currentStep > 1 && onStepChange?.(currentStep - 1)}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentStep === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                disabled={currentStep === 1}
              >
                {t('saveDraft')}
              </button>
              
              <button
                type="submit"
                className="btn-primary px-8 py-3 text-lg"
                disabled={loading}
              >
                {loading 
                  ? t('processing') 
                  : currentStep === 3 
                    ? t('submit')
                    : 'Next'
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
