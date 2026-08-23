import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, collectionGroup } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, TrendingUp } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [searchParams] = useSearchParams();
  const filter = searchParams.get('filter') || 'all'; 
  const [activeTab, setActiveTab] = useState(filter === 'today' ? 0 : filter === 'month' ? 1 : 2);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collectionGroup(db, 'sales'));
    
    return onSnapshot(q, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      data.sort((a, b) => (b.createdAt || b.timestamp || 0) - (a.createdAt || a.timestamp || 0));
      setSales(data);
    });

  }, []);

  const filteredSales = sales.filter(sale => {
    if (activeTab === 2) return true;
    const now = new Date();
    const timestamp = sale.createdAt || sale.timestamp || 0;
    if (activeTab === 0) {
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      return timestamp >= todayStart;
    }
    if (activeTab === 1) {
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      return timestamp >= monthStart;
    }
    return true;
  });

  const totalAmount = filteredSales.reduce((sum, sale) => sum + (parseFloat(sale.faceValue) || parseFloat(sale.amount?.replace(',', '') || '0')), 0);

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">تقرير المبيعات</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-primary-dark text-white rounded-[24px] p-6 shadow-lg relative overflow-hidden">
          <TrendingUp className="absolute left-4 bottom-4 w-24 h-24 text-white/5" />
          <div className="text-[14px] text-white/70 mb-2 font-medium">إجمالي المبيعات ({activeTab === 0 ? 'اليوم' : activeTab === 1 ? 'الشهر' : 'الكل'})</div>
          <div className="flex items-end gap-2">
            <span className="text-[32px] font-black leading-none">{totalAmount.toLocaleString('en-US')}</span>
            <span className="text-[16px] text-white/70 font-bold pb-1">ر.س</span>
          </div>
          <div className="text-[12px] text-white/50 mt-4">إجمالي عدد العمليات: {filteredSales.length} عملية</div>
        </div>

        <div className="flex bg-gray-200/50 rounded-xl p-1 mt-6">
          <button onClick={() => setActiveTab(0)} className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 0 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>اليوم</button>
          <button onClick={() => setActiveTab(1)} className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 1 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>الشهر</button>
          <button onClick={() => setActiveTab(2)} className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 2 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}>الكل</button>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4 mt-2">
          {filteredSales.length > 0 ? filteredSales.map((sale, i) => (
            <React.Fragment key={sale.id}>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-bold text-[16px] text-primary-dark">{sale.faceValue || sale.amount || '0'} <span className="text-[12px] text-gray-500">ر.س</span></div>
                  <div className="text-[13px] text-gray-500 mt-1">{sale.saleType === 'POS' ? 'بيع عبر الصراف' : sale.saleType === 'DIRECT' ? 'بيع مباشر' : (sale.description || 'عملية مبيعات جديدة')} {sale.customerId ? ` - ${sale.customerId}` : ''}</div>
                </div>
                <div className="text-left text-[12px] text-gray-400 font-bold bg-app-bg px-2 py-1 rounded-lg">
                  {new Date(sale.createdAt || sale.timestamp || 0).toLocaleDateString('ar-SA')}
                </div>
              </div>
              {i < filteredSales.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          )) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا توجد مبيعات في هذه الفترة.</div>
          )}
        </div>
      </div>
    </div>
  );
}
