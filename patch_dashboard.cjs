const fs = require('fs');

let code = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const replacement = `
        const clientsRef = collection(db, 'users');
        const clientsSnap = await getDocs(clientsRef);
        
        let activeClientsCount = 0;
        let trialCount = 0;
        let clientsList: any[] = [];
        
        clientsSnap.forEach(doc => {
          const data = doc.data();
          // Filter out admins and staff to match Clients.tsx
          if (data.role !== 'ADMIN' && data.role !== 'STAFF') {
            clientsList.push({ id: doc.id, ...data });
            if (data.status === 'active') {
              activeClientsCount++;
            } else if (data.status === 'trial') {
              trialCount++;
            }
          }
        });

        // Sort by newest first
        clientsList.sort((a, b) => {
          const timeA = typeof a.createdAt === 'string' ? new Date(a.createdAt).getTime() : (a.createdAt?.toMillis?.() || 0);
          const timeB = typeof b.createdAt === 'string' ? new Date(b.createdAt).getTime() : (b.createdAt?.toMillis?.() || 0);
          return timeB - timeA;
        });

        // Keep only top 10 for dashboard
        setLatestClients(clientsList.slice(0, 10));
`;

code = code.replace(
  /const clientsRef = collection\(db, 'users'\);\s*const qClients = query\(clientsRef, where\('role', '==', 'NETWORK_OWNER'\), limit\(10\)\);\s*const clientsSnap = await getDocs\(qClients\);\s*let activeClientsCount = 0;\s*let trialCount = 0;\s*const clientsList: any\[\] = \[\];\s*clientsSnap\.forEach\(doc => \{\s*const data = doc\.data\(\);\s*clientsList\.push\(\{ id: doc\.id, \.\.\.data \}\);\s*if \(data\.status === 'active'\) \{\s*activeClientsCount\+\+;\s*\} else if \(data\.status === 'trial'\) \{\s*trialCount\+\+;\s*\}\s*\}\);\s*setLatestClients\(clientsList\);/s,
  replacement
);

fs.writeFileSync('src/pages/Dashboard.tsx', code);
