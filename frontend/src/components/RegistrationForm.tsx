import React, { useState } from 'react';
import { User, Calendar, MapPin, Phone, Mail, GraduationCap, CreditCard, BookOpen } from 'lucide-react';
import { studentAPI } from '../utils/api';
import { RegistrationData, Department, Course } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

interface RegistrationFormProps {
  onSubmit: (data: RegistrationData) => void;
  currentStep?: number;
  onStepChange?: (step: number) => void;
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit, currentStep = 1, onStepChange }) => {
  const { t, language, setLanguage } = useTranslation();
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
            
            {/* Language Toggle */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={() => setLanguage(language === 'th' ? 'en' : 'th')}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                {language === 'th' ? 'EN' : 'TH'}
              </button>
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
            
            {/* Personal Information */}
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

            {/* Education History */}
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
