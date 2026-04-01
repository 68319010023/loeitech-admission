import React, { useState } from 'react';
import { Search, User, Calendar, GraduationCap, CheckCircle, Clock, XCircle, Home, Printer } from 'lucide-react';
import { Student } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

const StatusCheck: React.FC = () => {
  const { t } = useTranslation();
  const [idCardNumber, setIdCardNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [student, setStudent] = useState<Student | null>(null);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!idCardNumber.trim()) {
      setError(t('idCardRequired'));
      return;
    }

    setLoading(true);
    setError('');
    setStudent(null);

    try {
      // Mock API call - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data for demonstration
      if (idCardNumber === '1234567890123') {
        const mockStudent: Student = {
          id: '1',
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          idCardNumber: '1234567890123',
          birthDate: '2540-05-15',
          gender: 'male',
          address: '123 ถนนสุขุมวิท ตำบลในเมือง อำเภอเมือง จังหวัดเลย 42000',
          phone: '0812345678',
          email: 'somchai@email.com',
          educationLevel: 'ปวช',
          departmentId: '1',
          courseId: '1',
          schoolName: 'โรงเรียนตัวอย่าง',
          gpa: 3.5,
          parentName: 'บิดา สมชาย ใจดี',
          parentPhone: '0823456789',
          status: 'approved',
          createdAt: '2026-01-15T10:30:00Z',
          updatedAt: '2026-01-20T14:20:00Z'
        };
        setStudent(mockStudent);
      } else {
        setError(t('noRegistrationFound'));
      }
    } catch (err) {
      setError(t('noRegistrationFound'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'approved':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return t('statusPending');
      case 'approved':
        return t('statusApproved');
      case 'rejected':
        return t('statusRejected');
      case 'completed':
        return t('statusCompleted');
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('th-TH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Section */}
      <div className="glass-effect rounded-3xl p-8 border border-white/30 shadow-xl">
        <div className="flex items-center space-x-3 mb-6">
          <Search className="w-6 h-6 text-primary-600" />
          <h2 className="text-2xl font-bold text-neutral-800 font-thai">{t('statusCheck')}</h2>
        </div>
        
        <div className="flex space-x-4">
          <div className="flex-1">
            <input
              type="text"
              value={idCardNumber}
              onChange={(e) => setIdCardNumber(e.target.value)}
              placeholder={t('idCardPlaceholder')}
              className="w-full px-4 py-3 rounded-2xl border border-primary-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-200 transition-all duration-300 font-thai"
              maxLength={13}
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-thai font-medium"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{t('processing')}</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4" />
                <span>{t('checkStatusBtn')}</span>
              </div>
            )}
          </button>
        </div>
        
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-thai">
            {error}
          </div>
        )}
      </div>

      {/* Results Section */}
      {student && (
        <div className="glass-effect rounded-3xl p-8 border border-white/30 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <User className="w-6 h-6 text-primary-600" />
              <h3 className="text-xl font-bold text-neutral-800 font-thai">{t('registrationFound')}</h3>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(student.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(student.status)} font-thai`}>
                {getStatusText(student.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Personal Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary-600 font-thai font-semibold">
                <User className="w-5 h-5" />
                <span>{t('applicantInfo')}</span>
              </div>
              
              <div className="space-y-3 bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/30">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('fullName')}</span>
                  <span className="font-medium font-thai">{student.firstName} {student.lastName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('idCardNumber')}</span>
                  <span className="font-medium font-thai">{student.idCardNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('birthDate')}</span>
                  <span className="font-medium font-thai">{student.birthDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('gender')}</span>
                  <span className="font-medium font-thai">{student.gender === 'male' ? t('male') : t('female')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('phone')}</span>
                  <span className="font-medium font-thai">{student.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('email')}</span>
                  <span className="font-medium font-thai">{student.email}</span>
                </div>
              </div>
            </div>

            {/* Education Information */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-primary-600 font-thai font-semibold">
                <GraduationCap className="w-5 h-5" />
                <span>{t('applicantEducation')}</span>
              </div>
              
              <div className="space-y-3 bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/30">
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('educationLevel')}</span>
                  <span className="font-medium font-thai">{student.educationLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('schoolName')}</span>
                  <span className="font-medium font-thai">{student.schoolName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('gpa')}</span>
                  <span className="font-medium font-thai">{student.gpa}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('parentName')}</span>
                  <span className="font-medium font-thai">{student.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 font-thai">{t('parentPhone')}</span>
                  <span className="font-medium font-thai">{student.parentPhone}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/30">
              <Calendar className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 font-thai">{t('submittedDate')}</p>
                <p className="font-medium font-thai">{formatDate(student.createdAt)}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 bg-white/50 backdrop-blur rounded-2xl p-4 border border-white/30">
              <Clock className="w-5 h-5 text-primary-600" />
              <div>
                <p className="text-sm text-gray-600 font-thai">{t('lastUpdated')}</p>
                <p className="font-medium font-thai">{formatDate(student.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end space-x-4">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-2 px-6 py-3 bg-white/80 backdrop-blur text-primary-600 rounded-2xl hover:bg-white hover:shadow-md border border-primary-200 transition-all duration-300 font-thai font-medium"
            >
              <Printer className="w-4 h-4" />
              <span>{t('printApplication')}</span>
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-2xl hover:from-primary-600 hover:to-primary-700 transition-all duration-300 shadow-lg hover:shadow-xl font-thai font-medium"
            >
              <Home className="w-4 h-4" />
              <span>{t('backToHome')}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatusCheck;
