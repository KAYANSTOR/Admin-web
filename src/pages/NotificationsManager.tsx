
import { serviceAccount } from '../config/serviceAccount';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, setDoc, addDoc, collection, serverTimestamp, getDocs, query, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, BellRing, Send, CheckCircle2, MessageSquare, Bell } from 'lucide-react';

export default function NotificationsManager() {
  const navigate = useNavigate();
  
  // Notification States
  const [notificationType, setNotificationType] = useState<'BOTH' | 'PUSH' | 'POPUP'>('BOTH');
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);

  const [clients, setClients] = useState<any[]>([]);
  useEffect(() => {
    const fetchClients = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'NETWORK_OWNER'));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setClients(list);
    };
    fetchClients();
  }, []);

  const [success, setSuccess] = useState(false);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) return;
    
    setIsLoading(true);
    try {
      const now = Date.now();
      
      // 1. إشعار النظام (عام) -> app_settings/global_config/notifications
      if (targetAudience === 'ALL') {
         await addDoc(collection(db, 'app_settings', 'global_config', 'notifications'), {
           title: title.trim(),
           message: message.trim(),
           timestamp: now
         });
      } else {
         // 2. إشعار لمستخدم فردي -> users/{UID}/notifications
         await addDoc(collection(db, 'users', targetAudience, 'notifications'), {
           title: title.trim(),
           message: message.trim(),
           timestamp: now,
           is_read: false
         });
      }

      // إضافة نافذة منبثقة (Popup) إلى إعدادات النظام الحالية إذا طُلب ذلك
      if (notificationType === 'POPUP' || notificationType === 'BOTH') {
        await setDoc(doc(db, 'app_settings', 'global_config'), {
          Current_Popup: {
            title: title.trim(),
            message: message.trim(),
            target: targetAudience,
            updatedAt: new Date().toISOString()
          }
        }, { merge: true });
      }

      setSuccess(true);
      setTitle('');
      setMessage('');
      setTimeout(() => setSuccess(false), 3000);
      
    } catch (err) {
      console.error('Error sending notification:', err);
      alert('حدث خطأ أثناء الإرسال');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إدارة التنبيهات</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-primary-dark">إرسال تنبيه جديد</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">تحديد الفئة ونوع الإشعار للعملاء</p>
            </div>
          </div>
          
          <form onSubmit={handleSendNotification} className="space-y-5">
            
            {/* Target Audience (الفئة المستهدفة) */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">الفئة المستهدفة</label>
              <select
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] appearance-none cursor-pointer font-bold text-gray-700"
                value={targetAudience}
                onChange={e => setTargetAudience(e.target.value)}
              >
                <option value="ALL">إشعار عام للجميع</option>
                <optgroup label="تخصيص لعميل محدد">
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.name || 'عميل غير مسمى'} - {c.phone}</option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Notification Type (نوع الرسالة) */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">نوع التنبيه</label>
              <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
                <button 
                  type="button" 
                  onClick={() => setNotificationType('PUSH')} 
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${notificationType === 'PUSH' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}
                >
                  <Bell className="w-4 h-4" />
                  إشعار هاتف (Push)
                </button>
                <button 
                  type="button" 
                  onClick={() => setNotificationType('POPUP')} 
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${notificationType === 'POPUP' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}
                >
                  <MessageSquare className="w-4 h-4" />
                  نافذة منبثقة (Pop-up)
                </button>
                <button 
                  type="button" 
                  onClick={() => setNotificationType('BOTH')} 
                  className={`flex-1 py-2 rounded-lg text-[12px] font-bold transition-all flex items-center justify-center gap-1.5 ${notificationType === 'BOTH' ? 'bg-white shadow-sm text-primary-dark' : 'text-gray-500'}`}
                >
                  <Send className="w-4 h-4" />
                  إرسال للاثنين
                </button>
              </div>
            </div>

            <div className="h-[1px] bg-gray-100 my-4"></div>

            {/* Title & Message */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">عنوان التنبيه</label>
              <input 
                required 
                type="text" 
                placeholder="مثال: تذكير بسداد الاشتراك!" 
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">نص التنبيه</label>
              <textarea 
                required 
                rows={4}
                placeholder="اكتب تفاصيل الرسالة هنا..." 
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] resize-none" 
                value={message} 
                onChange={e => setMessage(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${success ? 'bg-icon-green text-white' : 'bg-primary text-white disabled:opacity-50'}`}
            >
              {success ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  تم الإرسال بنجاح
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  {isLoading ? 'جاري الإرسال...' : 'إرسال التنبيه'}
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
