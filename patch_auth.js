import fs from 'fs';

let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');

// Replace the fallback admin creation block to handle Auth + Firestore properly
content = content.replace(
  /if \(phone === '773303455' && pin === '0808'\) \{[\s\S]*?\} else \{/,
  `if (phone === '773303455' && pin === '0808') {
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
        } else {`
);

fs.writeFileSync('src/contexts/AuthContext.tsx', content);
