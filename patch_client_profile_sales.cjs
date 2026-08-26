const fs = require('fs');

function patchSalesList(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Specific regex for ClientProfile
  const oldUi = `<div className="font-bold text-\\[14px\\] text-primary-dark">بطاقة: \\{sale\\.cardId \\|\\| 'غير معروف'\\}</div>\\s*<div className="text-\\[12px\\] text-gray-500 flex gap-2">\\s*<span>\\{sale\\.createdAt \\? format\\(new Date\\(sale\\.createdAt\\), 'dd/MM HH:mm'\\) : ''\\}</span>\\s*<span>•</span>\\s*<span>الزبون: \\{sale\\.customerId\\}</span>\\s*</div>`;
  const newUi = `<div className="font-bold text-[14px] text-primary-dark flex items-center gap-2">
                      <span>بطاقة: {sale.cardId || '-'}</span>
                      {sale.categoryId && <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{sale.categoryId}</span>}
                    </div>
                    <div className="text-[12px] text-gray-500 flex flex-wrap gap-2 mt-1">
                      <span>{sale.createdAt ? format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm') : ''}</span>
                      <span>•</span>
                      <span dir="ltr">الزبون: {sale.customerId || '-'}</span>
                      {sale.saleType && <><span>•</span><span className="text-primary">{sale.saleType}</span></>}
                    </div>
                    <div className="text-[11px] text-gray-400 flex flex-wrap gap-x-3 gap-y-1 mt-1">
                      {sale.transactionId && <span>رقم العملية: {sale.transactionId}</span>}
                      {sale.posId && <span>نقاط البيع: {sale.posId}</span>}
                      {sale.smsMessageId && <span>SMS: {sale.smsMessageId}</span>}
                    </div>`;

  const oldRightUi = `<div className="font-black text-\\[15px\\] text-primary-dark">\\{sale\\.faceValue \\|\\| 0\\} ري</div>\\s*<div className={\`text-\\[11px\\] font-bold \\$\\{sale\\.status === 'COMPLETED' \\? 'text-green-600' : 'text-orange-600'\\}\`}>\\s*\\{sale\\.status === 'COMPLETED' \\? 'مكتمل' : sale\\.status\\}\\s*</div>`;
  const newRightUi = `<div className="text-left">
                      <div className="font-black text-[15px] text-primary-dark">{sale.faceValue || 0} ري</div>
                      {sale.netAmount !== undefined && <div className="text-[11px] text-gray-500">الصافي: {sale.netAmount}</div>}
                      {sale.commission !== undefined && <div className="text-[11px] text-teal-600">عمولة: {sale.commission}</div>}
                    </div>
                    <div className={\`text-[11px] font-bold text-center px-2 py-1 rounded-lg mt-1 \${sale.status === 'COMPLETED' ? 'bg-green-50 text-green-600' : sale.status === 'ROLLED_BACK' ? 'bg-red-50 text-red-600' : 'bg-orange-50 text-orange-600'}\`}>
                      {sale.status === 'COMPLETED' ? 'مكتمل' : sale.status === 'ROLLED_BACK' ? 'مسترجع' : sale.status === 'SMS_PENDING' ? 'قيد الـ SMS' : sale.status}
                    </div>`;

  // Apply regexes safely
  let patched = content.replace(new RegExp(oldUi, 'g'), newUi);
  patched = patched.replace(new RegExp(oldRightUi, 'g'), newRightUi);
  
  if (patched !== content) {
    fs.writeFileSync(filePath, patched);
    console.log('Patched ' + filePath);
  } else {
    console.log('Failed to match ' + filePath);
  }
}

patchSalesList('src/pages/ClientProfile.tsx');
