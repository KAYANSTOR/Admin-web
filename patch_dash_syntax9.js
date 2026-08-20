import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

content = content.replace(
  `    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
    };
  }, []);`,
  `    return () => {
      unsubClients();
      unsubSubs();
      unsubComms();
      unsubSales();
    };
  }, [user]);`
);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
