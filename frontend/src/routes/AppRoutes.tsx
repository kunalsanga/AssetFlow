
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';
import { Dashboard } from '../pages/Dashboard';
import { Assets } from '../pages/Assets';
import { Organization } from '../pages/Organization';
import { Allocation } from '../pages/Allocation';
import { Bookings } from '../pages/Bookings';
import { Maintenance } from '../pages/Maintenance';
import { Audit } from '../pages/Audit';
import { Reports } from '../pages/Reports';
import { Notifications } from '../pages/Notifications';


export const AppRoutes = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return null;

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assets" element={<Assets />} />
          <Route path="/allocation" element={<Allocation />} />
          <Route path="/bookings" element={<Bookings />} />
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/audit" element={<Audit />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/notifications" element={<Notifications />} />

          
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/organization" element={<Organization />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
