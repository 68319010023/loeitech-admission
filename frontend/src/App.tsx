import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import RegistrationForm from './components/RegistrationForm';
import Sidebar from './components/Sidebar';
import Stepper from './components/Stepper';
import { LanguageProvider, useTranslation } from './contexts/LanguageContext';
import './App.css';

function AppContent() {
  const [currentStep, setCurrentStep] = useState(1);
  const { language, setLanguage, t } = useTranslation();

  return (
    <Router>
      <div className="min-h-screen gradient-bg flex">
        <Sidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="glass-effect border-b border-white/30 shadow-lg">
            <div className="px-6 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl flex items-center justify-center shadow-lg bounce-animation">
                    <span className="text-white font-bold text-xl font-thai">TC</span>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-neutral-800 font-thai">{t('systemTitle')}</h1>
                    <p className="text-sm text-primary-600 font-medium font-thai">{t('collegeName')}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setLanguage('th')}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 font-thai ${
                      language === 'th' 
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-white/80 backdrop-blur text-primary-600 hover:bg-white hover:shadow-md border border-primary-200'
                    }`}
                  >
                    TH
                  </button>
                  <button 
                    onClick={() => setLanguage('en')}
                    className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                      language === 'en' 
                        ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-lg hover:shadow-xl' 
                        : 'bg-white/80 backdrop-blur text-primary-600 hover:bg-white hover:shadow-md border border-primary-200'
                    }`}
                  >
                    EN
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">
              <Stepper currentStep={currentStep} />
              
              <Routes>
                <Route 
                  path="/" 
                  element={
                    <RegistrationForm 
                      onSubmit={(data) => {
                        console.log('Registration submitted:', data);
                        if (currentStep < 3) {
                          setCurrentStep(currentStep + 1);
                        }
                      }} 
                      currentStep={currentStep}
                      onStepChange={setCurrentStep}
                    />
                  } 
                />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </Router>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}

export default App;
