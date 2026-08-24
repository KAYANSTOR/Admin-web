const fs = require('fs');

let code = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

const changeRoleFunc = `
  const promoteToAdmin = async (client: any) => {
    if (!window.confirm(\`هل أنت متأكد من ترقية \${client.name} إلى مشرف؟\nلن يظهر هذا الحساب في قائمة العملاء بعد الآن.\`)) return;
    try {
      await updateDoc(doc(db, 'users', client.id), {
        role: 'ADMIN',
        permissions: ['clients', 'licenses', 'serials', 'commissions', 'subscriptions', 'employees', 'sales']
      });
      alert('تم الترقية بنجاح!');
    } catch (e) {
      console.error(e);
      alert('حدث خطأ');
    }
  };
`;

code = code.replace(
  "const changeStatus = async (client: any, newStatus: string) => {",
  changeRoleFunc + "\n  const changeStatus = async (client: any, newStatus: string) => {"
);

const promoteButton = `
                  <button 
                    onClick={(e) => { e.stopPropagation(); promoteToAdmin(client); }}
                    className="text-[12px] font-bold text-white bg-purple-600 hover:bg-purple-700 px-2 py-1 rounded-lg transition-colors mt-1"
                  >
                    ترقية لمشرف
                  </button>
`;

code = code.replace(
  "تغيير الحالة\n                  </button>",
  "تغيير الحالة\n                  </button>" + promoteButton
);

fs.writeFileSync('src/pages/Clients.tsx', code);
