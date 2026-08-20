import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Bell, BellRing, Lock, Smartphone, 
  HelpCircle, LogOut, ChevronLeft, X
} from 'lucide-react';
import { doc, updateDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export default function Settings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // States for Security Modal
  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securityError, setSecurityError] = useState('');
  const [securitySuccess, setSecuritySuccess] = useState('');

  // States for Notifications Modal
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.notificationsEnabled !== false);
  const [notifLoading, setNotifLoading] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpdatePin = async (e: React.FormEvent) => {
    e.preventDefault();
    setSecurityError('');
    setSecuritySuccess('');

    if (oldPin !== user?.pin) {
      setSecurityError('الرمز القديم غير صحيح');
      return;
    }

    if (newPin.length !== 4) {
      setSecurityError('رمز الدخول الجديد يجب أن يكون 4 أرقام');
      return;
    }
    
    if (oldPin === newPin) {
      setSecurityError('الرمز الجديد مطابق للرمز القديم');
      return;
    }

    setSecurityLoading(true);
    try {
      // Re-authenticate first to ensure updatePassword works
      const email = `${user.phone}@kayansoft.com`;
      const oldPassword = `${oldPin}kayan`;
      const newPassword = `${newPin}kayan`;
      
      await signInWithEmailAndPassword(auth, email, oldPassword);
      
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, newPassword);
      }

      // Update Firestore
      if (user?.id) {
        await updateDoc(doc(db, 'users', user.id), {
          pin: newPin
        });
      }

      setSecuritySuccess('تم تغيير رمز الدخول بنجاح');
      setTimeout(() => {
        setIsSecurityModalOpen(false);
        setOldPin('');
        setNewPin('');
        setSecuritySuccess('');
      }, 1500);

    } catch (err: any) {
      console.error(err);
      setSecurityError('حدث خطأ أثناء تغيير الرمز. حاول مرة أخرى.');
    } finally {
      setSecurityLoading(false);
    }
  };

  const handleToggleNotifications = async () => {
    const newValue = !notificationsEnabled;
    setNotificationsEnabled(newValue);
    setNotifLoading(true);
    try {
      if (user?.id) {
        await updateDoc(doc(db, 'users', user.id), {
          notificationsEnabled: newValue
        });
      }
    } catch (err) {
      console.error(err);
      // Revert if failed
      setNotificationsEnabled(!newValue);
    } finally {
      setNotifLoading(false);
    }
  };

  const SettingRow = ({ icon: Icon, title, subtitle, onClick, destructive = false, children }: any) => (
    <div 
      onClick={onClick}
      className={`flex items-center justify-between p-4 bg-white border-b border-gray-100 last:border-0 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''} transition-colors`}
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
      {children ? children : (onClick && !destructive ? <ChevronLeft className="w-5 h-5 text-gray-400" /> : null)}
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
          {(user?.role === 'ADMIN' || user?.permissions?.includes('employees')) && (
            <SettingRow 
              icon={Shield} 
              title="إدارة الموظفين" 
              subtitle="إضافة أو حذف مستخدمين وصلاحياتهم" 
              onClick={() => navigate('/employees')}
            />
          )}
          {(user?.role === 'ADMIN' || user?.permissions?.includes('settings')) && (
            <SettingRow 
              icon={Smartphone} 
              title="إعدادات التطبيق" 
              subtitle="التحكم بالرابط والرسائل المنبثقة" 
              onClick={() => navigate('/system-settings')}
            />
          )}
          {(user?.role === 'ADMIN' || user?.permissions?.includes('notifications')) && (
            <SettingRow 
              icon={BellRing} 
              title="إدارة التنبيهات" 
              subtitle="إرسال إشعارات ورسائل للعملاء" 
              onClick={() => navigate('/notifications-manager')}
            />
          )}
          <SettingRow 
            icon={Bell} 
            title="الإشعارات" 
            subtitle="التحكم في تنبيهات النظام" 
            onClick={() => setIsNotificationsModalOpen(true)}
          />
          <SettingRow 
            icon={Lock} 
            title="الأمان" 
            subtitle="تغيير رمز الدخول (PIN)" 
            onClick={() => setIsSecurityModalOpen(true)}
          />
        </div>

        {/* Support & Logout */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
          <SettingRow 
            icon={HelpCircle} 
            title="المساعدة والدعم" 
            onClick={() => window.open('mailto:support@kayansoft.com')}
          />
          <SettingRow 
            icon={LogOut} 
            title="تسجيل الخروج" 
            onClick={handleLogout}
            destructive
          />
        </div>
      </div>

      {/* Security Modal */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 relative">
            <button 
              onClick={() => setIsSecurityModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Lock className="w-6 h-6 text-primary" />
            </div>
            
            <h2 className="font-black text-[18px] text-primary-dark mb-2 text-center">تغيير رمز الدخول</h2>
            <p className="text-[13px] text-gray-500 mb-6 text-center">الرجاء إدخال الرمز الحالي والرمز الجديد</p>
            
            <form onSubmit={handleUpdatePin} className="space-y-4">
              <div>
                <input 
                  required 
                  type="password" 
                  maxLength={4} 
                  inputMode="numeric" 
                  dir="ltr" 
                  placeholder="الرمز الحالي (4 أرقام)" 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-center tracking-[0.5em] text-[14px]" 
                  value={oldPin} 
                  onChange={e => setOldPin(e.target.value.replace(/\D/g, ''))} 
                />
              </div>
              
              <div>
                <input 
                  required 
                  type="password" 
                  maxLength={4} 
                  inputMode="numeric" 
                  dir="ltr" 
                  placeholder="الرمز الجديد (4 أرقام)" 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-center tracking-[0.5em] text-[14px]" 
                  value={newPin} 
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} 
                />
              </div>
              
              {securityError && <p className="text-red-500 text-[12px] font-bold text-center">{securityError}</p>}
              {securitySuccess && <p className="text-green-500 text-[12px] font-bold text-center">{securitySuccess}</p>}
              
              <button 
                type="submit" 
                disabled={securityLoading} 
                className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] mt-2 disabled:opacity-50"
              >
                {securityLoading ? 'جاري الحفظ...' : 'تغيير الرمز'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Notifications Modal */}
      {isNotificationsModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="bg-surface rounded-t-[24px] sm:rounded-[24px] w-full max-w-sm p-6 animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-200 relative pb-10 sm:pb-6">
            <button 
              onClick={() => setIsNotificationsModalOpen(false)}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-gray-600 bg-gray-50 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4 mx-auto">
              <Bell className="w-6 h-6 text-blue-500" />
            </div>

            <h2 className="font-black text-[18px] text-primary-dark mb-2 text-center">إعدادات الإشعارات</h2>
            <p className="text-[13px] text-gray-500 mb-6 text-center">قم بتفعيل أو تعطيل التنبيهات الخاصة بالنظام</p>

            <div className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <div className="font-bold text-[15px] text-primary-dark">تلقي الإشعارات</div>
                <div className="text-[12px] text-gray-500 mt-1">تنبيهات العمولات والاشتراكات الجديدة</div>
              </div>
              
              {/* Toggle Switch */}
              <button 
                type="button"
                disabled={notifLoading}
                onClick={handleToggleNotifications}
                className={`w-12 h-7 rounded-full p-1 transition-colors relative disabled:opacity-50 ${notificationsEnabled ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${notificationsEnabled ? 'transform -translate-x-5' : 'transform translate-x-0'}`} />
              </button>
            </div>
            
            <button 
              onClick={() => setIsNotificationsModalOpen(false)}
              className="w-full bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px] mt-6"
            >
              إغلاق
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
