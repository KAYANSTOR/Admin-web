import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { createUserWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db, secondaryAuth } from '../lib/firebase';
import { ArrowLeft, Plus, Shield, User, Trash2, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ALL_PERMISSIONS = [
  { id: 'clients', label: 'العملاء' },
  { id: 'serials', label: 'السيريالات' },
  { id: 'commissions', label: 'العمولات' },
  { id: 'subscriptions', label: 'الاشتراكات' },
  { id: 'employees', label: 'الموظفين' },
  { id: 'sales', label: 'المبيعات' },
  { id: 'settings', label: 'إعدادات التطبيق' },
  { id: 'notifications', label: 'إدارة التنبيهات' },
];

export default function Employees() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState<any>(null);
  
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPin, setNewPin] = useState('');
  const [newRole, setNewRole] = useState('STAFF');
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [modalError, setModalError] = useState('');
  
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.role !== 'ADMIN' && !user.permissions?.includes('employees')) {
      navigate('/dashboard');
      return;
    }

    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
      const data: any[] = [];
      snapshot.forEach(d => {
        const u: any = { ...d.data(), id: d.id };
        if (u.role === 'ADMIN' || u.role === 'STAFF') {
          data.push(u);
        }
      });
      setEmployees(data);
    });
  }, [user, navigate]);

  const openCreateModal = () => {
    setEditingEmp(null);
    setNewName('');
    setNewPhone('');
    setNewPin('');
    setNewRole('STAFF');
    setNewPermissions([]);
    setIsModalOpen(true);
  };

  const openEditModal = (emp: any) => {
    setEditingEmp(emp);
    setNewName(emp.name || '');
    setNewPhone(emp.phone || '');
    setNewPin(emp.pin || '');
    setNewRole(emp.role || 'STAFF');
    setNewPermissions(emp.permissions || []);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone || newPin.length !== 4) return;
    setIsLoading(true);
    
    try {
      if (editingEmp) {
        // Edit existing user in Firestore
        await updateDoc(doc(db, 'users', editingEmp.id), {
          name: newName,
          phone: newPhone,
          pin: newPin,
          role: newRole,
          permissions: newRole === 'ADMIN' ? ALL_PERMISSIONS.map(p => p.id) : newPermissions,
        });
      } else {
        // Create new user in Firebase Auth using the secondary app
        const email = `${newPhone}@kayansoft.com`;
        const password = `${newPin}kayan`;
        
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        
        // Store in Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: newName,
          phone: newPhone,
          pin: newPin,
          role: newRole,
          permissions: newRole === 'ADMIN' ? ALL_PERMISSIONS.map(p => p.id) : newPermissions,
          isActive: true,
          createdAt: serverTimestamp(),
        });

        // Sign out of secondary app just in case
        await secondaryAuth.signOut();
      }
      
      setIsModalOpen(false);
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setModalError('رقم الجوال مسجل مسبقاً في النظام.');
      } else {
        console.error(err);
        setModalError('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ غير معروف'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const togglePermission = (id: string) => {
    setNewPermissions(prev => 
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const toggleActive = async (employee: any) => {
    if (employee.id === user?.id) return;
    try {
      await updateDoc(doc(db, 'users', employee.id), {
        isActive: !(employee.isActive ?? true)
      });
    } catch (err: any) {
      console.error(err);
      setErrorMsg('تعذر تغيير الحالة: ' + err.message);
    }
  };

  const deleteEmployee = async (id: string) => {
    if (id === user?.id) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error("Delete Error details:", err);
      if (err.code === 'permission-denied') {
         setErrorMsg('تعذر الحذف: الصلاحيات لا تسمح لك بحذف هذا المستخدم.');
      } else {
         setErrorMsg('تعذر الحذف: ' + (err.message || 'خطأ غير معروف'));
      }
      setDeleteConfirmId(null);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إدارة الموظفين</h1>
        <button onClick={openCreateModal} className="p-2 active:scale-95 transition-transform">
          <Plus className="w-6 h-6 text-primary" />
        </button>
      </div>

      {errorMsg && (
        <div className="m-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-[14px] text-center font-bold relative">
          <button onClick={() => setErrorMsg('')} className="absolute left-2 top-2 text-red-400">
            <X className="w-4 h-4" />
          </button>
          {errorMsg}
        </div>
      )}

      <div className="p-4 space-y-4">
        <div className="bg-white rounded-[20px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-4 space-y-4">
          {employees.map((emp, i) => {
            const isActive = emp.isActive ?? true;
            return (
              <React.Fragment key={emp.id}>
                <div className={`flex flex-col gap-3 py-2 transition-opacity ${!isActive ? 'opacity-60 grayscale-[50%]' : ''}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-[44px] h-[44px] rounded-full flex items-center justify-center font-bold text-[18px] ${emp.role === 'ADMIN' ? 'bg-primary/10 text-primary' : 'bg-gray-100 text-gray-600'}`}>
                        {emp.name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[15px] text-primary-dark flex items-center gap-1">
                          {emp.name}
                          {emp.id === user?.id && <span className="text-[10px] bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded-full ml-1">أنت</span>}
                          {!isActive && <span className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full ml-1">موقوف</span>}
                        </div>
                        <div className="text-[13px] text-gray-500 mt-1 dir-ltr text-right">{emp.phone}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className={`text-[11px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 ${emp.role === 'ADMIN' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600'}`}>
                        {emp.role === 'ADMIN' ? <Shield className="w-3 h-3" /> : <User className="w-3 h-3" />}
                        {emp.role === 'ADMIN' ? 'مدير نظام' : 'موظف'}
                      </div>
                      
                      <button onClick={() => openEditModal(emp)} className="p-2 text-gray-400 hover:text-primary transition-colors bg-gray-50 rounded-full">
                        <Edit2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  {emp.id !== user?.id && (
                    <div className="flex justify-end gap-2 border-t border-gray-50 pt-2">
                      <button onClick={() => toggleActive(emp)} className={`text-[12px] font-bold flex items-center gap-1 px-3 py-1.5 rounded-lg ${isActive ? 'text-orange-500 bg-orange-50' : 'text-green-600 bg-green-50'}`}>
                        {isActive ? 'إيقاف الحساب' : 'تنشيط الحساب'}
                      </button>
                      {deleteConfirmId === emp.id ? (
                        <div className="flex gap-1">
                          <button onClick={async (e) => { e.stopPropagation(); await deleteEmployee(emp.id); }} className="text-[12px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg">تأكيد</button>
                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} className="text-[12px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(emp.id); }} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {i < employees.length - 1 && <div className="h-[1px] bg-gray-100" />}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto scrollbar-hide">
            <h2 className="font-black text-[18px] text-primary-dark mb-6 text-center">
              {editingEmp ? 'تعديل بيانات الموظف' : 'إضافة موظف جديد'}
            </h2>
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm text-center font-bold">
                {modalError}
              </div>
            )}
            <form onSubmit={handleSave} className="space-y-4">
              <input required type="text" placeholder="الاسم كامل" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={newName} onChange={e => setNewName(e.target.value)} />
              <input required type="tel" dir="ltr" disabled={!!editingEmp} placeholder="رقم الجوال" className={`w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:border-primary text-right text-[14px] ${editingEmp ? 'bg-gray-100 text-gray-500' : 'bg-app-bg'}`} value={newPhone} onChange={e => setNewPhone(e.target.value)} />
              
              <div>
                <input required type="password" disabled={!!editingEmp} maxLength={4} inputMode="numeric" dir="ltr" placeholder="رمز الدخول (4 أرقام)" className={`w-full p-3.5 border border-gray-200 rounded-xl outline-none focus:border-primary text-center tracking-[0.5em] text-[14px] ${editingEmp ? 'bg-gray-100 text-gray-500' : 'bg-app-bg'}`} value={newPin} onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))} />
                {editingEmp && <p className="text-[11px] text-gray-400 mt-1 text-center">لا يمكن تغيير رمز الدخول بعد الإنشاء لدواعي أمنية.</p>}
              </div>
              
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl relative z-10">
                <button type="button" onClick={() => setNewRole('STAFF')} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${newRole === 'STAFF' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}>موظف</button>
                <button type="button" onClick={() => setNewRole('ADMIN')} className={`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all ${newRole === 'ADMIN' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}>مدير نظام</button>
              </div>

              {newRole === 'STAFF' && (
                <div className="pt-2 border-t border-gray-100">
                  <label className="block text-[13px] font-bold text-gray-700 mb-3">الصلاحيات (للموظف)</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ALL_PERMISSIONS.map(p => (
                      <div 
                        key={p.id}
                        onClick={() => togglePermission(p.id)}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer border ${newPermissions.includes(p.id) ? 'bg-primary/5 border-primary text-primary' : 'bg-gray-50 border-gray-200 text-gray-600'}`}
                      >
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${newPermissions.includes(p.id) ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                          {newPermissions.includes(p.id) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <span className="text-[12px] font-bold">{p.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isLoading} className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px]">حفظ</button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
