import fs from 'fs';
let content = fs.readFileSync('src/pages/Dashboard.tsx', 'utf8');
content = content.replace('Fingerprint', 'Coins, Fingerprint');
content = content.replace('{ title: "إصدار ترخيص", icon: Fingerprint, onClick: () => navigate(\'/licenses\'), req: \'licenses\' }', '{ title: "إدارة العمولات", icon: Coins, onClick: () => navigate(\'/commissions\'), req: \'commissions\' }');
fs.writeFileSync('src/pages/Dashboard.tsx', content);
