import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, getDocs, collectionGroup, where } from 'firebase/firestore';
import { Users, Clock, CreditCard, ChevronDown, Fingerprint, Coins, TrendingUp, Phone, UserPlus } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';
  const hasPerm = (perm: string | null) => !perm || isAdmin || user?.permissions?.includes(perm);
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    activeSubscriptions: 0,
    trialCount: 0,
    pendingCommissions: 0,
    monthSalesValue: 0,
    todaySalesValue: 0
  });
  const [latestClients, setLatestClients] = useState<any[]>([]);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get Clients (Network Owners)
        const clientsRef = collection(db, 'users');
        const qClients = query(clientsRef, where('role', '==', 'NETWORK_OWNER'), limit(10));
        const clientsSnap = await getDocs(qClients);
        
        let activeClientsCount = 0;
        let trialCount = 0;
        const clientsList: any[] = [];
        
        clientsSnap.forEach(doc => {
          const data = doc.data();
          clientsList.push({ id: doc.id, ...data });
          if (data.is_active) {
            activeClientsCount++;
          } else {
            trialCount++; // Just an estimate to populate the UI for now
          }
        });
        
        setLatestClients(clientsList);

        // Fetch Sales using collectionGroup
        // المبيعات محفوظة فعلياً في networks/{uid}/sales (يكتبها تطبيق الأندرويد)
        // وليس في users/{uid}/sales، لذلك يجب استخدام collectionGroup على 'sales'
        let monthSalesValue = 0;
        let todaySalesValue = 0;
        let pendingCommissions = 0;

        const salesSnap = await getDocs(collectionGroup(db, 'sales'));
        const allSales: any[] = [];
        salesSnap.forEach(doc => {
          allSales.push(doc.data());
        });

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).setHours(0,0,0,0);

        allSales.forEach(data => {
          if (data.status !== 'COMPLETED') return; // حساب المبيعات الناجحة فقط

          const faceValue = data.faceValue || 0;
          const createdAt = data.createdAt || 0;
          
          if (createdAt >= startOfMonth) {
            monthSalesValue += faceValue;
            pendingCommissions += data.commission || 0; 
          }
          if (createdAt >= startOfDay) {
            todaySalesValue += faceValue;
          }
        });

        setMetrics({
          activeSubscriptions: activeClientsCount,
          trialCount: trialCount,
          pendingCommissions: Math.round(pendingCommissions),
          monthSalesValue,
          todaySalesValue
        });

      } catch (error: any) {
                console.error("Error fetching dashboard data:", error);
      }
    };

    fetchData();
  }, []);

  const userName = user?.name?.split(' ')[0] || 'مدير النظام';
  const todayDate = format(new Date(), 'EEEE، d MMMM yyyy', { locale: ar });

  const kpis = [
    { title: "اشتراكات نشطة", value: metrics.activeSubscriptions, icon: Users, colorClass: "text-icon-orange", bgColorClass: "bg-icon-orange/15", onClick: () => navigate('/subscriptions'), req: 'subscriptions' },
    { title: "فترة تجريبية", value: metrics.trialCount, icon: Clock, colorClass: "text-icon-purple", bgColorClass: "bg-icon-purple/15", onClick: () => navigate('/subscriptions'), req: 'subscriptions' },
  ].filter(k => hasPerm(k.req));
  
  return (
    <div className="bg-app-bg min-h-full">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h1 className="text-2xl font-black text-primary-dark">مرحباً {userName}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{todayDate}</p>
      </div>

      
      {/* Hero Revenue Card */}
      {hasPerm('commissions') && (
        <div className="px-6 mb-6">
          <div 
            onClick={() => navigate('/commissions')}
            className="h-[170px] rounded-[24px] bg-gradient-to-r from-teal-start to-purple-end relative overflow-hidden p-6 flex flex-col items-end justify-between cursor-pointer shadow-lg shadow-teal-start/20"
          >
            <svg className="absolute left-0 bottom-0 w-[55%] h-[80%] opacity-50" preserveAspectRatio="none" viewBox="0 0 100 100">
              <path d="M0,80 L15,60 L30,50 L45,70 L60,30 L75,40 L90,10 L100,0" fill="none" stroke="white" strokeWidth="4" />
              <circle cx="15" cy="60" r="4" fill="white" />
              <circle cx="30" cy="50" r="4" fill="white" />
              <circle cx="45" cy="70" r="4" fill="white" />
              <circle cx="60" cy="30" r="4" fill="white" />
              <circle cx="75" cy="40" r="4" fill="white" />
              <circle cx="90" cy="10" r="4" fill="white" />
            </svg>
            <div className="bg-white/20 rounded-xl px-3 py-1.5 flex items-center gap-1 backdrop-blur-sm z-10">
              <span className="text-white text-xs font-medium">كل الوقت</span>
              <ChevronDown className="w-4 h-4 text-white" />
            </div>
            
            <div className="text-right z-10">
              <div className="text-white/90 text-[15px] font-medium mb-1">العمولات المعلقة</div>
              <div className="flex items-end justify-end gap-2 text-white">
                <span className="text-xl font-bold pb-1.5">ري</span>
                <span className="text-[38px] leading-none font-black">{metrics.pendingCommissions}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2x2 Grid KPIs */}
      {kpis.length > 0 && (
        <div className="px-6 grid grid-cols-2 gap-3 mb-6">
          {kpis.map((kpi, idx) => (
            <div 
              key={idx} 
              onClick={kpi.onClick}
              className="bg-white rounded-[20px] p-4 flex flex-col shadow-[0_2px_4px_rgba(0,0,0,0.05)] cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${kpi.bgColorClass}`}>
                <kpi.icon className={`w-5 h-5 ${kpi.colorClass}`} />
              </div>
              <div className="text-[24px] font-black text-primary-dark leading-none mb-1">{kpi.value}</div>
              <div className="text-[13px] font-medium text-gray-500">{kpi.title}</div>
            </div>
          ))}
        </div>
      )}

      {/* Sales Overview */}
      {hasPerm('sales') && (
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-black text-primary-dark">نظرة عامة على المبيعات</h2>
            <span onClick={() => navigate('/sales')} className="text-[14px] font-bold text-teal-start cursor-pointer">عرض التفاصيل</span>
          </div>
          <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
            <div className="flex items-center gap-6">
              <div className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" onClick={() => navigate('/sales?filter=today')}>
                <div className="text-[13px] text-gray-500 font-medium mb-1">مبيعات اليوم</div>
                <div className="text-[20px] font-black text-primary-dark">{metrics.todaySalesValue} <span className="text-[14px] text-gray-400 font-bold">ري</span></div>
              </div>
              <div className="w-[1px] h-12 bg-gray-200" />
              <div className="flex-1 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors" onClick={() => navigate('/sales?filter=month')}>
                <div className="text-[13px] text-gray-500 font-medium mb-1">مبيعات الشهر</div>
                <div className="text-[20px] font-black text-primary-dark">{metrics.monthSalesValue} <span className="text-[14px] text-gray-400 font-bold">ري</span></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Latest Clients */}
      {hasPerm('clients') && (
        <div className="px-6 pb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-[16px] font-black text-primary-dark">آخر العملاء</h2>
            <span onClick={() => navigate('/clients')} className="text-[14px] font-bold text-teal-start cursor-pointer">عرض الكل</span>
          </div>
          {latestClients.length === 0 ? (
            <div className="text-center text-gray-500 py-4">لا يوجد عملاء حالياً</div>
          ) : (
            <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4">
              {latestClients.map((client, i) => (
                <React.Fragment key={client.id}>
                  <div className="flex items-center justify-between py-1 cursor-pointer" onClick={() => navigate(`/clients/${client.id}`)}>
                    <div className="flex items-center gap-3">
                      <div className="w-[44px] h-[44px] rounded-full bg-teal-start flex items-center justify-center text-white font-bold text-[18px]">
                        {client.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-[15px] text-primary-dark">{client.name || 'عميل غير مسمى'}</div>
                        <div className="text-[13px] text-gray-500" dir="ltr">{client.phone || 'لا توجد شبكة'}</div>
                      </div>
                    </div>
                    <div className="text-left">
                      <div className="text-[13px] text-gray-500 mb-0.5">{client.is_active ? 'اشتراك فعال' : 'متوقف'}</div>
                      <div className={`text-[12px] font-bold ${client.is_active ? 'text-icon-green' : 'text-red-500'}`}>
                        {client.is_active ? 'نشط' : 'موقوف'}
                      </div>
                    </div>
                  </div>
                  {i < latestClients.length - 1 && <div className="h-[1px] bg-gray-200/50 my-3" />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State / No Permissions */}
      {!isAdmin && (!user?.permissions || user.permissions.length === 0) && (
        <div className="px-6 pb-6 pt-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Fingerprint className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-[18px] font-black text-primary-dark mb-2">لا توجد لديك صلاحيات</h2>
          <p className="text-[14px] text-gray-500">حسابك لا يحتوي على أي صلاحيات للوصول إلى أقسام النظام. يرجى مراجعة إدارة النظام.</p>
        </div>
      )}
    </div>
  );
}
