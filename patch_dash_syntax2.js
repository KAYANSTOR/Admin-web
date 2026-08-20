import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  `      });
    }

    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {`,
  `    }

    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {`
);

content = content.replace(
  `    if (hasPerm('subscriptions')) {
      unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
      let active = 0;
      let trial = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.statusTypeString === 'SUCCESS') active++;
        
        const plan = data.plan || '';
        const statusText = data.statusText || '';
        if (plan.includes('تجريب') || statusText.includes('تجريب')) trial++;
      });
      setMetrics(prev => ({ ...prev, activeSubscriptions: active, trialCount: trial }));
    });

      });
    }`,
  `    }
    
    if (hasPerm('subscriptions')) {
      unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
        let active = 0;
        let trial = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          if (data.statusTypeString === 'SUCCESS') active++;
          
          const plan = data.plan || '';
          const statusText = data.statusText || '';
          if (plan.includes('تجريب') || statusText.includes('تجريب')) trial++;
        });
        setMetrics(prev => ({ ...prev, activeSubscriptions: active, trialCount: trial }));
      });
    }`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
