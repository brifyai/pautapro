import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Breadcrumbs, Typography, Box } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

const BreadcrumbNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  // Mapeo de rutas a nombres legibles
  const routeNames = {
    'dashboard': 'Dashboard',
    'clientes': 'Clientes',
    'agencias': 'Agencias',
    'proveedores': 'Proveedores',
    'contratos': 'Contratos',
    'campanas': 'Campañas',
    'ordenes': 'Órdenes',
    'soportes': 'Soportes',
    'medios': 'Medios',
    'planificacion': 'Planificación',
    'reportes': 'Reportes',
    'usuarios': 'Usuarios',
    'perfil': 'Mi Perfil',
    'mensajes': 'Mensajes'
  };

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
      >
        <Link
          to="/dashboard"
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: '#667eea' }}
        >
          <HomeIcon sx={{ mr: 0.5, fontSize: 20 }} />
          Inicio
        </Link>

        {pathnames.map((pathname, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const displayName = routeNames[pathname] || pathname.charAt(0).toUpperCase() + pathname.slice(1);

          return isLast ? (
            <Typography key={pathname} color="textPrimary" sx={{ fontWeight: 500 }}>
              {displayName}
            </Typography>
          ) : (
            <Link
              key={pathname}
              to={routeTo}
              style={{ textDecoration: 'none', color: '#667eea' }}
            >
              {displayName}
            </Link>
          );
        })}
      </Breadcrumbs>
    </Box>
  );
};

export default BreadcrumbNav;