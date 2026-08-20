import fs from 'fs';
let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

// Update imports if needed
if (!content.includes('ChevronLeft')) {
  content = content.replace(/import { (.*) } from 'lucide-react';/, "import { $1, ChevronLeft } from 'lucide-react';");
}

content = content.replace(
  `  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 pb-20">
      <div className="pt-6">
        <button 
          onClick={() => navigate('/clients')}
          className="flex items-center gap-2 text-gray-500 hover:text-primary transition-colors font-bold text-[14px]"
        >
          <ArrowRight className="w-5 h-5" />
          العودة للعملاء
        </button>
      </div>
      <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">`,
  `  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate('/clients')} className="p-2 active:scale-95 transition-transform">
          <ArrowRight className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">ملف العميل</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Client Info Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] overflow-hidden">`
);

content = content.replace(
  `        </div>
        
        {/* Device Information */}`,
  `        </div>
      </div>
      
      <div className="px-4 space-y-4">
        {/* Device Information Card */}`
);

content = content.replace(
  `          )}
        </div>
        
        {/* Audit Log */}`,
  `          )}
        </div>

        {/* Audit Log Card */}`
);

content = content.replace(
  `        {/* Device Information Card */}
        <div className="p-6 md:p-8 border-b border-gray-100">`,
  `        {/* Device Information Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">`
);

content = content.replace(
  `        {/* Audit Log Card */}
        <div className="p-6 md:p-8">`,
  `        {/* Audit Log Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">`
);

content = content.replace(
  `              {client.auditLog.map((log: any, i: number) => (`,
  `              {client.auditLog.slice(0, 5).map((log: any, i: number) => (`
);

content = content.replace(
  `                  {i !== client.auditLog.length - 1 && (`,
  `                  {i !== Math.min(client.auditLog.length, 5) - 1 && (`
);

// Format main card
content = content.replace(
  `        <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-teal-start flex items-center justify-center text-white font-black text-[32px] shrink-0 shadow-sm">
            {client.name?.charAt(0) || '?'}
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-2xl font-black text-primary-dark">{client.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-[14px] text-gray-500">`,
  `        <div className="pt-8 pb-6 px-6 flex flex-col items-center relative text-center">
          <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-r from-teal-start/10 to-purple-end/10" />
          <div className="absolute top-4 right-4 z-10">
            <StatusBadge status={currentStatus} />
          </div>
          
          <div className="w-[84px] h-[84px] rounded-full bg-gradient-to-tr from-teal-start to-purple-end text-white text-[32px] font-black flex items-center justify-center z-10 shadow-lg border-4 border-white mb-4">
            {client.name?.charAt(0) || '?'}
          </div>
          
          <h1 className="font-black text-[22px] text-primary-dark z-10">{client.name}</h1>
          <div className="flex flex-col items-center gap-2 mt-2 text-[14px] text-gray-500 z-10">`
);

content = content.replace(
  `            </div>
          </div>
          <StatusBadge status={currentStatus} />
        </div>`,
  `            </div>
        </div>`
);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
