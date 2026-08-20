import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  `    if (hasPerm('clients')) {
      unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
      let activeCount = 0;
      let latest: any[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.isActive) activeCount++;
        latest.push({ id: doc.id, ...data });
      });
      setMetrics(prev => ({ ...prev, activeClients: activeCount }));
      setLatestClients(latest.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 4));
    });`,
  `    if (hasPerm('clients')) {
      unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {
        let activeCount = 0;
        let latest: any[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.isActive) activeCount++;
          latest.push({ id: doc.id, ...data });
        });
        setMetrics(prev => ({ ...prev, activeClients: activeCount }));
        setLatestClients(latest.sort((a, b) => (b.createdAt?.toMillis() || 0) - (a.createdAt?.toMillis() || 0)).slice(0, 4));
      });
    }`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
