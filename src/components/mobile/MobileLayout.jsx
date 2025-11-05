import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './MobileLayout.css';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  useMediaQuery,
  useTheme,
  Badge,
  Paper,
  BottomNavigation,
  BottomNavigationAction
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import MobileDrawer from './MobileDrawer';
import { supabase } from '../../config/supabase';

const MobileLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState(0);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const getUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userData } = await supabase
          .from('usuarios')
          .select('nombre, email')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData);
        }
      }
    };

    getUserSession();

    // Obtener notificaciones reales de actividades recientes
    const getNotifications = async () => {
      try {
        // Obtener actividades recientes de las últimas 24 horas
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        const [clientesRecientes, campanasRecientes, ordenesRecientes] = await Promise.all([
          supabase
            .from('clientes')
            .select('id_cliente')
            .gte('created_at', yesterday.toISOString()),
          supabase
            .from('campania')
            .select('id_campania')
            .gte('created_at', yesterday.toISOString()),
          supabase
            .from('ordenes')
            .select('id')
            .gte('created_at', yesterday.toISOString())
        ]);

        const totalActividades = (clientesRecientes.data?.length || 0) +
                                (campanasRecientes.data?.length || 0) +
                                (ordenesRecientes.data?.length || 0);

        setNotifications(totalActividades);
      } catch (error) {
        console.error('Error obteniendo notificaciones:', error);
        setNotifications(0);
      }
    };

    getNotifications();
  }, []);

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  const getPageTitle = () => {
    const path = location.pathname;
    const titles = {
      '/': 'Dashboard',
      '/clientes': 'Clientes',
      '/campanas': 'Campañas',
      '/proveedores': 'Proveedores',
      '/medios': 'Medios',
      '/soportes': 'Soportes',
      '/ordenes/crear': 'Crear Orden',
      '/ordenes/revisar': 'Revisar Orden',
      '/reportes/analisis-medios': 'Análisis de Medios',
      '/reportes/efectividad-proveedores': 'Efectividad Proveedores',
      '/reportes/rendimiento-campanas': 'Rendimiento Campañas',
      '/reportes/informe-inversion': 'Informe Inversión',
      '/reportes/detalle-alternativa': 'Detalle por Alternativa',
      '/configuracion/ia': 'Configuración IA',
      '/agencias': 'Agencias',
      '/contratos': 'Contratos',
      '/usuarios': 'Usuarios',
      '/rentabilidad': 'Rentabilidad IA'
    };

    return titles[path] || 'PautaPro';
  };

  if (!isMobile) {
    return children; // En desktop, renderizar sin layout móvil
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        className="mobile-app-bar"
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          boxShadow: '0 4px 20px rgba(102, 126, 234, 0.3)'
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={toggleDrawer}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 'bold',
              fontSize: '1.1rem'
            }}
          >
            {getPageTitle()}
          </Typography>

          {/* Botones de acción en la App Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton color="inherit">
              <SearchIcon />
            </IconButton>

            <IconButton color="inherit" onClick={() => navigate('/dashboard')}>
              <Badge badgeContent={notifications} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Espacio para el App Bar */}
      <Box sx={{ height: '56px' }} />

      {/* Contenido principal */}
      <Box
        component="main"
        sx={{
          flex: 1,
          p: 2,
          backgroundColor: '#f5f7fa',
          minHeight: 'calc(100vh - 56px - 64px)' // altura header + bottom nav
        }}
      >
        {children}
      </Box>

      {/* Bottom Navigation moderno */}
      <Paper
        elevation={3}
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          pb: 'env(safe-area-inset-bottom)'
        }}
      >
        <BottomNavigation
          className="mobile-bottom-navigation"
          showLabels
          value={
            location.pathname.startsWith('/clientes') ? 'clientes' :
            location.pathname.startsWith('/ordenes') ? 'ordenes' :
            location.pathname.startsWith('/reportes') ? 'reportes' : 'home'
          }
          onChange={(event, value) => {
            switch (value) {
              case 'home': navigate('/'); break;
              case 'clientes': navigate('/clientes'); break;
              case 'ordenes': navigate('/ordenes/crear'); break;
              case 'reportes': navigate('/reportes/informe-inversion'); break;
              default: break;
            }
          }}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important',
            '& .MuiBottomNavigationAction-root': {
              color: 'rgba(255, 255, 255, 0.7) !important',
              minWidth: '60px !important',
              '&.Mui-selected': {
                color: 'white !important'
              }
            },
            '& .MuiBottomNavigationAction-label': {
              fontSize: '0.75rem !important',
              color: 'rgba(255, 255, 255, 0.7) !important',
              '&.Mui-selected': {
                fontSize: '0.75rem !important',
                color: 'white !important',
                fontWeight: '600 !important'
              }
            },
            '& .MuiSvgIcon-root': {
              color: 'inherit !important'
            }
          }}
        >
          <BottomNavigationAction
            label="Inicio"
            value="home"
            icon={<HomeIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7) !important',
              '&.Mui-selected': {
                color: 'white !important'
              },
              '& .MuiBottomNavigationAction-label': {
                color: 'rgba(255, 255, 255, 0.7) !important',
                '&.Mui-selected': {
                  color: 'white !important'
                }
              }
            }}
          />
          <BottomNavigationAction
            label="Clientes"
            value="clientes"
            icon={<PeopleIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7) !important',
              '&.Mui-selected': {
                color: 'white !important'
              },
              '& .MuiBottomNavigationAction-label': {
                color: 'rgba(255, 255, 255, 0.7) !important',
                '&.Mui-selected': {
                  color: 'white !important'
                }
              }
            }}
          />
          <BottomNavigationAction
            label="Órdenes"
            value="ordenes"
            icon={<ShoppingCartIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7) !important',
              '&.Mui-selected': {
                color: 'white !important'
              },
              '& .MuiBottomNavigationAction-label': {
                color: 'rgba(255, 255, 255, 0.7) !important',
                '&.Mui-selected': {
                  color: 'white !important'
                }
              }
            }}
          />
          <BottomNavigationAction
            label="Reportes"
            value="reportes"
            icon={<AssessmentIcon />}
            sx={{
              color: 'rgba(255, 255, 255, 0.7) !important',
              '&.Mui-selected': {
                color: 'white !important'
              },
              '& .MuiBottomNavigationAction-label': {
                color: 'rgba(255, 255, 255, 0.7) !important',
                '&.Mui-selected': {
                  color: 'white !important'
                }
              }
            }}
          />
        </BottomNavigation>
      </Paper>
 
      {/* Espacio para bottom navigation */}
      <Box sx={{ height: '64px' }} />

      {/* Mobile Drawer */}
      <MobileDrawer
        open={drawerOpen}
        onClose={toggleDrawer}
        user={user}
      />
    </Box>
  );
};

export default MobileLayout;