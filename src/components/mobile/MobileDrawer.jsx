import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './MobileDrawer.css';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Box,
  Typography,
  IconButton,
  Collapse,
  Avatar,
  Chip
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  Business as BusinessIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon,
  ExpandLess,
  ExpandMore,
  Close as CloseIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';

const MobileDrawer = ({ open, onClose, user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState({
    dashboard: false,
    ordenes: false,
    reportes: false,
    configuracion: false
  });

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/auth/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const toggleMenu = (menu) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menu]: !prev[menu]
    }));
  };

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <DashboardIcon />,
      primary: true,
      submenu: [
        { text: 'Dashboard General', path: '/' },
        { text: 'Dashboard Rentabilidad', path: '/rentabilidad' }
      ],
      expandable: true,
      menuKey: 'dashboard'
    },
    {
      text: 'Clientes',
      icon: <PeopleIcon />,
      path: '/clientes',
      primary: true
    },
    {
      text: 'Campañas',
      icon: <CampaignIcon />,
      path: '/campanas',
      primary: true
    },
    {
      text: 'Proveedores',
      icon: <BusinessIcon />,
      path: '/proveedores',
      primary: true
    },
    {
      text: 'Agencias',
      icon: <BusinessIcon />,
      path: '/agencias',
      primary: true
    },
    {
      text: 'Medios',
      icon: <CampaignIcon />,
      path: '/medios',
      primary: true
    },
    {
      text: 'Soportes',
      icon: <AssessmentIcon />,
      path: '/soportes',
      primary: true
    },
    {
      text: 'Órdenes',
      icon: <ShoppingCartIcon />,
      primary: true,
      submenu: [
        { text: 'Crear Orden', path: '/ordenes/crear' },
        { text: 'Revisar Orden', path: '/ordenes/revisar' }
      ],
      expandable: true,
      menuKey: 'ordenes'
    },
    {
      text: 'Planificación',
      icon: <AssessmentIcon />,
      path: '/planificacion',
      primary: true
    },
    {
      text: 'Contratos',
      icon: <SettingsIcon />,
      path: '/contratos',
      primary: true
    },
    {
      text: 'Reportes',
      icon: <AssessmentIcon />,
      primary: true,
      submenu: [
        { text: 'Reporte de Inversión', path: '/reportes/inversion' },
        { text: 'Gestión de Órdenes', path: '/reportes/ordenes' },
        { text: 'Dashboard Analítico', path: '/reportes/analitico' }
      ],
      expandable: true,
      menuKey: 'reportes'
    },
    {
      text: 'Usuarios',
      icon: <PeopleIcon />,
      path: '/usuarios',
      primary: true
    },
    {
      text: 'Configuración',
      icon: <SettingsIcon />,
      primary: true,
      submenu: [
        { text: 'Configuración IA', path: '/configuracion/ia' }
      ],
      expandable: true,
      menuKey: 'configuracion'
    }
  ];

  const isActive = (path) => {
    return location.pathname === path;
  };

  const isSubmenuActive = (submenu) => {
    return submenu.some(item => isActive(item.path));
  };

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: '280px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white'
        }
      }}
      PaperProps={{
        className: 'mobile-drawer-paper'
      }}
    >
      {/* Header del Drawer */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', color: 'white' }}>
            PautaPro Móvil
          </Typography>
          <IconButton onClick={onClose} sx={{ color: 'white' }}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Información del usuario */}
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.2)' }}>
              <AccountCircleIcon sx={{ color: 'white' }} />
            </Avatar>
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'white' }}>
                {user.nombre || 'Usuario'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                {user.email}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>

      {/* Lista de navegación */}
      <List sx={{ flex: 1, pt: 1 }}>
        {menuItems.map((item) => (
          <React.Fragment key={item.text}>
            <ListItem disablePadding>
              <ListItemButton
                onClick={() => {
                  if (item.expandable) {
                    toggleMenu(item.menuKey);
                  } else {
                    navigate(item.path);
                    onClose();
                  }
                }}
                sx={{
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  },
                  backgroundColor: isActive(item.path) || (item.expandable && isSubmenuActive(item.submenu))
                    ? 'rgba(255,255,255,0.2)'
                    : 'transparent'
                }}
              >
                <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontWeight: item.primary ? 'bold' : 'normal',
                      color: 'white'
                    }
                  }}
                />
                {item.expandable && (
                  expandedMenus[item.menuKey] ? <ExpandLess sx={{ color: 'white' }} /> : <ExpandMore sx={{ color: 'white' }} />
                )}
              </ListItemButton>
            </ListItem>

            {/* Submenú */}
            {item.expandable && (
              <Collapse in={expandedMenus[item.menuKey]} timeout="auto" unmountOnExit>
                <List component="div" disablePadding>
                  {item.submenu.map((subItem) => (
                    <ListItem key={subItem.path} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          navigate(subItem.path);
                          onClose();
                        }}
                        sx={{
                          pl: 4,
                          '&:hover': {
                            backgroundColor: 'rgba(255,255,255,0.1)'
                          },
                          backgroundColor: isActive(subItem.path)
                            ? 'rgba(255,255,255,0.15)'
                            : 'transparent'
                        }}
                      >
                        <ListItemText
                          primary={subItem.text}
                          sx={{
                            '& .MuiListItemText-primary': {
                              fontSize: '0.875rem',
                              color: 'white'
                            }
                          }}
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Collapse>
            )}
          </React.Fragment>
        ))}
      </List>

      <Divider sx={{ bgcolor: 'rgba(255,255,255,0.2)' }} />

      {/* Footer con logout */}
      <Box sx={{ p: 2 }}>
        <ListItem disablePadding>
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: '8px',
              '&:hover': {
                backgroundColor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            <ListItemIcon sx={{ color: 'white', minWidth: '40px' }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText
              primary="Cerrar Sesión"
              sx={{
                '& .MuiListItemText-primary': {
                  color: 'white'
                }
              }}
            />
          </ListItemButton>
        </ListItem>
      </Box>
    </Drawer>
  );
};

export default MobileDrawer;