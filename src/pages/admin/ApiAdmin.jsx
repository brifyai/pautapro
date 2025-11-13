import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  Switch,
  Alert,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  Tooltip,
  Badge,
  CircularProgress
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  ContentCopy as CopyIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Refresh as RefreshIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import MainLayout from '../../components/layout/MainLayout';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

const ApiAdmin = () => {
  const navigate = useNavigate();

  // Estados principales
  const [loading, setLoading] = useState(true);
  const [apiTokens, setApiTokens] = useState([]);
  const [apiMetrics, setApiMetrics] = useState({});
  const [openTokenModal, setOpenTokenModal] = useState(false);
  const [openMetricsModal, setOpenMetricsModal] = useState(false);
  const [editingToken, setEditingToken] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  // Estados del formulario
  const [tokenForm, setTokenForm] = useState({
    nombre: '',
    descripcion: '',
    permisos: [],
    plan: 'standard',
    expiracion_dias: 365,
    limite_requests_hora: 1000,
    activo: true
  });

  // Datos de configuración
  const [permisosDisponibles] = useState([
    { id: 'clientes.read', nombre: 'Leer Clientes', descripcion: 'Acceso de solo lectura a datos de clientes' },
    { id: 'clientes.create', nombre: 'Crear Clientes', descripcion: 'Permiso para crear nuevos clientes' },
    { id: 'clientes.update', nombre: 'Actualizar Clientes', descripcion: 'Permiso para modificar datos de clientes' },
    { id: 'clientes.delete', nombre: 'Eliminar Clientes', descripcion: 'Permiso para eliminar clientes' },
    { id: 'ordenes.read', nombre: 'Leer Órdenes', descripcion: 'Acceso de solo lectura a órdenes' },
    { id: 'ordenes.create', nombre: 'Crear Órdenes', descripcion: 'Permiso para crear nuevas órdenes' },
    { id: 'ordenes.update', nombre: 'Actualizar Órdenes', descripcion: 'Permiso para modificar órdenes' },
    { id: 'reportes.read', nombre: 'Leer Reportes', descripcion: 'Acceso a reportes y analytics' },
    { id: 'reportes.admin', nombre: 'Administrar Reportes', descripcion: 'Generación de reportes administrativos' },
    { id: 'webhooks.manage', nombre: 'Gestionar Webhooks', descripcion: 'Crear y gestionar webhooks' }
  ]);

  const [planes] = useState([
    { id: 'standard', nombre: 'Standard', limite: 1000, precio: '$99/mes' },
    { id: 'premium', nombre: 'Premium', limite: 10000, precio: '$299/mes' },
    { id: 'enterprise', nombre: 'Enterprise', limite: 'ilimitado', precio: 'Personalizado' }
  ]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      await Promise.all([
        cargarApiTokens(),
        cargarApiMetrics()
      ]);
    } catch (error) {
      console.error('Error cargando datos:', error);
      mostrarSnackbar('Error cargando datos de la API', 'error');
    } finally {
      setLoading(false);
    }
  };

  const cargarApiTokens = async () => {
    try {
      const { data, error } = await supabase
        .from('api_tokens')
        .select('*')
        .order('fecha_creacion', { ascending: false });

      if (error) throw error;
      setApiTokens(data || []);
    } catch (error) {
      console.error('Error cargando tokens:', error);
    }
  };

  const cargarApiMetrics = async () => {
    try {
      // Simular métricas (en producción vendría de la API real)
      const metricasSimuladas = {
        total_requests_24h: 12456,
        requests_exitosos: 11890,
        requests_error: 566,
        tokens_activos: 8,
        tokens_inactivos: 3,
        bandwidth_usado: 245.7, // MB
        bandwidth_limite: 1000, // MB
        uptime: 99.9,
        endpoints_mas_usados: [
          { endpoint: 'GET /clientes', requests: 5432 },
          { endpoint: 'POST /ordenes', requests: 3210 },
          { endpoint: 'GET /reportes', requests: 2890 }
        ]
      };
      setApiMetrics(metricasSimuladas);
    } catch (error) {
      console.error('Error cargando métricas:', error);
    }
  };

  const generarToken = async () => {
    try {
      if (!tokenForm.nombre.trim()) {
        mostrarSnackbar('El nombre es obligatorio', 'error');
        return;
      }

      if (tokenForm.permisos.length === 0) {
        mostrarSnackbar('Debe seleccionar al menos un permiso', 'error');
        return;
      }

      // Generar token único
      const token = `pk_${generateSecureToken()}`;
      
      // Preparar datos del token
      const tokenData = {
        ...tokenForm,
        token: token,
        fecha_creacion: new Date().toISOString(),
        fecha_expiracion: new Date(Date.now() + tokenForm.expiracion_dias * 24 * 60 * 60 * 1000).toISOString(),
        limite_requests_hora: getLimiteRequestsPorPlan(tokenForm.plan),
        requests_realizadas: 0,
        requests_restantes: getLimiteRequestsPorPlan(tokenForm.plan)
      };

      // Guardar en base de datos
      const { data, error } = await supabase
        .from('api_tokens')
        .insert([tokenData])
        .select()
        .single();

      if (error) throw error;

      // Actualizar lista
      await cargarApiTokens();
      
      mostrarSnackbar('Token generado exitosamente', 'success');
      setOpenTokenModal(false);
      resetForm();

    } catch (error) {
      console.error('Error generando token:', error);
      mostrarSnackbar('Error generando token', 'error');
    }
  };

  const eliminarToken = async (tokenId) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: 'Esta acción no se puede deshacer',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#d32f2f'
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from('api_tokens')
          .delete()
          .eq('id', tokenId);

        if (error) throw error;
        
        await cargarApiTokens();
        mostrarSnackbar('Token eliminado exitosamente', 'success');
      }

    } catch (error) {
      console.error('Error eliminando token:', error);
      mostrarSnackbar('Error eliminando token', 'error');
    }
  };

  const regenerarToken = async (tokenId) => {
    try {
      const result = await Swal.fire({
        title: 'Regenerar Token',
        text: '¿Estás seguro de que quieres regenerar este token? El token anterior dejará de funcionar.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, regenerar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f57c00'
      });

      if (result.isConfirmed) {
        const nuevoToken = `pk_${generateSecureToken()}`;
        
        const { error } = await supabase
          .from('api_tokens')
          .update({ 
            token: nuevoToken,
            fecha_regeneracion: new Date().toISOString(),
            requests_realizadas: 0,
            requests_restantes: getLimiteRequestsPorPlan(editingToken.plan)
          })
          .eq('id', tokenId);

        if (error) throw error;
        
        await cargarApiTokens();
        mostrarSnackbar('Token regenerado exitosamente', 'success');
      }

    } catch (error) {
      console.error('Error regenerando token:', error);
      mostrarSnackbar('Error regenerando token', 'error');
    }
  };

  const copiarToken = (token) => {
    navigator.clipboard.writeText(token);
    mostrarSnackbar('Token copiado al portapapeles', 'success');
  };

  const exportarTokens = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Nombre,Descripción,Permisos,Plan,Estado,Creación,Expiración,Requests\n"
      + apiTokens.map(token => 
          `"${token.nombre}","${token.descripcion}","${token.permisos.join(', ')}","${token.plan}","${token.activo ? 'Activo' : 'Inactivo'}","${new Date(token.fecha_creacion).toLocaleDateString()}","${new Date(token.fecha_expiracion).toLocaleDateString()}","${token.requests_realizadas}"`
        ).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `api_tokens_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setTokenForm({
      nombre: '',
      descripcion: '',
      permisos: [],
      plan: 'standard',
      expiracion_dias: 365,
      limite_requests_hora: 1000,
      activo: true
    });
    setEditingToken(null);
  };

  // Funciones auxiliares
  const generateSecureToken = () => {
    return Array.from({length: 32}, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
  };

  const getLimiteRequestsPorPlan = (plan) => {
    const planConfig = planes.find(p => p.id === plan);
    return planConfig?.limite === 'ilimitado' ? -1 : planConfig?.limite || 1000;
  };

  const mostrarSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const cerrarSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const getPlanColor = (plan) => {
    const colors = {
      'standard': 'primary',
      'premium': 'warning', 
      'enterprise': 'success'
    };
    return colors[plan] || 'default';
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('es-CL').format(num);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-CL');
  };

  if (loading) {
    return (
      <MainLayout>
        <Container maxWidth="xl" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Container>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <SecurityIcon color="primary" />
              Administración de API
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Gestiona tokens de API, permisos y métricas de integración empresarial
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={cargarDatos}
            >
              Actualizar
            </Button>
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={exportarTokens}
              disabled={apiTokens.length === 0}
            >
              Exportar
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenTokenModal(true)}
            >
              Nuevo Token
            </Button>
          </Box>
        </Box>

        {/* Métricas Generales */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <CodeIcon color="primary" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatNumber(apiMetrics.total_requests_24h || 0)}</Typography>
                    <Typography variant="body2" color="text.secondary">Requests 24h</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SecurityIcon color="success" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{apiMetrics.tokens_activos || 0}</Typography>
                    <Typography variant="body2" color="text.secondary">Tokens Activos</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AnalyticsIcon color="warning" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{apiMetrics.uptime || 0}%</Typography>
                    <Typography variant="body2" color="text.secondary">Uptime</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <SettingsIcon color="info" sx={{ fontSize: 40 }} />
                  <Box>
                    <Typography variant="h4">{formatNumber(apiMetrics.bandwidth_usado || 0)} MB</Typography>
                    <Typography variant="body2" color="text.secondary">Bandwidth</Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Tabla de Tokens */}
        <Paper elevation={3}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Tokens de API Registrados ({apiTokens.length})
            </Typography>
            
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Descripción</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell>Permisos</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Requests 24h</TableCell>
                    <TableCell>Creado</TableCell>
                    <TableCell>Expira</TableCell>
                    <TableCell>Acciones</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {apiTokens.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        No hay tokens registrados. Crea tu primer token para comenzar.
                      </TableCell>
                    </TableRow>
                  ) : (
                    apiTokens.map((token) => (
                      <TableRow key={token.id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" fontWeight="medium">
                              {token.nombre}
                            </Typography>
                            {!token.activo && (
                              <Chip size="small" label="Inactivo" color="error" variant="outlined" />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {token.descripcion || '-'}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={token.plan.toUpperCase()} 
                            color={getPlanColor(token.plan)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                            {token.permisos.slice(0, 2).map((permiso) => (
                              <Chip 
                                key={permiso} 
                                label={permiso} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            ))}
                            {token.permisos.length > 2 && (
                              <Chip 
                                label={`+${token.permisos.length - 2}`} 
                                size="small" 
                                variant="outlined"
                                sx={{ fontSize: '0.75rem' }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={token.activo ? 'Activo' : 'Inactivo'}
                            color={token.activo ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2">
                              {formatNumber(token.requests_realizadas || 0)}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              / {token.limite_requests_hora === -1 ? '∞' : formatNumber(token.limite_requests_hora)}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {formatDate(token.fecha_creacion)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color={
                            new Date(token.fecha_expiracion) < new Date() ? 'error.main' : 'text.primary'
                          }>
                            {formatDate(token.fecha_expiracion)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Tooltip title="Copiar Token">
                              <IconButton 
                                size="small"
                                onClick={() => copiarToken(token.token)}
                              >
                                <CopyIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Regenerar Token">
                              <IconButton 
                                size="small"
                                onClick={() => regenerarToken(token.id)}
                                color="warning"
                              >
                                <RefreshIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Eliminar Token">
                              <IconButton 
                                size="small"
                                onClick={() => eliminarToken(token.id)}
                                color="error"
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        </Paper>

        {/* Modal de Nuevo/Editar Token */}
        <Dialog 
          open={openTokenModal} 
          onClose={() => setOpenTokenModal(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>
            {editingToken ? 'Editar Token' : 'Generar Nuevo Token de API'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nombre del Token"
                    value={tokenForm.nombre}
                    onChange={(e) => setTokenForm({...tokenForm, nombre: e.target.value})}
                    placeholder="Ej: Sistema de Facturación"
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Plan</InputLabel>
                    <Select
                      value={tokenForm.plan}
                      onChange={(e) => setTokenForm({...tokenForm, plan: e.target.value})}
                      label="Plan"
                    >
                      {planes.map((plan) => (
                        <MenuItem key={plan.id} value={plan.id}>
                          {plan.nombre} - {plan.precio}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Descripción"
                    value={tokenForm.descripcion}
                    onChange={(e) => setTokenForm({...tokenForm, descripcion: e.target.value})}
                    multiline
                    rows={2}
                    placeholder="Descripción del uso del token..."
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Expiración (días)"
                    type="number"
                    value={tokenForm.expiracion_dias}
                    onChange={(e) => setTokenForm({...tokenForm, expiracion_dias: parseInt(e.target.value)})}
                    InputProps={{ inputProps: { min: 1, max: 3650 } }}
                  />
                </Grid>
                
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Estado</InputLabel>
                    <Select
                      value={tokenForm.activo ? 'activo' : 'inactivo'}
                      onChange={(e) => setTokenForm({...tokenForm, activo: e.target.value === 'activo'})}
                      label="Estado"
                    >
                      <MenuItem value="activo">Activo</MenuItem>
                      <MenuItem value="inactivo">Inactivo</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Permisos
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Selecciona los permisos que tendrá este token
                  </Typography>
                  
                  <Grid container spacing={2}>
                    {permisosDisponibles.map((permiso) => (
                      <Grid item xs={12} md={6} key={permiso.id}>
                        <Box
                          sx={{
                            p: 2,
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 1,
                            cursor: 'pointer',
                            backgroundColor: tokenForm.permisos.includes(permiso.id) ? 'primary.light' : 'transparent',
                            color: tokenForm.permisos.includes(permiso.id) ? 'primary.contrastText' : 'inherit',
                            '&:hover': {
                              backgroundColor: tokenForm.permisos.includes(permiso.id) ? 'primary.main' : 'action.hover'
                            }
                          }}
                          onClick={() => {
                            const permisos = tokenForm.permisos.includes(permiso.id)
                              ? tokenForm.permisos.filter(p => p !== permiso.id)
                              : [...tokenForm.permisos, permiso.id];
                            setTokenForm({...tokenForm, permisos});
                          }}
                        >
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <Box>
                              <Typography variant="subtitle2" fontWeight="medium">
                                {permiso.nombre}
                              </Typography>
                              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                {permiso.descripcion}
                              </Typography>
                            </Box>
                            <Switch 
                              checked={tokenForm.permisos.includes(permiso.id)}
                              onChange={() => {}}
                              size="small"
                            />
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              </Grid>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenTokenModal(false)}>Cancelar</Button>
            <Button 
              variant="contained" 
              onClick={generarToken}
              disabled={!tokenForm.nombre.trim() || tokenForm.permisos.length === 0}
            >
              {editingToken ? 'Actualizar' : 'Generar'} Token
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar para notificaciones */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={cerrarSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert
            onClose={cerrarSnackbar}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </MainLayout>
  );
};

export default ApiAdmin;