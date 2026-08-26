const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

const updateWarningCode = `
  const updateWarning = async () => {
    if (!client) return;
    const msg = window.prompt('أدخل رسالة التحذير للعميل (اتركها فارغة للإزالة):', client.warning_message || '');
    if (msg === null) return;
    
    setIsUpdating(true);
    try {
      await updateDoc(doc(db, 'users', client.id), {
        warning_message: msg.trim()
      });
    } catch (e) {
      console.error(e);
      alert('حدث خطأ أثناء حفظ الرسالة');
    } finally {
      setIsUpdating(false);
    }
  };
`;

const btnHtml = `
            {client.warning_message && (
              <div className="mt-2 p-3 bg-orange-50 rounded-lg flex items-start justify-between gap-2 text-orange-700 cursor-pointer hover:bg-orange-100 transition-colors" onClick={updateWarning}>
                <div className="flex gap-2">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span className="text-[13px]">{client.warning_message}</span>
                </div>
              </div>
            )}
            {!client.warning_message && (
               <button onClick={updateWarning} className="mt-2 text-[12px] text-gray-500 hover:text-primary text-right underline">
                 + إضافة رسالة تحذير
               </button>
            )}
`;

content = content.replace(/const renewSubscription = async \(\) => {/, updateWarningCode + '\n  const renewSubscription = async () => {');
content = content.replace(/\{client\.warning_message && \([\s\S]*?\}\)/, btnHtml);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
