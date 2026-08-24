import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../lib/firebase';
import { doc, onSnapshot, collection, query, where, orderBy, getDocs, updateDoc } from 'firebase/firestore';
import { ArrowLeft, User, Phone, CheckCircle2, ShieldOff, AlertTriangle, Calendar, Building2, Coins, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function ClientProfile() {
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
        const salesRef = collection(db, `network/${id}/sales`);
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

  const toggleStatus = async () => {
    if (!client) return;
    if (!window.confirm(client.is_active ? 'هل أنت متأكد من إيقاف هذا العميل؟' : 'هل أنت متأكد من تفعيل هذا العميل؟')) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', client.id), {
        is_active: !client.is_active,
        isActive: !client.is_active
      });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء تحديث الحالة');
    }
    setIsUpdating(false);
  };

  const renewSubscription = async () => {
    if (!client) return;
    const days = window.prompt('أدخل عدد الأيام لتجديد الاشتراك:', '30');
    if (!days) return;
    const numDays = parseInt(days);
    if (isNaN(numDays) || numDays <= 0) return alert('الرجاء إدخال رقم صحيح');
    
    setIsUpdating(true);
    try {
      // Calculate new end date based on current logic (if expired, start from now, else add to existing)
      const now = Date.now();
      const currentEnd = client.subscription_end_date || now;
      const baseDate = currentEnd < now ? now : currentEnd;
      const newEndDate = baseDate + (numDays * 24 * 60 * 60 * 1000);
      
      await updateDoc(doc(db, 'users', client.id), {
        subscription_end_date: newEndDate,
        is_active: true,
        isActive: true,
        warning_message: ''
      });
      alert('تم تجديد الاشتراك بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء التجديد');
    }
    setIsUpdating(false);
  };

  if (loading) return <div className="p-6 text-center">جاري التحميل...</div>;
  if (!client) return <div className="p-6 text-center">العميل غير موجود. <button onClick={() => navigate('/clients')} className="text-primary hover:underline">العودة</button></div>;

  const totalSalesValue = sales.reduce((sum, s) => sum + (s.faceValue || 0), 0);
  const totalCommission = sales.reduce((sum, s) => sum + (s.commission || 0), 0); // Or use faceValue * client.commission_rate
  const calculatedAdminCommission = totalSalesValue * ((client.commission_rate || 0) / 100);
  
  const isExpired = client.subscription_end_date && client.subscription_end_date < Date.now();

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
          </div>
        </div>
      </div>

      {/* Main Content Overlapping Header */}
      <div className="px-6 -mt-12 relative z-10 space-y-4">
        
        {/* Status Card */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_4px_20px_rgba(0,0,0,0.08)] flex justify-between items-center">
          <div>
            <div className="text-[13px] text-gray-500 font-medium mb-1">حالة الحساب</div>
            <div className="flex items-center gap-2">
              {client.is_active ? (
                <><CheckCircle2 className="w-5 h-5 text-icon-green" /><span className="text-[16px] font-bold text-primary-dark">نشط</span></>
              ) : (
                <><ShieldOff className="w-5 h-5 text-red-500" /><span className="text-[16px] font-bold text-red-500">متوقف</span></>
              )}
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
                {client.subscription_end_date ? format(new Date(client.subscription_end_date), 'dd/MM/yyyy') : 'غير محدد'}
              </span>
            </div>
            {client.warning_message && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg flex items-start gap-2 text-orange-700">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span className="text-[13px]">{client.warning_message}</span>
              </div>
            )}
          </div>
        </div>

        {/* Financial Info */}
        <div className="bg-white rounded-[20px] p-5 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="flex items-center gap-2 text-primary-dark font-black mb-4">
            <Coins className="w-5 h-5 text-icon-orange" />
            <span>المالية والعمولات</span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-xl text-center">
              <div className="text-[12px] text-gray-500 mb-1">نسبة العمولة</div>
              <div className="text-[18px] font-black text-primary-dark">
                {client.commission_rate || 0}%
              </div>
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
                {calculatedAdminCommission} <span className="text-[14px]">ري</span>
              </div>
            </div>
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
                    <div className="font-bold text-[14px] text-primary-dark">بطاقة: {sale.cardId || 'غير معروف'}</div>
                    <div className="text-[12px] text-gray-500 flex gap-2">
                      <span>{sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM HH:mm') : ''}</span>
                      <span>•</span>
                      <span>الزبون: {sale.customerId}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="font-black text-[15px] text-primary-dark">{sale.faceValue || 0} ري</div>
                    <div className={`text-[11px] font-bold ${sale.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'}`}>
                      {sale.status === 'COMPLETED' ? 'مكتمل' : sale.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
      </div>
    </div>
  );
}
