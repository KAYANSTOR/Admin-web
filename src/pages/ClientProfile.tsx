import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowRight, User, Phone, Building2 } from 'lucide-react';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'clients', id), (doc) => {
      if (doc.exists()) {
        setClient({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });
    return () => unsub();
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
        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-teal-start flex items-center justify-center text-white font-black text-[32px] shrink-0 shadow-sm">
            {client.name?.charAt(0) || '?'}
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-2xl font-black text-primary-dark">{client.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-[14px] text-gray-500">
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
            </div>
          </div>
          <StatusBadge status={currentStatus} />
        </div>
        
        {/* Device Information */}
        <div className="p-6 md:p-8 border-b border-gray-100">
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
              {client.auditLog.map((log: any, i: number) => (
                <div key={i} className="flex gap-4 relative">
                  {i !== client.auditLog.length - 1 && (
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
    </div>
  );
}
