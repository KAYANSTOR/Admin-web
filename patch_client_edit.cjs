const fs = require('fs');

let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

// Add state variables for Edit Modal
const importRegex = /export default function ClientProfile\(\) \{/;
const stateVars = `
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCommission, setEditCommission] = useState('');
  
  const openEditModal = () => {
    if (!client) return;
    setEditName(client.name || '');
    setEditPhone(client.phone || '');
    setEditCommission(client.commission_rate?.toString() || '0');
    setIsEditModalOpen(true);
  };
  
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', client.id), {
        name: editName.trim(),
        phone: editPhone.trim(),
        commission_rate: parseFloat(editCommission) || 0
      });
      // Update network metadata as well
      await updateDoc(doc(db, 'networks', client.id, '_metadata', 'info'), {
        name: editName.trim(),
        phoneNumber: editPhone.trim()
      }).catch(err => console.log('Network info might not exist yet, ignoring...', err));
      setIsEditModalOpen(false);
    } catch (err) {
      console.error(err);
      alert('حدث خطأ أثناء حفظ البيانات');
    } finally {
      setIsUpdating(false);
    }
  };
`;
content = content.replace(importRegex, 'export default function ClientProfile() {' + stateVars);

// Add Edit Button in the UI header
const headerRegex = /<h1 className="text-2xl font-black">\{client\.name\}<\/h1>/;
const headerReplacement = `<div className="flex items-center gap-3">
              <h1 className="text-2xl font-black">{client.name}</h1>
              <button onClick={openEditModal} className="bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                تعديل البيانات
              </button>
            </div>`;
content = content.replace(headerRegex, headerReplacement);

// Add the Modal UI at the bottom
const modalUI = `
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-[24px] w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h2 className="font-black text-[18px] text-primary-dark mb-4 text-center">تعديل بيانات العميل</h2>
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">اسم العميل</label>
                <input required type="text" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={editName} onChange={e => setEditName(e.target.value)} disabled={isUpdating} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">رقم الهاتف</label>
                <input required type="tel" dir="ltr" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-right text-[14px]" value={editPhone} onChange={e => setEditPhone(e.target.value)} disabled={isUpdating} />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">نسبة العمولة (%)</label>
                <input required type="number" step="0.01" min="0" max="100" className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" value={editCommission} onChange={e => setEditCommission(e.target.value)} disabled={isUpdating} />
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" disabled={isUpdating} className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] disabled:opacity-50">
                  {isUpdating ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
                <button type="button" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating} className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px] disabled:opacity-50">إلغاء</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
`;
content = content.replace(/<\/div>\s*<\/div>\s*\);\s*\}/, modalUI);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
