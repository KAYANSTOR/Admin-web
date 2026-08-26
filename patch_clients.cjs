const fs = require('fs');

let content = fs.readFileSync('src/pages/Clients.tsx', 'utf8');

const replacement = `      await setDoc(doc(db, 'users', userCred.user.uid), {
        name: newName.trim(),
        phone: newPhone.trim(),
        pin: newPassword.trim(),
        email: generatedEmail,
        storeName: newStore.trim(),
        status: 'ACTIVE',
        is_active: true,
        commission_rate: parseFloat(newCommission) || 0,
        role: 'NETWORK_OWNER',
        createdAt: serverTimestamp(),
        deviceLimit: 3
      });

      // إنشـاء ميتا داتا الشبكة الإلزامي حسب الدليل
      await setDoc(doc(db, 'networks', userCred.user.uid, '_metadata', 'info'), {
        networkId: userCred.user.uid,
        name: newName.trim(),
        phoneNumber: newPhone.trim(),
        description: newStore.trim(),
        createdAt: Date.now()
      });`;

content = content.replace(/await setDoc\(doc\(db, 'users', userCred\.user\.uid\), \{[\s\S]*?deviceLimit: 3\s*\}\);/m, replacement);

fs.writeFileSync('src/pages/Clients.tsx', content);
