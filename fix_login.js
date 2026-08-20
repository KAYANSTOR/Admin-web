import fs from 'fs';
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

content = content.replace(
  `      // 2. We are authenticated! Now read from Firestore to verify Name and get Profile
      const usersRef = collection(db, 'users');
      const q = query(
        usersRef, 
        where("phone", "==", phone),
        where("name", "==", name),
        where("pin", "==", pin)
      );
      
      const querySnapshot = await getDocs(q);
      
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
        // Auth succeeded but details don't match Firestore DB (wrong name perhaps)
        await firebaseSignOut(auth);
        setErrorMsg('البيانات المدخلة غير صحيحة');
        throw new Error('Invalid credentials (Firestore mismatch)');
      }`,
  `      // 2. We are authenticated! Now read from Firestore to get Profile
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
      }`
);

// Also remove the confusing error override
content = content.replace(
  `      if (!errorMsg || errorMsg === 'البيانات المدخلة غير صحيحة') {
        setErrorMsg('حدث خطأ في تسجيل الدخول. تأكد من صحة البيانات.');
      }`,
  `      setErrorMsg(e.message === 'Account suspended' ? 'تم إيقاف هذا الحساب من قبل الإدارة.' : (e.message === 'Invalid credentials (Firestore mismatch)' ? 'الحساب غير موجود في قاعدة البيانات' : 'حدث خطأ في تسجيل الدخول. تأكد من صحة البيانات.'));`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
