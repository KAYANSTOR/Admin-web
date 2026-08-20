import fs from 'fs';
let content = fs.readFileSync('src/pages/Employees.tsx', 'utf8');

// The issue might be related to Firestore rules or how the click event is propagating
content = content.replace(
  `                          <button onClick={() => deleteEmployee(emp.id)} className="text-[12px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg">تأكيد</button>`,
  `                          <button onClick={async (e) => { e.stopPropagation(); await deleteEmployee(emp.id); }} className="text-[12px] font-bold text-white bg-red-500 px-3 py-1.5 rounded-lg">تأكيد</button>`
);

content = content.replace(
  `                          <button onClick={() => setDeleteConfirmId(null)} className="text-[12px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">إلغاء</button>`,
  `                          <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(null); }} className="text-[12px] font-bold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-lg">إلغاء</button>`
);

content = content.replace(
  `                        <button onClick={() => setDeleteConfirmId(emp.id)} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">`,
  `                        <button onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(emp.id); }} className="text-[12px] font-bold text-red-500 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50">`
);

// We should also check the actual delete function to make sure it's not failing silently
content = content.replace(
  `    try {
      await deleteDoc(doc(db, 'users', id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error(err);
      alert('تعذر الحذف: ' + err.message);
    }`,
  `    try {
      await deleteDoc(doc(db, 'users', id));
      setDeleteConfirmId(null);
    } catch (err: any) {
      console.error("Delete Error details:", err);
      if (err.code === 'permission-denied') {
         alert('تعذر الحذف: الصلاحيات لا تسمح لك بحذف هذا المستخدم.');
      } else {
         alert('تعذر الحذف: ' + (err.message || 'خطأ غير معروف'));
      }
      setDeleteConfirmId(null);
    }`
);

fs.writeFileSync('src/pages/Employees.tsx', content);
