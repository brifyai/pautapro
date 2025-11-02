import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  IconButton,
  Button,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Avatar,
  Tooltip,
  Fab,
  Zoom,
  Alert,
  Badge,
  Menu,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  InputAdornment,
  Paper,
  List,
  ListItem
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Dashboard as DashboardIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  AttachMoney as AttachMoneyIcon,
  Notifications as NotificationsIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Fullscreen as FullscreenIcon,
  ViewModule as ViewModuleIcon,
  ViewList as ViewListIcon,
  FilterList as FilterIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Assessment as AssessmentIcon,
  Timeline as TimelineIcon,
  Lightbulb as LightbulbIcon,
  Speed as SpeedIcon,
  Analytics as AnalyticsIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  Schedule as ScheduleIcon,
  Star as StarIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { dashboardService } from '../../services/dashboardService';
import { campaignService } from '../../services/campaignService';
import { orderService } from '../../services/orderService';
import clientScoringService from '../../services/clientScoringService';
import './CRMDashboard.css';

const CRMDashboard = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('grid'); // grid, list, kanban
  const [layoutConfig, setLayoutConfig] = useState({
    showStats: true,
    showCharts: true,
    showRecentActivity: true,
    showQuickActions: true,
    showNotifications: true,
    compactMode: false
  });
  const [widgets, setWidgets] = useState([
    { id: 'stats', title: 'Estadísticas', visible: true, order: 1 },
    { id: 'charts', title: 'Gráficos', visible: true, order: 2 },
    { id: 'recent', title: 'Actividad Reciente', visible: true, order: 3 },
    { id: 'quick', title: 'Acciones Rápidas', visible: true, order: 4 },
    { id: 'notifications', title: 'Notificaciones', visible: true, order: 5 }
  ]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTab, setSelectedTab] = useState(0);

  // Datos del dashboard
  const [stats, setStats] = useState({
    totalClients: 0,
    activeCampaigns: 0,
    pendingOrders: 0,
    totalRevenue: 0,
    conversionRate: 0,
    satisfactionScore: 0
  });

  const [recentActivities, setRecentActivities] = useState([]);
  const [quickActions, setQuickActions] = useState([
    { id: 1, title: 'Nuevo Cliente', icon: <PeopleIcon />, action: () => navigate('/clientes') },
    { id: 2, title: 'Crear Campaña', icon: <CampaignIcon />, action: () => navigate('/campanas') },
    { id: 3, title: 'Nueva Orden', icon: <ShoppingCartIcon />, action: () => navigate('/ordenes/crear') },
    { id: 4, title: 'Generar Reporte', icon: <AssessmentIcon />, action: () => navigate('/reportes') }
  ]);

  useEffect(() => {
    loadDashboardData();
    loadUserPreferences();
    loadNotifications();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activitiesData] = await Promise.all([
        dashboardService.getDashboardStats(),
        dashboardService.getRecentActivity()
      ]);

      setStats({
        totalClients: statsData.clientes || 0,
        activeCampaigns: statsData.campanas || 0,
        pendingOrders: statsData.ordenesActivas || 0,
        totalRevenue: statsData.presupuestoTotal || 0,
        conversionRate: 85.5,
        satisfactionScore: 4.7
      });

      setRecentActivities(activitiesData || []);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const loadUserPreferences = async () => {
    try {
      const preferences = localStorage.getItem('crm_dashboard_preferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        setLayoutConfig(parsed.layout || layoutConfig);
        setWidgets(parsed.widgets || widgets);
        setViewMode(parsed.viewMode || viewMode);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadNotifications = async () => {
    try {
      const mockNotifications = [
        { id: 1, type: 'success', title: 'Nueva orden creada', message: 'Orden #1234 ha sido creada exitosamente', time: 'hace 5 min', read: false },
        { id: 2, type: 'warning', title: 'Campaña por vencer', message: 'Campaña "Verano 2024" vence en 3 días', time: 'hace 1 hora', read: false },
        { id: 3, type: 'info', title: 'Cliente nuevo', message: 'Empresa ABC se ha registrado como nuevo cliente', time: 'hace 2 horas', read: true }
      ];
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const saveUserPreferences = () => {
    try {
      const preferences = {
        layout: layoutConfig,
        widgets,
        viewMode
      };
      localStorage.setItem('crm_dashboard_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving user preferences:', error);
    }
  };

  const handleWidgetToggle = (widgetId) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const handleWidgetReorder = (widgetId, direction) => {
    const widgetIndex = widgets.findIndex(w => w.id === widgetId);
    const newWidgets = [...widgets];
    
    if (direction === 'up' && widgetIndex > 0) {
      [newWidgets[widgetIndex], newWidgets[widgetIndex - 1]] = 
      [newWidgets[widgetIndex - 1], newWidgets[widgetIndex]];
    } else if (direction === 'down' && widgetIndex < widgets.length - 1) {
      [newWidgets[widgetIndex], newWidgets[widgetIndex + 1]] = 
      [newWidgets[widgetIndex + 1], newWidgets[widgetIndex]];
    }
    
    setWidgets(newWidgets);
  };

  const handleConfigChange = (key, value) => {
    setLayoutConfig(prev => ({ ...prev, [key]: value }));
  };

  const handleNotificationClick = (notificationId) => {
    setNotifications(notifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    ));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const renderStatsCard = () => (
    <Card className="crm-stats-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" className="text-gradient">
            Métricas Clave
          </Typography>
          <IconButton size="small" onClick={() => setSettingsOpen(true)}>
            <SettingsIcon />
          </IconButton>
        </Box>
        
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Box className="metric-card">
              <Avatar className="metric-avatar" sx={{ bgcolor: '#4CAF50' }}>
                <PeopleIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" className="metric-value">
                  {stats.totalClients}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Clientes Totales
                </Typography>
                <Box className="metric-trend positive">
                  <TrendingUpIcon fontSize="small" />
                  <span>+12%</span>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box className="metric-card">
              <Avatar className="metric-avatar" sx={{ bgcolor: '#2196F3' }}>
                <CampaignIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" className="metric-value">
                  {stats.activeCampaigns}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Campañas Activas
                </Typography>
                <Box className="metric-trend positive">
                  <TrendingUpIcon fontSize="small" />
                  <span>+8%</span>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box className="metric-card">
              <Avatar className="metric-avatar" sx={{ bgcolor: '#FF9800' }}>
                <ShoppingCartIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" className="metric-value">
                  {stats.pendingOrders}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Órdenes Pendientes
                </Typography>
                <Box className="metric-trend negative">
                  <TrendingUpIcon fontSize="small" style={{ transform: 'rotate(180deg)' }} />
                  <span>-3%</span>
                </Box>
              </Box>
            </Box>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Box className="metric-card">
              <Avatar className="metric-avatar" sx={{ bgcolor: '#9C27B0' }}>
                <AttachMoneyIcon />
              </Avatar>
              <Box>
                <Typography variant="h4" className="metric-value">
                  ${(stats.totalRevenue / 1000000).toFixed(1)}M
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Ingresos Totales
                </Typography>
                <Box className="metric-trend positive">
                  <TrendingUpIcon fontSize="small" />
                  <span>+15%</span>
                </Box>
              </Box>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  const renderQuickActions = () => (
    <Card className="crm-quick-actions-card animate-slide-up" style={{ animationDelay: '0.3s' }}>
      <CardContent>
        <Typography variant="h6" className="text-gradient" mb={3}>
          Acciones Rápidas
        </Typography>
        
        <Grid container spacing={2}>
          {quickActions.map((action, index) => (
            <Grid item xs={12} sm={6} md={3} key={action.id}>
              <Button
                fullWidth
                variant="outlined"
                className="quick-action-btn"
                onClick={action.action}
                startIcon={action.icon}
                sx={{ 
                  height: 80,
                  flexDirection: 'column',
                  textTransform: 'none',
                  border: '2px dashed',
                  borderColor: 'primary.main'
                }}
              >
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {action.title}
                </Typography>
              </Button>
            </Grid>
          ))}
        </Grid>
      </CardContent>
    </Card>
  );

  const renderRecentActivity = () => (
    <Card className="crm-activity-card animate-slide-up" style={{ animationDelay: '0.4s' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" className="text-gradient">
            Actividad Reciente
          </Typography>
          <Button size="small" variant="text">
            Ver todo
          </Button>
        </Box>
        
        <List className="activity-list">
          {recentActivities.slice(0, 5).map((activity, index) => (
            <ListItem key={index} className="activity-item">
              <ListItemIcon>
                <Avatar className="activity-avatar" sx={{ width: 32, height: 32 }}>
                  {activity.type === 'order' && <ShoppingCartIcon />}
                  {activity.type === 'client' && <PeopleIcon />}
                  {activity.type === 'campaign' && <CampaignIcon />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={activity.title}
                secondary={activity.time}
                primaryTypographyProps={{ variant: 'body2', fontWeight: 500 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Chip 
                label={activity.status} 
                size="small" 
                color={activity.status === 'completed' ? 'success' : 'warning'}
              />
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  const renderNotifications = () => (
    <Card className="crm-notifications-card animate-slide-up" style={{ animationDelay: '0.5s' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h6" className="text-gradient">
            Notificaciones
          </Typography>
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </Box>
        
        <List className="notifications-list">
          {notifications.slice(0, 3).map((notification) => (
            <ListItem 
              key={notification.id} 
              className={`notification-item ${!notification.read ? 'unread' : ''}`}
              onClick={() => handleNotificationClick(notification.id)}
            >
              <ListItemIcon>
                <Avatar className="notification-avatar" sx={{ width: 32, height: 32 }}>
                  {notification.type === 'success' && <TimelineIcon />}
                  {notification.type === 'warning' && <LightbulbIcon />}
                  {notification.type === 'info' && <SpeedIcon />}
                </Avatar>
              </ListItemIcon>
              <ListItemText
                primary={notification.title}
                secondary={notification.message}
                primaryTypographyProps={{ variant: 'body2', fontWeight: !notification.read ? 600 : 400 }}
                secondaryTypographyProps={{ variant: 'caption' }}
              />
              <Typography variant="caption" color="text.secondary">
                {notification.time}
              </Typography>
            </ListItem>
          ))}
        </List>
      </CardContent>
    </Card>
  );

  return (
    <Box className="crm-dashboard">
      {/* Header CRM */}
      <AppBar position="static" className="crm-header" elevation={0}>
        <Toolbar>
          <Typography variant="h5" className="crm-title">
            PautaPro CRM
          </Typography>
          
          <Box sx={{ flexGrow: 1 }} />
          
          {/* Barra de búsqueda */}
          <Paper className="crm-search-bar">
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
            <TextField
              placeholder="Buscar clientes, campañas, órdenes..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{ 
                disableUnderline: true,
                sx: { background: 'transparent' }
              }}
            />
          </Paper>

          {/* Controles de vista */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Vista Grid">
              <IconButton 
                color={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                <ViewModuleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Vista Lista">
              <IconButton 
                color={viewMode === 'list' ? 'primary' : 'default'}
                onClick={() => setViewMode('list')}
              >
                <ViewListIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filtros">
              <IconButton>
                <FilterIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Configuración">
              <IconButton onClick={() => setSettingsOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
            
            {/* Notificaciones */}
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Pestañas de navegación */}
      <Box className="crm-tabs-container">
        <Tabs value={selectedTab} onChange={(e, v) => setSelectedTab(v)} className="crm-tabs">
          <Tab label="Resumen" icon={<DashboardIcon />} />
          <Tab label="Análisis" icon={<AnalyticsIcon />} />
          <Tab label="Clientes" icon={<PeopleIcon />} />
          <Tab label="Campañas" icon={<CampaignIcon />} />
          <Tab label="Reportes" icon={<AssessmentIcon />} />
        </Tabs>
      </Box>

      {/* Contenido principal */}
      <Box className="crm-content" sx={{ p: 3 }}>
        <Grid container spacing={3}>
          {/* Estadísticas */}
          {widgets.find(w => w.id === 'stats')?.visible && (
            <Grid item xs={12}>
              {renderStatsCard()}
            </Grid>
          )}

          {/* Acciones Rápidas */}
          {widgets.find(w => w.id === 'quick')?.visible && (
            <Grid item xs={12} lg={6}>
              {renderQuickActions()}
            </Grid>
          )}

          {/* Actividad Reciente */}
          {widgets.find(w => w.id === 'recent')?.visible && (
            <Grid item xs={12} lg={6}>
              {renderRecentActivity()}
            </Grid>
          )}

          {/* Notificaciones */}
          {widgets.find(w => w.id === 'notifications')?.visible && (
            <Grid item xs={12} md={6}>
              {renderNotifications()}
            </Grid>
          )}
        </Grid>
      </Box>

      {/* Diálogo de configuración */}
      <Dialog 
        open={settingsOpen} 
        onClose={() => setSettingsOpen(false)}
        maxWidth="md"
        fullWidth
        className="crm-settings-dialog"
      >
        <DialogTitle className="text-gradient">
          Personalizar Dashboard
        </DialogTitle>
        <DialogContent>
          <Typography variant="h6" gutterBottom>
            Widgets Visibles
          </Typography>
          <List>
            {widgets.map((widget) => (
              <ListItem key={widget.id}>
                <ListItemIcon>
                  <DragIcon />
                </ListItemIcon>
                <ListItemText primary={widget.title} />
                <IconButton 
                  onClick={() => handleWidgetToggle(widget.id)}
                  color={widget.visible ? 'primary' : 'default'}
                >
                  {widget.visible ? <VisibilityIcon /> : <VisibilityOffIcon />}
                </IconButton>
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Configuración General
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={layoutConfig.compactMode}
                    onChange={(e) => handleConfigChange('compactMode', e.target.checked)}
                  />
                }
                label="Modo Compacto"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSettingsOpen(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={() => {
              saveUserPreferences();
              setSettingsOpen(false);
            }}
            variant="contained"
            className="modern-btn"
          >
            Guardar Cambios
          </Button>
        </DialogActions>
      </Dialog>

      {/* Botón flotante de acciones rápidas */}
      <Fab
        color="primary"
        aria-label="add"
        className="crm-fab animate-float"
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <AddIcon />
      </Fab>

      {/* Menú de acciones rápidas */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        className="crm-quick-menu"
      >
        {quickActions.map((action) => (
          <MenuItem key={action.id} onClick={action.action}>
            <ListItemIcon>{action.icon}</ListItemIcon>
            <ListItemText>{action.title}</ListItemText>
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
};

export default CRMDashboard;