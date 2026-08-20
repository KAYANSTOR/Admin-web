import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Clock, Key } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Licenses() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'subscriptions'));
    return onSnapshot(q, (snapshot) => {
      let data: any[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setLicenses(data);
    });
  }, []);

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">التراخيص</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {licenses.length > 0 ? licenses.map((license, i) => {
            const isTrial = license.plan?.includes('تجريب') || license.statusText?.includes('تجريب');
            const isActive = license.statusTypeString === 'SUCCESS' || isTrial;

            return (
              <React.Fragment key={license.id}>
                <div className="flex justify-between items-center py-2">
                  <div className="flex-1">
                    <div className="font-bold text-[15px] text-primary-dark">{license.clientName || 'عميل غير مسجل'}</div>
                    <div className="text-[13px] text-gray-500 mt-1 font-mono tracking-wider">{license.serialNumber || 'بدون سيريال'}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-[11px] font-bold">
                        {isTrial ? <Clock className="w-3 h-3" /> : <Key className="w-3 h-3" />}
                        {license.plan || 'أساسي'}
                      </span>
                    </div>
                  </div>
                  <div className="text-left flex flex-col items-end gap-2">
                    <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${isActive ? 'bg-icon-green/10 text-icon-green' : 'bg-red-500/10 text-red-500'}`}>
                      {license.statusText || (isActive ? 'فعال' : 'منتهي')}
                    </div>
                    {license.expiryDate && (
                      <div className="text-[11px] text-gray-400 font-bold">
                        {new Date(license.expiryDate).toLocaleDateString('ar-SA')}
                      </div>
                    )}
                  </div>
                </div>
                {i < licenses.length - 1 && <div className="h-[1px] bg-gray-100" />}
              </React.Fragment>
            );
          }) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا توجد تراخيص حالياً.</div>
          )}
        </div>
      </div>
    </div>
  );
}
