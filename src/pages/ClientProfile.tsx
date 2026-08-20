import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { ArrowRight, User, Phone, Building2 } from 'lucide-react';

export default function ClientProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const unsub = onSnapshot(doc(db, 'clients', id), (doc) => {
      if (doc.exists()) {
        setClient({ id: doc.id, ...doc.data() });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [id]);

  if (loading) {
    return <div className="p-8 text-center text-text-secondary">جاري التحميل...</div>;
  }

  if (!client) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-bold text-text-primary mb-4">العميل غير موجود</h2>
        <button onClick={() => navigate('/clients')} className="text-primary hover:underline">العودة للعملاء</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <button 
        onClick={() => navigate('/clients')}
        className="flex items-center gap-2 text-text-secondary hover:text-primary transition-colors font-medium text-sm"
      >
        <ArrowRight className="w-4 h-4" />
        العودة للعملاء
      </button>

      <div className="bg-surface rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-8 flex flex-col md:flex-row items-center gap-6 border-b border-gray-100">
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-4xl shrink-0">
            {client.name?.charAt(0) || 'ع'}
          </div>
          <div className="text-center md:text-right flex-1">
            <h1 className="text-2xl font-bold text-text-primary">{client.name}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-3 text-sm text-text-secondary">
              <div className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                <span dir="ltr">{client.phone}</span>
              </div>
              {client.storeName && (
                <div className="flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{client.storeName}</span>
                </div>
              )}
            </div>
          </div>
          <div className={`px-4 py-2 rounded-full text-sm font-medium ${
            client.isActive ? 'bg-success-bg text-success' : 'bg-error-bg text-error'
          }`}>
            {client.isActive ? 'حساب نشط' : 'حساب مجمد'}
          </div>
        </div>
        
        <div className="p-8 text-center text-text-secondary">
          <p>التفاصيل الإضافية وتراخيص العميل ستظهر هنا.</p>
        </div>
      </div>
    </div>
  );
}
