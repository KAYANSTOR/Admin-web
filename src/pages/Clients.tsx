import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, setDoc, doc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { secondaryAuth } from '../lib/firebase';
import { db } from '../lib/firebase';
import { ArrowLeft, Search, Plus, Phone, Building2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Clients() {
  const [clients, setClients] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [search, setSearch] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [statusModalOpen, setStatusModalOpen] = useState<any>(null);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newStore, setNewStore] = useState('');
  const [newCommission, setNewCommission] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab) setActiveTab(parseInt(tab));
  }, [location]);

  useEffect(() => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(doc => {
        const d = { id: doc.id, ...doc.data() };
        if (d.role === 'NETWORK_OWNER' || (!d.role && d.storeName)) {
           data.push(d);
        }
      });
      data.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
      setClients(data);
    });
  }, []);

  const getClientStatus = (client: any) => {
    if (client.status) return client.status;
    return client.isActive ? 'ACTIVE' : 'SUSPENDED';
  };

  const isClientActive = (client: any) => {
    const s = getClientStatus(client);
    return ['ACTIVE', 'WARNING', 'GRACE_PERIOD'].includes(s);
  };

  const filteredClients = clients
    .filter(c => (activeTab === 0 ? isClientActive(c) : !isClientActive(c)))
    .filter(c => 
      c.name?.toLowerCase().includes(search.toLowerCase()) || 
      c.phone?.includes(search)
    );

  
  const handleCreateClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim() || !newPassword.trim() || !newEmail.trim()) return;
    try {
      const userCred = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: newName,
        phone: newPhone,
        email: newEmail,
        storeName: newStore,
        status: 'ACTIVE',
        isActive: true, // legacy
        is_active: true, // new Android requirement
        commissionPercentage: parseFloat(newCommission) || 0,
        commission_rate: parseFloat(newCommission) || 0, // new Android requirement
        role: 'NETWORK_OWNER',
        createdAt: serverTimestamp(),
        deviceLimit: 3
      });
      await secondaryAuth.signOut();
      setIsCreateModalOpen(false);
      setNewName(''); setNewPhone(''); setNewStore(''); setNewCommission(''); setNewPassword(''); setNewEmail('');
    } catch (err: any) {
      alert('خطأ في إنشاء الحساب: ' + err.message);
      console.error(err);
    }
  };

  
  const changeStatus = async (client: any, newStatus: string) => {
    try {
      const isActive = ['ACTIVE', 'WARNING', 'GRACE_PERIOD'].includes(newStatus);
      await updateDoc(doc(db, 'users', client.id), {
        status: newStatus,
        isActive: isActive,
        is_active: isActive // new Android requirement
      });
      setStatusModalOpen(null);
    } catch (err) {
      console.error(err);
    }
  };

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
      <div className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles[status] || styles['ACTIVE']}`}>
        {labels[status] || 'نشط'}
      </div>
    );
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate('/dashboard')} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إدارة العملاء</h1>
        <button onClick={() => setIsCreateModalOpen(true)} className="p-2 active:scale-95 transition-transform">
          <Plus className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="بحث بالاسم أو الرقم..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-10 pl-4 py-3 bg-white border border-gray-100 rounded-[16px] shadow-sm outline-none focus:ring-1 focus:ring-primary focus:border-primary text-[14px]"
          />
        </div>

        <div className="flex bg-gray-200/50 rounded-xl p-1">
          <button 
            onClick={() => setActiveTab(0)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 0 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            النشطين
          </button>
          <button 
            onClick={() => setActiveTab(1)}
            className={`flex-1 py-2 text-[14px] font-bold rounded-lg transition-colors ${activeTab === 1 ? 'bg-white text-primary shadow-sm' : 'text-gray-500'}`}
          >
            غير النشطين
          </button>
        </div>

        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {filteredClients.length > 0 ? filteredClients.map((client, i) => (
            <React.Fragment key={client.id}>
              <div className="flex justify-between items-center py-1">
                <div 
                  className="flex items-center gap-3 flex-1 cursor-pointer"
                  onClick={() => navigate(`/clients/${client.id}`)}
                >
                  <div className="w-[44px] h-[44px] rounded-full bg-teal-start flex items-center justify-center text-white font-bold text-[18px]">
                    {client.name?.charAt(0) || '?'}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-primary-dark">{client.name || 'عميل غير مسمى'}</div>
                    <div className="text-[13px] text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3" />
                      <span dir="ltr">{client.phone}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <StatusBadge status={getClientStatus(client)} />
                  <button 
                    onClick={(e) => { e.stopPropagation(); setStatusModalOpen(client); }}
                    className="text-[12px] font-bold text-primary bg-primary/5 px-2 py-1 rounded-lg"
                  >
                    تغيير الحالة
                  </button>
                </div>
              </div>
              {i < filteredClients.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          )) : (
            <div className="text-center py-8 text-gray-500 text-[14px]">لا يوجد عملاء.</div>
          )}
        </div>
      </div>

      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-6 text-center">إضافة عميل جديد</h2>
            <form onSubmit={handleCreateClient} className="space-y-4">
              <input required type="text" placeholder="اسم العميل" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={newName} onChange={e => setNewName(e.target.value)} />
              <input required type="tel" placeholder="رقم الهاتف" dir="ltr" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-right text-[14px]" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              <input type="text" placeholder="اسم المتجر (اختياري)" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={newStore} onChange={e => setNewStore(e.target.value)} />
              <input type="number" step="0.01" min="0" max="100" placeholder="نسبة العمولة (%)" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={newCommission} onChange={e => setNewCommission(e.target.value)} />
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px]">إضافة</button>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {statusModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-4 text-center">تغيير حالة العميل</h2>
            <div className="text-center text-[14px] text-gray-500 mb-6">{statusModalOpen.name}</div>
            
            <div className="space-y-2">
              {[
                { val: 'ACTIVE', label: 'نشط', classes: 'bg-icon-green/10 text-icon-green' },
                { val: 'WARNING', label: 'إنذار', classes: 'bg-yellow-500/10 text-yellow-600' },
                { val: 'GRACE_PERIOD', label: 'فترة سماح', classes: 'bg-icon-orange/10 text-icon-orange' },
                { val: 'OVERDUE', label: 'متأخر', classes: 'bg-red-500/10 text-red-500' },
                { val: 'SUSPENDED', label: 'موقوف', classes: 'bg-gray-500/10 text-gray-500' },
              ].map(s => (
                <button
                  key={s.val}
                  onClick={() => changeStatus(statusModalOpen, s.val)}
                  className={`w-full py-3 rounded-xl font-bold text-[14px] ${s.classes} ${getClientStatus(statusModalOpen) === s.val ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
            
            <button 
              onClick={() => setStatusModalOpen(null)} 
              className="w-full mt-4 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]"
            >
              إلغاء
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
