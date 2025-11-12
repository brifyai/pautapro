import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './HorizontalNav.css';
import UserDataPopup from '../UserDataPopup';

const HorizontalNav = () => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userDataOpen, setUserDataOpen] = useState(false);
  const [dropdownPositions, setDropdownPositions] = useState({});
  const itemRefs = useRef({});
  const navRef = useRef(null);

  // Helpers desktop + estado activo por ruta
  const isDesktop = () => window.matchMedia('(min-width: 1025px)').matches;
  const location = useLocation();

  const isActiveItem = useCallback((item) => {
    if (item.path) {
      return location.pathname.startsWith(item.path);
    }
    if (item.submenu && item.submenu.length) {
      return item.submenu.some(s => location.pathname.startsWith(s.path));
    }
    return false;
  }, [location.pathname]);

  const openSubmenu = useCallback((menuId) => {
    if (!isDesktop()) return;
    setExpandedMenus({ [menuId]: true });

    if (itemRefs.current[menuId]) {
      const rect = itemRefs.current[menuId].getBoundingClientRect();
      setDropdownPositions(prev => ({
        ...prev,
        [menuId]: {
          top: rect.bottom,
          left: rect.left
        }
      }));
    }
  }, []);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-chart-line',
      submenu: [
        { label: 'Dashboard General', path: '/dashboard' },
        { label: 'Dashboard Rentabilidad', path: '/rentabilidad' }
      ]
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: 'fas fa-users',
      path: '/clientes'
    },
    {
      id: 'campanas',
      label: 'Campañas',
      icon: 'fas fa-bullhorn',
      path: '/campanas'
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: 'fas fa-building',
      path: '/proveedores'
    },
    {
      id: 'agencias',
      label: 'Agencias',
      icon: 'fas fa-landmark',
      path: '/agencias'
    },
    {
      id: 'medios',
      label: 'Medios',
      icon: 'fas fa-tv',
      path: '/medios'
    },
    {
      id: 'soportes',
      label: 'Soportes',
      icon: 'fas fa-broadcast-tower',
      path: '/soportes'
    },
    {
      id: 'ordenes',
      label: 'Órdenes',
      icon: 'fas fa-file-invoice',
      submenu: [
        { label: 'Crear Orden', path: '/ordenes/crear' },
        { label: 'Revisar Orden', path: '/ordenes/revisar' }
      ]
    },
    {
      id: 'planificacion',
      label: 'Planificación',
      icon: 'fas fa-project-diagram',
      path: '/planificacion'
    },
    {
      id: 'contratos',
      label: 'Contratos',
      icon: 'fas fa-file-contract',
      path: '/contratos'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'fas fa-chart-bar',
      submenu: [
        { label: 'Reporte de Inversión', path: '/reportes/inversion' },
        { label: 'Gestión de Órdenes', path: '/reportes/ordenes' },
        { label: 'Dashboard Analítico', path: '/reportes/analitico' }
      ]
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'fas fa-user-check',
      path: '/usuarios'
    },
  ];

  const toggleSubmenu = useCallback((menuId) => {
    setExpandedMenus(prev => {
      // Si el menú ya está abierto, cerrarlo
      if (prev[menuId]) {
        return { [menuId]: false };
      }
      // Si el menú está cerrado, abrirlo y cerrar todos los demás
      return { [menuId]: true };
    });

    // Calcular posición del elemento
    if (itemRefs.current[menuId]) {
      const rect = itemRefs.current[menuId].getBoundingClientRect();
      setDropdownPositions(prev => ({
        ...prev,
        [menuId]: {
          top: rect.bottom,
          left: rect.left
        }
      }));
    }
  }, []);

  const closeAllMenus = useCallback(() => {
    setExpandedMenus({});
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      // Verificar si el clic fue dentro del nav o en un dropdown portal
      const isClickInsideNav = navRef.current && navRef.current.contains(e.target);
      const isClickInsideDropdown = e.target.closest('.dropdown-menu-portal');
      
      // Si el clic fue fuera de ambos, cerrar los menús
      if (!isClickInsideNav && !isClickInsideDropdown) {
        closeAllMenus();
      }
    };

    // Usar 'mousedown' en lugar de 'click' para mejor detección
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [closeAllMenus]);

  return (
    <>
      <nav className="horizontal-nav nav-dashboard" ref={navRef}>
        <div className="nav-container">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="nav-item-wrapper"
              ref={(el) => { itemRefs.current[item.id] = el; }}
              onMouseEnter={() => { if (item.submenu && item.submenu.length && isDesktop()) openSubmenu(item.id); }}
            >
              {!item.submenu || item.submenu.length === 0 ? (
                <Link
                  to={item.path}
                  className={`nav-link ${isActiveItem(item) ? 'active' : ''}`}
                >
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className={`nav-link dropdown-toggle ${(expandedMenus[item.id] || isActiveItem(item)) ? 'active' : ''}`}
                  onClick={() => toggleSubmenu(item.id)}
                  type="button"
                  onMouseEnter={() => openSubmenu(item.id)}
                  onFocus={() => openSubmenu(item.id)}
                >
                  <span>{item.label}</span>
                  <span className="caret">▾</span>
                </button>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Dropdowns renderizados en portal */}
      {menuItems.map((item) =>
        item.submenu && item.submenu.length > 0 && expandedMenus[item.id] && dropdownPositions[item.id]
          ? createPortal(
              <div
                key={`dropdown-${item.id}`}
                className="dropdown-menu-portal"
                style={{
                  position: 'fixed',
                  top: `${dropdownPositions[item.id].top}px`,
                  left: `${dropdownPositions[item.id].left}px`,
                  zIndex: 9999
                }}
              >
                <div className="dropdown-menu show" onMouseLeave={() => closeAllMenus()}>
                  {item.submenu.map((subItem, index) => (
                    <Link
                      key={index}
                      to={subItem.path}
                      className="dropdown-link"
                      onClick={() => setExpandedMenus({})}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              </div>,
              document.body
            )
          : null
      )}

      <UserDataPopup open={userDataOpen} onClose={() => setUserDataOpen(false)} />
    </>
  );
};

export default HorizontalNav;