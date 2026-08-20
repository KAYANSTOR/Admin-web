import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, limit, addDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: 'ADMIN' | 'EMPLOYEE';
  permissions: string[];
  isActive: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  errorMsg: string | null;
  login: (name: string, phone: string, pin: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    const checkAutoLogin = async () => {
      try {
        const storedUserStr = localStorage.getItem('kayan_user');
        if (storedUserStr) {
          const storedUser = JSON.parse(storedUserStr);
          // Optional: re-verify user from db, for now just use local cache like Android does
          setUser(storedUser);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    checkAutoLogin();
  }, []);

  const login = async (name: string, phone: string, pin: string) => {
    if (!name.trim() || !phone.trim() || pin.length !== 4) {
      setErrorMsg('الرجاء تعبئة جميع الحقول بشكل صحيح (كلمة المرور 4 أرقام)');
      throw new Error('Invalid input');
    }

    setErrorMsg(null);
    try {
      // Create admin if db is empty, matching Android's AuthViewModel
      const usersRef = collection(db, 'users');
      const qAll = query(usersRef, limit(1));
      const querySnapshotAll = await getDocs(qAll);
      
      if (querySnapshotAll.empty) {
        const admin: Omit<UserProfile, 'id'> = {
          name: "jar",
          phone: "773303455",
          pin: "0808",
          role: "ADMIN",
          permissions: ["clients", "licenses", "serials", "commissions", "subscriptions", "employees"],
          isActive: true
        };
        await addDoc(usersRef, admin);
        
        if (name === admin.name && phone === admin.phone && pin === admin.pin) {
          const newUser = { id: 'admin_created', ...admin };
          setUser(newUser);
          localStorage.setItem('kayan_user', JSON.stringify(newUser));
          return;
        }
      }

      const q = query(
        usersRef, 
        where("phone", "==", phone),
        where("name", "==", name),
        where("pin", "==", pin)
      );
      
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const doc = querySnapshot.docs[0];
        const userData = doc.data() as Omit<UserProfile, 'id'>;
        const newUser = { id: doc.id, ...userData };
        setUser(newUser);
        localStorage.setItem('kayan_user', JSON.stringify(newUser));
      } else {
        setErrorMsg('البيانات المدخلة غير صحيحة');
        throw new Error('Invalid credentials');
      }
    } catch (e) {
      console.error(e);
      setErrorMsg('حدث خطأ في الاتصال بقاعدة البيانات');
      throw e;
    }
  };

  const logout = () => {
    localStorage.removeItem('kayan_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, errorMsg, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
