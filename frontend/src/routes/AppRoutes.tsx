
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from '../pages/auth/Login';
import { Signup } from '../pages/auth/Signup';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute } from './ProtectedRoute';
import { useAuth } from '../context/AuthContext';

import { AllocationPage } from '../modules/allocation/AllocationPage';

// Placeholder components for modules to be implemented by teammates
const Dashboard = () => <div className="p-4">Dashboard Overview</div>;
const Organization = () => <div className="p-4">Organization Setup (Admin Only)</div>;
const Assets = () => <div className="p-4">Assets Module</div>;

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
          <Route path="/allocation" element={<AllocationPage />} />
          {/* Add other generic protected routes here */}
          
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/organization" element={<Organization />} />
          </Route>
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
