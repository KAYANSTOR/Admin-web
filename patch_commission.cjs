const fs = require('fs');
let content = fs.readFileSync('src/pages/ClientProfile.tsx', 'utf8');

content = content.replace(
  /const totalSalesValue = sales\.reduce\(\(sum, s\) => sum \+ \(s\.faceValue \|\| 0\), 0\);/,
  "const totalSalesValue = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.faceValue || 0), 0);"
);

content = content.replace(
  /const totalCommission = sales\.reduce\(\(sum, s\) => sum \+ \(s\.commission \|\| 0\), 0\);.*$/,
  "const totalCommission = sales.filter(s => s.status === 'COMPLETED').reduce((sum, s) => sum + (s.commission || ((s.faceValue || 0) * (client?.commission_rate || 0) / 100)), 0);"
);

fs.writeFileSync('src/pages/ClientProfile.tsx', content);
