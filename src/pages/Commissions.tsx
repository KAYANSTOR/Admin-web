import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Commissions() {
  const [comms, setComms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'commissions'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setComms(data);
    });
  }, []);

  const filteredComms = comms.filter(comm => {
    const isPending = comm.statusTypeString === 'WARNING';
    return activeTab === 0 ? isPending : !isPending;
  });

  const settleCommission = async (id: string) => {
    try {
      await updateDoc(doc(db, 'commissions', id), {
        statusTypeString: 'SUCCESS'
      });
    } catch (err) {
      console.error('Error settling commission:', err);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">العمولات</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex bg-gray-200/50 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 0 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            المعلقة
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 1 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            المكتملة
          </button>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {filteredComms.length > 0 ? filteredComms.map((comm, i) => (
            <React.Fragment key={comm.id}>
              <div className="flex justify-between items-center py-2">
                <div className="flex-1">
                  <div className="font-bold text-[16px] text-primary-dark">{comm.commissionAmount || comm.amount || '0'} <span className="text-[12px] text-gray-500">ر.س</span></div>
                  <div className="text-[13px] text-gray-500 mt-1">{comm.description || 'عملية غير مسماة'}</div>
                  {comm.clientName && <div className="text-[12px] text-primary mt-1">{comm.clientName}</div>}
                </div>
                <div className="text-left flex flex-col items-end gap-2">
                  <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${comm.statusTypeString === 'WARNING' ? 'bg-icon-purple/10 text-icon-purple' : 'bg-icon-green/10 text-icon-green'}`}>
                    {comm.statusTypeString === 'WARNING' ? 'معلقة' : 'مكتملة'}
                  </div>
                  {comm.statusTypeString === 'WARNING' && (
                    <button 
                      onClick={() => settleCommission(comm.id)}
                      className="text-[12px] font-bold text-primary flex items-center gap-1 active:scale-95 transition-transform bg-primary/5 px-2 py-1 rounded-lg mt-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      تصفية
                    </button>
                  )}
                </div>
              </div>
              {i < filteredComms.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          )) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا توجد عمولات مطابقة.</div>
          )}
        </div>
      </div>
    </div>
  );
}
