// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { authService } from '@/services/auth/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: Array<'CUSTOMER' | 'STAFF' | 'TECHNICIAN' | 'ADMIN'>;
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  // kiểm tra token hợp lệ & còn hạn
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // kiểm tra role từ token (không cần gọi BE)
  if (allowedRoles && allowedRoles.length > 0) {
    const role = authService.getRole();
    if (!role || !allowedRoles.includes(role)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};
