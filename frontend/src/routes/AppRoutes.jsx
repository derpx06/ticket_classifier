import React, { Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import Login from '../pages/auth/Login';
import Signup from '../pages/auth/Signup';
import RoleBasedDashboard from '../pages/dashboard/RoleBasedDashboard';
import Landing from '../pages/public/Landing';
import Unauthorized from '../pages/system/Unauthorized';
import Teams from '../pages/teams/Teams';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
  return (
    <Suspense
      fallback={(
        <div className="flex h-screen items-center justify-center bg-slate-50">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      )}
    >
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<Login />} />
          <Route path="signup" element={<Signup />} />
        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route path="dashboard" element={<RoleBasedDashboard />} />

            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="teams" element={<Teams />} />
              <Route path="admin" element={<Navigate to="/teams" replace />} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
