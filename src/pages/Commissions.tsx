import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, doc, updateDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, CheckCircle2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Commissions() {
  const [comms, setComms] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [settlementModal, setSettlementModal] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleRef, setSettleRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementModal || !settleAmount) return;
    setIsSubmitting(true);
    try {
      // Create settlement record
      await addDoc(collection(db, 'settlements'), {
        commissionId: settlementModal.id,
        amount: settleAmount,
        reference: settleRef,
        createdAt: serverTimestamp()
      });
      
      // Update commission status
      await updateDoc(doc(db, 'commissions', settlementModal.id), {
        statusTypeString: 'SUCCESS',
        settledAmount: settleAmount,
        settlementRef: settleRef
      });
      
      setSettlementModal(null);
      setSettleAmount('');
      setSettleRef('');
    } catch (err) {
      console.error('Error settling commission:', err);
    } finally {
      setIsSubmitting(false);
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
                      onClick={() => setSettlementModal(comm)}
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

      {/* Settlement Modal */}
      {settlementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-[18px] text-primary-dark">تصفية العمولة</h2>
              <button onClick={() => setSettlementModal(null)} className="p-1">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            
            <form onSubmit={handleSettle} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">المبلغ المسدد</label>
                <input 
                  required 
                  type="number" 
                  step="0.01"
                  placeholder="0.00" 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-left dir-ltr" 
                  value={settleAmount} 
                  onChange={e => setSettleAmount(e.target.value)} 
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">مرجع الدفع (اختياري)</label>
                <input 
                  type="text" 
                  placeholder="رقم الحوالة أو الإيصال..." 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary" 
                  value={settleRef} 
                  onChange={e => setSettleRef(e.target.value)} 
                />
              </div>
              
              <div className="pt-4">
                <button type="submit" disabled={isSubmitting} className="w-full bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-5 h-5" />
                  {isSubmitting ? 'جاري الحفظ...' : 'تأكيد التسديد'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
