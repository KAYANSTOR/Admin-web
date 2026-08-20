import fs from 'fs';
let content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
content = content.replace('"licenses", ', '');
fs.writeFileSync('src/contexts/AuthContext.tsx', content);
