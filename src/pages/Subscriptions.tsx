import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Subscriptions() {
  const [subs, setSubs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0); // 0 = Active, 1 = Trial/Pending
  const navigate = useNavigate();

  useEffect(() => {
    // Note: No createdAt in current mock docs so we just fetch all
    const q = query(collection(db, 'subscriptions'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setSubs(data);
    });
  }, []);

  const filteredSubs = subs.filter(sub => {
    const isSuccess = sub.statusTypeString === 'SUCCESS';
    return activeTab === 0 ? isSuccess : !isSuccess;
  });

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">الاشتراكات</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex bg-gray-200/50 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 0 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            فعالة
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 1 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            تجريبية / معلقة
          </button>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {filteredSubs.length > 0 ? filteredSubs.map((sub, i) => (
            <React.Fragment key={sub.id}>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-bold text-[15px] text-primary-dark">{sub.plan || 'خطة غير معروفة'}</div>
                  <div className="text-[13px] text-gray-500 mt-1">{sub.statusText || 'لا توجد تفاصيل للحالة'}</div>
                </div>
                <div className="text-left">
                  <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${sub.statusTypeString === 'SUCCESS' ? 'bg-icon-green/10 text-icon-green' : 'bg-icon-orange/10 text-icon-orange'}`}>
                    {sub.statusTypeString === 'SUCCESS' ? 'فعال' : 'تجريبي / معلق'}
                  </div>
                </div>
              </div>
              {i < filteredSubs.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          )) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا توجد اشتراكات مطابقة.</div>
          )}
        </div>
      </div>
    </div>
  );
}
