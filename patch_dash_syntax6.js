import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  `    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {
      let total = 0;
      let pending = 0;
      snapshot.forEach(doc => {
        const data = doc.data();
        const amt = parseFloat(String(data.amount || '0').replace(/,/g, ''));
        if (!isNaN(amt)) {
          if (data.statusTypeString === 'SUCCESS') total += amt;
          else if (data.statusTypeString === 'WARNING') pending += amt;
        }
      });
      setMetrics(prev => ({ 
        ...prev, 
        totalCommissions: total.toLocaleString('en-US'),
        pendingCommissions: pending.toLocaleString('en-US')
      }));
    });
    
    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
    };
  }, []);`,
  `    if (hasPerm('commissions')) {
      unsubComms = onSnapshot(collection(db, 'commissions'), (snapshot) => {
        let total = 0;
        let pending = 0;
        snapshot.forEach(doc => {
          const data = doc.data();
          const amt = parseFloat(String(data.amount || '0').replace(/,/g, ''));
          if (!isNaN(amt)) {
            if (data.statusTypeString === 'SUCCESS') total += amt;
            else if (data.statusTypeString === 'WARNING') pending += amt;
          }
        });
        setMetrics(prev => ({ 
          ...prev, 
          totalCommissions: total.toLocaleString('en-US'),
          pendingCommissions: pending.toLocaleString('en-US')
        }));
      });
    }

    if (hasPerm('sales')) {
      unsubSales = onSnapshot(collection(db, 'sales'), (snapshot) => {
        let today = 0;
        let month = 0;
        const now = new Date();
        snapshot.forEach(doc => {
          const data = doc.data();
          const val = parseFloat(String(data.value || '0').replace(/,/g, ''));
          if (!isNaN(val)) {
            const date = data.date ? new Date(data.date) : new Date();
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
  }, [user]);`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
