import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot, updateDoc, collection, query, where, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowRight, CheckCircle2, X, Wallet, CreditCard, Activity, Coins, User, Phone, Building2, Percent, Edit2, ChevronLeft, Trash2 } from 'lucide-react';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isCommissionModalOpen, setIsCommissionModalOpen] = useState(false);
  const [editCommission, setEditCommission] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [settlementModal, setSettlementModal] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleRef, setSettleRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'clients', id), (doc) => {
      if (doc.exists()) {
        setClient({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });

    const unsubSub = onSnapshot(query(collection(db, 'subscriptions'), where('clientId', '==', id)), (snapshot) => {
      if (!snapshot.empty) {
        setSubscription({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      } else {
        setSubscription(null);
      }
    });

    const unsubComm = onSnapshot(query(collection(db, 'commissions'), where('clientId', '==', id)), (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setCommissions(data);
    });

    return () => {
      unsub();
      unsubSub();
      unsubComm();
    };
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">جاري التحميل...</div>;
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-4">العميل غير موجود</h2>
        <button onClick={() => navigate('/clients')} className="text-primary hover:underline">العودة للعملاء</button>
      </div>
    );
  }

  const StatusBadge = ({ status }: { status: string }) => {
    const styles: Record<string, string> = {
      'ACTIVE': 'bg-icon-green/10 text-icon-green',
      'WARNING': 'bg-yellow-500/10 text-yellow-600',
      'GRACE_PERIOD': 'bg-icon-orange/10 text-icon-orange',
      'OVERDUE': 'bg-red-500/10 text-red-500',
      'SUSPENDED': 'bg-gray-500/10 text-gray-500',
    };
    const labels: Record<string, string> = {
      'ACTIVE': 'نشط',
      'WARNING': 'إنذار',
      'GRACE_PERIOD': 'فترة سماح',
      'OVERDUE': 'متأخر',
      'SUSPENDED': 'موقوف',
    };
    return (
      <div className={`px-4 py-2 rounded-full text-sm font-bold ${styles[status] || styles['ACTIVE']}`}>
        {labels[status] || 'نشط'}
      </div>
    );
  };

  const currentStatus = client.status || (client.isActive ? 'ACTIVE' : 'SUSPENDED');

  
  const handleDeleteClient = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا العميل وجميع بياناته؟')) {
      try {
        await deleteDoc(doc(db, 'clients', id!));
        navigate('/clients');
      } catch (err) {
        console.error('Error deleting client', err);
      }
    }
  };

  const handleSettle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settlementModal || !settleAmount) return;
    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'settlements'), {
        commissionId: settlementModal.id,
        amount: settleAmount,
        reference: settleRef,
        createdAt: serverTimestamp()
      });
      await updateDoc(doc(db, 'commissions', settlementModal.id), {
        statusTypeString: 'SUCCESS',
        settledAmount: settleAmount,
        settlementRef: settleRef
      });
      setSettlementModal(null);
      setSettleAmount('');
      setSettleRef('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCommission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client?.id) return;
    try {
      await updateDoc(doc(db, 'clients', client.id), {
        commissionPercentage: parseFloat(editCommission) || 0
      });
      setIsCommissionModalOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <div className="pt-6">
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-[14px]"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للعملاء
        </button>
      </div>

      <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">
        <div className="pt-8 pb-6 px-6 flex flex-col items-center relative text-center">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-teal-start/10 to-purple-end/10" />
          
          <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
            <StatusBadge status={currentStatus} />
            <button onClick={handleDeleteClient} className="p-2 bg-white/20 hover:bg-red-500/80 transition-colors rounded-full backdrop-blur-sm text-white">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>

          
          <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-teal-start to-purple-end text-white text-[32px] font-black flex items-center justify-center z-10 shadow-lg border-4 border-white mb-4">
            {client.name?.charAt(0) || '?'}
          </div>
          
          <h1 className="font-black text-[22px] text-primary-dark z-10">{client.name}</h1>
          <div className="flex flex-col items-center gap-2 mt-2 text-[14px] text-gray-500 z-10">
              <div className="flex items-center gap-1.5 font-medium">
                <Phone className="w-4 h-4 text-teal-start" />
                <span dir="ltr">{client.phone}</span>
              </div>
              {client.storeName && (
                <div className="flex items-center gap-1.5 font-medium">
                  <Building2 className="w-4 h-4 text-teal-start" />
                  <span>{client.storeName}</span>
                </div>
              )}
              <div 
                onClick={() => {
                  setEditCommission(client.commissionPercentage?.toString() || '0');
                  setIsCommissionModalOpen(true);
                }}
                className="flex items-center gap-1.5 font-medium cursor-pointer text-primary hover:bg-primary/5 px-3 py-1 rounded-lg transition-colors border border-primary/20"
              >
                <Percent className="w-4 h-4 text-primary" />
                <span>عمولة: {client.commissionPercentage || 0}%</span>
                <Edit2 className="w-3 h-3 ml-1" />
              </div>
            </div>
        </div>
      </div>
      
      <div className="px-4 space-y-4">
        {/* Subscription Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-black text-primary-dark">حالة الاشتراك</h3>
          </div>
          {subscription ? (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex justify-between items-center">
              <div>
                <div className="font-bold text-[15px] text-gray-800">{subscription.plan || 'خطة غير معروفة'}</div>
                <div className="text-[13px] text-gray-500 mt-1">{subscription.statusText || 'لا يوجد تفاصيل'}</div>
              </div>
              <div className={`text-[12px] font-bold px-3 py-1.5 rounded-lg ${subscription.statusTypeString === 'SUCCESS' ? 'bg-icon-green/10 text-icon-green' : 'bg-icon-orange/10 text-icon-orange'}`}>
                {subscription.statusTypeString === 'SUCCESS' ? 'فعال' : 'تجريبي / معلق'}
              </div>
            </div>
          ) : (
            <div className="text-gray-500 text-[14px] bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              لا توجد اشتراكات لهذا العميل.
            </div>
          )}
        </div>

        {/* Financials & Commissions Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="text-[16px] font-black text-primary-dark">المالية والعمولات</h3>
          </div>
          
          <div className="space-y-3">
            {commissions.filter(c => c.statusTypeString === 'WARNING').length > 0 ? (
              commissions.filter(c => c.statusTypeString === 'WARNING').map((comm, i) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-4 rounded-xl border border-gray-100">
                  <div>
                    <div className="font-bold text-[16px] text-primary-dark">{comm.commissionAmount || comm.amount || '0'} <span className="text-[12px] text-gray-500">ر.س</span></div>
                    <div className="text-[13px] text-gray-500 mt-1">{comm.description || 'عملية غير مسماة'}</div>
                  </div>
                  <button 
                    onClick={() => setSettlementModal(comm)}
                    className="text-[13px] font-bold text-white bg-primary hover:bg-primary-dark active:scale-95 transition-all px-4 py-2 rounded-xl flex items-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    تسوية
                  </button>
                </div>
              ))
            ) : (
              <div className="text-gray-500 text-[14px] bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
                لا توجد عمولات معلقة تستوجب التسوية.
              </div>
            )}
            
            {/* Show total settled */}
            {commissions.filter(c => c.statusTypeString === 'SUCCESS').length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                <span className="text-[14px] text-gray-500 font-bold">إجمالي العمولات المسددة:</span>
                <span className="text-[16px] font-black text-icon-green">
                  {commissions.filter(c => c.statusTypeString === 'SUCCESS').reduce((sum, c) => sum + parseFloat(String(c.commissionAmount || c.amount || '0').replace(/,/g, '')), 0).toLocaleString('en-US')} ر.س
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Device Information Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <h3 className="text-[16px] font-black text-primary-dark mb-4">الأجهزة المسجلة</h3>
          {client.devices && client.devices.length > 0 ? (
            <div className="space-y-3">
              {client.devices.map((device: any, i: number) => (
                <div key={i} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div>
                    <div className="font-bold text-[14px] text-gray-700">{device.name || 'جهاز غير مسمى'}</div>
                    <div className="text-[12px] text-gray-500 font-mono mt-1">{device.deviceId}</div>
                  </div>
                  <div className="text-[12px] text-gray-400 bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    آخر ظهور: {device.lastSeen ? new Date(device.lastSeen).toLocaleDateString('ar-SA') : 'غير معروف'}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-[14px] bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              لا توجد أجهزة مرتبطة بهذا الحساب.
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="p-6 md:p-8">
          <h3 className="text-[16px] font-black text-primary-dark mb-4">سجل التدقيق (Audit Log)</h3>
          {client.auditLog && client.auditLog.length > 0 ? (
            <div className="space-y-4">
              {client.auditLog.slice(0, 5).map((log: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== Math.min(client.auditLog.length, 5) - 1 && (
                    <div className="absolute right-[11px] top-6 bottom-[-24px] w-[2px] bg-gray-100" />
                  )}
                  <div className="w-6 h-6 rounded-full bg-teal-start/10 flex items-center justify-center shrink-0 z-10 border-2 border-white">
                    <div className="w-2 h-2 rounded-full bg-teal-start" />
                  </div>
                  <div className="pb-2">
                    <div className="font-bold text-[14px] text-gray-700">{log.action}</div>
                    <div className="text-[13px] text-gray-500 mt-0.5">{log.details}</div>
                    <div className="text-[11px] font-bold text-gray-400 mt-1.5 bg-gray-50 inline-block px-2 py-0.5 rounded-md">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString('ar-SA') : ''} • بواسطة: {log.user || 'النظام'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-gray-500 text-[14px] bg-gray-50 p-4 rounded-xl text-center border border-gray-100">
              لا توجد سجلات متاحة.
            </div>
          )}
        </div>
      </div>

      {settlementModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-black text-[18px] text-primary-dark">تسوية العمولة</h2>
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

      {isCommissionModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-6 text-center">تعديل نسبة العمولة</h2>
            <form onSubmit={handleUpdateCommission} className="space-y-4">
              <div>
                <label className="block text-[13px] text-gray-500 mb-1.5 font-bold">النسبة المئوية (%)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  min="0" 
                  max="100" 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" 
                  value={editCommission} 
                  onChange={e => setEditCommission(e.target.value)} 
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px]">حفظ</button>
                <button type="button" onClick={() => setIsCommissionModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
