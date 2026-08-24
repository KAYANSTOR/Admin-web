const fs = require('fs');
let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const errorUI = `
      {/* Index Error Alert */}
      {indexError && (
        <div className="px-6 mb-6">
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
            <h3 className="font-bold mb-2">تنبيه: مطلوب إعداد فهرس لقاعدة البيانات</h3>
            <p className="text-sm mb-3">لعرض الإحصائيات بشكل صحيح، يرجى إنشاء الفهرس المطلوب (Index) بالضغط على الرابط التالي:</p>
            <a href={indexError} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline break-all text-[13px] block p-3 bg-white rounded-xl border border-red-100">
              إنشاء الفهرس الآن
            </a>
          </div>
        </div>
      )}
`;

code = code.replace(
  "{/* Hero Revenue Card */}",
  errorUI + "\n      {/* Hero Revenue Card */}"
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
