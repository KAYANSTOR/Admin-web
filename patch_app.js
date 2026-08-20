import fs from 'fs';
let content = fs.readFileSync('src/App.tsx', 'utf8');
content = content.replace('import Licenses from \'./pages/Licenses\';', '');
content = content.replace('<Route path="licenses" element={<Licenses />} />', '');
fs.writeFileSync('src/App.tsx', content);
