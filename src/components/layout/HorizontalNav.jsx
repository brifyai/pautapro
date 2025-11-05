import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { createPortal } from 'react-dom';
import './HorizontalNav.css';
import UserDataPopup from '../UserDataPopup';

const HorizontalNav = () => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const [userDataOpen, setUserDataOpen] = useState(false);
  const [dropdownPositions, setDropdownPositions] = useState({});
  const itemRefs = useRef({});
  const navRef = useRef(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: 'fas fa-chart-line',
      path: '/dashboard',
      submenu: [
        { label: 'Dashboard General', path: '/dashboard' },
        { label: 'Dashboard Rentabilidad', path: '/rentabilidad' }
      ]
    },
    {
      id: 'ordenes',
      label: 'Órdenes',
      icon: 'fas fa-file-invoice',
      path: '/ordenes/revisar',
      submenu: [
        { label: 'Crear Orden', path: '/ordenes/crear' },
        { label: 'Revisar Órdenes', path: '/ordenes/revisar' }
      ]
    },
    {
      id: 'planificacion',
      label: 'Planificación',
      icon: 'fas fa-calendar-alt',
      path: '/planificacion',
      submenu: [
        { label: 'Mis Planificaciones', path: '/planificacion' }
      ]
    },
    {
      id: 'campanas',
      label: 'Campañas',
      icon: 'fas fa-bullhorn',
      path: '/campanas'
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: 'fas fa-users',
      path: '/clientes'
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
      icon: 'fas fa-store',
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
      icon: 'fas fa-headset',
      path: '/soportes'
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
      path: '/reportes',
      submenu: [
        { label: 'Orden de Compra', path: '/reportes/ordendecompra' },
        { label: 'Diario de Órdenes', path: '/reportes/diarioordenes' },
        { label: 'Informe Inversión', path: '/reportes/informeinversion' },
        { label: 'Inversión por Cliente', path: '/reportes/inversionporcliente' },
        { label: 'Rendimiento Campañas', path: '/reportes/rendimientocampanas' },
        { label: 'Análisis Medios', path: '/reportes/analisismedios' },
        { label: 'Efectividad Proveedores', path: '/reportes/efectividadproveedores' },
        { label: 'Detalle por Alternativa', path: '/reportes/detalleporalternativa' },
        { label: 'Informe Inversión Cliente Bruto', path: '/reportes/informeinversionclientebruto' }
      ]
    },
    {
      id: 'usuarios',
      label: 'Usuarios',
      icon: 'fas fa-user-tie',
      path: '/usuarios'
    }
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
      <nav className="horizontal-nav" ref={navRef}>
        <div className="nav-container">
          {menuItems.map((item) => (
            <div
              key={item.id}
              className="nav-item-wrapper"
              ref={(el) => { itemRefs.current[item.id] = el; }}
            >
              {!item.submenu || item.submenu.length === 0 ? (
                <Link to={item.path} className="nav-link">
                  <i className={`${item.icon}`}></i>
                  <span>{item.label}</span>
                </Link>
              ) : (
                <button
                  className={`nav-link dropdown-toggle ${expandedMenus[item.id] ? 'active' : ''}`}
                  onClick={() => toggleSubmenu(item.id)}
                  type="button"
                >
                  <i className={`${item.icon}`}></i>
                  <span>{item.label}</span>
                  <i className="fas fa-chevron-down"></i>
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
                <div className="dropdown-menu show">
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