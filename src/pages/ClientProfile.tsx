import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { ArrowLeft, Phone, CheckCircle2, ShieldOff, AlertTriangle, Calendar, Building2, Coins, TrendingUp } from 'lucide-react';
import ConfirmDialog from '../components/ConfirmDialog';
import { format } from 'date-fns';
import { endDateToDate, isSubscriptionExpired, timestampFromDaysFromNow, timestampFromMillis, endDateToMillis, isTrialAccount, activateTrialAccount } from '../lib/subscriptionUtils';
import { ar } from 'date-fns/locale';

export default function ClientProfile() {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [dialogConfig, setDialogConfig] = useState<any>({ isOpen: false });
  const closeDialog = () => setDialogConfig({ isOpen: false });

  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCommission, setEditCommission] = useState('');
  
  const openEditModal = () => {
    if (!client) return;
    setEditName(client.name || '');
    setEditPhone(client.phone || '');
    setEditCommission(client.commission_rate?.toString() || '0');
    setIsEditModalOpen(true);
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', client.id), {
        name: editName.trim(),
        phone: editPhone.trim(),
        commission_rate: parseFloat(editCommission) || 0
      });
      // Update network metadata as well
      await updateDoc(doc(db, 'networks', client.id, '_metadata', 'info'), {
        name: editName.trim(),
        phoneNumber: editPhone.trim()
      }).catch(err => console.log('Network info might not exist yet, ignoring...', err));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsUpdating(false);
    }
  };

  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    
    // Listen to client document
    const unsub = onSnapshot(doc(db, 'users', id), (docSnap) => {
      if (docSnap.exists()) {
        setClient({ id: docSnap.id, ...docSnap.data() });
      } else {
        setClient(null);
      }
      setLoading(false);
    });

    // Fetch client sales
    const fetchSales = async () => {
      try {
        // المسار الصحيح حسب العقد مع تطبيق الأندرويد هو "networks" (جمع) وليس "network"
        const salesRef = collection(db, `networks/${id}/sales`);
        const q = query(salesRef, orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data: any[] = [];
        snap.forEach(d => {
          data.push({ id: d.id, ...d.data() });
        });
        setSales(data);
      } catch (e) {
        console.error("Error fetching sales:", e);
      }
    };
    
    fetchSales();
    return () => unsub();
  }, [id]);

  
    const handleDeleteClient = async () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: 'حذف العميل نهائياً',
      message: 'تنبيه خطير: سيتم حذف جميع بيانات العميل من قاعدة البيانات. لا يمكن التراجع عن هذه العملية! اكتب "حذف" للتأكيد:',
      danger: true,
      requireInput: true,
      expectedInput: 'حذف',
      inputPlaceholder: 'اكتب كلمة "حذف"',
      confirmText: 'حذف نهائي',
      onConfirm: async () => {
        closeDialog();
        setIsUpdating(true);
        try {
          await deleteDoc(doc(db, 'users', client.id));
          alert('تم حذف العميل بنجاح. تذكر حذف حسابه من Firebase Authentication يدوياً إذا أردت منعه من تسجيل الدخول نهائياً.');
          navigate('/clients');
        } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء الحذف');
          setIsUpdating(false);
        }
      },
      onCancel: closeDialog
    });
  };

      const handleActivateTrial = async () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: 'تفعيل الحساب التجريبي',
      message: 'أدخل عدد الأيام لتفعيل الحساب:',
      requireInput: true,
      inputType: 'number',
      defaultValue: '30',
      confirmText: 'التالي (نسبة العمولة)',
      onConfirm: (daysStr: string) => {
        closeDialog();
        const days = parseInt(daysStr);
        if (isNaN(days) || days <= 0) return alert('أيام غير صالحة');
        
        setTimeout(() => {
          setDialogConfig({
            isOpen: true,
            title: 'نسبة العمولة',
            message: 'أدخل نسبة عمولة النظام لهذا العميل (%):',
            requireInput: true,
            inputType: 'number',
            defaultValue: '1.5',
            confirmText: 'تفعيل الحساب رسمياً',
            onConfirm: async (rateStr: string) => {
              closeDialog();
              const rate = parseFloat(rateStr);
              if (isNaN(rate) || rate < 0 || rate > 100) return alert('نسبة غير صالحة');
              
              setIsUpdating(true);
              try {
                await activateTrialAccount(client.id, days, rate);
                alert('تم تفعيل الحساب بنجاح وإخراجه من الفترة التجريبية!');
              } catch (e) {
                console.error(e);
                alert('حدث خطأ');
              } finally {
                setIsUpdating(false);
              }
            },
            onCancel: closeDialog
          });
        }, 100); // small delay to allow previous dialog to unmount
      },
      onCancel: closeDialog
    });
  };

