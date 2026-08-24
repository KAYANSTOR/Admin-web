import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Users, ArrowLeft, ShieldOff, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function Subscriptions() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const q = query(collection(db, 'users'), where('role', '==', 'NETWORK_OWNER'));
        const snap = await getDocs(q);
        const data: any[] = [];
        snap.forEach(d => {
          data.push({ id: d.id, ...d.data() });
        });
        setClients(data);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    fetchClients();
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
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">إدارة الاشتراكات</h1>
            <p className="text-white/80 text-sm">متابعة حالة الحسابات وتاريخ التجديد</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10">
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : clients.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا يوجد اشتراكات</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {clients.map(client => {
                const isExpired = client.subscription_end_date && client.subscription_end_date < Date.now();
                return (
                  <div 
                    key={client.id} 
                    className="p-4 flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/clients/${client.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold">
                        {client.name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <div className="font-bold text-[14px] text-primary-dark">{client.name}</div>
                        <div className="text-[12px] text-gray-500">
                          {client.subscription_end_date ? format(new Date(client.subscription_end_date), 'dd/MM/yyyy') : 'غير محدد'}
                        </div>
                      </div>
                    </div>
                    <div className="text-left flex items-center gap-2">
                      {client.is_active && !isExpired ? (
                        <CheckCircle2 className="w-5 h-5 text-icon-green" />
                      ) : (
                        <ShieldOff className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
