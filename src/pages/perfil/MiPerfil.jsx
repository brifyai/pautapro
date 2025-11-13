import React, { useState, useEffect } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Paper
} from '@mui/material';
import {
  Person as PersonIcon,
  Email as EmailIcon,
  VpnKey as VpnKeyIcon,
  Close as CloseIcon,
  Edit as EditIcon
} from '@mui/icons-material';
import { supabase } from '../../config/supabase';
import Swal from 'sweetalert2';

const MiPerfil = () => {
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido: '',
    Email: '',
    Password: ''
  });

  useEffect(() => {
    fetchUsuario();
  }, []);

  const fetchUsuario = async () => {
    try {
      // Obtener el usuario del localStorage
      const userLocal = JSON.parse(localStorage.getItem('user'));
      console.log('🔍 Usuario en localStorage:', userLocal);

      if (!userLocal) {
        console.warn('❌ No hay usuario en localStorage');
        setUsuario({
          nombre: 'Usuario',
          email: 'sin@email.com',
          apellido: '',
          telefono: '',
          rol: 'Usuario',
          estado: false
        });
        setLoading(false);
        return;
      }

      // Usar datos del localStorage directamente (más confiable)
      const usuarioData = {
        id: userLocal.id || userLocal.id_usuario,
        nombre: userLocal.nombre || 'Usuario',
        email: userLocal.email || 'sin@email.com',
        apellido: userLocal.apellido || '',
        telefono: userLocal.telefono || '',
        rol: userLocal.rol || userLocal.perfil || 'Usuario',
        estado: userLocal.estado !== undefined ? userLocal.estado : true,
        perfil: userLocal.perfil || userLocal.rol || 'Usuario',
        id_perfil: userLocal.id_perfil || 1
      };

      console.log('✅ Datos del usuario preparados:', usuarioData);

      setUsuario(usuarioData);
      setFormData({
        Nombre: usuarioData.nombre || '',
        Apellido: usuarioData.apellido || '',
        Email: usuarioData.email || '',
        Password: ''
      });

      // Intentar actualizar desde Supabase solo si tenemos ID
      if (usuarioData.id) {
        try {
          console.log('🔄 Intentando actualizar desde Supabase...');
          const { data: userData, error } = await supabase
            .from('usuarios')
            .select('estado, perfil, id_perfil')
            .eq('id', usuarioData.id)
            .single();

          if (!error && userData) {
            console.log('✅ Datos actualizados desde BD:', userData);
            // Actualizar solo campos específicos de la BD
            setUsuario(prev => ({
              ...prev,
              estado: userData.estado,
              perfil: userData.perfil,
              id_perfil: userData.id_perfil
            }));
          }
        } catch (dbError) {
          console.warn('⚠️ No se pudo actualizar desde BD, usando localStorage:', dbError.message);
        }
      }

    } catch (error) {
      console.error('💥 Error general cargando usuario:', error);
      // Último recurso: mostrar datos mínimos
      setUsuario({
        nombre: 'Usuario',
        email: 'sin@email.com',
        apellido: '',
        telefono: '',
        rol: 'Usuario',
        estado: false
      });
      setFormData({
        Nombre: '',
        Apellido: '',
        Email: '',
        Password: ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => {
    setEditModalOpen(true);
  };

  const handleCloseEdit = () => {
    setEditModalOpen(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Preparar datos para actualizar en Supabase
      const updateData = {
        nombre: formData.Nombre.trim(),
        email: formData.Email.trim().toLowerCase(),
        fechadeultimamodificacion: new Date().toISOString()
      };

      // Solo incluir la contraseña si se ha modificado
      if (formData.Password && formData.Password.trim()) {
        updateData.password = formData.Password; // Nota: En producción debería estar hasheada
      }

      // Actualizar en Supabase
      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuario.id);

      if (error) throw error;

      // Actualizar también el localStorage para mantener consistencia
      const updatedUser = {
        ...usuario,
        nombre: formData.Nombre,
        apellido: formData.Apellido, // Mantener apellido del localStorage
        email: formData.Email,
        nombre_completo: `${formData.Nombre} ${formData.Apellido}`
      };

      // Solo incluir la contraseña si se ha modificado
      if (formData.Password) {
        updatedUser.password = formData.Password;
      }

      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Disparar evento de cambio de autenticación
      window.dispatchEvent(new Event('auth-change'));

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Perfil actualizado correctamente en la base de datos',
        timer: 1500,
        showConfirmButton: false
      });

      setEditModalOpen(false);
      fetchUsuario(); // Recargar los datos del usuario desde Supabase
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el perfil en la base de datos',
        timer: 1500,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!usuario) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" color="error">
          No se pudo cargar la información del usuario
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Mi Perfil
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6">Información Personal</Typography>
          <Button
            variant="contained"
            startIcon={<EditIcon sx={{ color: 'white' }} />}
            onClick={handleEditClick}
          >
            Editar Perfil
          </Button>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Nombre</Typography>
            <Typography variant="body1">{usuario.nombre}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Apellido</Typography>
            <Typography variant="body1">{usuario.apellido || 'No especificado'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Email</Typography>
            <Typography variant="body1">{usuario.email}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Teléfono</Typography>
            <Typography variant="body1">{usuario.telefono || 'No especificado'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Perfil</Typography>
            <Typography variant="body1">{usuario.perfil || usuario.rol || 'Usuario'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Grupo</Typography>
            <Typography variant="body1">{usuario.Grupos?.nombre_grupo || 'No asignado'}</Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Typography variant="subtitle1" color="textSecondary">Estado</Typography>
            <Typography variant="body1">{usuario.estado ? 'Activo' : 'Inactivo'}</Typography>
          </Grid>
        </Grid>
      </Paper>

      {/* Acciones Rápidas y Acceso a Módulos */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          🚀 Acceso Rápido a Módulos
        </Typography>
        
        <Grid container spacing={2}>
          {/* Botones principales */}
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-chart-line" style={{ color: '#3b82f6' }}></i>}
              onClick={() => window.location.href = '/dashboard'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#3b82f6',
                '&:hover': {
                  borderColor: '#2563eb',
                  backgroundColor: '#f0f9ff'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  📊 Dashboard
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Vista general del sistema
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-file-invoice" style={{ color: '#10b981' }}></i>}
              onClick={() => window.location.href = '/ordenes/crear'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#10b981',
                '&:hover': {
                  borderColor: '#059669',
                  backgroundColor: '#f0fdf4'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  📦 Crear Orden
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Nueva orden de trabajo
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-users" style={{ color: '#f59e0b' }}></i>}
              onClick={() => window.location.href = '/clientes'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#f59e0b',
                '&:hover': {
                  borderColor: '#d97706',
                  backgroundColor: '#fffbeb'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  👥 Clientes
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Gestión de clientes
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-building" style={{ color: '#8b5cf6' }}></i>}
              onClick={() => window.location.href = '/proveedores'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#8b5cf6',
                '&:hover': {
                  borderColor: '#7c3aed',
                  backgroundColor: '#faf5ff'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  🏢 Proveedores
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Gestión de proveedores
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-calendar-alt" style={{ color: '#ef4444' }}></i>}
              onClick={() => window.location.href = '/planificacion'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#ef4444',
                '&:hover': {
                  borderColor: '#dc2626',
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  📅 Planificación
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Planificación de medios
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<i className="fas fa-chart-bar" style={{ color: '#06b6d4' }}></i>}
              onClick={() => window.location.href = '/reportes/inversion'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '60px',
                borderColor: '#06b6d4',
                '&:hover': {
                  borderColor: '#0891b2',
                  backgroundColor: '#f0fdfa'
                }
              }}
            >
              <Box>
                <Typography variant="body1" fontWeight={600}>
                  📊 Reportes
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Reportes de inversión
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Herramientas y Utilidades */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          🛠️ Herramientas y Utilidades
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-magic" style={{ color: '#ec4899' }}></i>}
              onClick={() => window.location.href = '/ordenes/crear'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#fdf2f8'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  🤖 Asistente IA
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Crear orden con IA
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-bullhorn" style={{ color: '#84cc16' }}></i>}
              onClick={() => window.location.href = '/campanas'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#f7fee7'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  🎯 Campañas
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Gestión de campañas
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-envelope" style={{ color: '#6366f1' }}></i>}
              onClick={() => window.location.href = '/mensajes'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#eef2ff'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  💬 Mensajes
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Centro de mensajes
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Configuración Adicional */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" sx={{ mb: 3 }}>
          ⚙️ Configuración y Sistema
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-cog" style={{ color: '#64748b' }}></i>}
              onClick={() => window.location.href = '/configuracion'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#f8fafc'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  ⚙️ Configuración IA
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Configuración de IA
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-user-tie" style={{ color: '#0ea5e9' }}></i>}
              onClick={() => window.location.href = '/usuarios'}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#f0f9ff'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600}>
                  👨‍💼 Usuarios
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Gestión de usuarios
                </Typography>
              </Box>
            </Button>
          </Grid>

          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="text"
              fullWidth
              startIcon={<i className="fas fa-sign-out-alt" style={{ color: '#dc2626' }}></i>}
              onClick={() => {
                localStorage.clear();
                sessionStorage.clear();
                window.dispatchEvent(new Event('auth-change'));
                window.location.href = '/login';
              }}
              sx={{
                p: 2,
                textAlign: 'left',
                justifyContent: 'flex-start',
                height: '50px',
                '&:hover': {
                  backgroundColor: '#fef2f2'
                }
              }}
            >
              <Box>
                <Typography variant="body2" fontWeight={600} color="#dc2626">
                  🚪 Cerrar Sesión
                </Typography>
                <Typography variant="caption" color="textSecondary">
                  Salir del sistema
                </Typography>
              </Box>
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Modal de edición */}
      <Dialog open={editModalOpen} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>
          Editar Perfil
          <IconButton
            aria-label="close"
            onClick={handleCloseEdit}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Nombre"
                  name="Nombre"
                  value={formData.Nombre}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Apellido"
                  name="Apellido"
                  value={formData.Apellido}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="Email"
                  type="email"
                  value={formData.Email}
                  onChange={handleChange}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Nueva Contraseña"
                  name="Password"
                  type="password"
                  value={formData.Password}
                  onChange={handleChange}
                  helperText="Dejar en blanco para mantener la contraseña actual"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKeyIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseEdit}>Cancelar</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : null}
            >
              Guardar
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default MiPerfil;
