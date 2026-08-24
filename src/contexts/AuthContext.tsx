import React, { createContext, useContext, useEffect, useState } from 'react';
import { collection, query, where, getDocs, addDoc, doc, onSnapshot } from 'firebase/firestore';
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
          
          // Setup real-time listener for current user
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where("phone", "==", firebaseUser.email?.split('@')[0]));
          
          unsubscribeDoc = onSnapshot(q, (snapshot) => {
            
            
            if (!snapshot.empty) {
              const uData = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as UserProfile;
              
              if (uData.isActive === false) {
                // Suspended
                firebaseSignOut(auth).then(() => {
                  setUser(null);
                  localStorage.removeItem('kayan_user');
                  setErrorMsg('تم إيقاف حسابك من قبل الإدارة.');
                
          
          }, (error) => {
            console.error("Firestore onSnapshot permission error:", error);
            setErrorMsg("خطأ في صلاحيات قاعدة البيانات (Firestore). يرجى التأكد من تحديث قواعد الأمان كما هو موضح.");
            setLoading(false);
          });
              } else {
                setUser(uData);
                localStorage.setItem('kayan_user', JSON.stringify(uData));
              }
            } else {
              // Document deleted or not created yet
              setUser((prev) => {
                if (prev) {
                  firebaseSignOut(auth).then(() => {
                    localStorage.removeItem('kayan_user');
                    setErrorMsg('حسابك غير موجود.');
                  });
                }
                return null;
              });
            }
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
      setLoading(false);
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeDoc) unsubscribeDoc();
    };
  }, []);

  const login = async (name: string, phone: string, pin: string) => {
    if (!name.trim() || !phone.trim() || pin.length !== 4) {
      setErrorMsg('الرجاء تعبئة جميع الحقول بشكل صحيح (كلمة المرور 4 أرقام)');
      throw new Error('Invalid input');
    }

    setErrorMsg(null);
    const email = `${phone}@kayansoft.com`;
    const password = `${pin}kayan`;

    try {
      // 1. Try to sign in with Firebase Auth
      try {
        await signInWithEmailAndPassword(auth, email, password);
      } catch (authError: any) {
        // Fallback for Admin creation ONLY
        if (phone === '773303455' && pin === '0808') {
          try {
            // Check if user exists in auth first to avoid "email already in use" error masking firestore errors
            try {
               await signInWithEmailAndPassword(auth, email, password);
            } catch (innerAuthErr) {
               await createUserWithEmailAndPassword(auth, email, password);
            }
            
            // Wait for auth state to propagate before writing to firestore
            await new Promise(resolve => setTimeout(resolve, 1000));

            const adminDoc = {
              name: name || "مدير النظام",
              phone: "773303455",
              pin: "0808",
              role: "ADMIN",
              permissions: ["clients", "licenses", "serials", "commissions", "subscriptions", "employees", "sales"],
              isActive: true
            };
            const qs = await getDocs(query(collection(db, 'users'), where("phone", "==", phone)));
            if (qs.empty) {
              await addDoc(collection(db, 'users'), adminDoc);
            }
          } catch (createError) {
             console.error("Admin creation failed", createError);
             throw createError; // throw actual error for UI
          }
        } else {
          throw authError; // Not the admin fallback, so just throw
        }
      }

      // 2. We are authenticated! Now read from Firestore to get Profile
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where("phone", "==", phone));
      
      let querySnapshot = await getDocs(q);
      
      // If admin document missing for some reason, create it now
      if (querySnapshot.empty && phone === '773303455' && pin === '0808') {
         const adminDoc = {
            name: name,
            phone: "773303455",
            pin: "0808",
            role: "ADMIN",
            permissions: ["clients", "licenses", "serials", "commissions", "subscriptions", "employees", "sales"],
            isActive: true
         };
         await addDoc(collection(db, 'users'), adminDoc);
         querySnapshot = await getDocs(q);
      }
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const userData = docSnap.data() as Omit<UserProfile, 'id'>;
        
        if (userData.isActive === false) {
          await firebaseSignOut(auth);
          setErrorMsg('تم إيقاف هذا الحساب من قبل الإدارة.');
          throw new Error('Account suspended');
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
      console.error(e);
      await firebaseSignOut(auth).catch(() => {});
      setErrorMsg(e.message === 'Account suspended' ? 'تم إيقاف هذا الحساب من قبل الإدارة.' : (e.message === 'Invalid credentials (Firestore mismatch)' ? 'الحساب غير موجود في قاعدة البيانات' : 'حدث خطأ في تسجيل الدخول. تأكد من صحة البيانات.'));
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
