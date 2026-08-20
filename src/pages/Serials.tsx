import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Serials() {
  const [serials, setSerials] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'serials'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setSerials(data);
    });
  }, []);

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إدارة السيريالات</h1>
        <button onClick={() => navigate('/create-serial')} className="p-2 active:scale-95 transition-transform">
          <Plus className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {serials.length > 0 ? serials.map((serial, i) => (
            <React.Fragment key={serial.id}>
              <div className="flex justify-between items-center py-2">
                <div>
                  <div className="font-bold text-[15px] text-primary-dark tracking-wide">{serial.code || 'XXXX-XXXX-XXXX'}</div>
                  <div className="text-[13px] text-gray-500 mt-1 flex items-center gap-2">
                    <span>{serial.clientName || 'غير مخصص'}</span>
                    <span>•</span>
                    <span>{serial.duration || 'شهر'}</span>
                  </div>
                </div>
                <div className="text-left">
                  <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${serial.isActive ? 'bg-icon-green/10 text-icon-green' : 'bg-red-500/10 text-red-500'}`}>
                    {serial.isActive ? 'مفعل' : 'موقوف'}
                  </div>
                </div>
              </div>
              {i < serials.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          )) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا توجد سيريالات حالياً.</div>
          )}
        </div>
      </div>
    </div>
  );
}
