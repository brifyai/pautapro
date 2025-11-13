import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import { useTheme } from '@mui/material/styles';
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
  Fab,
  useMediaQuery,
  Card,
  CardContent,
  Avatar,
  Pagination
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
  Assistant as AssistantIcon,
  Badge as BadgeIcon,
  Phone as PhoneIcon,
  LocationOn as LocationOnIcon,
  Business as BusinessIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './ListadoUsuarios.css';
import '../agencias/Agencias.css';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
  const [paginationModel, setPaginationModel] = useState({ pageSize: 10, page: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);

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

  // Forzar que siempre sea 10 por página (paginación cliente)
  const handlePaginationChange = (newModel) => {
    setPaginationModel({ ...newModel, pageSize: 10 });
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


  // VERSIÓN MÓVIL optimizada con diseño de cards creativos
  if (isMobile) {
    return (
      <>
        {/* Header móvil simple */}
        <Box sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 2,
          textAlign: 'center',
          mb: 2
        }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            👥 Usuarios
          </Typography>
        </Box>

        <Box sx={{ p: 2 }}>
          {/* Barra de búsqueda móvil */}
          <Box sx={{ mb: 2 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="🔍 Buscar usuario..."
              value={searchTerm}
              onChange={handleSearchChange}
              size="small"
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                }
              }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                )
              }}
            />
          </Box>

          {/* Botón de filtros y exportar */}
          <Box sx={{ mb: 2, display: 'flex', gap: 1 }}>
            <Button
              variant={showFilters ? 'contained' : 'outlined'}
              size="small"
              onClick={() => setShowFilters(!showFilters)}
              startIcon={<FilterListIcon />}
              sx={{ borderRadius: '12px' }}
            >
              Filtros
            </Button>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FileDownloadIcon />}
              sx={{ borderRadius: '12px' }}
            >
              Exportar
            </Button>
          </Box>

          {/* Cards creativos para usuarios */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
            {usuarios.slice((mobilePage - 1) * 10, mobilePage * 10).map((usuario, index) => (
              <Card
                key={usuario.id}
                sx={{
                  background: `linear-gradient(135deg, ${
                    index % 4 === 0 ? '#667eea 0%, #764ba2 100%' :
                    index % 4 === 1 ? '#f093fb 0%, #f5576c 100%' :
                    index % 4 === 2 ? '#4facfe 0%, #00f2fe 100%' :
                    '#43e97b 0%, #38f9d7 100%'
                  })`,
                  borderRadius: '16px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Header del Card */}
                <Box sx={{
                  background: 'rgba(255,255,255,0.95)',
                  p: 2,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  {/* Avatar con iniciales */}
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      background: `linear-gradient(135deg, ${
                        index % 4 === 0 ? '#667eea 0%, #764ba2 100%' :
                        index % 4 === 1 ? '#f093fb 0%, #f5576c 100%' :
                        index % 4 === 2 ? '#4facfe 0%, #00f2fe 100%' :
                        '#43e97b 0%, #38f9d7 100%'
                      })`,
                      fontSize: '1.5rem',
                      fontWeight: 'bold',
                      color: 'white'
                    }}
                  >
                    {usuario.nombre?.charAt(0) || usuario.Apellido?.charAt(0) || '?'}
                  </Avatar>

                  {/* Información principal */}
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 'bold',
                        fontSize: '1rem',
                        color: '#1e293b',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {usuario.nombre} {usuario.Apellido}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 0.5 }}>
                      <Chip
                        label={usuario.email || 'Sin email'}
                        size="small"
                        icon={<EmailIcon />}
                        sx={{
                          height: '24px',
                          fontSize: '0.75rem',
                          backgroundColor: 'rgba(102, 126, 234, 0.1)',
                          color: '#667eea',
                          fontWeight: 600
                        }}
                      />
                      <Chip
                        label={usuario.Estado ? '✓ Activo' : '✗ Inactivo'}
                        size="small"
                        sx={{
                          height: '24px',
                          fontSize: '0.75rem',
                          backgroundColor: usuario.Estado ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: usuario.Estado ? '#16a34a' : '#dc2626',
                          fontWeight: 600
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Botones de acción */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                    <IconButton
                      size="small"
                      onClick={() => handleEditClick(usuario)}
                      sx={{
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(34, 197, 94, 0.2)' }
                      }}
                    >
                      <EditIcon fontSize="small" sx={{ color: '#22c55e' }} />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteClick(usuario)}
                      sx={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        '&:hover': { backgroundColor: 'rgba(239, 68, 68, 0.2)' }
                      }}
                    >
                      <DeleteIcon fontSize="small" sx={{ color: '#ef4444' }} />
                    </IconButton>
                  </Box>
                </Box>

                {/* Detalles adicionales */}
                <Box sx={{
                  background: 'rgba(255,255,255,0.85)',
                  p: 2,
                  pt: 1
                }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Perfil
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {usuario.Perfiles?.NombrePerfil || 'Sin perfil'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        Grupo
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {usuario.Grupos?.nombre_grupo || 'Sin grupo'}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        📅 Creación
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(usuario.fechaCreacion)}
                      </Typography>
                    </Box>
                    <Box>
                      <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
                        🔄 Modificación
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                        {formatDate(usuario.fechadeultimamodificacion)}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Card>
            ))}

            {/* Mensaje si no hay usuarios */}
            {usuarios.length === 0 && !loading && (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="body1" color="text.secondary">
                  No se encontraron usuarios
                </Typography>
              </Box>
            )}
          </Box>

          {/* Paginación móvil */}
          {usuarios.length > 10 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Pagination
                count={Math.ceil(usuarios.length / 10)}
                page={mobilePage}
                onChange={(event, value) => setMobilePage(value)}
                color="primary"
                size="small"
                sx={{
                  '& .MuiPaginationItem-root': {
                    fontSize: '0.875rem',
                  }
                }}
              />
            </Box>
          )}

          {/* Contador de resultados */}
          <Box sx={{ textAlign: 'center', mb: 10 }}>
            <Typography variant="caption" sx={{ color: '#64748b', fontWeight: 600 }}>
              Mostrando {Math.min((mobilePage - 1) * 10 + 1, usuarios.length)}-{Math.min(mobilePage * 10, usuarios.length)} de {usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}
            </Typography>
          </Box>

          {/* FAB para agregar usuario */}
          <Fab
            color="primary"
            aria-label="add"
            onClick={handleOpenAddModal}
            sx={{
              position: 'fixed',
              bottom: 80,
              right: 16,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              '&:hover': {
                background: 'linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%)',
              }
            }}
          >
            <AddIcon />
          </Fab>
        </Box>

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
      </>
    );
  }

  // VERSIÓN ESCRITORIO (original)
  return (
    <div className="agencias-container animate-fade-in">
      {!isMobile && (
        <div className="modern-header animate-slide-down">
          <div className="modern-title" style={{ fontSize: '1rem', marginTop: '14px', lineHeight: '1' }}>
            👥 LISTADO DE USUARIOS
          </div>
        </div>
      )}

      {/* Única fila: Campos de filtro y botones */}
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 2,
        mb: 2,
        mt: 3
      }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <TextField
            variant="outlined"
            placeholder="Buscar por nombre, apellido o email..."
            value={searchTerm}
            onChange={handleSearchChange}
            sx={{
              background: 'rgba(255,255,255,0.9)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              '& .MuiOutlinedInput-root': {
                borderRadius: '12px',
                '&:hover fieldset': {
                  borderColor: 'var(--gradient-primary)',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--gradient-primary)',
                },
              }
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: '#6777ef' }}/>
                </InputAdornment>
              ),
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<AddIcon sx={{ color: 'white' }} />}
            onClick={handleOpenAddModal}
            className="btn-agregar"
            sx={{ height: '40px' }}
          >
            Agregar Usuario
          </Button>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon sx={{ color: 'white' }} />}
            className="btn-agregar"
            sx={{ height: '40px' }}
          >
            📊 Exportar Usuarios
          </Button>
        </Box>
      </Box>

      {/* DataGrid Container */}
      <Box sx={{ p: 0, pt: 0 }}>
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
        pagination
        paginationMode="client"
        paginationModel={paginationModel}
        onPaginationModelChange={handlePaginationChange}
        pageSizeOptions={[10]}
        autoHeight
        rowHeight={56}
        columnHeaderHeight={56}
        disableSelectionOnClick
        hideFooterSelectedRowCount
        getRowId={(row) => row.id}
        initialState={{
          pagination: {
            paginationModel: {
              pageSize: 10
            }
          }
        }}
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
          '& .MuiDataGrid-footerContainer': {
            borderTop: '1px solid rgba(102, 126, 234, 0.1) !important',
            background: 'rgba(255,255,255,0.8) !important',
          },
          '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-selectLabel': {
            display: 'none'
          },
          '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-select': {
            display: 'none'
          },
          '& .MuiDataGrid-footerContainer .MuiTablePagination-root .MuiTablePagination-selectIcon': {
            display: 'none'
          },
        }}
        />
        </div>
      </Box>

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
