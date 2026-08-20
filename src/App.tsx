import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppLayout from './components/layout/AppLayout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Clients from './pages/Clients';
import ClientProfile from './pages/ClientProfile';
import Licenses from './pages/Licenses';
import Settings from './pages/Settings';
import Subscriptions from './pages/Subscriptions';
import Commissions from './pages/Commissions';
import Sales from './pages/Sales';
import Serials from './pages/Serials';
import CreateSerial from './pages/CreateSerial';
import Employees from './pages/Employees';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  
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
            <Route path="clients" element={<Clients />} />
            <Route path="clients/:id" element={<ClientProfile />} />
            <Route path="licenses" element={<Licenses />} />
            <Route path="settings" element={<Settings />} />
            <Route path="subscriptions" element={<Subscriptions />} />
            <Route path="commissions" element={<Commissions />} />
            <Route path="sales" element={<Sales />} />
            <Route path="serials" element={<Serials />} />
            <Route path="create-serial" element={<CreateSerial />} />
            <Route path="employees" element={<Employees />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
