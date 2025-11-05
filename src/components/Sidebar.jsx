import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      id: 'asistente',
      label: '🤖 Asistente IA',
      icon: 'fas fa-magic',
      path: '/ordenes/crear',
      special: true
    },
    {
      id: 'dashboard',
      label: '📊 Dashboard',
      icon: 'fas fa-chart-line',
      path: '/dashboard',
      submenu: [
        { label: '📈 Dashboard General', path: '/dashboard' },
        { label: '💰 Dashboard Rentabilidad', path: '/rentabilidad' }
      ]
    },
    {
      id: 'ordenes',
      label: '📦 Órdenes',
      icon: 'fas fa-file-invoice',
      path: '/ordenes/revisar',
      submenu: [
        { label: '➕ Crear Orden', path: '/ordenes/crear' },
        { label: '👁️ Revisar Órdenes', path: '/ordenes/revisar' }
      ]
    },
    {
      id: 'planificacion',
      label: '📅 Planificación',
      icon: 'fas fa-calendar-alt',
      path: '/planificacion',
      submenu: [
        { label: '📋 Mis Planificaciones', path: '/planificacion' }
      ]
    },
    {
      id: 'campanas',
      label: '🎯 Campañas',
      icon: 'fas fa-bullhorn',
      path: '/campanas'
    },
    {
      id: 'clientes',
      label: '👥 Clientes',
      icon: 'fas fa-users',
      path: '/clientes'
    },
    {
      id: 'proveedores',
      label: '🏢 Proveedores',
      icon: 'fas fa-building',
      path: '/proveedores'
    },
    {
      id: 'agencias',
      label: '🏪 Agencias',
      icon: 'fas fa-store',
      path: '/agencias'
    },
    {
      id: 'medios',
      label: '📺 Medios',
      icon: 'fas fa-tv',
      path: '/medios'
    },
    {
      id: 'soportes',
      label: '🎧 Soportes',
      icon: 'fas fa-headset',
      path: '/soportes'
    },
    {
      id: 'contratos',
      label: '📄 Contratos',
      icon: 'fas fa-file-contract',
      path: '/contratos'
    },
    {
      id: 'reportes',
      label: '📊 Reportes',
      icon: 'fas fa-chart-bar',
      path: '/reportes',
      submenu: [
        { label: '💰 Reporte de Inversión', path: '/reportes/inversion' },
        { label: '🛒 Gestión de Órdenes', path: '/reportes/ordenes' },
        { label: '📈 Dashboard Analítico', path: '/reportes/analitico' }
      ]
    },
    {
      id: 'usuarios',
      label: '👨‍💼 Usuarios',
      icon: 'fas fa-user-tie',
      path: '/usuarios'
    }
  ];

  const isActive = (path) => location.pathname === path;

  const toggleMenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const handleLinkClick = () => {
    // Cerrar el sidebar en móviles después de hacer clic
    if (window.innerWidth < 768 && isOpen) {
      onToggle();
    }
  };

  return (
    <>
      {/* Overlay para móviles */}
      <div
        className={`sidebar-overlay ${isOpen ? 'show' : ''}`}
        onClick={onToggle}
      ></div>
      
      <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <div key={item.id} className="menu-item-wrapper">
              {item.submenu && item.submenu.length > 0 ? (
                <>
                  <button
                    className={`menu-link ${expandedMenu === item.id ? 'expanded' : ''} ${item.special ? 'special-item' : ''}`}
                    onClick={() => toggleMenu(item.id)}
                  >
                    <i className={item.icon}></i>
                    <span className="menu-label">{item.label}</span>
                    <i className="fas fa-chevron-down menu-chevron"></i>
                  </button>
                  {expandedMenu === item.id && (
                    <div className="submenu open">
                      {item.submenu.map((subitem, index) => (
                        <Link
                          key={index}
                          to={subitem.path}
                          className={`submenu-link ${isActive(subitem.path) ? 'active' : ''}`}
                          onClick={handleLinkClick}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to={item.path}
                  className={`menu-link ${isActive(item.path) ? 'active' : ''} ${item.special ? 'special-item' : ''}`}
                  onClick={handleLinkClick}
                >
                  <i className={item.icon}></i>
                  <span className="menu-label">{item.label}</span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;