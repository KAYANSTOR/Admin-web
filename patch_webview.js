import fs from 'fs';
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// Update State
content = content.replace(
  `  // States for WebView URL\n  const [webViewUrl, setWebViewUrl] = useState('');`,
  `  // States for WebView URL\n  const [webViewUrl, setWebViewUrl] = useState('');\n  const [webViewPlacement, setWebViewPlacement] = useState('MAIN_SCREEN');`
);

// Update Fetch
content = content.replace(
  `          if (data.WebView_URL) setWebViewUrl(data.WebView_URL);`,
  `          if (data.WebView_Config) {\n            setWebViewUrl(data.WebView_Config.url || '');\n            setWebViewPlacement(data.WebView_Config.placement || 'MAIN_SCREEN');\n          } else if (data.WebView_URL) {\n            setWebViewUrl(data.WebView_URL);\n          }`
);

// Update Save logic
content = content.replace(
  `      await setDoc(doc(db, 'settings', 'app_settings'), {\n        WebView_URL: webViewUrl\n      }, { merge: true });`,
  `      await setDoc(doc(db, 'settings', 'app_settings'), {\n        WebView_Config: {\n          url: webViewUrl,\n          placement: webViewPlacement\n        }\n      }, { merge: true });`
);

// Update UI
content = content.replace(
  `          <form onSubmit={handleSaveUrl} className="space-y-4">\n            <div>\n              <input \n                required \n                type="url" \n                dir="ltr"\n                placeholder="https://example.com" \n                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-left text-[14px]" \n                value={webViewUrl} \n                onChange={e => setWebViewUrl(e.target.value)} \n              />\n            </div>`,
  `          <form onSubmit={handleSaveUrl} className="space-y-4">\n            <div>\n              <label className="block text-[13px] font-bold text-gray-700 mb-2">رابط الويب (URL)</label>\n              <input \n                required \n                type="url" \n                dir="ltr"\n                placeholder="https://example.com" \n                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-left text-[14px]" \n                value={webViewUrl} \n                onChange={e => setWebViewUrl(e.target.value)} \n              />\n            </div>\n\n            <div>\n              <label className="block text-[13px] font-bold text-gray-700 mb-2">مكان الظهور في التطبيق</label>\n              <select\n                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] appearance-none cursor-pointer"\n                value={webViewPlacement}\n                onChange={e => setWebViewPlacement(e.target.value)}\n              >\n                <option value="MAIN_SCREEN">في الشاشة الرئيسية</option>\n                <option value="SIDEBAR_MENU">كعنصر في القائمة الجانبية</option>\n                <option value="OFFERS_SCREEN">في شاشة العروض</option>\n              </select>\n            </div>`
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
