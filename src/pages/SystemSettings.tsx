import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, storage } from '../lib/firebase';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { ArrowLeft, Link as LinkIcon, MessageSquare, Save, CheckCircle2, Image as ImageIcon, Plus, Trash2, UploadCloud, Shield } from 'lucide-react';

export default function SystemSettings() {
  const navigate = useNavigate();
  
  // States for Global App Settings
  const [isAppActive, setIsAppActive] = useState(true);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [isGlobalSaving, setIsGlobalSaving] = useState(false);
  const [globalSaveSuccess, setGlobalSaveSuccess] = useState(false);

  // States for WebView URL
  const [webViewUrl, setWebViewUrl] = useState('');
  const [webViewPlacement, setWebViewPlacement] = useState('MAIN_SCREEN');
  const [isUrlSaving, setIsUrlSaving] = useState(false);
  const [urlSaveSuccess, setUrlSaveSuccess] = useState(false);

  // States for Popup
  const [popupTitle, setPopupTitle] = useState('');
  const [popupMessage, setPopupMessage] = useState('');
  const [isPopupSaving, setIsPopupSaving] = useState(false);
  const [popupSaveSuccess, setPopupSaveSuccess] = useState(false);

  // States for Banners
  const [banners, setBanners] = useState<string[]>([]);
  const [newBannerUrl, setNewBannerUrl] = useState('');
  const [isBannerSaving, setIsBannerSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        
        const globalRef = doc(db, 'app_settings', 'global_config');
        const globalSnap = await getDoc(globalRef);
        if (globalSnap.exists()) {
          const gData = globalSnap.data();
          setIsAppActive(gData.is_app_active ?? true);
          setMaintenanceMsg(gData.maintenance_message || '');
        }

        const docRef = doc(db, 'app_settings', 'global_config');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.WebView_Config) {
            setWebViewUrl(data.WebView_Config.url || '');
            setWebViewPlacement(data.WebView_Config.placement || 'MAIN_SCREEN');
          } else if (data.WebView_URL) {
            setWebViewUrl(data.WebView_URL);
          }
          if (data.Banners) setBanners(data.Banners);
          if (data.Current_Popup) {
            setPopupTitle(data.Current_Popup.title || '');
            setPopupMessage(data.Current_Popup.message || '');
          }
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
      }
    };
    fetchSettings();
  }, []);

  
  const handleSaveGlobal = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGlobalSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'global_config'), {
        is_app_active: isAppActive,
        maintenance_message: maintenanceMsg
      }, { merge: true });
      setGlobalSaveSuccess(true);
      setTimeout(() => setGlobalSaveSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      // Removed alert
    } finally {
      setIsGlobalSaving(false);
    }
  };

  const handleSaveUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUrlSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'global_config'), {
        WebView_Config: {
          url: webViewUrl,
          placement: webViewPlacement
        }
      }, { merge: true });
      
      setUrlSaveSuccess(true);
      setTimeout(() => setUrlSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving URL:', err);
    } finally {
      setIsUrlSaving(false);
    }
  };

  const handleSavePopup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPopupSaving(true);
    try {
      await setDoc(doc(db, 'app_settings', 'global_config'), {
        Current_Popup: {
          title: popupTitle,
          message: popupMessage,
          updatedAt: new Date().toISOString()
        }
      }, { merge: true });
      
      setPopupSaveSuccess(true);
      setTimeout(() => setPopupSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Error saving Popup:', err);
    } finally {
      setIsPopupSaving(false);
    }
  };

  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;
    setIsBannerSaving(true);
    try {
      const updatedBanners = [...banners, newBannerUrl.trim()];
      await setDoc(doc(db, 'app_settings', 'global_config'), {
        Banners: updatedBanners
      }, { merge: true });
      
      setBanners(updatedBanners);
      setNewBannerUrl('');
    } catch (err) {
      console.error('Error adding banner:', err);
    } finally {
      setIsBannerSaving(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsBannerSaving(true);
    try {
      const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedBanners = [...banners, downloadURL];
      await setDoc(doc(db, 'app_settings', 'global_config'), {
        Banners: updatedBanners
      }, { merge: true });
      
      setBanners(updatedBanners);
    } catch (err) {
      console.error('Error uploading banner:', err);
      // Removed alert
    } finally {
      setIsBannerSaving(false);
      e.target.value = '';
    }
  };

  const handleDeleteBanner = async (index: number) => {
    const bannerUrl = banners[index];
    const updatedBanners = banners.filter((_, i) => i !== index);
    try {
      if (bannerUrl.includes('firebasestorage.googleapis.com')) {
        const fileRef = ref(storage, bannerUrl);
        await deleteObject(fileRef).catch(console.warn);
      }

      await setDoc(doc(db, 'app_settings', 'global_config'), {
        Banners: updatedBanners
      }, { merge: true });
      setBanners(updatedBanners);
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إعدادات التطبيق</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-6">
        
        
        {/* Global Config Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-primary-dark">حالة التطبيق العامة</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">إيقاف أو تشغيل تطبيق العملاء</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveGlobal} className="space-y-5">
            <div className="flex items-center justify-between bg-gray-50 p-4 rounded-xl border border-gray-100">
              <div>
                <div className="font-bold text-[14px] text-gray-800">التطبيق متاح للعملاء؟</div>
                <div className="text-[12px] text-gray-500 mt-1">إذا تم الإيقاف سيطرد الجميع وتظهر رسالة الصيانة</div>
              </div>
              <button 
                type="button"
                onClick={() => setIsAppActive(!isAppActive)}
                className={`w-12 h-7 rounded-full p-1 transition-colors relative ${isAppActive ? 'bg-primary' : 'bg-gray-200'}`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform duration-300 ${isAppActive ? 'transform -translate-x-5' : 'transform translate-x-0'}`} />
              </button>
            </div>

            {!isAppActive && (
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">رسالة الصيانة</label>
                <textarea 
                  rows={2}
                  placeholder="مثال: التطبيق قيد الصيانة، سنعود قريباً..." 
                  className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] resize-none"
                  value={maintenanceMsg}
                  onChange={e => setMaintenanceMsg(e.target.value)} 
                />
              </div>
            )}
            
            <button 
              type="submit" 
              disabled={isGlobalSaving}
              className={`w-full py-4 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${globalSaveSuccess ? 'bg-icon-green text-white' : 'bg-primary text-white disabled:opacity-50'}`}
            >
              {globalSaveSuccess ? (
                <><CheckCircle2 className="w-5 h-5" />تم الحفظ بنجاح</>
              ) : (
                <><Save className="w-5 h-5" />{isGlobalSaving ? 'جاري الحفظ...' : 'حفظ حالة التطبيق'}</>
              )}
            </button>
          </form>
        </div>

        {/* WebView Control Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-500">
              <LinkIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-primary-dark">رابط الويب (WebView)</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">تحديث الرابط الذي يظهر في تطبيق العميل</p>
            </div>
          </div>
          
          <form onSubmit={handleSaveUrl} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">رابط الويب (URL)</label>
              <input 
                required 
                type="url" 
                dir="ltr"
                placeholder="https://example.com" 
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-left text-[14px]" 
                value={webViewUrl} 
                onChange={e => setWebViewUrl(e.target.value)} 
              />
            </div>

            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">مكان الظهور في التطبيق</label>
              <select
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] appearance-none cursor-pointer"
                value={webViewPlacement}
                onChange={e => setWebViewPlacement(e.target.value)}
              >
                <option value="MAIN_SCREEN">في الشاشة الرئيسية</option>
                <option value="SIDEBAR_MENU">كعنصر في القائمة الجانبية</option>
                <option value="OFFERS_SCREEN">في شاشة العروض</option>
              </select>
            </div>
            
            <button 
              type="submit" 
              disabled={isUrlSaving} 
              className={`w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${urlSaveSuccess ? 'bg-icon-green text-white' : 'bg-primary text-white disabled:opacity-50'}`}
            >
              {urlSaveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  تم الحفظ بنجاح
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  {isUrlSaving ? 'جاري الحفظ...' : 'حفظ الرابط'}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Banners Control Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-500">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-primary-dark">الإعلانات (Banners)</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">إدارة وإضافة روابط صور الإعلانات في التطبيق</p>
            </div>
          </div>
          
          <form onSubmit={handleAddBanner} className="flex gap-2 mb-4">
            <input 
              required 
              type="url" 
              dir="ltr"
              placeholder="رابط صورة خارجي (اختياري)" 
              className="flex-1 p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-left text-[14px]" 
              value={newBannerUrl} 
              onChange={e => setNewBannerUrl(e.target.value)} 
            />
            <button 
              type="submit" 
              disabled={isBannerSaving} 
              className="bg-primary text-white px-5 rounded-xl font-bold flex items-center justify-center disabled:opacity-50 transition-colors"
            >
              {isBannerSaving ? '...' : <Plus className="w-5 h-5" />}
            </button>
          </form>

          <div className="mb-4">
            <label className="flex items-center justify-center gap-2 w-full p-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors bg-app-bg">
              <UploadCloud className="w-5 h-5 text-gray-500" />
              <span className="text-[14px] font-bold text-gray-600">أو اضغط لرفع صورة من الاستوديو</span>
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleFileUpload}
                disabled={isBannerSaving}
              />
            </label>
          </div>

          <div className="space-y-3">
            {banners.length > 0 ? banners.map((url, i) => (
              <div key={i} className="flex items-center gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="w-12 h-12 rounded-lg bg-gray-200 overflow-hidden shrink-0 flex items-center justify-center">
                  <img 
                    src={url} 
                    alt={`Banner ${i}`} 
                    className="w-full h-full object-cover" 
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} 
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-[12px] text-gray-500 truncate dir-ltr text-left">{url}</p>
                </div>
                <button 
                  type="button"
                  onClick={() => handleDeleteBanner(i)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            )) : (
              <div className="text-gray-500 text-[13px] text-center py-4 bg-gray-50 rounded-xl border border-gray-100">
                لا توجد إعلانات حالياً
              </div>
            )}
          </div>
        </div>

        {/* Custom Popup Control Card */}
        <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-[16px] font-black text-primary-dark">الرسائل المنبثقة (Pop-ups)</h3>
              <p className="text-[12px] text-gray-500 mt-0.5">إرسال رسالة تظهر فوراً للمستخدمين</p>
            </div>
          </div>
          
          <form onSubmit={handleSavePopup} className="space-y-4">
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">عنوان الرسالة</label>
              <input 
                required 
                type="text" 
                placeholder="مثال: تحديث جديد متاح!" 
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]" 
                value={popupTitle} 
                onChange={e => setPopupTitle(e.target.value)} 
              />
            </div>
            
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">نص الرسالة</label>
              <textarea 
                required 
                rows={3}
                placeholder="اكتب تفاصيل الرسالة هنا..." 
                className="w-full p-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px] resize-none" 
                value={popupMessage} 
                onChange={e => setPopupMessage(e.target.value)} 
              />
            </div>
            
            <button 
              type="submit" 
              disabled={isPopupSaving} 
              className={`w-full py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2 transition-colors ${popupSaveSuccess ? 'bg-icon-green text-white' : 'bg-primary text-white disabled:opacity-50'}`}
            >
              {popupSaveSuccess ? (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  تم التفعيل بنجاح
                </>
              ) : (
                <>
                  <MessageSquare className="w-5 h-5" />
                  {isPopupSaving ? 'جاري الإرسال...' : 'إرسال / تفعيل الرسالة'}
                </>
              )}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
