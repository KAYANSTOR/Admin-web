import fs from 'fs';
let content = fs.readFileSync('src/pages/Employees.tsx', 'utf8');

// 1. Remove window.confirm for delete and add a custom state for it
content = content.replace(
  `  const [isLoading, setIsLoading] = useState(false);`,
  `  const [isLoading, setIsLoading] = useState(false);\n  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);`
);

content = content.replace(
  `  const deleteEmployee = async (id: string, uid?: string) => {
    if (id === user?.id) return;
    if (!window.confirm('هل أنت متأكد من حذف هذا الموظف؟ (سيتم حذفه من قاعدة البيانات فقط، قد يبقى في Auth)')) return;
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error(err);
    }
  };`,
  `  const deleteEmployee = async (id: string) => {
    if (id === user?.id) return;
    try {
      await deleteDoc(doc(db, 'users', id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      alert('تعذر الحذف: ' + err.message);
    }
  };`
);

// Update delete button to use the new confirm state
content = content.replace(
  `                      <button onClick={() => deleteEmployee(emp.id, emp.uid)} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">
                        <Trash2 className="w-3 h-3" />
                        حذف
                      </button>`,
  `                      {deleteConfirmId === emp.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => deleteEmployee(emp.id)} className="text-[12px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg">تأكيد</button>
                          <button onClick={() => setDeleteConfirmId(null)} className="text-[12px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">إلغاء</button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirmId(emp.id)} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">
                          <Trash2 className="w-3 h-3" />
                          حذف
                        </button>
                      )}`
);

// 2. Add error surfacing to toggleActive
content = content.replace(
  `  const toggleActive = async (employee: any) => {
    if (employee.id === user?.id) return;
    try {
      await updateDoc(doc(db, 'users', employee.id), {
        isActive: !(employee.isActive ?? true)
      });
    } catch (err) {
      console.error(err);
    }
  };`,
  `  const toggleActive = async (employee: any) => {
    if (employee.id === user?.id) return;
    try {
      await updateDoc(doc(db, 'users', employee.id), {
        isActive: !(employee.isActive ?? true)
      });
    } catch (err: any) {
      console.error(err);
      alert('تعذر تغيير الحالة: ' + err.message);
    }
  };`
);

// 3. Add error surfacing to handleSave
content = content.replace(
  `    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        alert('رقم الجوال مسجل مسبقاً في النظام.');
      }
    } finally {`,
  `    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        alert('رقم الجوال مسجل مسبقاً في النظام.');
      } else {
        alert('حدث خطأ أثناء الحفظ: ' + (err.message || 'خطأ غير معروف'));
      }
    } finally {`
);

// Fix button UI in the modal
content = content.replace(
  `              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button type="button" onClick={() => setNewRole('STAFF')} className={\`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all \${newRole === 'STAFF' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}\`}>موظف</button>
                <button type="button" onClick={() => setNewRole('ADMIN')} className={\`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all \${newRole === 'ADMIN' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}\`}>مدير نظام</button>
              </div>`,
  `              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl relative z-10">
                <button type="button" onClick={() => setNewRole('STAFF')} className={\`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all \${newRole === 'STAFF' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}\`}>موظف</button>
                <button type="button" onClick={() => setNewRole('ADMIN')} className={\`flex-1 py-2 rounded-lg text-[13px] font-bold transition-all \${newRole === 'ADMIN' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}\`}>مدير نظام</button>
              </div>`
);

fs.writeFileSync('src/pages/Employees.tsx', content);
