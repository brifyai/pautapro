import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './CollapsibleSidebar.css';

const CollapsibleSidebar = ({ collapsed }) => {
  const location = useLocation();
  const [expandedMenu, setExpandedMenu] = useState(null);

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      path: '/dashboard',
      submenu: []
    },
    {
      id: 'ordenes',
      label: 'Órdenes',
      icon: '📋',
      path: '/ordenes',
      submenu: [
        { label: 'Crear Orden', path: '/ordenes/crear' },
        { label: 'Ver Órdenes', path: '/ordenes' },
        { label: 'Reportes', path: '/ordenes/reportes' }
      ]
    },
    {
      id: 'campanas',
      label: 'Campañas',
      icon: '📢',
      path: '/campanas',
      submenu: [
        { label: 'Nueva Campaña', path: '/campanas/nueva' },
        { label: 'Mis Campañas', path: '/campanas' },
        { label: 'Planificación', path: '/planificacion' }
      ]
    },
    {
      id: 'clientes',
      label: 'Clientes',
      icon: '👥',
      path: '/clientes',
      submenu: [
        { label: 'Nuevo Cliente', path: '/clientes/nuevo' },
        { label: 'Listado', path: '/clientes' }
      ]
    },
    {
      id: 'proveedores',
      label: 'Proveedores',
      icon: '🏢',
      path: '/proveedores',
      submenu: [
        { label: 'Nuevo Proveedor', path: '/proveedores/nuevo' },
        { label: 'Listado', path: '/proveedores' }
      ]
    },
    {
      id: 'agencias',
      label: 'Agencias',
      icon: '🏛️',
      path: '/agencias',
      submenu: [
        { label: 'Nueva Agencia', path: '/agencias/nueva' },
        { label: 'Listado', path: '/agencias' }
      ]
    },
    {
      id: 'medios',
      label: 'Medios',
      icon: '📺',
      path: '/medios',
      submenu: []
    },
    {
      id: 'soportes',
      label: 'Soportes',
      icon: '📻',
      path: '/soportes',
      submenu: []
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: '📈',
      path: '/reportes',
      submenu: [
        { label: 'Análisis de Medios', path: '/reportes/medios' },
        { label: 'Efectividad Proveedores', path: '/reportes/proveedores' },
        { label: 'Orden de Compra', path: '/reportes/orden-compra' }
      ]
    },
    {
      id: 'configuracion',
      label: 'Configuración',
      icon: '⚙️',
      path: '/configuracion',
      submenu: [
        { label: 'Usuarios', path: '/usuarios' },
        { label: 'Perfiles', path: '/configuracion/perfiles' },
        { label: 'Grupos', path: '/configuracion/grupos' }
      ]
    }
  ];

  const toggleMenu = (menuId) => {
    setExpandedMenu(expandedMenu === menuId ? null : menuId);
  };

  const isActive = (path) => location.pathname === path;

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : 'expanded'}`}>
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <div key={item.id} className="menu-item-wrapper">
            <div className="menu-item">
              <Link
                to={item.path}
                className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
              >
                <span className="menu-icon">{item.icon}</span>
                {!collapsed && <span className="menu-label">{item.label}</span>}
              </Link>
              {item.submenu.length > 0 && !collapsed && (
                <button
                  className="menu-expand-btn"
                  onClick={() => toggleMenu(item.id)}
                >
                  {expandedMenu === item.id ? '▼' : '▶'}
                </button>
              )}
            </div>

            {item.submenu.length > 0 && !collapsed && expandedMenu === item.id && (
              <div className="submenu">
                {item.submenu.map((subitem, index) => (
                  <Link
                    key={index}
                    to={subitem.path}
                    className={`submenu-link ${isActive(subitem.path) ? 'active' : ''}`}
                  >
                    {subitem.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-version">
          {!collapsed && <span>v1.0.0</span>}
        </div>
      </div>
    </aside>
  );
};

export default CollapsibleSidebar;
