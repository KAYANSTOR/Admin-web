import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collectionGroup, query, orderBy, limit, getDocs, collection } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TrendingUp, ArrowLeft, Search } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { endDateToMillis } from '../lib/subscriptionUtils';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'COMPLETED' | 'PENDING' | 'ROLLED_BACK'>('ALL');
  const navigate = useNavigate();

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const filterParam = searchParams.get('filter');

  useEffect(() => {
    const fetchSales = async () => {
      try {
        // Fetch all users to map network/client IDs to their names
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersMap = new Map();
        usersSnap.forEach(u => {
          usersMap.set(u.id, u.data().name || 'مستخدم غير معروف');
        });

        const salesQuery = query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc'), limit(500));
        const snap = await getDocs(salesQuery);
        let allSales: any[] = [];
        
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        
        snap.forEach(d => {
          const data = d.data();
          const createdAtMs = endDateToMillis(data.createdAt);
          if (filterParam === 'today' && createdAtMs < startOfDay) return;
          if (filterParam === 'month' && createdAtMs < startOfMonth) return;
          
          const parentDoc = d.ref.parent.parent;
          const clientId = parentDoc ? parentDoc.id : data.networkId;
          const clientName = usersMap.get(clientId) || 'غير معروف';

          allSales.push({ id: d.id, clientId, clientName, ...data });
        });
        
        setSales(allSales);
      } catch (e: any) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSales();
  }, [filterParam]);

  const visibleSales = sales.filter((sale) => {
    const normalizedSearch = search.trim().toLowerCase();
    const matchesSearch = !normalizedSearch || [sale.clientName, sale.cardId, sale.customerId, sale.transactionId, sale.networkId]
      .some(value => String(value ?? '').toLowerCase().includes(normalizedSearch));
    const matchesStatus = statusFilter === 'ALL'
      || (statusFilter === 'COMPLETED' && sale.status === 'COMPLETED')
      || (statusFilter === 'ROLLED_BACK' && sale.status === 'ROLLED_BACK')
      || (statusFilter === 'PENDING' && sale.status !== 'COMPLETED' && sale.status !== 'ROLLED_BACK');
    return matchesSearch && matchesStatus;
  });

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
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">سجل المبيعات</h1>
            <p className="text-white/80 text-sm">عرض جميع المبيعات في النظام</p>
          </div>
        </div>
      </div>

      


      <div className="px-6 -mt-6 relative z-10 space-y-3">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-4 space-y-3">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="بحث في المبيعات..." className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {([['ALL', 'الكل'], ['COMPLETED', 'مكتملة'], ['PENDING', 'معلقة'], ['ROLLED_BACK', 'مسترجعة']] as const).map(([value, label]) => (
              <button key={value} onClick={() => setStatusFilter(value)} className={`whitespace-nowrap px-3 py-2 rounded-lg text-[12px] font-bold ${statusFilter === value ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>{label}</button>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : visibleSales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد مبيعات</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {visibleSales.map(sale => (
                <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-bold text-[14px] text-primary-dark flex items-center gap-2">
                      <span className="text-blue-600">👤 {sale.clientName}</span>
                      <span className="text-gray-300">|</span>
                      <span>بطاقة: {sale.cardId || '-'}</span>
                      {sale.categoryId && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sale.categoryId}</span>}
                    </div>
                    <div className="text-[12px] text-gray-500 flex flex-wrap gap-2 mt-1">
                      <span>{endDateToMillis(sale.createdAt) ? format(new Date(endDateToMillis(sale.createdAt)), 'dd/MM/yyyy HH:mm') : ''}</span>
                      <span>•</span>
                      <span dir="ltr">الزبون: {sale.customerId || '-'}</span>
                      {sale.saleType && <><span>•</span><span className="text-primary">{sale.saleType}</span></>}
                    </div>
                    <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {sale.transactionId && <span>رقم العملية: {sale.transactionId}</span>}
                      {sale.posId && <span>نقاط البيع: {sale.posId}</span>}
                      {sale.networkId && <span>الشبكة: {sale.networkId}</span>}
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
        </div>
      </div>
    </div>
  );
}
