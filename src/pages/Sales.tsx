import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collectionGroup, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';
import { TrendingUp, ArrowLeft, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Sales() {
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

  useEffect(() => {
    const fetchSales = async () => {
      try {
        // المبيعات يرفعها تطبيق الأندرويد إلى المسار networks/{uid}/sales
        // نستخدم collectionGroup لقراءتها من كل الشبكات دفعة واحدة بدل حلقة يدوية على مسار خاطئ
        const salesQuery = query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc'), limit(100));
        const snap = await getDocs(salesQuery);
        const allSales: any[] = [];
        snap.forEach(d => allSales.push({ id: d.id, ...d.data() }));
        setSales(allSales);
      } catch (e: any) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchSales();
  }, []);

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

      


      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : sales.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد مبيعات</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {sales.map(sale => (
                <div key={sale.id} className="p-4 flex justify-between items-center hover:bg-gray-50 transition-colors">
                  <div>
                    <div className="font-bold text-[14px] text-primary-dark">بطاقة: {sale.cardId || 'غير معروف'}</div>
                    <div className="text-[12px] text-gray-500 flex gap-2">
                      <span>{sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : ''}</span>
                      <span>•</span>
                      <span dir="ltr">{sale.customerId || '-'}</span>
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
