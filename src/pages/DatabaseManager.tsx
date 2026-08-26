import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, doc, deleteDoc, setDoc } from 'firebase/firestore';
import { Database, Search, Edit3, Trash2, Save, X, RefreshCw } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

export default function DatabaseManager() {
  const { user } = useAuth();
  const [collectionPath, setCollectionPath] = useState('users');
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Editor Modal State
  const [editDocData, setEditDocData] = useState<any>(null);
  const [editJson, setEditJson] = useState('');
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Dialog State
  const [dialogConfig, setDialogConfig] = useState<any>({ isOpen: false });
  const closeDialog = () => setDialogConfig({ isOpen: false });

  // Only allow ADMIN to use this feature (or you can remove this check if you want anyone to use it)
  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        عذراً، هذه الصفحة مخصصة للمدير العام فقط بسبب حساسيتها.
      </div>
    );
  }

  const fetchDocuments = async () => {
    if (!collectionPath.trim()) return;
    setLoading(true);
    setErrorMsg('');
    try {
      const snap = await getDocs(collection(db, collectionPath.trim()));
      const docsArr: any[] = [];
      snap.forEach(d => {
        docsArr.push({ id: d.id, ...d.data() });
      });
      setDocuments(docsArr);
    } catch (e: any) {
      console.error(e);
      setErrorMsg(e.message || 'حدث خطأ أثناء جلب البيانات. تأكد من صحة مسار المجموعة ووجود صلاحيات.');
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const openEditor = (docObj: any) => {
    const { id, ...data } = docObj;
    setEditDocData({ id, data });
    setEditJson(JSON.stringify(data, null, 2));
    setIsEditorOpen(true);
  };

  const handleSaveDoc = async () => {
    let parsedData;
    try {
      parsedData = JSON.parse(editJson);
    } catch (e) {
      alert('صيغة JSON غير صحيحة!');
      return;
    }
    
    setIsSaving(true);
    try {
      await setDoc(doc(db, collectionPath.trim(), editDocData.id), parsedData);
      alert('تم الحفظ بنجاح');
      setIsEditorOpen(false);
      fetchDocuments(); // Refresh list
    } catch (e: any) {
      console.error(e);
      alert('خطأ أثناء الحفظ: ' + e.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDoc = (docId: string) => {
    setDialogConfig({
      isOpen: true,
      title: 'حذف مستند',
      message: `هل أنت متأكد من حذف المستند (${docId})؟ لا يمكن التراجع عن هذا الإجراء!`,
      danger: true,
      confirmText: 'حذف',
      onConfirm: async () => {
        closeDialog();
        try {
          await deleteDoc(doc(db, collectionPath.trim(), docId));
          fetchDocuments(); // Refresh list
        } catch (e: any) {
          console.error(e);
          alert('خطأ أثناء الحذف: ' + e.message);
        }
      },
      onCancel: closeDialog
    });
  };

  const filteredDocs = documents.filter(docObj => 
    docObj.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    JSON.stringify(docObj).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-app-bg min-h-full pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 px-6 pt-6 pb-12 rounded-b-[40px] relative">
        <div className="flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
            <Database className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black">مستكشف قاعدة البيانات</h1>
            <p className="text-white/80 text-sm">عرض، تعديل، وحذف البيانات الخام</p>
          </div>
        </div>
      </div>

      <div className="px-6 -mt-6 relative z-10 space-y-4">
        {/* Collection Selector */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-5">
          <label className="block text-[13px] font-bold text-gray-700 mb-2">مسار المجموعة (Collection Path)</label>
          <div className="flex gap-2">
            <input 
              type="text" 
              className="flex-1 p-3.5 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-gray-800 text-left text-[14px]" 
              dir="ltr"
              value={collectionPath} 
              onChange={e => setCollectionPath(e.target.value)} 
              placeholder="e.g. users or networks/UID/sales"
            />
            <button 
              onClick={fetchDocuments}
              disabled={loading}
              className="bg-gray-800 text-white px-5 rounded-xl font-bold hover:bg-gray-900 flex items-center justify-center disabled:opacity-50"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
          <div className="mt-3 flex gap-2 flex-wrap">
            <button onClick={() => { setCollectionPath('users'); fetchDocuments(); }} className="text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200">users</button>
            <button onClick={() => { setCollectionPath('app_settings'); fetchDocuments(); }} className="text-[11px] bg-gray-100 px-2 py-1 rounded text-gray-600 hover:bg-gray-200">app_settings</button>
          </div>
          
          {errorMsg && (
            <div className="mt-3 text-red-500 text-sm font-bold p-3 bg-red-50 rounded-lg">
              {errorMsg}
            </div>
          )}
        </div>

        {/* Data List */}
        <div className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                className="w-full pr-10 pl-3 py-3 border border-gray-200 rounded-xl outline-none focus:border-gray-800 text-[14px]"
                placeholder="بحث في المستندات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-8 text-center text-gray-500">جاري التحميل...</div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-8 text-center text-gray-500">لا توجد مستندات</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredDocs.map(docObj => (
                <div key={docObj.id} className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 overflow-hidden">
                    <div className="font-bold text-[14px] text-gray-800 mb-1 truncate" dir="ltr">{docObj.id}</div>
                    <div className="text-[12px] text-gray-500 truncate" dir="ltr">
                      {JSON.stringify(docObj).substring(0, 100)}...
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button 
                      onClick={() => openEditor(docObj)}
                      className="w-10 h-10 bg-gray-100 text-gray-700 rounded-xl flex items-center justify-center hover:bg-gray-200 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                    <button 
                      onClick={() => handleDeleteDoc(docObj.id)}
                      className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center hover:bg-red-100 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Editor Modal */}
      {isEditorOpen && editDocData && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl h-[80vh] flex flex-col shadow-xl animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-[24px]">
              <div>
                <h2 className="text-[18px] font-black text-gray-800">تعديل المستند</h2>
                <div className="text-[12px] text-gray-500 font-mono mt-1" dir="ltr">{editDocData.id}</div>
              </div>
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-300"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 p-5 overflow-hidden flex flex-col">
              <label className="block text-[13px] font-bold text-gray-700 mb-2">Raw JSON Data</label>
              <textarea 
                className="flex-1 w-full p-4 bg-gray-800 text-green-400 font-mono text-[13px] rounded-xl outline-none resize-none"
                dir="ltr"
                value={editJson}
                onChange={e => setEditJson(e.target.value)}
                spellCheck={false}
              />
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 rounded-b-[24px] flex justify-end gap-3">
              <button 
                onClick={() => setIsEditorOpen(false)}
                className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-xl font-bold text-[14px]"
              >
                إلغاء
              </button>
              <button 
                onClick={handleSaveDoc}
                disabled={isSaving}
                className="px-6 py-2.5 bg-gray-800 text-white rounded-xl font-bold text-[14px] flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التعديلات'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog {...dialogConfig} />
    </div>
  );
}
