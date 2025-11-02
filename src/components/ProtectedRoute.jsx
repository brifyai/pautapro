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
    return <Navigate to="/login" replace />;
  }

  // Verificar rol específico si se requiere
  if (requiredRole && currentUser.rol !== requiredRole) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar permiso específico si se requiere
  if (requiredPermission && !authServiceSimple.hasPermission(currentUser, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Verificar acceso a módulo si se requiere
  if (requiredModule && !authServiceSimple.hasModuleAccess(currentUser, requiredModule)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Si pasa todas las validaciones, mostrar el componente
  return children;
};

export default ProtectedRoute;