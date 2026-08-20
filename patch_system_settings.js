import fs from 'fs';
let content = fs.readFileSync('src/pages/SystemSettings.tsx', 'utf8');

// Ensure storage imports exist
if (!content.includes('firebase/storage')) {
  content = content.replace(
    "import { db } from '../lib/firebase';",
    "import { db, storage } from '../lib/firebase';\nimport { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';"
  );
}

if (!content.includes('UploadCloud')) {
  content = content.replace(
    "Trash2 } from 'lucide-react';",
    "Trash2, UploadCloud } from 'lucide-react';"
  );
}

// Replace handleAddBanner & handleDeleteBanner with upload logic
content = content.replace(
  `  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;
    setIsBannerSaving(true);
    try {
      const updatedBanners = [...banners, newBannerUrl.trim()];
      await setDoc(doc(db, 'settings', 'app_settings'), {
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

  const handleDeleteBanner = async (index: number) => {
    const updatedBanners = banners.filter((_, i) => i !== index);
    try {
      await setDoc(doc(db, 'settings', 'app_settings'), {
        Banners: updatedBanners
      }, { merge: true });
      setBanners(updatedBanners);
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };`,
  `  const handleAddBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBannerUrl.trim()) return;
    setIsBannerSaving(true);
    try {
      const updatedBanners = [...banners, newBannerUrl.trim()];
      await setDoc(doc(db, 'settings', 'app_settings'), {
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
      const storageRef = ref(storage, \`banners/\${Date.now()}_\${file.name}\`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const updatedBanners = [...banners, downloadURL];
      await setDoc(doc(db, 'settings', 'app_settings'), {
        Banners: updatedBanners
      }, { merge: true });
      
      setBanners(updatedBanners);
    } catch (err) {
      console.error('Error uploading banner:', err);
      alert('حدث خطأ أثناء رفع الصورة');
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

      await setDoc(doc(db, 'settings', 'app_settings'), {
        Banners: updatedBanners
      }, { merge: true });
      setBanners(updatedBanners);
    } catch (err) {
      console.error('Error deleting banner:', err);
    }
  };`
);

content = content.replace(
  `          <form onSubmit={handleAddBanner} className="flex gap-2 mb-4">
            <input 
              required 
              type="url" 
              dir="ltr"
              placeholder="https://example.com/banner.png" 
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
          </form>`,
  `          <form onSubmit={handleAddBanner} className="flex gap-2 mb-4">
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
          </div>`
);

fs.writeFileSync('src/pages/SystemSettings.tsx', content);
