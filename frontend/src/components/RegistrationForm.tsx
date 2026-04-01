import React, { useState } from 'react';
import { User, GraduationCap, CreditCard, BookOpen, Upload, FileImage, CheckCircle, AlertCircle, Camera, Scan } from 'lucide-react';
import { studentAPI } from '../utils/api';
import { RegistrationData, Department, Course } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, currentStep = 1, onStepChange }) => {
  const { t } = useTranslation();
  const [inputMethod, setInputMethod] = useState<'manual' | 'ocr'>('manual');
  const [formData, setFormData] = useState<RegistrationData>({
    title: '',
    firstName: '',
    lastName: '',
    fullName: '',
    idCardNumber: '',
    birthDate: '',
    gender: 'male',
    address: '',
    province: '',
    district: '',
    subDistrict: '',
    postalCode: '',
    phone: '',
    email: '',
    educationLevel: 'ปวช',
    departmentId: '',
    courseId: '',
    schoolName: '',
    gpa: undefined,
    parentName: '',
    parentPhone: ''
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [ocrFile, setOcrFile] = useState<File | null>(null);
  const [ocrProcessing, setOcrProcessing] = useState(false);

  React.useEffect(() => {
  fetchDepartments();
}, []);

// eslint-disable-next-line react-hooks/exhaustive-deps
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

const handleInputChange = (
  e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
) => {
  const { name, value } = e.target;

  setFormData(prev => ({
    ...prev,
    [name]: name === 'gpa' ? (value ? parseFloat(value) : undefined) : value
  }));
};

  const handleOcrFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setOcrFile(file);
    setOcrProcessing(true);

    try {
      // Mock OCR processing - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock OCR result
      const mockOcrResult = {
        firstName: 'สมชาย',
        lastName: 'ใจดี',
        idCardNumber: '1234567890123',
        birthDate: '2540-05-15',
        address: '123 ถนนสุขุมวิท ตำบลในเมือง อำเภอเมือง จังหวัดเลย 42000'
      };

      setFormData(prev => ({
        ...prev,
        ...mockOcrResult,
        fullName: `${mockOcrResult.firstName} ${mockOcrResult.lastName}`,
        province: 'เลย',
        district: 'เมือง',
        subDistrict: 'ในเมือง',
        postalCode: '42000'
      }));

      // ไม่ต้องแสดง alert เมื่อ OCR สำเร็จ
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert(t('ocrError'));
    } finally {
      setOcrProcessing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName || !formData.lastName || !formData.idCardNumber || 
        !formData.birthDate || !formData.phone || !formData.departmentId || !formData.courseId) {
      alert('กรุณากรอกข้อมูลที่จำเป็นทั้งหมด');
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
            
            {/* Input Method Selection */}
            <div className="card">
              <h3 className="text-lg font-semibold mb-4 text-center font-thai">
                {t('selectInputMethod')}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div
                  onClick={() => setInputMethod('manual')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    inputMethod === 'manual'
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      inputMethod === 'manual' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <User size={24} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 font-thai">{t('manualInput')}</h4>
                    <p className="text-sm text-gray-600 font-thai">{t('manualInputDesc')}</p>
                  </div>
                </div>
                
                <div
                  onClick={() => setInputMethod('ocr')}
                  className={`p-6 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${
                    inputMethod === 'ocr'
                      ? 'border-primary-500 bg-primary-50 shadow-lg'
                      : 'border-gray-200 hover:border-gray-300 bg-white'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${
                      inputMethod === 'ocr' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'
                    }`}>
                      <CreditCard size={24} />
                    </div>
                    <h4 className="font-semibold text-lg mb-2 font-thai">{t('ocrInput')}</h4>
                    <p className="text-sm text-gray-600 font-thai">{t('ocrInputDesc')}</p>
                  </div>
                </div>
              </div>
              
              {inputMethod === 'ocr' && (
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-2xl">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-yellow-800 font-thai mb-1">
                        เคล็ดลับสำคัญ
                      </p>
                      <p className="text-sm text-yellow-700 font-thai">
                        {t('ocrTip')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              {inputMethod === 'ocr' && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3 font-thai">
                    <div className="flex items-center space-x-2">
                      <Scan className="w-4 h-4 text-primary-600" />
                      <span>{t('uploadIdCardForOcr')}</span>
                    </div>
                  </label>
                  
                  <div className="relative">
                    <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all duration-500 ${
                      ocrProcessing 
                        ? 'border-yellow-400 bg-yellow-50' 
                        : ocrFile 
                          ? 'border-green-400 bg-green-50' 
                          : 'border-gray-300 bg-white hover:border-primary-400 hover:bg-primary-50'
                    }`}>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleOcrFileUpload}
                        className="hidden"
                        id="ocr-file-upload"
                        disabled={ocrProcessing}
                      />
                      
                      {!ocrFile && !ocrProcessing && (
                        <label htmlFor="ocr-file-upload" className="cursor-pointer block">
                          <div className="relative">
                            <div className="w-24 h-24 mx-auto mb-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full flex items-center justify-center float-animation">
                              <Camera className="w-12 h-12 text-primary-600" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center pulse-animation">
                              <Upload className="w-4 h-4 text-white" />
                            </div>
                          </div>
                          
                          <h3 className="text-lg font-semibold text-gray-700 mb-2 font-thai">
                            {t('clickToCaptureOrSelect')}
                          </h3>
                          <p className="text-sm text-gray-500 mb-4 font-thai">
                            {t('supportFiles')}
                          </p>
                          
                          <div className="flex items-center justify-center space-x-4 text-xs text-gray-400">
                            <div className="flex items-center space-x-1">
                              <FileImage className="w-3 h-3" />
                              <span>JPG, PNG</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <AlertCircle className="w-3 h-3" />
                              <span>Max 5MB</span>
                            </div>
                          </div>
                        </label>
                      )}
                      
                      {ocrProcessing && (
                        <div className="py-4 relative">
                          <div className="relative w-64 h-40 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-yellow-400 shadow-xl">
                            {ocrFile && (
                              <img 
                                src={URL.createObjectURL(ocrFile)}
                                alt="บัตรประชาชน"
                                className="absolute inset-0 w-full h-full object-cover"
                              />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-yellow-400/20 to-transparent">
                              <div className="w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent animate-scan-line"></div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="bg-yellow-400/90 rounded-full p-3 backdrop-blur-sm">
                                <Scan className="w-8 h-8 text-yellow-800 animate-pulse" />
                              </div>
                            </div>
                            <div className="absolute top-2 right-2">
                              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-yellow-700 mb-2 font-thai">
                            {t('ocrProcessing')}
                          </h3>
                          <p className="text-sm text-yellow-600 font-thai">
                            {t('processingOcr')}
                          </p>
                          <div className="mt-4 flex justify-center space-x-1">
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                          </div>
                        </div>
                      )}
                      
                      {ocrFile && !ocrProcessing && (
                        <div 
                          onClick={() => document.getElementById('ocr-file-upload')?.click()}
                          className="py-4 cursor-pointer"
                        >
                          <div className="relative w-64 h-40 mx-auto mb-4 rounded-xl overflow-hidden border-2 border-green-400 shadow-xl">
                            <img 
                              src={URL.createObjectURL(ocrFile)}
                              alt="บัตรประชาชน"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-white" />
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-green-600 font-thai mb-4">
                            {t('ocrCompleted')}
                          </p>
                          
                          <div className="mt-6 text-center">
                            <p className="text-xs text-gray-500 font-thai">
                              {t('clickFrameToChange')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                                  </div>
              )}
            </div>
            
            {/* Personal Information */}
            {(inputMethod === 'manual' || (inputMethod === 'ocr' && !ocrProcessing)) && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <User className="mr-2" size={20} />
                  {t('personalInfo')}
                </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('title')} *
                  </label>
                  <select
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">{t('selectTitle')}</option>
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="นางสาว">นางสาว</option>
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('fullName')} *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('fullNamePlaceholder')}
                    required
                  />
                </div>
                
                <div className="md:col-span-3">
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
                    placeholder={t('idCardPlaceholder')}
                    required
                  />
                </div>
                
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('address')} *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('addressPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('province')} *
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    className="input-field"
                    required
                  >
                    <option value="">เลือกจังหวัด</option>
                    <option value="เลย">เลย</option>
                    <option value="กรุงเทพมหานคร">กรุงเทพมหานคร</option>
                    <option value="นนทบุรี">นนทบุรี</option>
                    <option value="ปทุมธานี">ปทุมธานี</option>
                    <option value="สมุทรปราการ">สมุทรปราการ</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('district')} *
                  </label>
                  <input
                    type="text"
                    name="district"
                    value={formData.district}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('districtPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('subDistrict')} *
                  </label>
                  <input
                    type="text"
                    name="subDistrict"
                    value={formData.subDistrict}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('subDistrictPlaceholder')}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('postalCode')} *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="input-field"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    placeholder={t('postalCodePlaceholder')}
                    required
                  />
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
                    placeholder={t('phonePlaceholder')}
                    required
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
                    placeholder={t('emailPlaceholder')}
                  />
                </div>
              </div>
            </div>
            )}

            {/* Education Information */}
            {(inputMethod === 'manual' || (inputMethod === 'ocr' && !ocrProcessing)) && (
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
            )}

            {/* Parent Information */}
            {(inputMethod === 'manual' || (inputMethod === 'ocr' && !ocrProcessing)) && (
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
            )}

            {/* Education History */}
            {(inputMethod === 'manual' || (inputMethod === 'ocr' && !ocrProcessing)) && (
              <div className="card">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <BookOpen className="mr-2" size={20} />
                  {t('educationHistory')}
                </h3>
              <p className="text-gray-600 mb-4">
                {t('currentlyStudyingOrGraduatedFrom')}
              </p>
              
              <div className="grid grid-cols-1 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('schoolInstitutionName')}
                  </label>
                  <input
                    type="text"
                    name="schoolName"
                    value={formData.schoolName}
                    onChange={handleInputChange}
                    className="input-field"
                    placeholder={t('schoolNamePlaceholder')}
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('educationLevelClass')}
                </label>
                <div className="flex flex-wrap gap-4">
                  {['ม.3', 'ม.6', 'ปวช', 'ปวส'].map((level) => (
                    <label key={level} className="inline-flex items-center">
                      <input
                        type="radio"
                        name="educationLevel"
                        value={level}
                        checked={formData.educationLevel === level}
                        onChange={handleInputChange}
                        className="form-radio h-4 w-4 text-blue-600"
                      />
                      <span className="ml-2 text-gray-700">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            )}

            {/* Navigation Buttons */}
            {(inputMethod === 'manual' || (inputMethod === 'ocr' && !ocrProcessing)) && (
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
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
