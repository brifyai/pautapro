import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Popover,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Button,
  Divider,
  Chip,
  Avatar,
  Switch,
  FormControlLabel,
  FormGroup,
  Card,
  CardContent,
  LinearProgress,
  Tooltip,
  Menu,
  MenuItem,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Email as EmailIcon,
  MarkEmailRead as MarkReadIcon,
  MarkEmailUnread as MarkUnreadIcon,
  Delete as DeleteIcon,
  Settings as SettingsIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Celebration as CelebrationIcon,
  Business as BusinessIcon,
  Campaign as CampaignIcon,
  AutoMode as AutoModeIcon,
  SystemUpdate as SystemIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import notificationService from '../../services/notificationService';

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [settingsAnchorEl, setSettingsAnchorEl] = useState(null);
  const [filterAnchorEl, setFilterAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('date');
  const [userPreferences, setUserPreferences] = useState({
    email: true,
    push: true,
    inApp: true,
    types: {
      order: true,
      client: true,
      campaign: true,
      system: true,
      automation: true
    }
  });
  const [settingsDialogOpen, setSettingsDialogOpen] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadNotifications();
    
    // Suscribirse a cambios en notificaciones
    const unsubscribe = notificationService.addListener(({ notifications, unreadCount }) => {
      setNotifications(notifications);
      setUnreadCount(unreadCount);
    });

    // Escuchar eventos de nuevas notificaciones
    const handleNewNotification = (event) => {
      showNotificationToast(event.detail);
    };

    window.addEventListener('newNotification', handleNewNotification);

    return () => {
      unsubscribe();
      window.removeEventListener('newNotification', handleNewNotification);
    };
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      await notificationService.loadNotifications();
    } catch (error) {
      console.error('Error loading notifications:', error);
      showNotification('Error al cargar notificaciones', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotificationToast = (notification) => {
    // Aquí podrías integrar un toast library como react-toastify
    console.log('New notification:', notification);
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleNotificationsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleNotificationsClose = () => {
    setAnchorEl(null);
  };

  const handleSettingsClick = (event) => {
    setSettingsAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setSettingsAnchorEl(null);
  };

  const handleFilterClick = (event) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
    } catch (error) {
      console.error('Error marking notification as read:', error);
      showNotification('Error al marcar como leído', 'error');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      showNotification('Todas las notificaciones marcadas como leídas', 'success');
    } catch (error) {
      console.error('Error marking all as read:', error);
      showNotification('Error al marcar todas como leídas', 'error');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      showNotification('Notificación eliminada', 'success');
    } catch (error) {
      console.error('Error deleting notification:', error);
      showNotification('Error al eliminar notificación', 'error');
    }
  };

  const handleRefresh = async () => {
    await loadNotifications();
  };

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    handleFilterClose();
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    handleSettingsClose();
  };

  const handlePreferenceChange = async (preferenceType, value) => {
    try {
      const newPreferences = {
        ...userPreferences,
        [preferenceType]: value
      };
      
      await notificationService.saveUserPreferences(newPreferences);
      setUserPreferences(newPreferences);
      showNotification('Preferencias actualizadas', 'success');
    } catch (error) {
      console.error('Error updating preferences:', error);
      showNotification('Error al actualizar preferencias', 'error');
    }
  };

  const handleTypePreferenceChange = async (type, value) => {
    try {
      const newPreferences = {
        ...userPreferences,
        types: {
          ...userPreferences.types,
          [type]: value
        }
      };
      
      await notificationService.saveUserPreferences(newPreferences);
      setUserPreferences(newPreferences);
      showNotification('Preferencias actualizadas', 'success');
    } catch (error) {
      console.error('Error updating type preferences:', error);
      showNotification('Error al actualizar preferencias', 'error');
    }
  };

  const getNotificationIcon = (type, priority) => {
    const iconProps = {
      fontSize: 'small',
      color: priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'action'
    };

    switch (type) {
      case 'order':
        return <BusinessIcon {...iconProps} />;
      case 'client':
        return <CelebrationIcon {...iconProps} />;
      case 'campaign':
        return <CampaignIcon {...iconProps} />;
      case 'automation':
        return <AutoModeIcon {...iconProps} />;
      case 'system':
        return <SystemIcon {...iconProps} />;
      default:
        return <InfoIcon {...iconProps} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order': return 'primary';
      case 'client': return 'success';
      case 'campaign': return 'warning';
      case 'automation': return 'info';
      case 'system': return 'error';
      default: return 'default';
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
    if (diffDays < 7) return `Hace ${diffDays} días`;
    return date.toLocaleDateString();
  };

  const filteredAndSortedNotifications = notifications
    .filter(notification => {
      if (filter === 'all') return true;
      if (filter === 'unread') return !notification.read;
      return notification.type === filter;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return 0;
    });

  const open = Boolean(anchorEl);
  const settingsOpen = Boolean(settingsAnchorEl);
  const filterOpen = Boolean(filterAnchorEl);

  return (
    <Box>
      <Tooltip title="Notificaciones">
        <IconButton color="inherit" onClick={handleNotificationsClick}>
          <Badge badgeContent={unreadCount} color="error">
            {unreadCount > 0 ? (
              <NotificationsActiveIcon />
            ) : (
              <NotificationsIcon />
            )}
          </Badge>
        </IconButton>
      </Tooltip>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleNotificationsClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          style: { width: 400, maxHeight: 500 }
        }}
      >
        <Box p={2} borderBottom={1} borderColor="divider">
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="h6">Notificaciones</Typography>
            <Box>
              <Tooltip title="Actualizar">
                <IconButton size="small" onClick={handleRefresh}>
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Filtrar">
                <IconButton size="small" onClick={handleFilterClick}>
                  <FilterIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Configuración">
                <IconButton size="small" onClick={() => setSettingsDialogOpen(true)}>
                  <SettingsIcon />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>
          
          <Box display="flex" gap={1}>
            <Button size="small" onClick={handleMarkAllAsRead}>
              Marcar todas como leídas
            </Button>
          </Box>
        </Box>

        {loading && <LinearProgress />}

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {filteredAndSortedNotifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No hay notificaciones"
                secondary="Las notificaciones aparecerán aquí"
              />
            </ListItem>
          ) : (
            filteredAndSortedNotifications.map((notification) => (
              <ListItem
                key={notification.id}
                sx={{
                  bgcolor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': { bgcolor: 'action.selected' }
                }}
              >
                <ListItemIcon>
                  <Avatar sx={{ bgcolor: `${getNotificationColor(notification.type)}.main` }}>
                    {getNotificationIcon(notification.type, notification.priority)}
                  </Avatar>
                </ListItemIcon>
                
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle2" sx={{ fontWeight: notification.read ? 'normal' : 'bold' }}>
                        {notification.title}
                      </Typography>
                      <Chip 
                        label={notification.type} 
                        size="small" 
                        color={getNotificationColor(notification.type)}
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box>
                      <Typography variant="body2" color="textSecondary">
                        {notification.message}
                      </Typography>
                      <Typography variant="caption" color="textSecondary">
                        {formatTime(notification.created_at)}
                      </Typography>
                    </Box>
                  }
                />
                
                <ListItemSecondaryAction>
                  <Box display="flex" flexDirection="column" gap={1}>
                    {!notification.read && (
                      <Tooltip title="Marcar como leído">
                        <IconButton
                          size="small"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          <MarkReadIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Eliminar">
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteNotification(notification.id)}
                        color="error"
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))
          )}
        </List>
      </Popover>

      <Menu
        anchorEl={filterAnchorEl}
        open={filterOpen}
        onClose={handleFilterClose}
      >
        <MenuItem onClick={() => handleFilterChange('all')}>
          Todas
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('unread')}>
          No leídas
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => handleFilterChange('order')}>
          Órdenes
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('client')}>
          Clientes
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('campaign')}>
          Campañas
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('automation')}>
          Automatización
        </MenuItem>
        <MenuItem onClick={() => handleFilterChange('system')}>
          Sistema
        </MenuItem>
      </Menu>

      <Dialog open={settingsDialogOpen} onClose={() => setSettingsDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Configuración de Notificaciones</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Canales de Notificación
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.inApp}
                        onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
                      />
                    }
                    label="Notificaciones en la aplicación"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.email}
                        onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                      />
                    }
                    label="Notificaciones por email"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.push}
                        onChange={(e) => handlePreferenceChange('push', e.target.checked)}
                      />
                    }
                    label="Notificaciones push"
                  />
                </FormGroup>
              </CardContent>
            </Card>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Tipos de Notificación
                </Typography>
                <FormGroup>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.types.order}
                        onChange={(e) => handleTypePreferenceChange('order', e.target.checked)}
                      />
                    }
                    label="Órdenes"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.types.client}
                        onChange={(e) => handleTypePreferenceChange('client', e.target.checked)}
                      />
                    }
                    label="Clientes"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.types.campaign}
                        onChange={(e) => handleTypePreferenceChange('campaign', e.target.checked)}
                      />
                    }
                    label="Campañas"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.types.automation}
                        onChange={(e) => handleTypePreferenceChange('automation', e.target.checked)}
                      />
                    }
                    label="Automatización"
                  />
                  <FormControlLabel
                    control={
                      <Switch
                        checked={userPreferences.types.system}
                        onChange={(e) => handleTypePreferenceChange('system', e.target.checked)}
                      />
                    }
                    label="Sistema"
                  />
                </FormGroup>
              </CardContent>
            </Card>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsDialogOpen(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>

      {notification.open && (
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ position: 'fixed', top: 20, right: 20, zIndex: 9999 }}
        >
          {notification.message}
        </Alert>
      )}
    </Box>
  );
};

export default NotificationCenter;