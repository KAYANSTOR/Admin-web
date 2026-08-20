import fs from 'fs';
let content = fs.readFileSync('src/pages/Employees.tsx', 'utf8');
content = content.replace("  { id: 'licenses', label: 'التراخيص' },\n", '');
fs.writeFileSync('src/pages/Employees.tsx', content);
