import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Rol } from '../types';

interface RoleGuardProps {
  allowedRoles: Rol[];
}

export const PrivateRoute: React.FC = () => {
  const { user } = useAuthStore();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuthStore();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.rol)) {
    // Redirige al panel correspondiente a su rol si no tiene acceso
    const fallbackPath = user.rol === 'ADMIN' ? '/admin' : '/vendedor';
    return <Navigate to={fallbackPath} replace />;
  }

  return <Outlet />;
};
