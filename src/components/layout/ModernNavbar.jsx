import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './ModernNavbar.css';

const ModernNavbar = ({ user, onLogout, onToggleSidebar, sidebarCollapsed }) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'active' : '';
  };

  return (
    <nav className="modern-navbar">
      <div className="navbar-container">
        {/* Logo y Toggle */}
        <div className="navbar-brand">
          <button 
            className="sidebar-toggle"
            onClick={onToggleSidebar}
            title="Alternar menú"
          >
            <i className="fas fa-bars"></i>
          </button>
          <Link to="/" className="navbar-logo">
            <span style={{
              fontSize: '20px',
              fontWeight: 'bold',
              background: 'linear-gradient(135deg, #1e40af 0%, #2563eb 50%, #3b82f6 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}>PautaPro</span>
          </Link>
        </div>

        {/* Navegación Central */}
        <div className="navbar-menu">
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`}>
            <i className="fas fa-chart-line"></i>
            <span>Dashboard</span>
          </Link>
          <Link to="/ordenes" className={`nav-link ${isActive('/ordenes')}`}>
            <i className="fas fa-file-invoice"></i>
            <span>Órdenes</span>
          </Link>
          <Link to="/campanas" className={`nav-link ${isActive('/campanas')}`}>
            <i className="fas fa-bullhorn"></i>
            <span>Campañas</span>
          </Link>
          <Link to="/clientes" className={`nav-link ${isActive('/clientes')}`}>
            <i className="fas fa-users"></i>
            <span>Clientes</span>
          </Link>
          <Link to="/proveedores" className={`nav-link ${isActive('/proveedores')}`}>
            <i className="fas fa-building"></i>
            <span>Proveedores</span>
          </Link>
        </div>

        {/* Acciones Derecha */}
        <div className="navbar-actions">
          <div className="search-box">
            <input 
              type="text" 
              placeholder="Buscar..." 
              className="search-input"
            />
            <i className="fas fa-search"></i>
          </div>


          <div className="user-menu-wrapper">
            <button 
              className="user-menu-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={user?.nombre || 'Usuario'}
            >
              <img 
                src={user?.avatar || '/src/assets/img/users/user-1.png'} 
                alt="Avatar"
                className="user-avatar"
              />
              <span className="user-name">{user?.nombre || 'Usuario'}</span>
              <i className="fas fa-chevron-down"></i>
            </button>

            {showUserMenu && (
              <div className="user-dropdown">
                <Link to="/perfil" className="dropdown-item">
                  <i className="fas fa-user"></i>
                  <span>Mi Perfil</span>
                </Link>
                <Link to="/configuracion" className="dropdown-item">
                  <i className="fas fa-cog"></i>
                  <span>Configuración</span>
                </Link>
                <hr className="dropdown-divider" />
                <button
                  className="dropdown-item logout-btn"
                  onClick={() => {
                    setShowUserMenu(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ModernNavbar;
