import React, { createContext, useContext, useEffect, useState } from 'react';
import { doc, getDocs, collection, query, where, onSnapshot } from 'firebase/firestore';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  pin: string;
  role: 'ADMIN' | 'STAFF';
  permissions: string[];
  isActive: boolean;
  notificationsEnabled?: boolean;
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
    let unsubscribeDoc: (() => void) | null = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const storedUserStr = localStorage.getItem('kayan_user');
          if (storedUserStr) {
            setUser(JSON.parse(storedUserStr));
          }
          
          // استخدم UID الخاص بـ Firebase بدل البحث بالهاتف؛ فهذا يمنع اختيار سجل مستخدم خاطئ عند تكرار الرقم.
          if (unsubscribeDoc) unsubscribeDoc();
          unsubscribeDoc = onSnapshot(doc(db, 'users', firebaseUser.uid), (userDoc) => {
            if (userDoc.exists()) {
              const uData = { id: userDoc.id, ...userDoc.data() } as UserProfile;
              
              if (uData.isActive === false) {
                // Suspended
                firebaseSignOut(auth).then(() => {
                  setUser(null);
                  localStorage.removeItem('kayan_user');
                  setErrorMsg('تم إيقاف حسابك من قبل الإدارة.');
                });
              } else if (uData.role !== 'ADMIN' && uData.role !== 'STAFF') {
                // Not authorized
                firebaseSignOut(auth).then(() => {
                  setUser(null);
                  localStorage.removeItem('kayan_user');
                  setErrorMsg('عذراً، هذا الحساب للعملاء فقط ولا يمكنه الدخول للوحة التحكم.');
                });
              } else {
                setUser(uData);
                localStorage.setItem('kayan_user', JSON.stringify(uData));
              }
            } else {
              setUser(null);
              localStorage.removeItem('kayan_user');
              setErrorMsg('حسابك غير موجود.');
              firebaseSignOut(auth).catch(() => {});
            }
            setLoading(false);
          }, (error) => {
            console.error("Firestore onSnapshot permission error:", error);
            setErrorMsg("خطأ في صلاحيات قاعدة البيانات (Firestore). يرجى التأكد من تحديث قواعد الأمان كما هو موضح.");
            setLoading(false);
          });
          
        } catch (err) {
          console.error("Error restoring session", err);
        }
      } else {
        setUser(null);
        localStorage.removeItem('kayan_user');
        if (unsubscribeDoc) {
          unsubscribeDoc();
          unsubscribeDoc = null;
        }
      }
      if (!firebaseUser) setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const login = async (name: string, phone: string, pin: string) => {
    if (!phone.trim() || pin.length !== 4) {
      setErrorMsg('الرجاء تعبئة جميع الحقول بشكل صحيح (كلمة المرور 4 أرقام)');
      throw new Error('Invalid input');
    }

    setErrorMsg(null);
    const email = `${phone}@kayansoft.com`;
    const password = `${pin}kayan`;

    try {
      // 1. Try to sign in with Firebase Auth
      await signInWithEmailAndPassword(auth, email, password);

      // 2. We are authenticated! Now read from Firestore to get Profile
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("phone", "==", phone));
      
      let querySnapshot = await getDocs(q);
      
      
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const userData = docSnap.data() as Omit<UserProfile, 'id'>;
        
        if (userData.isActive === false) {
          await firebaseSignOut(auth);
          setErrorMsg('تم إيقاف هذا الحساب من قبل الإدارة.');
          throw new Error('Account suspended');
        }
        
        if (userData.role !== 'ADMIN' && userData.role !== 'STAFF') {
          await firebaseSignOut(auth);
          setErrorMsg('عذراً، هذا الحساب للعملاء فقط ولا يمكنه الدخول للوحة التحكم.');
          throw new Error('Not authorized');
        }
        
        const newUser = { id: docSnap.id, ...userData };
        setUser(newUser);
        localStorage.setItem('kayan_user', JSON.stringify(newUser));
      } else {
        await firebaseSignOut(auth);
        setErrorMsg('الحساب غير موجود في قاعدة البيانات');
        throw new Error('Invalid credentials (Firestore mismatch)');
      }
    } catch (e: any) {
      if (e.code !== 'auth/invalid-credential' && e.code !== 'auth/email-already-in-use' && e.code !== 'auth/user-not-found' && e.code !== 'auth/wrong-password') {
        console.error("Login Error:", e);
      }
      await firebaseSignOut(auth).catch(() => {});
      if (e.message === 'Account suspended') {
        setErrorMsg('تم إيقاف هذا الحساب من قبل الإدارة.');
      } else if (e.message === 'Not authorized') {
        setErrorMsg('عذراً، هذا الحساب للعملاء فقط ولا يمكنه الدخول للوحة التحكم.');
      } else if (e.message === 'Invalid credentials (Firestore mismatch)') {
        setErrorMsg('الحساب غير موجود في قاعدة البيانات');
      } else if (!errorMsg) {
        setErrorMsg('حدث خطأ في تسجيل الدخول. تأكد من صحة البيانات.');
      }
      throw e;
    }
  };

  const logout = async () => {
    await firebaseSignOut(auth);
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
