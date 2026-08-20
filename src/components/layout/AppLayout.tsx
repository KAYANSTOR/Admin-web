import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Home, Users, Key, Settings as SettingsIcon, Plus, UserPlus, ShieldOff, CheckCircle2, Menu, X, KeyRound
} from 'lucide-react';

export default function AppLayout() {
  const { user } = useAuth();
  const [showQuickActions, setShowQuickActions] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navItems = [
    { route: '/dashboard', title: 'الرئيسية', icon: Home },
    { route: '/clients', title: 'العملاء', icon: Users },
    { route: '/licenses', title: 'التراخيص', icon: Key },
    { route: '/settings', title: 'الإعدادات', icon: SettingsIcon },
  ];

  return (
    <div dir="rtl" className="min-h-screen bg-app-bg text-text-primary pb-[104px]">
      
      {/* Main Content */}
      <main className="h-full">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-40 px-0 pb-0">
        <div className="relative">
          {/* Central FAB - Only show if Admin or has clients permission */}
          {(user?.role === 'ADMIN' || user?.permissions?.includes('clients')) && (
            <button
              onClick={() => setShowQuickActions(true)}
              className="absolute left-1/2 -translate-x-1/2 -top-6 w-16 h-16 bg-primary-dark text-white rounded-full flex items-center justify-center shadow-lg shadow-black/10 z-50 hover:bg-opacity-90 transition-all active:scale-95"
              aria-label="إجراءات سريعة"
            >
              <Plus className="w-8 h-8" />
            </button>
          )}

          {/* Bottom Nav Bar */}
          <div className="h-[88px] bg-surface rounded-t-[24px] shadow-[0_-4px_16px_rgba(0,0,0,0.05)] px-4 flex justify-between items-center relative z-40">
            {navItems.map((item, index) => {
              const isActive = location.pathname.startsWith(item.route);
              
              return (
                <React.Fragment key={item.route}>
                  {index === 2 && <div className="w-14" />} {/* Spacer for FAB */}
                  
                  <button
                    onClick={() => navigate(item.route)}
                    className="flex-1 flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform"
                  >
                    <item.icon 
                      className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-gray-500'}`} 
                    />
                    <span 
                      className={`text-[11px] ${isActive ? 'text-primary font-bold' : 'text-gray-500'}`}
                    >
                      {item.title}
                    </span>
                  </button>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions Bottom Sheet Modal */}
      {showQuickActions && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-50 animate-in fade-in duration-200"
            onClick={() => setShowQuickActions(false)}
          />
          <div className="fixed bottom-0 inset-x-0 bg-surface rounded-t-[24px] z-50 pt-2 pb-8 animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-4" />
            
            <h2 className="text-xl font-bold text-text-primary px-6 py-2 mb-2">إجراءات سريعة</h2>
            
            <div className="flex flex-col">
              <button 
                onClick={() => { setShowQuickActions(false); navigate('/create-serial'); }}
                className="w-full px-6 py-4 flex items-center gap-4 text-text-primary hover:bg-gray-50 transition-colors"
              >
                <KeyRound className="w-6 h-6" />
                <span className="text-lg font-bold">إنشاء سيريال للعميل</span>
              </button>

              {user?.role === 'ADMIN' && (
                <button 
                  onClick={() => { setShowQuickActions(false); /* showCreateUserDialog=true */ }}
                  className="w-full px-6 py-4 flex items-center gap-4 text-text-primary hover:bg-gray-50 transition-colors"
                >
                  <UserPlus className="w-6 h-6" />
                  <span className="text-lg font-bold">إنشاء مستخدم مع الصلاحيات</span>
                </button>
              )}

              <button 
                onClick={() => { setShowQuickActions(false); navigate('/subscriptions'); }}
                className="w-full px-6 py-4 flex items-center gap-4 text-error hover:bg-error-bg/50 transition-colors"
              >
                <ShieldOff className="w-6 h-6" />
                <span className="text-lg font-bold">تجميد / حذف اشتراك</span>
              </button>

              <button 
                onClick={() => { setShowQuickActions(false); navigate('/commissions'); }}
                className="w-full px-6 py-4 flex items-center gap-4 text-text-primary hover:bg-gray-50 transition-colors"
              >
                <CheckCircle2 className="w-6 h-6" />
                <span className="text-lg font-bold">تسوية وتصفية عمولة</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
