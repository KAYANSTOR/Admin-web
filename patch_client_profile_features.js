import fs from 'fs';
let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

// Ensure we have correct imports
if (!content.includes('query')) {
  content = content.replace(/import { doc, onSnapshot, updateDoc } from 'firebase/firestore';/, "import { doc, onSnapshot, updateDoc, collection, query, where, addDoc, serverTimestamp } from 'firebase/firestore';");
}

if (!content.includes('CheckCircle2')) {
  content = content.replace(/import { ArrowRight/g, "import { ArrowRight, CheckCircle2, X, Wallet, CreditCard, Activity, Coins");
}

// Add state for sub/comms
content = content.replace(
  `  const [editCommission, setEditCommission] = useState('');`,
  `  const [editCommission, setEditCommission] = useState('');
  const [subscription, setSubscription] = useState<any>(null);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [settlementModal, setSettlementModal] = useState<any>(null);
  const [settleAmount, setSettleAmount] = useState('');
  const [settleRef, setSettleRef] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);`
);

// Add useEffect logic to fetch subs and comms
content = content.replace(
  `      if (doc.exists()) {
        setClient({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);`,
  `      if (doc.exists()) {
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
  }, [id]);`
);

// Add settle function
content = content.replace(
  `  const handleUpdateCommission = async (e: React.FormEvent) => {`,
  `  const handleSettle = async (e: React.FormEvent) => {
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

  const handleUpdateCommission = async (e: React.FormEvent) => {`
);

// Add missing components to UI before Device Information Card
// Calculate pending commissions inside render
content = content.replace(
  `      <div className="px-4 space-y-4">
        {/* Device Information Card */}`,
  `      <div className="px-4 space-y-4">
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
              <div className={\`text-[12px] font-bold px-3 py-1.5 rounded-lg \${subscription.statusTypeString === 'SUCCESS' ? 'bg-icon-green/10 text-icon-green' : 'bg-icon-orange/10 text-icon-orange'}\`}>
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

        {/* Device Information Card */}`
);

// Add Settlement Modal to UI bottom
content = content.replace(
  `      {isCommissionModalOpen && (`,
  `      {settlementModal && (
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

      {isCommissionModalOpen && (`
);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
