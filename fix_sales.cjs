const fs = require('fs');
let code = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

// Add state
code = code.replace(
  "const [loading, setLoading] = useState(true);",
  "const [loading, setLoading] = useState(true);\n  const [indexError, setIndexError] = useState<string | null>(null);"
);

// Add catch block
code = code.replace(
  "} catch (e) {",
  "} catch (e: any) {\n        if (e.message && e.message.includes('requires a COLLECTION_GROUP_DESC index')) {\n          const match = e.message.match(/https:\\/\\/console\\.firebase\\.google\\.com[^\\s]*/);\n          if (match) setIndexError(match[0]);\n        }"
);

// Add UI
const errorUI = `
      {indexError && (
        <div className="px-6 relative z-10 mb-6">
          <div className="p-4 bg-red-50 text-red-700 rounded-2xl border border-red-100 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
            <h3 className="font-bold mb-2">تنبيه: مطلوب إعداد فهرس لقاعدة البيانات</h3>
            <p className="text-sm mb-3">لعرض المبيعات بشكل صحيح، يرجى إنشاء الفهرس المطلوب بالضغط على الرابط التالي:</p>
            <a href={indexError} target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline break-all text-[13px] block p-3 bg-white rounded-xl border border-red-100">
              إنشاء الفهرس الآن
            </a>
          </div>
        </div>
      )}
`;

code = code.replace(
  "<div className=\"px-6 -mt-6 relative z-10\">",
  errorUI + "\n      <div className=\"px-6 -mt-6 relative z-10\">"
);

fs.writeFileSync('src/pages/Sales.tsx', code);
