const fs = require('fs');

let content = fs.readFileSync('src/pages/Employees.tsx', 'utf8');

const oldCode = `        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        
        // Store in Firestore
        await addDoc(collection(db, 'users'), {
          uid: userCredential.user.uid,
          name: newName,
          phone: newPhone,
          pin: newPin,
          role: newRole,
          permissions: newRole === 'ADMIN' ? ALL_PERMISSIONS.map(p => p.id) : newPermissions,
          isActive: true,
          createdAt: serverTimestamp(),
        });`;

const newCode = `        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        
        // Store in Firestore USING setDoc with the UID
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          uid: userCredential.user.uid,
          name: newName,
          phone: newPhone,
          pin: newPin,
          role: newRole,
          permissions: newRole === 'ADMIN' ? ALL_PERMISSIONS.map(p => p.id) : newPermissions,
          isActive: true,
          is_active: true, // For consistency
          createdAt: serverTimestamp(),
        });`;

let patched = content.replace(oldCode, newCode);

if (patched !== content) {
    fs.writeFileSync('src/pages/Employees.tsx', patched);
    console.log('Employees patched');
} else {
    console.log('Failed to patch employees');
}
