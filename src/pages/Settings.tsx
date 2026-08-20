import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Bell, Lock, 
  HelpCircle, LogOut, ChevronLeft 
} from 'lucide-react';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const SettingRow = ({ icon: Icon, title, subtitle, onClick, destructive = false }: any) => (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 cursor-pointer active:bg-gray-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${destructive ? 'bg-red-50 text-red-500' : 'bg-app-bg text-primary-dark'}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <div className={`font-bold text-[15px] ${destructive ? 'text-red-500' : 'text-primary-dark'}`}>{title}</div>
          {subtitle && <div className="text-[12px] text-gray-500 mt-0.5">{subtitle}</div>}
        </div>
      </div>
      {!destructive && <ChevronLeft className="w-5 h-5 text-gray-400" />}
    </div>
  );

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <div className="w-10"></div>
        <h1 className="text-[18px] font-black text-primary-dark">الإعدادات</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        {/* Modern Profile Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] pt-8 pb-6 px-6 flex flex-col items-center justify-center relative overflow-hidden text-center">
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-teal-start/10 to-purple-end/10" />
          
          <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-teal-start to-purple-end text-white text-[32px] font-black flex items-center justify-center z-10 shadow-lg border-4 border-white mb-4">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          
          <h2 className="font-black text-[22px] text-primary-dark z-10">{user?.name}</h2>
          <p className="text-[15px] text-gray-500 mt-1 z-10 dir-ltr tracking-wide">{user?.phone}</p>
          
          <div className="mt-4 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[13px] font-bold z-10">
            {user?.role === 'ADMIN' ? 'مدير النظام' : 'موظف'}
          </div>
        </div>

        {/* Settings List */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          {user?.role === 'ADMIN' && (
            <SettingRow 
              icon={Shield} 
              title="إدارة الموظفين" 
              subtitle="إضافة أو حذف مستخدمين وصلاحياتهم" 
              onClick={() => navigate('/employees')}
            />
          )}
          <SettingRow 
            icon={Bell} 
            title="الإشعارات" 
            subtitle="التحكم في تنبيهات النظام" 
            onClick={() => {}}
          />
          <SettingRow 
            icon={Lock} 
            title="الأمان" 
            subtitle="تغيير رمز الدخول (PIN)" 
            onClick={() => {}}
          />
        </div>

        {/* Support & Logout */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <SettingRow 
            icon={HelpCircle} 
            title="المساعدة والدعم" 
            onClick={() => {}}
          />
          <SettingRow 
            icon={LogOut} 
            title="تسجيل الخروج" 
            onClick={handleLogout}
            destructive
          />
        </div>
      </div>
    </div>
  );
}
