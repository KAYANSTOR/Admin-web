import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  `function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  return <>{children}</>;
}`,
  `function ProtectedRoute({ children, reqPerm }: { children: React.ReactNode, reqPerm?: string }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (reqPerm && user.role !== 'ADMIN') {
    if (!user.permissions || !user.permissions.includes(reqPerm)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
}`
);

// Update routes
content = content.replace(
  `<Route path="clients" element={<Clients />} />`,
  `<Route path="clients" element={<ProtectedRoute reqPerm="clients"><Clients /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="clients/:id" element={<ClientProfile />} />`,
  `<Route path="clients/:id" element={<ProtectedRoute reqPerm="clients"><ClientProfile /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="subscriptions" element={<Subscriptions />} />`,
  `<Route path="subscriptions" element={<ProtectedRoute reqPerm="subscriptions"><Subscriptions /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="commissions" element={<Commissions />} />`,
  `<Route path="commissions" element={<ProtectedRoute reqPerm="commissions"><Commissions /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="sales" element={<Sales />} />`,
  `<Route path="sales" element={<ProtectedRoute reqPerm="sales"><Sales /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="serials" element={<Serials />} />`,
  `<Route path="serials" element={<ProtectedRoute reqPerm="serials"><Serials /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="create-serial" element={<CreateSerial />} />`,
  `<Route path="create-serial" element={<ProtectedRoute reqPerm="serials"><CreateSerial /></ProtectedRoute>} />`
);
content = content.replace(
  `<Route path="employees" element={<Employees />} />`,
  `<Route path="employees" element={<ProtectedRoute reqPerm="employees"><Employees /></ProtectedRoute>} />`
);

fs.writeFileSync('src/App.tsx', content);
