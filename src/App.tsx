import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';

import Settings from './pages/Settings';
import Subscriptions from './pages/Subscriptions';
import Commissions from './pages/Commissions';
import Sales from './pages/Sales';
import Serials from './pages/Serials';
import CreateSerial from './pages/CreateSerial';
import Employees from './pages/Employees';

function ProtectedRoute({ children, reqPerm }: { children: React.ReactNode, reqPerm?: string }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
  if (reqPerm && user.role !== 'ADMIN') {
    if (!user.permissions || !user.permissions.includes(reqPerm)) {
      return <Navigate to="/dashboard" replace />;
    }
  }
  
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="clients" element={<ProtectedRoute reqPerm="clients"><Clients /></ProtectedRoute>} />
            <Route path="clients/:id" element={<ProtectedRoute reqPerm="clients"><ClientProfile /></ProtectedRoute>} />
            
            <Route path="settings" element={<Settings />} />
            <Route path="subscriptions" element={<ProtectedRoute reqPerm="subscriptions"><Subscriptions /></ProtectedRoute>} />
            <Route path="commissions" element={<ProtectedRoute reqPerm="commissions"><Commissions /></ProtectedRoute>} />
            <Route path="sales" element={<ProtectedRoute reqPerm="sales"><Sales /></ProtectedRoute>} />
            <Route path="serials" element={<ProtectedRoute reqPerm="serials"><Serials /></ProtectedRoute>} />
            <Route path="create-serial" element={<ProtectedRoute reqPerm="serials"><CreateSerial /></ProtectedRoute>} />
            <Route path="employees" element={<ProtectedRoute reqPerm="employees"><Employees /></ProtectedRoute>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
