import fs from 'fs';

const content = `import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Search, Plus, Trash2, ShieldBan, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Serials() {
  const [serials, setSerials] = useState<any[]>([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const q = query(collection(db, 'serials'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() }));
      setSerials(data);
    });
  }, []);

  const deleteSerial = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'serials', id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      alert('تعذر الحذف: ' + err.message);
    }
  };

  const toggleActive = async (serial: any) => {
    try {
      await updateDoc(doc(db, 'serials', serial.id), {
        isActive: !(serial.isActive ?? true)
      });
    } catch (err: any) {
      console.error(err);
      alert('تعذر تغيير الحالة: ' + err.message);
    }
  };

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
              <div className="flex flex-col gap-3 py-2">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold text-[15px] text-primary-dark tracking-wide">{serial.code || 'XXXX-XXXX-XXXX'}</div>
                    <div className="text-[13px] text-gray-500 mt-1 flex items-center gap-2">
                      <span>{serial.clientName || 'غير مخصص'}</span>
                      <span>•</span>
                      <span>{serial.duration || 'شهر'}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className={\`text-[11px] font-bold px-3 py-1.5 rounded-full \${serial.isActive ? 'bg-icon-green/10 text-icon-green' : 'bg-red-500/10 text-red-500'}\`}>
                      {serial.isActive ? 'مفعل' : 'موقوف'}
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end gap-2 border-t border-gray-50 pt-2">
                  <button onClick={() => toggleActive(serial)} className={\`text-[12px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg \${serial.isActive ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50'}\`}>
                    {serial.isActive ? <ShieldBan className="w-3 h-3" /> : <CheckCircle className="w-3 h-3" />}
                    {serial.isActive ? 'إيقاف السيريال' : 'تنشيط السيريال'}
                  </button>
                  
                  {deleteConfirmId === serial.id ? (
                    <div className="flex gap-1">
                      <button onClick={() => deleteSerial(serial.id)} className="text-[12px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg">تأكيد</button>
                      <button onClick={() => setDeleteConfirmId(null)} className="text-[12px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">إلغاء</button>
                    </div>
                  ) : (
                    <button onClick={() => setDeleteConfirmId(serial.id)} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </button>
                  )}
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
`;

fs.writeFileSync('src/pages/Serials.tsx', content);
