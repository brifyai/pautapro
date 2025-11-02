import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  TextField,
  Button,
  InputAdornment,
  Breadcrumbs,
  Link,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  MenuItem,
  CircularProgress,
  Fab
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  FileDownload as FileDownloadIcon,
  Home as HomeIcon,
  Close as CloseIcon,
  Email as EmailIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  VpnKey as VpnKeyIcon,
  Add as AddIcon,
  Assistant as AssistantIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ListadoUsuarios.css';

const EditUserModal = ({ open, onClose, usuario, onUserUpdated }) => {
  const [formData, setFormData] = useState({
    Nombre: '',
    Apellido: '',
    Email: '',
    Password: '',
    Estado: true,
    id_perfil: '',
    id_grupo: ''
  });
  const [loading, setLoading] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    if (usuario) {
      setFormData({
        Nombre: usuario.Nombre || '',
        Apellido: usuario.Apellido || '',
        Email: usuario.Email || '',
        Password: '',
        Estado: usuario.Estado,
        id_perfil: usuario.Perfiles?.id || '',
        id_grupo: usuario.Grupos?.id_grupo || ''
      });
      fetchPerfilesYGrupos();
    }
  }, [usuario]);

  const fetchPerfilesYGrupos = async () => {
    try {
      const [perfilesResponse, gruposResponse] = await Promise.all([
        supabase.from('perfiles').select('id, nombreperfil'),
        supabase.from('grupos').select('id_grupo, nombre_grupo')
      ]);

      if (perfilesResponse.error) throw perfilesResponse.error;
      if (gruposResponse.error) throw gruposResponse.error;

      setPerfiles(perfilesResponse.data || []);
      setGrupos(gruposResponse.data || []);
    } catch (error) {
      console.error('Error al cargar perfiles y grupos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los perfiles y grupos',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Estado') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updateData = {
        Nombre: formData.Nombre,
        Apellido: formData.Apellido,
        Email: formData.Email,
        Estado: formData.Estado,
        id_perfil: formData.id_perfil,
        id_grupo: formData.id_grupo,
        fechadeultimamodificacion: new Date().toISOString()
      };

      // Solo incluir la contraseña si se ha modificado
      if (formData.Password) {
        updateData.Password = formData.Password;
      }

      const { error } = await supabase
        .from('usuarios')
        .update(updateData)
        .eq('id', usuario.id);

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Usuario actualizado correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo actualizar el usuario',
        timer: 1500,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Editar Usuario
        <IconButton
          aria-label="close"
          onClick={onClose}
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
                label="Contraseña"
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Perfil"
                name="id_perfil"
                value={formData.id_perfil}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {perfiles.map((perfil) => (
                  <MenuItem key={perfil.id} value={perfil.id}>
                    {perfil.nombreperfil}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Grupo"
                name="id_grupo"
                value={formData.id_grupo}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {grupos.map((grupo) => (
                  <MenuItem key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre_grupo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="Estado"
                value={formData.Estado.toString()}
                onChange={handleChange}
                required
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
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
  );
};

const AddUserModal = ({ open, onClose, onUserAdded }) => {
  const initialFormState = {
    Nombre: '',
    Apellido: '',
    Email: '',
    Password: '',
    Estado: true,
    id_perfil: '',
    id_grupo: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [perfiles, setPerfiles] = useState([]);
  const [grupos, setGrupos] = useState([]);

  useEffect(() => {
    if (open) {
      // Limpiar el formulario cada vez que se abre el modal
      setFormData(initialFormState);
      fetchPerfilesYGrupos();
    }
  }, [open]);

  const fetchPerfilesYGrupos = async () => {
    try {
      const [perfilesResponse, gruposResponse] = await Promise.all([
        supabase.from('perfiles').select('id, nombreperfil'),
        supabase.from('grupos').select('id_grupo, nombre_grupo')
      ]);

      if (perfilesResponse.error) throw perfilesResponse.error;
      if (gruposResponse.error) throw gruposResponse.error;

      setPerfiles(perfilesResponse.data || []);
      setGrupos(gruposResponse.data || []);
    } catch (error) {
      console.error('Error al cargar perfiles y grupos:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudieron cargar los perfiles y grupos',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'Estado') {
      setFormData(prev => ({ ...prev, [name]: value === 'true' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Verificar si el email ya existe
      const { data: existingUser } = await supabase
        .from('usuarios')
        .select('email')
        .eq('email', formData.email)
        .single();

      if (existingUser) {
        throw new Error('Ya existe un usuario con este email');
      }

      // Crear objeto con los datos del nuevo usuario
      const newUser = {
        Nombre: formData.Nombre.trim(),
        Apellido: formData.Apellido.trim(),
        Email: formData.Email.trim().toLowerCase(),
        Password: formData.Password,
        Estado: formData.Estado,
        id_perfil: formData.id_perfil,
        id_grupo: formData.id_grupo,
        fechaCreacion: new Date().toISOString(),
        fechadeultimamodificacion: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('usuarios')
        .insert(newUser)
        .select()
        .single();

      if (error) throw error;

      Swal.fire({
        icon: 'success',
        title: 'Éxito',
        text: 'Usuario creado correctamente',
        timer: 1500,
        showConfirmButton: false
      });

      onUserAdded();
      onClose();
      // Limpiar el formulario
      setFormData(initialFormState);
    } catch (error) {
      console.error('Error al crear usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message === 'Ya existe un usuario con este email' 
          ? error.message 
          : 'No se pudo crear el usuario',
        timer: 1500,
        showConfirmButton: false
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Agregar Usuario
        <IconButton
          aria-label="close"
          onClick={onClose}
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
                label="Contraseña"
                name="Password"
                type="password"
                value={formData.Password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <VpnKeyIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Perfil"
                name="id_perfil"
                value={formData.id_perfil}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {perfiles.map((perfil) => (
                  <MenuItem key={perfil.id} value={perfil.id}>
                    {perfil.nombreperfil}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Grupo"
                name="id_grupo"
                value={formData.id_grupo}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <GroupIcon />
                    </InputAdornment>
                  ),
                }}
              >
                {grupos.map((grupo) => (
                  <MenuItem key={grupo.id_grupo} value={grupo.id_grupo}>
                    {grupo.nombre_grupo}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                select
                label="Estado"
                name="Estado"
                value={formData.Estado.toString()}
                onChange={handleChange}
                required
              >
                <MenuItem value="true">Activo</MenuItem>
                <MenuItem value="false">Inactivo</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
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
  );
};

const ListadoUsuarios = () => {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const [totalRows, setTotalRows] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [pageSize, setPageSize] = useState(10);

  const fetchUsuarios = async (start, limit, searchQuery = '') => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('usuarios')
        .select('*', { count: 'exact', head: true });

      // Aplicar filtro de búsqueda si existe
      if (searchQuery) {
        query = query.or(`Nombre.ilike.%${searchQuery}%,Email.ilike.%${searchQuery}%,Apellido.ilike.%${searchQuery}%`);
      }

      const { count, error: countError } = await query;

      if (countError) {
        console.error('Error al obtener conteo:', countError);
        throw countError;
      }

      setTotalRows(count || 0);

      // Consulta para obtener los datos con el mismo filtro
      let dataQuery = supabase
        .from('usuarios')
        .select(`
          id,
          nombre,
          Apellido,
          Email,
          Estado,
          Avatar,
          fechaCreacion,
          fechadeultimamodificacion,
          Perfiles:id_perfil (
            id,
            NombrePerfil,
            Codigo
          ),
          Grupos:id_grupo (
            id_grupo,
            nombre_grupo
          )
        `);

      // Aplicar el mismo filtro de búsqueda a la consulta de datos
      if (searchQuery) {
        dataQuery = dataQuery.or(`Nombre.ilike.%${searchQuery}%,Email.ilike.%${searchQuery}%,Apellido.ilike.%${searchQuery}%`);
      }

      const { data, error } = await dataQuery
        .range(start, start + limit - 1)
        .order('id', { ascending: true });

      if (error) {
        console.error('Error al obtener usuarios:', error);
        throw error;
      }

      setUsuarios(data || []);
    } catch (error) {
      console.error('Error al cargar usuarios:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reiniciar la página cuando cambia el término de búsqueda
    setPage(0);
    // Agregar un pequeño retraso para evitar demasiadas llamadas mientras el usuario escribe
    const timeoutId = setTimeout(() => {
      fetchUsuarios(0, rowsPerPage, searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, rowsPerPage]);

  useEffect(() => {
    if (searchTerm === '') {
      fetchUsuarios(page * rowsPerPage, rowsPerPage, searchTerm);
    }
  }, [page]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleEditClick = (usuario) => {
    setSelectedUser(usuario);
    setEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = () => {
    fetchUsuarios(page * rowsPerPage, rowsPerPage, searchTerm);
  };

  const handleOpenAddModal = () => {
    setAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setAddModalOpen(false);
  };

  const handleDeleteClick = async (usuario) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Deseas eliminar al usuario ${usuario.Nombre} ${usuario.Apellido}?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        const { error } = await supabase
          .from('usuarios')
          .delete()
          .eq('id', usuario.id);

        if (error) throw error;

        Swal.fire({
          icon: 'success',
          title: 'Eliminado',
          text: 'Usuario eliminado correctamente',
          timer: 1500,
          showConfirmButton: false
        });

        // Actualizar la lista de usuarios
        fetchUsuarios(page * rowsPerPage, rowsPerPage, searchTerm);
      }
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo eliminar el usuario',
        timer: 1500,
        showConfirmButton: false
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return '-';
    try {
      return format(new Date(date), 'dd/MM/yyyy HH:mm', { locale: es });
    } catch (error) {
      console.error('Error formatting date:', error);
      return date;
    }
  };


  return (
    <div className="dashboard animate-fade-in">
      {/* Header moderno con gradiente */}
      <div className="modern-header animate-slide-down">
        <div className="modern-title" style={{ fontSize: '1.25rem' }}>
            👥 GESTIÓN DE USUARIOS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.8)' }}>
            Administración de usuarios del sistema
          </Typography>
        </div>
      </div>

      {/* Breadcrumbs */}
      <Box sx={{ p: 3, pb: 0 }}>
        <Breadcrumbs
          separator={<HomeIcon fontSize="small" />}
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          <Link
            component="button"
            variant="body2"
            onClick={() => navigate('/dashboard')}
            sx={{ color: 'var(--gradient-primary)', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            Dashboard
          </Link>
          <Typography color="text.primary" sx={{ fontWeight: 600 }}>Usuarios</Typography>
        </Breadcrumbs>
      </Box>

      {/* Controles de búsqueda y acciones */}
      <Box sx={{ p: 3, pt: 0 }}>
        <Grid container spacing={{ xs: 2, sm: 3 }} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="🔍 Buscar por nombre, apellido o email..."
              value={searchTerm}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: 'var(--gradient-primary)' }}/>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  background: 'rgba(255,255,255,0.9)',
                  backdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  '&:hover fieldset': {
                    borderColor: 'var(--gradient-primary)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--gradient-primary)',
                  },
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ color: 'white' }} />}
              onClick={handleOpenAddModal}
              sx={{
                background: 'var(--gradient-primary)',
                color: '#fff',
                height: '56px',
                width: '100%',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                '&:hover': {
                  background: 'var(--gradient-secondary)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(247, 107, 138, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              ➕ Agregar Usuario
            </Button>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Button
              variant="contained"
              startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
              sx={{
                background: 'var(--gradient-success)',
                color: '#fff',
                height: '56px',
                width: '100%',
                borderRadius: '12px',
                fontWeight: 600,
                boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                '&:hover': {
                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 16px rgba(16, 185, 129, 0.4)',
                },
                transition: 'all 0.3s ease'
              }}
            >
              📊 Exportar Usuarios
            </Button>
          </Grid>
        </Grid>
      </Box>

      {/* DataGrid Container */}
      <Box sx={{ p: 3, pt: 0 }}>
        <div className="data-grid-container">
        <DataGrid
        rows={usuarios.map(usuario => ({
          id: usuario.id,
          nombre: usuario.nombre,
          apellido: usuario.Apellido,
          email: usuario.Email,
          perfil: usuario.Perfiles?.NombrePerfil || '-',
          grupo: usuario.Grupos?.nombre_grupo || '-',
          estado: usuario.Estado,
          fechaCreacion: formatDate(usuario.fechaCreacion),
          ultimaModificacion: formatDate(usuario.fechadeultimamodificacion)
        }))}
        columns={[
          {
            field: 'nombre',
            headerName: 'Nombre',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'apellido',
            headerName: 'Apellido',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'email',
            headerName: 'Email',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'perfil',
            headerName: 'Perfil',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'grupo',
            headerName: 'Grupo',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'estado',
            headerName: 'Estado',
            flex: 1,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
              <Chip
                label={params.row.estado ? 'Activo' : 'Inactivo'}
                color={params.row.estado ? 'success' : 'error'}
                size="small"
                sx={{ minWidth: 80 }}
              />
            )
          },
          {
            field: 'fechaCreacion',
            headerName: 'Fecha Creación',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'ultimaModificacion',
            headerName: 'Última Modificación',
            flex: 1,
            headerClassName: 'data-grid-header'
          },
          {
            field: 'acciones',
            headerName: 'Acciones',
            flex: 1,
            headerClassName: 'data-grid-header',
            renderCell: (params) => (
              <div className="action-buttons">
                <Tooltip title="Editar">
                  <IconButton size="small" onClick={() => handleEditClick(params.row)}>
                    <EditIcon fontSize="small" color="primary" />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Eliminar">
                  <IconButton size="small" onClick={() => handleDeleteClick(params.row)}>
                    <DeleteIcon fontSize="small" color="error" />
                  </IconButton>
                </Tooltip>
              </div>
            )
          }
        ]}
        pageSize={pageSize}
        onPageSizeChange={(newPageSize) => setPageSize(newPageSize)}
        rowsPerPageOptions={[5, 10, 20, 50]}
        pagination
        autoHeight
        disableSelectionOnClick
        getRowId={(row) => row.id}
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            color: '#333',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid #ddd',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: '#f9f9f9',
          },
        }}
        />
        </div>
      </Box>

      {/* Botón flotante del Asistente */}
      <Tooltip title="🤖 Asistente Inteligente - Gestión de Usuarios" placement="left">
        <Fab
          color="primary"
          aria-label="asistente"
          className="animate-float"
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            width: 64,
            height: 64,
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)',
            border: '2px solid rgba(255,255,255,0.2)',
            '&:hover': {
              background: 'var(--gradient-secondary)',
              transform: 'scale(1.1)',
              boxShadow: '0 12px 40px rgba(247, 107, 138, 0.4)',
            },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
          onClick={() => window.open('/asistente', '_blank')}
        >
          <AssistantIcon sx={{ fontSize: 28 }} />
        </Fab>
      </Tooltip>

      {/* Modal de edición */}
      <EditUserModal
        open={editModalOpen}
        onClose={handleCloseEditModal}
        usuario={selectedUser}
        onUserUpdated={handleUserUpdated}
      />
      {/* Modal de agregar usuario */}
      <AddUserModal
        open={addModalOpen}
        onClose={handleCloseAddModal}
        onUserAdded={handleUserUpdated}
      />
    </div>
  );
};

export default ListadoUsuarios;
