import React from 'react';
import { Check, User, BookOpen, FileCheck } from 'lucide-react';

interface Step {
  id: number;
  title: string;
  description: string;
  icon: React.ElementType;
}

const Stepper = ({ currentStep }: { currentStep: number }) => {
  const steps: Step[] = [
    {
      id: 1,
      title: 'ข้อมูลผู้สมัคร',
      description: 'กรอกข้อมูลส่วนตัวและอัปโหลดเอกสาร',
      icon: User,
    },
    {
      id: 2,
      title: 'เลือกสาขา',
      description: 'เลือกแผนกและสาขาที่ต้องการเรียน',
      icon: BookOpen,
    },
    {
      id: 3,
      title: 'ยืนยันข้อมูล',
      description: 'ตรวจสอบและยืนยันข้อมูลการสมัคร',
      icon: FileCheck,
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 z-0" />
        <div
          className="absolute left-0 top-1/2 transform -translate-y-1/2 h-1 bg-green-600 z-0 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {/* Steps */}
        {steps.map((step) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center">
              {/* Step Circle */}
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isCompleted
                    ? 'bg-green-600 text-white shadow-lg'
                    : isActive
                    ? 'bg-green-600 text-white shadow-lg ring-4 ring-green-200'
                    : 'bg-white border-2 border-gray-300 text-gray-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>

              {/* Step Text */}
              <div className="mt-3 text-center">
                <h3
                  className={`font-semibold text-sm ${
                    isActive ? 'text-green-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {step.title}
                </h3>
                <p className={`text-xs mt-1 ${isActive ? 'text-green-600' : 'text-gray-400'}`}>
                  {step.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
