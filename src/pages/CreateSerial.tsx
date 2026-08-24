import React, { useState } from 'react';
import { ArrowLeft, KeyRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateSerial() {
  const navigate = useNavigate();
  const [deviceInfo, setDeviceInfo] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    alert('تم إنشاء الطلب بنجاح. سيتم توجيهك قريباً');
    navigate('/serials');
  };

  return (
    <div className="bg-app-bg min-h-full pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-primary-dark to-primary px-6 pt-6 pb-12 rounded-b-[40px] relative">
        <button 
          onClick={() => navigate('/serials')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-4 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">إنشاء سيريال جديد</h1>
            <p className="text-white/80 text-sm">تسجيل جهاز جديد في النظام</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden p-6">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">اسم الجهاز / العميل</label>
              <input 
                type="text"
                value={deviceInfo}
                onChange={e => setDeviceInfo(e.target.value)}
                required
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="أدخل اسم الجهاز أو معلومات العميل"
              />
            </div>
            
            <button 
              type="submit"
              className="bg-primary text-white px-6 py-3 rounded-xl font-bold w-full hover:bg-primary-dark transition-colors mt-4"
            >
              حفظ وإنشاء
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
