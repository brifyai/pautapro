import React from 'react';
import { Navigate } from 'react-router-dom';
import { authServiceSimple } from '../services/authServiceSimple';

const ProtectedRoute = ({ 
  children, 
  requiredPermission = null,
  requiredModule = null,
  requiredRole = null,
  fallbackPath = '/dashboard'
}) => {
  // Obtener usuario actual
  const currentUser = authServiceSimple.getCurrentUser();

  // Si no hay usuario autenticado, redirigir al login
  if (!currentUser) {
    console.warn('ProtectedRoute: usuario no autenticado, redirigiendo a /login');
    return <Navigate to="/login" replace />;
  }

  // Bypass temporal para rentabilidad (garantiza visibilidad mientras se sincronizan permisos)
  if (requiredModule === 'rentabilidad') {
    console.debug('ProtectedRoute: bypass temporal habilitado para módulo rentabilidad');
    return children;
  }

  // Verificar rol específico si se requiere
  if (requiredRole && currentUser.rol !== requiredRole) {
    console.warn('ProtectedRoute: rol requerido:', requiredRole, 'rol actual:', currentUser.rol);
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permiso específico si se requiere
  if (requiredPermission && !authServiceSimple.hasPermission(currentUser, requiredPermission)) {
    console.warn('ProtectedRoute: sin permiso requerido:', requiredPermission);
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar acceso a módulo si se requiere
  if (requiredModule && !authServiceSimple.hasModuleAccess(currentUser, requiredModule)) {
    console.warn('ProtectedRoute: sin acceso al módulo requerido:', requiredModule);
    return <Navigate to={fallbackPath} replace />;
  }

  // Si pasa todas las validaciones, mostrar el componente
  return children;
};

export default ProtectedRoute;