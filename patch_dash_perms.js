import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

// Replace the useEffect data fetch block to conditionally fetch based on permissions
content = content.replace(
  `  useEffect(() => {
    const unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {`,
  `  useEffect(() => {
    const isAdmin = user?.role === 'ADMIN';
    const hasPerm = (p: string) => isAdmin || user?.permissions?.includes(p);
    
    let unsubClients = () => {};
    let unsubSubs = () => {};
    let unsubComms = () => {};
    let unsubSales = () => {};

    if (hasPerm('clients')) {
      unsubClients = onSnapshot(collection(db, 'clients'), (snapshot) => {`
);

content = content.replace(
  `    const unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {`,
  `    if (hasPerm('subscriptions')) {
      unsubSubs = onSnapshot(collection(db, 'subscriptions'), (snapshot) => {`
);

content = content.replace(
  `    const unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {`,
  `      });
    }

    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {`
);

content = content.replace(
  `    const unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {`,
  `      });
    }

    if (hasPerm('sales')) {
      unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {`
);

content = content.replace(
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
    });

    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
      unsubSales();
    };
  }, []);`,
  `      setMetrics(prev => ({ ...prev, monthSalesValue: month.toLocaleString('en-US'), todaySalesValue: today.toLocaleString('en-US') }));
      });
    }

    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
      unsubSales();
    };
  }, [user]);`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
