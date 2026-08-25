const fs = require('fs');
let content = fs.readFileSync('src/pages/Employees.tsx', 'utf8');
content = content.replace(/setNewName\(emp.name\);/, "setNewName(emp.name || '');");
content = content.replace(/setNewPhone\(emp.phone\);/, "setNewPhone(emp.phone || '');");
content = content.replace(/setNewPin\(emp.pin\);/, "setNewPin(emp.pin || '');");
content = content.replace(/setNewRole\(emp.role\);/, "setNewRole(emp.role || 'STAFF');");
fs.writeFileSync('src/pages/Employees.tsx', content);
