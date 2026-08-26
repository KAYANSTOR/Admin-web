const fs = require('fs');

let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

const deleteCode = `
  const handleDeleteClient = async () => {
    if (!client) return;
    const confirm = window.prompt('تنبيه خطير: سيتم حذف جميع بيانات العميل من قاعدة البيانات (بما فيها ملفه الأساسي). لا يمكن التراجع عن هذه العملية! اكتب "حذف" للتأكيد:');
    if (confirm !== 'حذف') return;
    
    setIsUpdating(true);
    try {
      await deleteDoc(doc(db, 'users', client.id));
      // NOTE: Firebase Auth user must be deleted from Firebase Console or via Cloud Function
      alert('تم حذف العميل بنجاح. تذكر حذف حسابه من Firebase Authentication يدوياً إذا أردت منعه من تسجيل الدخول نهائياً.');
      navigate('/clients');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء الحذف');
      setIsUpdating(false);
    }
  };
`;
// We also need deleteDoc from firestore. Let's make sure it's imported.
content = content.replace(/import \{ doc, onSnapshot, collection, query, orderBy, getDocs, updateDoc \} from 'firebase\/firestore';/, "import { doc, onSnapshot, collection, query, orderBy, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';");

content = content.replace(/const toggleStatus = async \(\) => \{/, deleteCode + '\n  const toggleStatus = async () => {');

const deleteBtnUI = `
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button 
              onClick={toggleStatus}
              disabled={isUpdating}
              className={\`flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[14px] transition-colors \${client.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}\`}
            >
              {client.is_active ? <ShieldOff className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              {client.is_active ? 'إيقاف الحساب' : 'تنشيط الحساب'}
            </button>
            <button 
              onClick={handleDeleteClient}
              disabled={isUpdating}
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-[14px] transition-colors bg-red-100 text-red-700 hover:bg-red-200"
            >
              حذف نهائي
            </button>
          </div>
`;
content = content.replace(/<button\s*onClick=\{toggleStatus\}[\s\S]*?<\/button>\s*<\/div>/, deleteBtnUI.trim());

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
