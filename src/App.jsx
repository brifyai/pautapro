import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useTheme, useMediaQuery } from '@mui/material';
import MobileWrapper from './components/mobile/MobileWrapper';
import Home from './pages/Home/Home';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import Dashboard from './pages/dashboard/Dashboard';
import RevisarOrden from './pages/ordenes/RevisarOrden';
import Clientes from './pages/clientes/Clientes';
import ViewCliente from './pages/clientes/ViewCliente';
import Medios from './pages/medios/Medios';
import Grupos from './pages/grupos/Grupos';
import Agencias from './pages/agencias/Agencias';
import ViewAgencia from './pages/agencias/ViewAgencia';
import Proveedores from './pages/proveedores/Proveedores';
import Soportes from './pages/soportes/SoportesMejorado';
import ViewProveedor from './pages/proveedores/ViewProveedor';
import ViewSoporte from './pages/soportes/ViewSoporte';
import Mensajes from './pages/mensajes/Mensajes';
import Campanas from './pages/campanas/Campanas';
import ViewCampania from './pages/campanas/ViewCampania';
import Contratos from './pages/contratos/Contratos';
import ViewContrato from './pages/contratos/ViewContratos';
import Planificacion from './pages/planificacion/Planificacion';
import NuevoPlan from './pages/planificacion/NuevoPlan';
import Alternativas from './pages/planificacion/Alternativas';
import CrearOrden from './pages/ordenes/CrearOrdenOptimized';
import RentabilidadDashboard from './pages/rentabilidad/RentabilidadDashboard';
import ListadoUsuarios from './pages/usuarios/ListadoUsuarios';
import MiPerfil from './pages/perfil/MiPerfil';
import ConfiguracionIA from './pages/configuracion/ConfiguracionIA';
// Reportes consolidados
import ReporteInversion from './pages/reportes/ReporteInversion';
import GestionOrdenes from './pages/reportes/GestionOrdenes';
import DashboardAnalitico from './pages/reportes/DashboardAnalitico';
import DashboardAnalytics from './pages/dashboard/DashboardAnalytics';
// import CalendarioDisponibilidadMedios from './components/medios/CalendarioDisponibilidadMedios';
import WorkflowWizard from './components/WorkflowWizard/WorkflowWizard';
import SeedProveedores from './components/SeedProveedores';
import Header from './components/layout/Header';
import Sidebar from './components/Sidebar';
import HorizontalNav from './components/layout/HorizontalNav';
import NotificationProvider from './components/Notifications/NotificationSystem';
import ProtectedRoute from './components/ProtectedRoute';
import UserManager from './components/UserManagement/UserManager';
import ErrorBoundary from './components/ErrorBoundary';
import { performanceMonitorService } from './services/performanceMonitorService';
import './App.css';
import './assets/css/responsive.css';
import './assets/css/modern-theme.css';
import './styles/sweetalert2-custom.css';

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Inicializar monitoreo de rendimiento
    performanceMonitorService.startMonitoring();

    const handleStorageChange = (event) => {
      // Evitar ejecución durante HMR o cambios no relacionados con autenticación
      if (event && event.type === 'storage' && event.key === null) {
        return; // Ignorar cambios de storage generados por HMR
      }

      const user = localStorage.getItem('user');
      const isAuth = !!user;

      // Verificar si el usuario existe y tiene datos válidos
      if (user) {
        try {
          const userData = JSON.parse(user);
          // Verificar que tenga al menos email y nombre
          if (!userData.email || !userData.nombre) {
            console.warn('Usuario en localStorage inválido, limpiando...');
            localStorage.removeItem('user');
            setIsAuthenticated(false);
            return;
          }
        } catch (error) {
          console.warn('Error parseando usuario de localStorage, limpiando...');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
          return;
        }
      }

      // Solo actualizar si realmente cambió el estado de autenticación
      setIsAuthenticated(prevIsAuth => {
        if (prevIsAuth !== isAuth) {
          console.log('🔄 Estado de autenticación cambió:', prevIsAuth, '->', isAuth);
          return isAuth;
        }
        return prevIsAuth;
      });
    };

    // Verificar autenticación inicial
    handleStorageChange();

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleStorageChange);
      performanceMonitorService.stopMonitoring();
    };
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Función para manejar logout desde componentes hijos
  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setIsAuthenticated(false);
    window.dispatchEvent(new Event('auth-change'));
  };

  return (
    <Router>
      <NotificationProvider>
        <ErrorBoundary>
          <div className="app">
            {isAuthenticated ? (
              <>
                {!isMobile && (
                  <>
                    <Header onToggleSidebar={toggleSidebar} onLogout={handleLogout} />
                    <HorizontalNav />
                  </>
                )}
                <div className="app-container">                  <main className={isMobile ? "app-content mobile-content" : "app-content"}>
                  <MobileWrapper>
                    <Routes>
                  {/* Rutas públicas con protección básica */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute requiredModule="dashboard">
                        <Dashboard />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Planificación */}
                  <Route
                    path="/planificacion"
                    element={
                      <ProtectedRoute requiredModule="planificacion" requiredPermission="ver_planificacion">
                        <Planificacion />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planificacion/new"
                    element={
                      <ProtectedRoute requiredModule="planificacion" requiredPermission="crear_planificacion">
                        <NuevoPlan />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/planificacion/alternativas/:id"
                    element={
                      <ProtectedRoute requiredModule="planificacion" requiredPermission="ver_planificacion">
                        <Alternativas />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Clientes */}
                  <Route
                    path="/clientes"
                    element={
                      <ProtectedRoute requiredModule="clientes" requiredPermission="ver_clientes">
                        <Clientes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/clientes/view/:id"
                    element={
                      <ProtectedRoute requiredModule="clientes" requiredPermission="ver_clientes">
                        <ViewCliente />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Medios */}
                  <Route
                    path="/medios"
                    element={
                      <ProtectedRoute requiredModule="medios" requiredPermission="ver_medios">
                        <Medios />
                      </ProtectedRoute>
                    }
                  />
                  {/* <Route
                    path="/medios/calendario"
                    element={
                      <ProtectedRoute requiredModule="medios" requiredPermission="ver_medios">
                        <CalendarioDisponibilidadMedios />
                      </ProtectedRoute>
                    }
                  /> */}
                  
                  {/* Módulo de Grupos */}
                  <Route
                    path="/grupos"
                    element={
                      <ProtectedRoute requiredRole="director">
                        <Grupos />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Agencias */}
                  <Route
                    path="/agencias"
                    element={
                      <ProtectedRoute requiredModule="agencias" requiredPermission="ver_agencias">
                        <Agencias />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/agencias/view/:id"
                    element={
                      <ProtectedRoute requiredModule="agencias" requiredPermission="ver_agencias">
                        <ViewAgencia />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Proveedores */}
                  <Route
                    path="/proveedores"
                    element={
                      <ProtectedRoute requiredModule="proveedores" requiredPermission="ver_proveedores">
                        <Proveedores />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/proveedores/view/:id"
                    element={
                      <ProtectedRoute requiredModule="proveedores" requiredPermission="ver_proveedores">
                        <ViewProveedor />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Soportes */}
                  <Route
                    path="/soportes"
                    element={
                      <ProtectedRoute requiredModule="soportes" requiredPermission="ver_soportes">
                        <Soportes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/soportes/view/:id"
                    element={
                      <ProtectedRoute requiredModule="soportes" requiredPermission="ver_soportes">
                        <ViewSoporte />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Mensajes */}
                  <Route
                    path="/mensajes"
                    element={
                      <ProtectedRoute requiredModule="mensajes" requiredPermission="ver_mensajes">
                        <Mensajes />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Campañas */}
                  <Route
                    path="/campanas"
                    element={
                      <ProtectedRoute requiredModule="campanas" requiredPermission="ver_campanas">
                        <Campanas />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/campanas/:id"
                    element={
                      <ProtectedRoute requiredModule="campanas" requiredPermission="ver_campanas">
                        <ViewCampania />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Contratos */}
                  <Route
                    path="/contratos"
                    element={
                      <ProtectedRoute requiredModule="contratos" requiredPermission="ver_contratos">
                        <Contratos />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/contratos/view/:id"
                    element={
                      <ProtectedRoute requiredModule="contratos" requiredPermission="ver_contratos">
                        <ViewContrato />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Órdenes */}
                  <Route
                    path="/ordenes/crear"
                    element={
                      <CrearOrden />
                    }
                  />
                  {/* <Route
                    path="/ordenes/historial"
                    element={
                      <ProtectedRoute requiredModule="ordenes" requiredPermission="ver_ordenes">
                        <ReporteVersionesOrdenes />
                      </ProtectedRoute>
                    }
                  /> */}
                  <Route
                    path="/ordenes/revisar"
                    element={
                      <ProtectedRoute requiredModule="ordenes" requiredPermission="ver_ordenes">
                        <RevisarOrden />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Reportes - Reportes Consolidados */}
                  <Route
                    path="/reportes/inversion"
                    element={
                      <ProtectedRoute requiredModule="reportes" requiredPermission="ver_reportes">
                        <ReporteInversion />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reportes/ordenes"
                    element={
                      <ProtectedRoute requiredModule="reportes" requiredPermission="ver_reportes">
                        <GestionOrdenes />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/reportes/analitico"
                    element={
                      <ProtectedRoute requiredModule="reportes" requiredPermission="ver_reportes">
                        <DashboardAnalitico />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Dashboard Analytics */}
                  <Route
                    path="/dashboard/analytics"
                    element={
                      <ProtectedRoute requiredModule="dashboard" requiredPermission="ver_dashboard">
                        <DashboardAnalytics />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Módulo de Rentabilidad Inteligente */}
                  {isMobile ? (
                    <Route
                      path="/rentabilidad"
                      element={<RentabilidadDashboard />}
                    />
                  ) : (
                    <Route
                      path="/rentabilidad"
                      element={
                        <ProtectedRoute requiredModule="rentabilidad" requiredPermission="ver_rentabilidad">
                          <RentabilidadDashboard />
                        </ProtectedRoute>
                      }
                    />
                  )}
                  
                  {/* Módulo de Usuarios - Solo para roles altos */}
                  <Route
                    path="/usuarios"
                    element={
                      <ProtectedRoute requiredModule="usuarios" requiredPermission="ver_usuarios">
                        <ListadoUsuarios />
                      </ProtectedRoute>
                    }
                  />
                  
                  {/* Perfil de usuario - accesible para todos */}
                  <Route
                    path="/perfil"
                    element={
                      <ProtectedRoute>
                        <MiPerfil />
                      </ProtectedRoute>
                    }
                  />

                  {/* Configuración IA - accesible para todos */}
                  <Route
                    path="/configuracion"
                    element={
                      <ProtectedRoute>
                        <ConfiguracionIA />
                      </ProtectedRoute>
                    }
                  />

                  {/* Asistente de Flujo de Trabajo */}
                  <Route
                    path="/asistente"
                    element={
                      <ProtectedRoute>
                        <WorkflowWizard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Ruta de creación de órdenes (asistente mejorado) */}
                  <Route
                    path="/ordenes/crear"
                    element={
                      <ProtectedRoute>
                        <WorkflowWizard />
                      </ProtectedRoute>
                    }
                  />

                  {/* Ruta temporal para insertar proveedores */}
                  <Route
                    path="/seed-proveedores"
                    element={
                      <ProtectedRoute>
                        <SeedProveedores />
                      </ProtectedRoute>
                    }
                  />

                  {/* Rutas por defecto - REDIRIGIR AL DASHBOARD */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </MobileWrapper>
                </main>
              </div>
            </>
          ) : (
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/home" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </div>
        </ErrorBoundary>
      </NotificationProvider>
    </Router>
  );
}

export default App;