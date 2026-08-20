import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import { 
  Users, Clock, ChevronDown, Phone,
  Banknote, KeyRound, CreditCard, UserPlus, Fingerprint
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState({
    trialCount: 0,
    activeSubscriptions: 0,
    activeClients: 0,
    totalCommissions: '0',
    pendingCommissions: '0',
    todaySalesValue: '0',
    monthSalesValue: '0',
  });
  
  const [latestClients, setLatestClients] = useState<any[]>([]);

  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      let activeCount = 0;
      let latest: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive) activeCount++;
        latest.push({ id: doc.id, ...data });
      });
      setMetrics(prev => ({ ...prev, activeClients: activeCount }));
      setLatestClients(latest.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 4));
    });

    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      let active = 0;
      let trial = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.statusTypeString === 'SUCCESS') active++;
        const plan = data.plan || '';
        const statusText = data.statusText || '';
        if (plan.includes('تجريب') || statusText.includes('تجريب')) trial++;
      });
      setMetrics(prev => ({ ...prev, activeSubscriptions: active, trialCount: trial }));
    });

    const unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {
      let total = 0;
      let pending = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.commissionAmount || data.amount || '0'.replace(',', ''));
        total += isNaN(amount) ? 0 : amount;
        if (data.statusTypeString === 'WARNING') pending += isNaN(amount) ? 0 : amount;
      });
      setMetrics(prev => ({ 
        ...prev, 
        totalCommissions: total.toLocaleString('en-US'),
        pendingCommissions: pending.toLocaleString('en-US')
      }));
    });

    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      
      let todayTotal = 0;
      let monthTotal = 0;
      
      snapshot.forEach(doc => {
        const data = doc.data();
        const amount = parseFloat(data.amount?.replace(',', '') || '0');
        const timestamp = data.timestamp || 0;
        
        if (timestamp >= monthStart) monthTotal += (isNaN(amount) ? 0 : amount);
        if (timestamp >= todayStart) todayTotal += (isNaN(amount) ? 0 : amount);
      });
      
      setMetrics(prev => ({ 
        ...prev, 
        todaySalesValue: todayTotal.toLocaleString('en-US'),
        monthSalesValue: monthTotal.toLocaleString('en-US')
      }));
    });

    return () => { unsubClients(); unsubSubs(); unsubComms(); unsubSales(); };
  }, []);

  const todayDate = new Intl.DateTimeFormat('ar-SA', { 
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
  }).format(new Date());

  const userName = user?.name || "مدير النظام";

  const KpiCard = ({ title, value, icon: Icon, colorClass, bgColorClass, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white p-4 rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] h-[105px] flex flex-col justify-between cursor-pointer active:scale-95 transition-transform"
    >
      <div className="flex justify-between items-start w-full">
        <div className={`w-[38px] h-[38px] rounded-full flex items-center justify-center ${bgColorClass}`}>
          <Icon className={`w-[22px] h-[22px] ${colorClass}`} />
        </div>
        <span className="text-xl font-black text-primary-dark">{value}</span>
      </div>
      <div>
        <div className="text-[13px] text-gray-500 font-medium mb-1.5">{title}</div>
        <div className={`w-full h-1 rounded-full opacity-100 ${bgColorClass.replace('/15', '')}`} style={{ backgroundColor: 'var(--color-' + colorClass.split('-')[1] + ')' }} />
      </div>
    </div>
  );

  const QuickActionCard = ({ title, icon: Icon, onClick }: any) => (
    <div 
      onClick={onClick}
      className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] h-[95px] flex flex-col items-center justify-center cursor-pointer active:scale-95 transition-transform"
    >
      <Icon className="w-8 h-8 text-teal-start mb-2.5" />
      <span className="text-[13px] font-bold text-primary-dark">{title}</span>
    </div>
  );

  return (
    <div className="bg-app-bg min-h-full">
      {/* Header */}
      <div className="pt-6 px-6 pb-4">
        <h1 className="text-2xl font-black text-primary-dark">مرحباً {userName}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{todayDate}</p>
      </div>

      {/* Hero Revenue Card */}
      <div className="px-6 mb-6">
        <div 
          onClick={() => navigate('/commissions')}
          className="h-[170px] rounded-[24px] bg-gradient-to-r from-teal-start to-purple-end relative overflow-hidden p-6 flex flex-col items-end justify-between cursor-pointer"
        >
          {/* Abstract background waves/chart mockup could go here (Canvas equivalent) */}
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

      {/* 2x2 Grid KPIs */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-6">
        <KpiCard title="إجمالي العمولات" value={metrics.totalCommissions} icon={Banknote} colorClass="text-icon-green" bgColorClass="bg-icon-green/15" onClick={() => navigate('/commissions')} />
        <KpiCard title="عملاء نشطون" value={metrics.activeClients} icon={KeyRound} colorClass="text-icon-blue" bgColorClass="bg-icon-blue/15" onClick={() => navigate('/clients')} />
        <KpiCard title="اشتراكات نشطة" value={metrics.activeSubscriptions} icon={Users} colorClass="text-icon-orange" bgColorClass="bg-icon-orange/15" onClick={() => navigate('/subscriptions')} />
        <KpiCard title="فترة تجريبية" value={metrics.trialCount} icon={Clock} colorClass="text-icon-purple" bgColorClass="bg-icon-purple/15" onClick={() => navigate('/subscriptions')} />
      </div>

      {/* Quick Actions */}
      <div className="px-6 mb-8">
        <h2 className="text-[16px] font-bold text-primary-dark mb-4">الإجراءات السريعة</h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard title="اشتراك جديد" icon={CreditCard} onClick={() => navigate('/subscriptions')} />
          <QuickActionCard title="إضافة جهاز" icon={Phone} onClick={() => navigate('/serials')} />
          <QuickActionCard title="إضافة عميل" icon={UserPlus} onClick={() => navigate('/clients')} />
          <QuickActionCard title="إصدار ترخيص" icon={Fingerprint} onClick={() => navigate('/licenses')} />
        </div>
      </div>

      {/* Sales Overview */}
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

      {/* Latest Clients */}
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
                <div className="flex items-center justify-between py-1">
                  <div className="flex items-center gap-3">
                    <div className="w-[44px] h-[44px] rounded-full bg-teal-start flex items-center justify-center text-white font-bold text-[18px]">
                      {client.name?.charAt(0) || '?'}
                    </div>
                    <div>
                      <div className="font-bold text-[15px] text-primary-dark">{client.name || 'عميل غير مسمى'}</div>
                      <div className="text-[13px] text-gray-500">{client.phone || 'لا توجد شبكة'}</div>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-[13px] text-gray-500 mb-0.5">{client.isActive ? 'اشتراك فعال' : 'متوقف'}</div>
                    <div className={`text-[12px] font-bold ${client.isActive ? 'text-icon-green' : 'text-red-500'}`}>
                      {client.isActive ? 'نشط' : 'موقوف'}
                    </div>
                  </div>
                </div>
                {i < latestClients.length - 1 && <div className="h-[1px] bg-gray-200/50 my-3" />}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
