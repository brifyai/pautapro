import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClickOutside } from '../../hooks/useClickOutside';
import { authServiceSimple } from '../../services/authServiceSimple';
import './Header.css';
import UserDataPopup from "../UserDataPopup";

const Header = ({ setIsAuthenticated, onToggleSidebar, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userDataOpen, setUserDataOpen] = useState(false);
  const [initialEditing, setInitialEditing] = useState(false);
  const openUserData = (editing = false) => {
    setInitialEditing(!!editing);
    setUserDataOpen(true);
    setShowMenu(false);
  };

  // Roles: admin puede ver Gestión de Usuarios y Configuración IA; ejecutivo no.
  const isAdmin = useMemo(() => {
    const role = (user?.rol || '').toLowerCase();
    return role.includes('admin') || role.includes('director') || role.includes('gerente') ||
           (typeof user?.rol_nivel === 'number' && user.rol_nivel >= 80) ||
           (user?.puede_ver_usuarios && user?.puede_configurar);
  }, [user]);

  useEffect(() => {
    const currentUser = authServiceSimple.getCurrentUser();
    setUser(currentUser);

    // Escuchar cambios de autenticación
    const handleAuthChange = () => {
      const updatedUser = authServiceSimple.getCurrentUser();
      setUser(updatedUser);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  const handleClickOutside = useCallback(() => {
    setShowMenu(false);
  }, []);

  useClickOutside(menuRef, handleClickOutside);

  const handleLogout = async () => {
    try {
      // Usar la función de logout del padre si está disponible
      if (onLogout) {
        onLogout();
      } else {
        // Fallback: limpiar directamente
        localStorage.clear();
        sessionStorage.clear();
        window.dispatchEvent(new Event('auth-change'));
        if (setIsAuthenticated) {
          setIsAuthenticated(false);
        }
      }

      // Navegar al login con replace para evitar volver atrás
      navigate('/login', { replace: true });

      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      // Forzar logout incluso si hay error
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
      navigate('/login', { replace: true });
    }
  };

  return (
    <header className="main-header">
      <div className="header-left">
        {onToggleSidebar && (
          <button
            className="hamburger-btn"
            onClick={onToggleSidebar}
            title="Alternar menú"
          >
            <i className="fas fa-bars"></i>
          </button>
        )}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
          minWidth: 0
        }}>
          <div className="logo-container">
            <div className="logo-main">
              🎯 PautaPro
            </div>
            <div className="logo-subtitle">
              Gestión Publicitaria Inteligente
            </div>
          </div>
        </div>
      </div>
      <div className="header-right">
        <div className="welcome-text">
          <span>👋 Bienvenid@ - {user ? user.nombre_completo : 'Usuario'}</span>
        </div>
        
        <div className="user-menu-container" ref={menuRef}>
          <div
            className="user-avatar"
            onClick={() => setShowMenu(!showMenu)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            {user?.nombre_completo ? user.nombre_completo.charAt(0).toUpperCase() : 'U'}
          </div>
          {showMenu && (
            <div className="user-menu">
              {/* Información del usuario */}
              <div style={{
                padding: '10px',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                  {user?.nombre_completo}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  {user?.email}
                </div>
              </div>
              
              <div className="menu-item" onClick={() => { navigate('/perfil'); setShowMenu(false); }}>
                <i className="fas fa-user"></i>
                <span>Mi Perfil</span>
              </div>

              <div className="menu-item" onClick={() => { openUserData(false); }}>
                <i className="fas fa-id-card"></i>
                <span>Mis Datos</span>
              </div>

              <div className="menu-item" onClick={() => { openUserData(true); }}>
                <i className="fas fa-key"></i>
                <span>Cambiar Contraseña</span>
              </div>

              {isAdmin && (
                <div className="menu-item" onClick={() => { navigate('/configuracion'); setShowMenu(false); }}>
                  <i className="fas fa-cog"></i>
                  <span>Configuración IA</span>
                </div>
              )}

              {isAdmin && (
                <div className="menu-item" onClick={() => { navigate('/usuarios'); setShowMenu(false); }}>
                  <i className="fas fa-users-cog"></i>
                  <span>Gestión de Usuarios</span>
                </div>
              )}

              {(user?.puede_ver_mensajes || authServiceSimple.hasPermission(user, 'ver_mensajes')) && (
                <div className="menu-item" onClick={() => { navigate('/mensajes'); setShowMenu(false); }}>
                  <i className="fas fa-envelope"></i>
                  <span>Mensajes</span>
                </div>
              )}
              
              <div className="menu-item" onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                <span style={{ color: '#EF4D36' }}>Cerrar Sesión</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <UserDataPopup open={userDataOpen} onClose={() => setUserDataOpen(false)} initialEditing={initialEditing} />
    </header>
  );
};

export default Header;
