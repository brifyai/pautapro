import React, { useState } from 'react';
import './UserProfileMenu.css';

const UserProfileMenu = ({ user, onLogout, onProfileClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    onLogout();
  };

  const handleProfileClick = () => {
    setIsOpen(false);
    onProfileClick();
  };

  return (
    <div className="user-profile-menu">
      <button className="profile-button" onClick={toggleMenu}>
        <div className="profile-avatar">
          {user?.nombre?.charAt(0).toUpperCase() || 'U'}
        </div>
        <span className="profile-name">{user?.nombre || 'Usuario'}</span>
        <i className={`icon-chevron ${isOpen ? 'open' : ''}`}></i>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-avatar-large">
              {user?.nombre?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="profile-info">
              <p className="profile-name-large">{user?.nombre || 'Usuario'}</p>
              <p className="profile-email">{user?.email || 'email@example.com'}</p>
              <p className="profile-role">{user?.perfil || 'Usuario'}</p>
            </div>
          </div>

          <div className="profile-divider"></div>

          <div className="profile-menu-items">
            <button className="menu-item" onClick={handleProfileClick}>
              <i className="icon-user"></i>
              <span>Mi Perfil</span>
            </button>
            
            {/* Botón de API solo para administradores */}
            {(user?.perfil === 'admin' || user?.id_perfil === 1) && (
              <button className="menu-item" onClick={() => { setIsOpen(false); window.location.href = '/admin/api'; }}>
                <i className="icon-code"></i>
                <span>API</span>
              </button>
            )}
            
            <button className="menu-item">
              <i className="icon-settings"></i>
              <span>Configuración</span>
            </button>
            <button className="menu-item">
              <i className="icon-help"></i>
              <span>Ayuda</span>
            </button>
          </div>

          <div className="profile-divider"></div>

          <button className="menu-item logout" onClick={handleLogout}>
            <i className="icon-logout"></i>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default UserProfileMenu;
