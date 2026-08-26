const fs = require('fs');
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');

const regex = /allSales\.forEach\(data => \{[\s\S]*?\}\);/m;
const replacement = `allSales.forEach(data => {
          if (data.status !== 'COMPLETED') return; // حساب المبيعات الناجحة فقط

          const faceValue = data.faceValue || 0;
          const createdAt = data.createdAt || 0;
          
          if (createdAt >= startOfMonth) {
            monthSalesValue += faceValue;
            pendingCommissions += data.commission || 0; 
          }
          if (createdAt >= startOfDay) {
            todaySalesValue += faceValue;
          }
        });`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/pages/Dashboard.tsx', content);
