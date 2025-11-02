import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Grid,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  Tabs,
  Tab,
  Paper,
  LinearProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Settings as SettingsIcon,
  Email as EmailIcon,
  Task as TaskIcon,
  Notifications as NotificationsIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import automationService from '../../services/automationService';

const AutomationManager = () => {
  const [rules, setRules] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    trigger: '',
    conditions: {},
    actions: [],
    priority: 1,
    active: true
  });
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });

  const triggerOptions = [
    { value: 'new_client', label: 'Nuevo Cliente' },
    { value: 'campaign_expiring', label: 'Campaña por Expirar' },
    { value: 'new_order', label: 'Nueva Orden' },
    { value: 'client_birthday', label: 'Cumpleaños del Cliente' },
    { value: 'client_inactive', label: 'Cliente Inactivo' }
  ];

  const actionOptions = [
    { value: 'send_welcome_email', label: 'Enviar Email de Bienvenida' },
    { value: 'send_reminder_email', label: 'Enviar Email de Recordatorio' },
    { value: 'send_confirmation_email', label: 'Enviar Email de Confirmación' },
    { value: 'send_birthday_email', label: 'Enviar Email de Cumpleaños' },
    { value: 'send_reactivation_email', label: 'Enviar Email de Reactivación' },
    { value: 'create_followup_task', label: 'Crear Tarea de Seguimiento' },
    { value: 'create_task', label: 'Crear Tarea' },
    { value: 'update_inventory', label: 'Actualizar Inventario' },
    { value: 'notify_manager', label: 'Notificar Gerente' },
    { value: 'notify_sales_team', label: 'Notificar Equipo de Ventas' },
    { value: 'apply_discount', label: 'Aplicar Descuento' }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [automationRules, automationStats] = await Promise.all([
        automationService.getAutomationRules(),
        automationService.getAutomationStats()
      ]);
      
      setRules(automationRules);
      setStats(automationStats);
    } catch (error) {
      console.error('Error loading automation data:', error);
      showNotification('Error al cargar datos de automatización', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, severity = 'success') => {
    setNotification({ open: true, message, severity });
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setFormData({
      name: '',
      trigger: '',
      conditions: {},
      actions: [],
      priority: 1,
      active: true
    });
    setDialogOpen(true);
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      trigger: rule.trigger,
      conditions: rule.conditions || {},
      actions: rule.actions || [],
      priority: rule.priority || 1,
      active: rule.active
    });
    setDialogOpen(true);
  };

  const handleSaveRule = async () => {
    try {
      if (!formData.name || !formData.trigger || formData.actions.length === 0) {
        showNotification('Por favor complete todos los campos requeridos', 'error');
        return;
      }

      if (editingRule) {
        await automationService.updateAutomationRule(editingRule.id, formData);
        showNotification('Regla actualizada correctamente', 'success');
      } else {
        await automationService.createAutomationRule(formData);
        showNotification('Regla creada correctamente', 'success');
      }

      setDialogOpen(false);
      await loadData();
    } catch (error) {
      console.error('Error saving rule:', error);
      showNotification('Error al guardar la regla', 'error');
    }
  };

  const handleDeleteRule = async (ruleId) => {
    if (window.confirm('¿Está seguro de que desea eliminar esta regla?')) {
      try {
        await automationService.deleteAutomationRule(ruleId);
        showNotification('Regla eliminada correctamente', 'success');
        await loadData();
      } catch (error) {
        console.error('Error deleting rule:', error);
        showNotification('Error al eliminar la regla', 'error');
      }
    }
  };

  const handleToggleRule = async (ruleId, active) => {
    try {
      await automationService.updateAutomationRule(ruleId, { active });
      showNotification(`Regla ${active ? 'activada' : 'desactivada'} correctamente`, 'success');
      await loadData();
    } catch (error) {
      console.error('Error toggling rule:', error);
      showNotification('Error al cambiar estado de la regla', 'error');
    }
  };

  const renderStats = () => {
    if (!stats) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <EmailIcon color="primary" />
                <Typography variant="h6" ml={1}>Emails</Typography>
              </Box>
              <Typography variant="h4" color="primary">
                {stats.emails.sent}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Enviados este mes
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.emails.sent / Math.max(stats.emails.total, 1)) * 100} 
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TaskIcon color="success" />
                <Typography variant="h6" ml={1}>Tareas</Typography>
              </Box>
              <Typography variant="h4" color="success.main">
                {stats.tasks.completed}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Completadas este mes
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.tasks.completed / Math.max(stats.tasks.total, 1)) * 100} 
                sx={{ mt: 1 }}
                color="success"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <SettingsIcon color="warning" />
                <Typography variant="h6" ml={1}>Reglas</Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {stats.rules.active}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Activas
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.rules.active / Math.max(stats.rules.total, 1)) * 100} 
                sx={{ mt: 1 }}
                color="warning"
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" mb={2}>
                <TrendingUpIcon color="info" />
                <Typography variant="h6" ml={1}>Eficiencia</Typography>
              </Box>
              <Typography variant="h4" color="info.main">
                {Math.round((stats.emails.sent / Math.max(stats.emails.total, 1)) * 100)}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Tasa de éxito
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={(stats.emails.sent / Math.max(stats.emails.total, 1)) * 100} 
                sx={{ mt: 1 }}
                color="info"
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderRulesList = () => {
    return (
      <Paper elevation={2}>
        <Box p={2} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Reglas de Automatización</Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateRule}
          >
            Nueva Regla
          </Button>
        </Box>
        
        <List>
          {rules.map((rule, index) => (
            <React.Fragment key={rule.id}>
              <ListItem>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1">{rule.name}</Typography>
                      <Chip 
                        label={rule.trigger} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                      <Chip 
                        label={`Prioridad: ${rule.priority}`} 
                        size="small" 
                        color="secondary" 
                        variant="outlined"
                      />
                    </Box>
                  }
                  secondary={
                    <Box mt={1}>
                      <Typography variant="body2" color="textSecondary">
                        Acciones: {rule.actions?.join(', ') || 'Ninguna'}
                      </Typography>
                      <Box display="flex" alignItems="center" gap={1} mt={1}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={rule.active}
                              onChange={(e) => handleToggleRule(rule.id, e.target.checked)}
                              size="small"
                            />
                          }
                          label={rule.active ? 'Activa' : 'Inactiva'}
                        />
                      </Box>
                    </Box>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleEditRule(rule)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    edge="end"
                    onClick={() => handleDeleteRule(rule.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
              {index < rules.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>
    );
  };

  const renderForm = () => {
    return (
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingRule ? 'Editar Regla de Automatización' : 'Nueva Regla de Automatización'}
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} mt={2}>
            <TextField
              label="Nombre de la Regla"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
              required
            />

            <FormControl fullWidth required>
              <InputLabel>Disparador</InputLabel>
              <Select
                value={formData.trigger}
                onChange={(e) => setFormData({ ...formData, trigger: e.target.value })}
                label="Disparador"
              >
                {triggerOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth required>
              <InputLabel>Acciones</InputLabel>
              <Select
                multiple
                value={formData.actions}
                onChange={(e) => setFormData({ ...formData, actions: e.target.value })}
                label="Acciones"
                renderValue={(selected) => (
                  <Box display="flex" flexWrap="wrap" gap={1}>
                    {selected.map((value) => (
                      <Chip 
                        key={value} 
                        label={actionOptions.find(opt => opt.value === value)?.label || value} 
                        size="small" 
                      />
                    ))}
                  </Box>
                )}
              >
                {actionOptions.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Prioridad"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
            />

            <FormControlLabel
              control={
                <Switch
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                />
              }
              label="Regla Activa"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button onClick={handleSaveRule} variant="contained">
            {editingRule ? 'Actualizar' : 'Crear'}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <LinearProgress sx={{ width: '50%' }} />
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Typography variant="h4" gutterBottom>
        Gestión de Automatización
      </Typography>

      {notification.open && (
        <Alert 
          severity={notification.severity} 
          onClose={() => setNotification({ ...notification, open: false })}
          sx={{ mb: 2 }}
        >
          {notification.message}
        </Alert>
      )}

      <Box mb={3}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Estadísticas" />
          <Tab label="Reglas" />
          <Tab label="Configuración" />
        </Tabs>
      </Box>

      {tabValue === 0 && renderStats()}
      {tabValue === 1 && renderRulesList()}
      {tabValue === 2 && (
        <Paper elevation={2}>
          <Box p={3}>
            <Typography variant="h6" gutterBottom>
              Configuración Avanzada
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Configuración avanzada del sistema de automatización estará disponible próximamente.
            </Typography>
          </Box>
        </Paper>
      )}

      {renderForm()}
    </Box>
  );
};

export default AutomationManager;