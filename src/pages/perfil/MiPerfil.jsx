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
      if (!userLocal?.id) {
        console.warn('No se encontró el usuario en localStorage');
        // Usar datos básicos del localStorage aunque no tenga ID
        setUsuario({
          nombre: userLocal?.nombre || 'Usuario',
          email: userLocal?.email || 'sin@email.com',
          apellido: userLocal?.apellido || '',
          telefono: userLocal?.telefono || '',
          rol: userLocal?.rol || 'Usuario'
        });
        setFormData({
          Nombre: userLocal?.nombre || '',
          Apellido: userLocal?.apellido || '',
          Email: userLocal?.email || '',
          Password: ''
        });
        setLoading(false);
        return;
      }

      // Intentar buscar el usuario en Supabase usando el ID
      try {
        const { data: userData, error } = await supabase
          .from('usuarios')
          .select(`
            id,
            nombre,
            email,
            estado,
            fechaCreacion,
            fechadeultimamodificacion,
            Perfiles:id_perfil (
              id,
              nombreperfil
            ),
            Grupos:id_grupo (
              id_grupo,
              nombre_grupo
            )
          `)
          .eq('id', userLocal.id)
          .single();

        if (!error && userData) {
          // Combinar datos de Supabase con datos locales
          const usuarioCompleto = {
            ...userData,
            apellido: userLocal.apellido || '',
            nombre_completo: userLocal.nombre_completo || `${userData.nombre} ${userLocal.apellido || ''}`,
            rol: userData.Perfiles?.nombreperfil || userLocal.rol || '',
            telefono: userLocal.telefono || ''
          };

          setUsuario(usuarioCompleto);
          setFormData({
            Nombre: userData.nombre || '',
            Apellido: userLocal.apellido || '',
            Email: userData.email || '',
            Password: ''
          });
        } else {
          throw error || new Error('No se encontraron datos del usuario');
        }
      } catch (dbError) {
        console.warn('Error en base de datos, usando datos locales:', dbError);
        // Usar solo datos del localStorage si falla la BD
        const usuarioLocalData = {
          nombre: userLocal?.nombre || 'Usuario',
          email: userLocal?.email || 'sin@email.com',
          apellido: userLocal?.apellido || '',
          telefono: userLocal?.telefono || '',
          rol: userLocal?.rol || 'Usuario',
          estado: true
        };

        setUsuario(usuarioLocalData);
        setFormData({
          Nombre: userLocal?.nombre || '',
          Apellido: userLocal?.apellido || '',
          Email: userLocal?.email || '',
          Password: ''
        });
      }
    } catch (error) {
      console.error('Error general cargando usuario:', error);
      // Último recurso: mostrar datos mínimos
      setUsuario({
        nombre: 'Usuario',
        email: 'sin@email.com',
        apellido: '',
        telefono: '',
        rol: 'Usuario',
        estado: true
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
            <Typography variant="body1">{usuario.rol || 'Usuario'}</Typography>
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
