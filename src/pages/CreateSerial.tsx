import React, { useState, useEffect } from 'react';
import { collection, addDoc, serverTimestamp, query, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowLeft, Search, Copy, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CreateSerial() {
  const [duration, setDuration] = useState('1'); 
  const [searchQuery, setSearchQuery] = useState('');
  const [clients, setClients] = useState<any[]>([]);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedSerial, setGeneratedSerial] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();

  // Search clients when query changes
  useEffect(() => {
    const fetchClients = async () => {
      if (searchQuery.length < 2) {
        setClients([]);
        return;
      }
      const q = query(collection(db, 'clients'));
      const snapshot = await getDocs(q);
      const data: any[] = [];
      snapshot.forEach(doc => {
        const client = { id: doc.id, ...doc.data() };
        // Match by phone, name or id
        if (
          client.phone?.includes(searchQuery) || 
          client.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          client.id.includes(searchQuery)
        ) {
          data.push(client);
        }
      });
      setClients(data);
    };
    
    const timeoutId = setTimeout(() => fetchClients(), 500);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    setIsLoading(true);
    try {
      const code = Array(4).fill(0).map(() => Math.random().toString(36).substring(2, 6).toUpperCase()).join('-');
      
      await addDoc(collection(db, 'serials'), {
        code,
        duration: `${duration} شهر`,
        isActive: true,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        clientPhone: selectedClient.phone,
        createdAt: serverTimestamp(),
      });
      
      setGeneratedSerial(code);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (generatedSerial) {
      navigator.clipboard.writeText(generatedSerial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="bg-app-bg min-h-full pb-[100px]">
      <div className="bg-surface px-4 py-4 flex items-center justify-between sticky top-0 z-10 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <button onClick={() => navigate(-1)} className="p-2 active:scale-95 transition-transform">
          <ArrowLeft className="w-6 h-6 text-primary-dark" />
        </button>
        <h1 className="text-[18px] font-black text-primary-dark">إنشاء سيريال</h1>
        <div className="w-10"></div>
      </div>

      <div className="p-4 space-y-4">
        {generatedSerial ? (
          <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6 text-center animate-in zoom-in duration-300">
            <div className="w-16 h-16 bg-icon-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-icon-green" />
            </div>
            <h2 className="font-black text-[20px] text-primary-dark mb-2">تم التوليد بنجاح</h2>
            <p className="text-[14px] text-gray-500 mb-6">تم ربط السيريال بالعميل {selectedClient?.name}</p>
            
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 mb-6 relative">
              <div className="font-mono text-[18px] font-bold text-primary-dark tracking-widest dir-ltr">
                {generatedSerial}
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={copyToClipboard}
                className="flex-1 bg-primary text-white py-3.5 rounded-xl font-bold text-[15px] flex items-center justify-center gap-2"
              >
                {copied ? <CheckCircle2 className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? 'تم النسخ' : 'نسخ السيريال'}
              </button>
              <button 
                onClick={() => navigate('/serials')}
                className="flex-1 bg-gray-100 text-gray-700 py-3.5 rounded-xl font-bold text-[15px]"
              >
                عودة للقائمة
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-[24px] shadow-[0_2px_4px_rgba(0,0,0,0.05)] p-6">
            <h2 className="font-bold text-[16px] text-primary-dark mb-6">تخصيص السيريال وتوليده</h2>
            
            <div className="space-y-6">
              {/* Search Client */}
              <div>
                <label className="block text-[14px] font-bold text-gray-700 mb-2">البحث عن العميل (بالاسم أو الرقم)</label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="رقم الجوال أو اسم العميل..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10 pl-4 py-3.5 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[14px]"
                  />
                </div>
                
                {/* Search Results */}
                {clients.length > 0 && !selectedClient && (
                  <div className="mt-2 border border-gray-200 rounded-xl overflow-hidden bg-white shadow-lg absolute z-20 left-4 right-10 max-h-48 overflow-y-auto">
                    {clients.map(client => (
                      <div 
                        key={client.id}
                        onClick={() => {
                          setSelectedClient(client);
                          setSearchQuery(client.name);
                          setClients([]);
                        }}
                        className="p-3 border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer flex justify-between items-center"
                      >
                        <div>
                          <div className="font-bold text-[14px]">{client.name}</div>
                          <div className="text-[12px] text-gray-500 dir-ltr text-right">{client.phone}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                {selectedClient && (
                  <div className="mt-3 p-3 bg-teal-start/10 border border-teal-start/20 rounded-xl flex justify-between items-center">
                    <div>
                      <div className="font-bold text-[14px] text-teal-start">{selectedClient.name}</div>
                      <div className="text-[12px] text-teal-start/80">{selectedClient.phone}</div>
                    </div>
                    <button 
                      onClick={() => { setSelectedClient(null); setSearchQuery(''); }}
                      className="text-[12px] font-bold text-red-500"
                    >
                      تغيير
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleCreate} className="space-y-6 pt-2">
                <div>
                  <label className="block text-[14px] font-bold text-gray-700 mb-2">مدة السيريال (بالأشهر)</label>
                  <select 
                    value={duration} 
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full p-4 bg-app-bg border border-gray-200 rounded-xl outline-none focus:border-primary text-[15px]"
                  >
                    <option value="1">1 شهر</option>
                    <option value="3">3 أشهر</option>
                    <option value="6">6 أشهر</option>
                    <option value="12">12 شهر (سنة)</option>
                  </select>
                </div>

                <button 
                  type="submit" 
                  disabled={isLoading || !selectedClient}
                  className={`w-full py-4 rounded-xl font-bold text-[16px] flex items-center justify-center h-[56px] transition-all ${
                    isLoading || !selectedClient 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                      : 'bg-primary text-white active:scale-95'
                  }`}
                >
                  {isLoading ? (
                    <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    'توليد السيريال'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
