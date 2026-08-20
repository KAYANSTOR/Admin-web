import fs from 'fs';

// 1. Patch App.tsx
let app = fs.readFileSync('src/App.tsx', 'utf8');
if (!app.includes('NotificationsManager')) {
  app = app.replace(
    "import SystemSettings from './pages/SystemSettings';",
    "import SystemSettings from './pages/SystemSettings';\nimport NotificationsManager from './pages/NotificationsManager';"
  );
  app = app.replace(
    `<Route path="system-settings" element={<ProtectedRoute reqPerm="settings"><SystemSettings /></ProtectedRoute>} />`,
    `<Route path="system-settings" element={<ProtectedRoute reqPerm="settings"><SystemSettings /></ProtectedRoute>} />\n            <Route path="notifications-manager" element={<ProtectedRoute reqPerm="notifications"><NotificationsManager /></ProtectedRoute>} />`
  );
  fs.writeFileSync('src/App.tsx', app);
}

// 2. Patch Settings.tsx
let settings = fs.readFileSync('src/pages/Settings.tsx', 'utf8');
if (!settings.includes('NotificationsManager')) {
  if (!settings.includes('BellRing')) {
    settings = settings.replace("Bell,", "Bell, BellRing,");
  }
  settings = settings.replace(
    `          {(user?.role === 'ADMIN' || user?.permissions?.includes('settings')) && (\n            <SettingRow \n              icon={Smartphone} \n              title="إعدادات التطبيق" \n              subtitle="التحكم بالرابط والرسائل المنبثقة" \n              onClick={() => navigate('/system-settings')}\n            />\n          )}`,
    `          {(user?.role === 'ADMIN' || user?.permissions?.includes('settings')) && (\n            <SettingRow \n              icon={Smartphone} \n              title="إعدادات التطبيق" \n              subtitle="التحكم بالرابط والرسائل المنبثقة" \n              onClick={() => navigate('/system-settings')}\n            />\n          )}\n          {(user?.role === 'ADMIN' || user?.permissions?.includes('notifications')) && (\n            <SettingRow \n              icon={BellRing} \n              title="إدارة التنبيهات" \n              subtitle="إرسال إشعارات ورسائل للعملاء" \n              onClick={() => navigate('/notifications-manager')}\n            />\n          )}`
  );
  fs.writeFileSync('src/pages/Settings.tsx', settings);
}

// 3. Patch Employees.tsx (Add Permission)
let emp = fs.readFileSync('src/pages/Employees.tsx', 'utf8');
if (!emp.includes("'notifications'")) {
  emp = emp.replace(
    "{ id: 'settings', label: 'إعدادات التطبيق' },",
    "{ id: 'settings', label: 'إعدادات التطبيق' },\n  { id: 'notifications', label: 'إدارة التنبيهات' },"
  );
  fs.writeFileSync('src/pages/Employees.tsx', emp);
}
