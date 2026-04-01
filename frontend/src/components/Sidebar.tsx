import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, FileText, CheckCircle, Users, Settings, LogOut } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

const Sidebar = () => {
  const { t } = useTranslation();
  const location = useLocation();
  
  const menuItems = [
    { icon: FileText, label: t('fillApplication'), path: '/' },
    { icon: CheckCircle, label: t('checkStatus'), path: '/status' },
  ];

  const adminItems = [
    { icon: Users, label: t('manageUsers'), path: '/users' },
    { icon: Settings, label: t('systemSettings'), path: '/settings' },
  ];

  return (
    <div className="w-72 bg-gradient-to-b from-primary-500/90 to-secondary-600/90 backdrop-blur-lg text-white flex flex-col border-r border-white/20">
      {/* Logo Section */}
      <div className="p-6 border-b border-white/20">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-white/20 backdrop-blur rounded-3xl flex items-center justify-center float-animation">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-thai">{t('collegeName')}</h2>
            <p className="text-xs text-white/80 font-thai">{t('systemDesc')}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4 font-thai">{t('mainMenu')}</h3>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className={`w-full flex items-center px-4 py-3 rounded-2xl transition-all duration-300 font-thai ${
                location.pathname === item.path
                  ? 'bg-white/20 shadow-lg backdrop-blur text-white'
                  : 'hover:bg-white/10 text-white/80 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="mt-8 space-y-2">
          <h3 className="text-xs font-semibold text-white/70 uppercase tracking-wider mb-4 font-thai">{t('staff')}</h3>
          {adminItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              className="w-full flex items-center px-4 py-3 rounded-2xl hover:bg-white/10 text-white/80 hover:text-white transition-all duration-300 font-thai"
            >
              <item.icon className="w-5 h-5 mr-3" />
              <span className="font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-6 border-t border-white/20">
        <button className="w-full flex items-center justify-center space-x-3 px-4 py-3 bg-white/10 backdrop-blur text-white/80 hover:bg-white/20 hover:text-white rounded-2xl transition-all duration-300 font-thai">
          <LogOut className="w-5 h-5" />
          <span className="font-medium">{t('logout')}</span>
        </button>
        <div className="text-center mt-4">
          <p className="text-xs text-white/60 font-thai">{t('copyright')}</p>
          <p className="text-xs text-white/40 mt-1">{t('systemDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
