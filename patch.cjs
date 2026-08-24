const fs = require('fs');

// Patch Dashboard.tsx
let dashboard = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

dashboard = dashboard.replace(
  "const salesGroupQuery = query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc'), limit(100));\n        const salesSnap = await getDocs(salesGroupQuery);\n\n        const now = new Date();\n        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();\n        const startOfDay = new Date(now.getFullYear(), now.getMonth(), 1).setHours(0,0,0,0);\n\n        salesSnap.forEach(doc => {\n          const data = doc.data();",
  `const usersSnap = await getDocs(collection(db, 'users'));
        let allSales: any[] = [];
        await Promise.all(usersSnap.docs.map(async (uDoc) => {
          const uSales = await getDocs(collection(db, 'users', uDoc.id, 'sales'));
          uSales.forEach(doc => {
            allSales.push(doc.data());
          });
        }));

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).setHours(0,0,0,0);

        allSales.forEach(data => {`
);

fs.writeFileSync('src/pages/Dashboard.tsx', dashboard);

// Patch Sales.tsx
let sales = fs.readFileSync('src/pages/Sales.tsx', 'utf8');

sales = sales.replace(
  "const q = query(collectionGroup(db, 'sales'), orderBy('createdAt', 'desc'), limit(100));\n        const snap = await getDocs(q);\n        const data: any[] = [];\n        snap.forEach(d => {\n          data.push({ id: d.id, ...d.data() });\n        });\n        setSales(data);",
  `const usersSnap = await getDocs(collection(db, 'users'));
        let allSales: any[] = [];
        await Promise.all(usersSnap.docs.map(async (uDoc) => {
          const uSales = await getDocs(collection(db, 'users', uDoc.id, 'sales'));
          uSales.forEach(d => {
            allSales.push({ id: d.id, ...d.data() });
          });
        }));
        allSales.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setSales(allSales.slice(0, 100));`
);

// We also need to make sure we import `collection` in Sales.tsx if not already imported
if (!sales.includes("import { collection, query")) {
  sales = sales.replace("import { collectionGroup, query", "import { collection, collectionGroup, query");
  fs.writeFileSync('src/pages/Sales.tsx', sales);
}

