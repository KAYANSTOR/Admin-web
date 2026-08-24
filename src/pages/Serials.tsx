import React from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Serials() {
  const navigate = useNavigate();
  return (
    <div className="bg-app-bg min-h-full pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-dark to-primary px-6 pt-6 pb-12 rounded-b-[40px] relative">
        <button 
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-4 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">إدارة السيريالات</h1>
            <p className="text-white/80 text-sm">الأجهزة والسيريالات</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-8 text-center">
          <KeyRound className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-700 mb-2">لا توجد أجهزة حالياً</h2>
          <p className="text-gray-500 text-sm mb-6">يتم تسجيل الأجهزة تلقائياً عند تسجيل دخول العميل من التطبيق.</p>
          <button 
            onClick={() => navigate('/create-serial')}
            className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-primary-dark transition-colors"
          >
            إنشاء سيريال جديد
          </button>
        </div>
      </div>
    </div>
  );
}
