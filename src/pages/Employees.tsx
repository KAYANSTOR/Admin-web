import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Plus, Shield, User, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If not admin, redirect out or just show error. Handled mostly by UI not showing the link.
    if (user && user.role !== 'ADMIN') {
      navigate('/dashboard');
      return;
    }

    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(d => data.push({ id: d.id, ...d.data() }));
      setEmployees(data);
    });
  }, [user, navigate]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || newPin.length !== 4) return;
    setIsLoading(true);
    try {
      await addDoc(collection(db, 'users'), {
        name: newName,
        phone: newPhone,
        pin: newPin,
        role: newRole,
        createdAt: serverTimestamp(),
      });
      setIsModalOpen(false);
      setNewName('');
      setNewPhone('');
      setNewPin('');
      setNewRole('STAFF');
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleRole = async (employee: any) => {
    if (employee.id === user?.id) return; // Cannot change own role here easily to prevent lockout
    try {
      await updateDoc(doc(db, 'users', employee.id), {
        role: employee.role === 'ADMIN' ? 'STAFF' : 'ADMIN'
      });
    } catch (err) {
      console.error(err);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (id === user?.id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إدارة الموظفين</h1>
        <button onClick={() => setIsModalOpen(true)} className="p-2 active:scale-95 transition-transform">
          <Plus className="w-6 h-6 text-primary" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {employees.map((emp, i) => (
            <React.Fragment key={emp.id}>
              <div className="flex justify-between items-center py-2">
                <div className="flex items-center gap-3">
                  <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center font-bold text-[18px] ${emp.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                    {emp.name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-[15px] text-primary-dark flex items-center gap-1">
                      {emp.name}
                      {emp.id === user?.id && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full ml-1">أنت</span>}
                    </div>
                    <div className="text-[13px] text-gray-500 mt-1 dir-ltr text-right">{emp.phone}</div>
                  </div>
                </div>
                
                <div className="flex flex-col items-end gap-2">
                  <div 
                    onClick={() => toggleRole(emp)}
                    className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-colors ${emp.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}
                  >
                    {emp.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                    {emp.role === 'ADMIN' ? 'مدير نظام' : 'موظف'}
                  </div>
                  {emp.id !== user?.id && (
                    <button onClick={() => deleteEmployee(emp.id)} className="text-[12px] font-bold text-red-500 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      حذف
                    </button>
                  )}
                </div>
              </div>
              {i < employees.length - 1 && <div className="h-[1px] bg-gray-100" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-6 text-center">إضافة موظف جديد</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <input required type="text" placeholder="الاسم كامل" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={newName} onChange={e => setNewName(e.target.value)} />
              <input required type="tel" dir="ltr" placeholder="رقم الجوال" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-right text-[14px]" value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              <input required type="password" maxLength={4} inputMode="numeric" dir="ltr" placeholder="رمز الدخول (4 أرقام)" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-center tracking-[0.5em] text-[14px]" value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
              
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setNewRole('STAFF')} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${newRole === 'STAFF' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}>موظف</button>
                <button type="button" onClick={() => setNewRole('ADMIN')} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${newRole === 'ADMIN' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}>مدير نظام</button>
              </div>

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px]">إضافة</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