const toggleStatus = async () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: client.is_active ? 'تأكيد إيقاف الحساب' : 'تأكيد تنشيط الحساب',
      message: client.is_active ? 'هل أنت متأكد من إيقاف هذا الحساب؟ لن يتمكن العميل من الدخول للتطبيق.' : 'هل أنت متأكد من تنشيط هذا الحساب؟',
      danger: client.is_active,
      confirmText: client.is_active ? 'إيقاف الحساب' : 'تنشيط',
      onConfirm: async () => {
        closeDialog();
        setIsUpdating(true);
        try {
          await updateDoc(doc(db, 'users', client.id), {
            is_active: !client.is_active,
          });
        } catch (e) {
          console.error(e);
        } finally {
          setIsUpdating(false);
        }
      },
      onCancel: closeDialog
    });
  };

    const handleSettleCommission = () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: 'تسوية العمولة',
      message: `العمولة المستحقة حالياً هي ${pendingCommission} ري. أدخل المبلغ المراد تسويته:`,
      requireInput: true,
      inputType: 'number',
      defaultValue: pendingCommission.toString(),
      confirmText: 'تسوية',
      onConfirm: async (amountStr: string) => {
        closeDialog();
        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) return alert('الرجاء إدخال مبلغ صحيح');
        setIsUpdating(true);
        try {
          await updateDoc(doc(db, 'users', client.id), {
            total_settled_commission: (client.total_settled_commission || 0) + amount
          });
        } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء التسوية');
        } finally {
          setIsUpdating(false);
        }
      },
      onCancel: closeDialog
    });
  };

  const handleEditCommissionRate = () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: 'تعديل نسبة العمولة',
      message: 'أدخل نسبة العمولة الجديدة (%):',
      requireInput: true,
      inputType: 'number',
      defaultValue: (client.commission_rate || 0).toString(),
      confirmText: 'حفظ التعديل',
      onConfirm: async (rateStr: string) => {
        closeDialog();
        const rate = parseFloat(rateStr);
        if (isNaN(rate) || rate < 0 || rate > 100) return alert('الرجاء إدخال نسبة صحيحة بين 0 و 100');
        setIsUpdating(true);
        try {
          await updateDoc(doc(db, 'users', client.id), {
            commission_rate: rate
          });
        } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء التعديل');
        } finally {
          setIsUpdating(false);
        }
      },
      onCancel: closeDialog
    });
  };

  const renewSubscription = async () => {
    if (!client) return;
    setDialogConfig({
      isOpen: true,
      title: 'تجديد الاشتراك',
      message: 'أدخل عدد الأيام لتجديد الاشتراك:',
      requireInput: true,
      inputType: 'number',
      defaultValue: '30',
      confirmText: 'تجديد',
      onConfirm: async (days: string) => {
        closeDialog();
        const numDays = parseInt(days);
        if (isNaN(numDays) || numDays <= 0) return alert('الرجاء إدخال رقم صحيح');
        
        setIsUpdating(true);
        try {
          const now = Date.now();
          const currentEndMs = endDateToMillis(client.subscription_end_date);
          const baseDate = currentEndMs < now ? now : currentEndMs;
          const newEndDateMs = baseDate + (numDays * 24 * 60 * 60 * 1000);
          
          await updateDoc(doc(db, 'users', client.id), {
            subscription_end_date: timestampFromMillis(newEndDateMs),
            is_active: true,
            warning_message: ''
          });
        } catch (e) {
          console.error(e);
          alert('حدث خطأ أثناء التجديد');
        } finally {
          setIsUpdating(false);
        }
      },
      onCancel: closeDialog
    });
  };

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;
  if (!client) return <div className="p-6 text-center">العميل غير موجود. <button onClick={() => navigate('/clients')} className="text-primary hover:underline">العودة</button></div>;

  const totalSalesValue = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.faceValue || 0), 0);
  const totalCommission = sales.reduce((sum, s) => sum + (s.commission || 0), 0); // Or use faceValue * client.commission_rate
  const calculatedAdminCommission = totalSalesValue * ((client.commission_rate || 0) / 100);
  const settledCommission = client.total_settled_commission || 0;
  const pendingCommission = Math.max(0, calculatedAdminCommission - settledCommission);
  
  const isExpired = isSubscriptionExpired(client.subscription_end_date);

  return (
    <div className="bg-app-bg min-h-full pb-20">
      {/* Header Profile */}
      <div className="bg-gradient-to-b from-primary-dark to-primary px-6 pt-6 pb-20 rounded-b-[40px] relative">
        <button 
          onClick={() => navigate('/clients')}
          className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white mb-4 hover:bg-white/20 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        <div className="flex items-center gap-4 text-white">
          <div className="w-[72px] h-[72px] bg-white/20 rounded-full flex items-center justify-center text-[28px] font-bold border-2 border-white/30">
            {client.name?.charAt(0) || '?'}
          </div>
          <div>
            <h1 className="text-[22px] font-black mb-1">{client.name}</h1>
            <div className="flex items-center gap-2 text-white/80 text-[14px]">
              <Phone className="w-4 h-4" />
              <span dir="ltr">{client.phone}</span>
            </div>
            {client.storeName && (
              <div className="flex items-center gap-2 text-white/80 text-[14px] mt-1">
                <Building2 className="w-4 h-4" />
                <span>{client.storeName}</span>
              </div>
            )}
      <ConfirmDialog {...dialogConfig} />
          </div>
        </div>
      </div>

      {/* Main Content Overlapping Header */}
      <div className="px-6 -mt-12 relative z-10 space-y-4">
        
        {/* Status Card */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-[13px] text-gray-500 font-medium mb-1">نوع الحساب</div>
              <div className="flex items-center gap-2">
                {isTrialAccount(client) ? (
                  <span className="text-[16px] font-bold text-icon-purple bg-icon-purple/10 px-3 py-1 rounded-lg">فترة تجريبية</span>
                ) : (
                  <span className="text-[16px] font-bold text-primary-dark">حساب معتمد (PAID)</span>
                )}
      <ConfirmDialog {...dialogConfig} />
              </div>
            </div>
            
            {isTrialAccount(client) && (
              <button 
                disabled={isUpdating}
                onClick={handleActivateTrial}
                className="px-6 py-2 rounded-xl text-[14px] font-bold transition-colors bg-primary text-white hover:bg-primary-variant"
              >
                اعتماد وتفعيل رسمي
              </button>
            )}
      <ConfirmDialog {...dialogConfig} />
          </div>
          <div className="h-[1px] bg-gray-100"></div>
          <div className="flex justify-between items-center">
          <div>
            <div className="text-[13px] text-gray-500 font-medium mb-1">حالة الحساب</div>
            <div className="flex items-center gap-2">
              {client.is_active ? (
                <><CheckCircle2 className="w-5 h-5 text-icon-green" /><span className="text-[16px] font-bold text-primary-dark">نشط</span></>
              ) : (
                <><ShieldOff className="w-5 h-5 text-red-500" /><span className="text-[16px] font-bold text-red-500">متوقف</span></>
              )}
      <ConfirmDialog {...dialogConfig} />
            </div>
          </div>
          <button 
            disabled={isUpdating}
            onClick={toggleStatus}
            className={`px-6 py-2 rounded-xl text-[14px] font-bold transition-colors ${
              client.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'
            }`}
          >
            {client.is_active ? 'إيقاف الحساب' : 'تفعيل الحساب'}
          </button>
        </div>
      </div>

        {/* Subscription Info */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex justify-between items-start mb-4">
            <div className="flex items-center gap-2 text-primary-dark font-black">
              <Calendar className="w-5 h-5 text-primary" />
              <span>الاشتراك</span>
            </div>
            <button 
              disabled={isUpdating}
              onClick={renewSubscription}
              className="px-4 py-1.5 bg-primary/10 text-primary rounded-lg text-[13px] font-bold hover:bg-primary/20"
            >
              تجديد
            </button>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[14px]">
              <span className="text-gray-500">تاريخ الانتهاء</span>
              <span className={`font-bold ${isExpired ? 'text-red-500' : 'text-primary-dark'}`}>
                {endDateToDate(client.subscription_end_date) ? format(endDateToDate(client.subscription_end_date)!, 'dd/MM/yyyy') : 'غير محدد'}
              </span>
            </div>
            {client.warning_message && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg flex items-start gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-[13px]">{client.warning_message}</span>
              </div>
            )}
      <ConfirmDialog {...dialogConfig} />
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-primary-dark font-black mb-4">
            <Coins className="w-5 h-5 text-icon-orange" />
            <span>المالية والعمولات</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl text-center relative group">
              <div className="text-[12px] text-gray-500 mb-1">نسبة العمولة</div>
              <div className="text-[18px] font-black text-primary-dark">
                {client.commission_rate || 0}%
              </div>
              <button 
                onClick={handleEditCommissionRate}
                className="absolute top-2 left-2 text-[10px] bg-white border border-gray-200 px-2 py-1 rounded text-gray-600 hover:text-primary transition-colors"
              >
                تعديل
              </button>
            </div>
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <div className="text-[12px] text-gray-500 mb-1">إجمالي المبيعات</div>
              <div className="text-[18px] font-black text-primary-dark text-icon-blue">
                {totalSalesValue} <span className="text-[12px]">ري</span>
              </div>
            </div>
          </div>
          
          <div className="bg-teal-50 p-4 rounded-xl flex justify-between items-center border border-teal-100">
            <div>
              <div className="text-[13px] text-teal-700 font-medium mb-1">عمولة الإدارة المستحقة</div>
              <div className="text-[20px] font-black text-teal-800">
                {pendingCommission} <span className="text-[14px]">ري</span>
              </div>
            </div>
            <button 
              onClick={handleSettleCommission}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-[13px] font-bold transition-colors"
            >
              تسوية العمولة
            </button>
          </div>
        </div>

        {/* Sales List */}
        <div className="bg-white rounded-[20px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="p-5 border-b border-gray-100">
            <div className="flex items-center gap-2 text-primary-dark font-black">
              <TrendingUp className="w-5 h-5 text-icon-purple" />
              <span>سجل المبيعات</span>
            </div>
          </div>
          
          {sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500 text-[14px]">لا توجد مبيعات مسجلة لهذا العميل</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sales.slice(0, 50).map(sale => (
                <div key={sale.id} className="p-4 flex justify-between items-center">
                  <div>
                    <div className="font-bold text-[14px] text-primary-dark flex items-center gap-2">
                      <span>بطاقة: {sale.cardId || '-'}</span>
                      {sale.categoryId && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sale.categoryId}</span>}
                    </div>
                    <div className="text-[12px] text-gray-500 flex flex-wrap gap-2 mt-1">
                      <span>{sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : ''}</span>
                      <span>•</span>
                      <span dir="ltr">الزبون: {sale.customerId || '-'}</span>
                      {sale.saleType && <><span>•</span><span className="text-primary">{sale.saleType}</span></>}
                    </div>
                    <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {sale.transactionId && <span>رقم العملية: {sale.transactionId}</span>}
                      {sale.posId && <span>نقاط البيع: {sale.posId}</span>}
                      {sale.smsMessageId && <span>SMS: {sale.smsMessageId}</span>}
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-left">
                      <div className="font-black text-[15px] text-primary-dark">{sale.faceValue || 0} ري</div>
                      {sale.netAmount !== undefined && <div className="text-[11px] text-gray-500">الصافي: {sale.netAmount}</div>}
                      {sale.commission !== undefined && <div className="text-[11px] text-teal-600">عمولة: {sale.commission}</div>}
                    </div>
                    <div className={`text-[11px] font-bold text-center px-2 py-1 rounded-lg mt-1 ${sale.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : sale.status === 'ROLLED_BACK' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}`}>
                      {sale.status === 'COMPLETED' ? 'مكتمل' : sale.status === 'ROLLED_BACK' ? 'مسترجع' : sale.status === 'SMS_PENDING' ? 'قيد الـ SMS' : sale.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
      <ConfirmDialog {...dialogConfig} />
        </div>
        
      
      </div>
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-4 text-center">تعديل بيانات العميل</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">اسم العميل</label>
                <input required type="text" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={editName} onChange={e => setEditName(e.target.value)} disabled={isUpdating} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <input required type="tel" dir="ltr" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-right text-[14px]" value={editPhone} onChange={e => setEditPhone(e.target.value)} disabled={isUpdating} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">نسبة العمولة (%)</label>
                <input required type="number" step="0.01" min="0" max="100" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={editCommission} onChange={e => setEditCommission(e.target.value)} disabled={isUpdating} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isUpdating} className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] disabled:opacity-50">
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px] disabled:opacity-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
      <ConfirmDialog {...dialogConfig} />
    </div>
  );
}

