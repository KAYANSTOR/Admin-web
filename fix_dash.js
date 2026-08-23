import fs from 'fs';

let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Fix imports
content = content.replace(
  "import { collection, onSnapshot } from 'firebase/firestore';",
  "import { collection, onSnapshot, collectionGroup } from 'firebase/firestore';"
);

// We need to replace the entire useEffect with the correct one.
const newUseEffect = `  useEffect(() => {
    const isAdmin = user?.role === 'ADMIN';
    const hasPerm = (p: string) => isAdmin || user?.permissions?.includes(p);
    
    let unsubClients = () => {};
    let unsubSubs = () => {};
    let unsubComms = () => {};
    let unsubSales = () => {};

    if (hasPerm('clients')) {
      unsubClients = onSnapshot(collection(db, 'users'), (snapshot) => {
        let activeCount = 0;
        let latest: any[] = [];
        snapshot.forEach(doc => {
          const d = doc.data();
          if (d.role === 'NETWORK_OWNER' || (!d.role && d.storeName)) {
            if (d.isActive || d.is_active) activeCount++;
            latest.push({ id: doc.id, ...d });
          }
        });
        latest.sort((a, b) => (b.createdAt?.toMillis?.() || 0) - (a.createdAt?.toMillis?.() || 0));
        setLatestClients(latest.slice(0, 5));
        setMetrics(prev => ({ ...prev, activeClients: activeCount }));
      });
    }

    if (hasPerm('subscriptions')) {
      unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {
        let active = 0;
        let trial = 0;
        snapshot.forEach(doc => {
          if (doc.data().statusTypeString === 'SUCCESS') active++;
          else trial++;
        });
        setMetrics(prev => ({ ...prev, activeSubscriptions: active, trialCount: trial }));
      });
    }

    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {
        let pending = 0;
        snapshot.forEach(doc => {
          if (doc.data().statusTypeString !== 'SUCCESS') {
            const amount = parseFloat(doc.data().commissionAmount || doc.data().amount || '0');
            if (!isNaN(amount)) pending += amount;
          }
        });
        setMetrics(prev => ({ ...prev, pendingCommissions: pending.toLocaleString('en-US') }));
      });
    }

    if (hasPerm('sales')) {
      unsubSales = onSnapshot(collectionGroup(db, 'sales'), (snapshot) => {
        let today = 0;
        let month = 0;
        const now = new Date();
        snapshot.forEach(doc => {
          const data = doc.data();
          const val = parseFloat(data.faceValue) || parseFloat(String(data.value || data.amount || '0').replace(/,/g, ''));
          if (!isNaN(val)) {
            const date = data.createdAt ? new Date(data.createdAt) : (data.date ? new Date(data.date) : (data.timestamp ? new Date(data.timestamp) : new Date()));
            if (date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()) {
              month += val;
              if (date.getDate() === now.getDate()) today += val;
            }
          }
        });
        setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
      });
    }

    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
      unsubSales();
    };
  }, [user]);`;

content = content.replace(
  /useEffect\(\(\) => \{[\s\S]*?\}, \[user\]\);/,
  newUseEffect
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
