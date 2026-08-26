const fs = require('fs');

let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

// I need to add back the missing divs. The regex replaced:
// </div></div>);}
// We can just find the end of the file and append the missing </div></div> if they are missing.
// The file currently ends with:
/*
      )}
    </div>
  );
}
*/
// Let's count the divs or just replace the end.
// Actually, looking at the grep, it replaced:
// </div> </div> ); } with modalUI.
// The modalUI string was:
// {isEditModalOpen && ( ... )} </div> ); }
// So it replaced TWO closing divs with ONE closing div.
// Let's replace the last `</div> ); }` with `</div> </div> </div> ); }` until the JSX is balanced.

const replacement = `
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
    </div>
  );
}
`;

content = content.replace(/\{isEditModalOpen && \([\s\S]*?\}\s*\)\}\s*<\/div>\s*\);\s*\}/, replacement.trim());
fs.writeFileSync('src/pages/ClientProfile.tsx', content);
