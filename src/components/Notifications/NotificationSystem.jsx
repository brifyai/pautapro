import React, { useState, useEffect, createContext, useContext } from 'react';
import {
  Snackbar,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Badge,
  Button,
  Drawer,
  Divider,
  Chip
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';

// Contexto para notificaciones
const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info',
    title: ''
  });

  // Cargar notificaciones iniciales
  useEffect(() => {
    loadNotifications();
    
    // Suscribirse a nuevas notificaciones en tiempo real solo si la tabla existe
    const setupRealtimeSubscription = async () => {
      try {
        // Primero verificar si la tabla mensajes existe y tiene la estructura correcta
        const { data: tableCheck, error: tableError } = await supabase
          .from('mensajes')
          .select('id, tipo, asunto, contenido, prioridad, leida, created_at')
          .limit(1);

        if (tableError) {
          console.warn('No se puede suscribir a notificaciones en tiempo real, tabla no disponible:', tableError.message);
          return;
        }

        // Si la tabla existe, suscribirse a cambios
        const subscription = supabase
          .channel('notifications')
          .on('postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'mensajes',
              filter: 'tipo=eq.sistema'
            },
            (payload) => {
              handleNewNotification(payload.new);
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log('Suscrito a notificaciones en tiempo real');
            } else if (status === 'CHANNEL_ERROR') {
              console.warn('Error en suscripción a notificaciones en tiempo real');
            }
          });

        return subscription;
      } catch (error) {
        console.warn('Error configurando suscripción a notificaciones:', error.message);
        return null;
      }
    };

    setupRealtimeSubscription().then(subscription => {
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      };
    });
  }, []);

  const loadNotifications = async () => {
    try {
      // Primero verificar si la tabla mensajes existe con la estructura correcta
      const { data: tableCheck, error: tableError } = await supabase
        .from('mensajes')
        .select('id, tipo, asunto, contenido, prioridad, leida, created_at')
        .limit(1);

      if (tableError) {
        console.warn('Tabla mensajes no encontrada o sin permisos, usando notificaciones de ejemplo. Error:', tableError.message);
        // Usar notificaciones de ejemplo si la tabla no existe o no hay permisos
        const exampleNotifications = [
          {
            id: 'demo-1',
            asunto: 'Bienvenido a PautaPro',
            contenido: 'Sistema de gestión publicitaria listo para usar',
            tipo: 'sistema',
            prioridad: 'info',
            leida: false,
            created_at: new Date().toISOString()
          },
          {
            id: 'demo-2',
            asunto: 'Sistema Optimizado',
            contenido: 'Componentes refactorizados y mejoras de rendimiento aplicadas',
            tipo: 'sistema',
            prioridad: 'success',
            leida: false,
            created_at: new Date(Date.now() - 3600000).toISOString()
          }
        ];
        setNotifications(exampleNotifications);
        updateUnreadCount(exampleNotifications);
        return;
      }

      // Si la tabla existe, cargar notificaciones reales
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('tipo', 'sistema')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.warn('Error cargando notificaciones desde la base de datos, usando ejemplo:', error.message);
        // Si hay error al cargar, usar notificaciones de ejemplo
        const exampleNotifications = [
          {
            id: 'fallback-1',
            asunto: 'Sistema PautaPro',
            contenido: 'Gestión publicitaria funcionando correctamente',
            tipo: 'sistema',
            prioridad: 'info',
            leida: false,
            created_at: new Date().toISOString()
          }
        ];
        setNotifications(exampleNotifications);
        updateUnreadCount(exampleNotifications);
        return;
      }
      
      setNotifications(data || []);
      updateUnreadCount(data || []);
    } catch (error) {
      console.error('Error crítico cargando notificaciones:', error);
      // En caso de cualquier error, usar notificaciones de ejemplo
      const exampleNotifications = [
        {
          id: 'emergency-1',
          asunto: 'Modo Offline',
          contenido: 'Trabajando con notificaciones locales',
          tipo: 'sistema',
          prioridad: 'warning',
          leida: false,
          created_at: new Date().toISOString()
        }
      ];
      setNotifications(exampleNotifications);
      updateUnreadCount(exampleNotifications);
    }
  };

  const handleNewNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    
    // Mostrar snackbar para notificaciones importantes
    if (notification.prioridad === 'alta' || notification.prioridad === 'critica') {
      showSnackbar({
        title: notification.asunto,
        message: notification.contenido,
        severity: notification.prioridad === 'critica' ? 'error' : 'warning'
      });
    }
  };

  const updateUnreadCount = (notifs) => {
    const unread = notifs.filter(n => !n.leida).length;
    setUnreadCount(unread);
  };

  const showSnackbar = ({ title, message, severity = 'info' }) => {
    setSnackbar({
      open: true,
      title,
      message,
      severity
    });
  };

  const markAsRead = async (notificationId) => {
    try {
      // Si es una notificación de demostración, solo actualizar localmente
      if (typeof notificationId === 'string' && notificationId.includes('demo')) {
        setNotifications(prev =>
          prev.map(n =>
            n.id === notificationId ? { ...n, leida: true } : n
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        return;
      }

      // Intentar marcar como leída en la base de datos
      const { error } = await supabase
        .from('mensajes')
        .update({ leida: true })
        .eq('id', notificationId);

      if (error) {
        console.warn('No se pudo marcar como leída en la base de datos, actualizando localmente. Error:', error.message);
      }

      // Siempre actualizar el estado local
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marcando notificación como leída:', error);
      // Actualizar localmente incluso si hay error
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, leida: true } : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(n => !n.leida)
        .map(n => n.id);

      if (unreadIds.length > 0) {
        // Intentar marcar en la base de datos
        const { error } = await supabase
          .from('mensajes')
          .update({ leida: true })
          .in('id', unreadIds);

        if (error) {
          console.warn('No se pudieron marcar todas como leídas en la base de datos');
        }
      }

      // Siempre actualizar el estado local
      setNotifications(prev =>
        prev.map(n => ({ ...n, leida: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marcando todas las notificaciones como leídas:', error);
      // Actualizar localmente incluso si hay error
      setNotifications(prev =>
        prev.map(n => ({ ...n, leida: true }))
      );
      setUnreadCount(0);
    }
  };

  const deleteNotification = async (notificationId) => {
    try {
      // Si es una notificación de demostración, solo eliminar localmente
      if (typeof notificationId === 'string' && notificationId.includes('demo')) {
        setNotifications(prev => prev.filter(n => n.id !== notificationId));
        updateUnreadCount(notifications.filter(n => n.id !== notificationId));
        return;
      }

      // Intentar eliminar de la base de datos
      const { error } = await supabase
        .from('mensajes')
        .delete()
        .eq('id', notificationId);

      if (error) {
        console.warn('No se pudo eliminar de la base de datos, eliminando localmente. Error:', error.message);
      }

      // Siempre eliminar del estado local
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      updateUnreadCount(notifications.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Error eliminando notificación:', error);
      // Eliminar localmente incluso si hay error
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      updateUnreadCount(notifications.filter(n => n.id !== notificationId));
    }
  };

  const getNotificationIcon = (type, severity) => {
    switch (severity) {
      case 'critica':
      case 'error':
        return <ErrorIcon sx={{ color: '#ef4444' }} />;
      case 'alta':
      case 'warning':
        return <WarningIcon sx={{ color: '#f59e0b' }} />;
      case 'media':
        return <InfoIcon sx={{ color: '#3b82f6' }} />;
      case 'baja':
      case 'success':
        return <CheckCircleIcon sx={{ color: '#10b981' }} />;
      default:
        return <InfoIcon sx={{ color: '#6b7280' }} />;
    }
  };

  const getNotificationColor = (severity) => {
    switch (severity) {
      case 'critica':
      case 'error':
        return 'error';
      case 'alta':
      case 'warning':
        return 'warning';
      case 'media':
        return 'info';
      case 'baja':
      case 'success':
        return 'success';
      default:
        return 'default';
    }
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays < 7) return `Hace ${diffDays} d`;
    return date.toLocaleDateString();
  };

  const NotificationItem = ({ notification }) => (
    <ListItem
      button
      onClick={() => markAsRead(notification.id)}
      sx={{
        backgroundColor: notification.leida ? 'transparent' : 'action.hover',
        borderLeft: notification.leida ? 'none' : '3px solid',
        borderLeftColor: getNotificationColor(notification.prioridad) + '.main',
        mb: 1
      }}
    >
      <ListItemIcon>
        {getNotificationIcon(notification.tipo, notification.prioridad)}
      </ListItemIcon>
      <ListItemText
        primary={
          <Box>
            <Typography variant="subtitle2" fontWeight={notification.leida ? 'normal' : 'bold'}>
              {notification.asunto}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 0.5 }}>
              <Chip
                label={notification.prioridad || 'info'}
                size="small"
                color={getNotificationColor(notification.prioridad)}
                variant="outlined"
                sx={{ fontSize: '0.6rem', height: 18 }}
              />
              <Typography variant="caption" color="text.secondary">
                {formatTime(notification.created_at)}
              </Typography>
            </Box>
          </Box>
        }
        secondary={
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {notification.contenido}
          </Typography>
        }
      />
      <IconButton
        edge="end"
        size="small"
        onClick={(e) => {
          e.stopPropagation();
          deleteNotification(notification.id);
        }}
      >
        <CloseIcon fontSize="small" />
      </IconButton>
    </ListItem>
  );

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      showSnackbar,
      markAsRead,
      markAllAsRead,
      deleteNotification
    }}>
      {children}


      {/* Drawer de notificaciones */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        sx={{
          '& .MuiDrawer-paper': {
            width: 400,
            p: 2
          }
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Notificaciones</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {unreadCount > 0 && (
              <Button size="small" onClick={markAllAsRead}>
                Marcar todas como leídas
              </Button>
            )}
            <IconButton onClick={() => setDrawerOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        <Divider sx={{ mb: 2 }} />

        {notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="body2" color="text.secondary">
              No hay notificaciones
            </Typography>
          </Box>
        ) : (
          <List sx={{ px: 0 }}>
            {notifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </List>
        )}
      </Drawer>

      {/* Snackbar para notificaciones importantes */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.title && <AlertTitle>{snackbar.title}</AlertTitle>}
          {snackbar.message}
        </Alert>
      </Snackbar>
    </NotificationContext.Provider>
  );
};

// Hook para crear notificaciones programadas
export const useScheduledNotifications = () => {
  const { showSnackbar } = useNotifications();

  const scheduleNotification = (title, message, delay, severity = 'info') => {
    setTimeout(() => {
      showSnackbar({ title, message, severity });
    }, delay);
  };

  const scheduleRecurringNotification = (title, message, interval, severity = 'info') => {
    return setInterval(() => {
      showSnackbar({ title, message, severity });
    }, interval);
  };

  return {
    scheduleNotification,
    scheduleRecurringNotification
  };
};

export default NotificationProvider;