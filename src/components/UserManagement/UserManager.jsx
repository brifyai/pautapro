import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip,
  Avatar
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Security as SecurityIcon
} from '@mui/icons-material';
import { authServiceImproved } from '../../services/authServiceImproved';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    id_perfil: '',
    id_grupo: '',
    estado: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, profilesData, groupsData] = await Promise.all([
        authServiceImproved.getUsers(),
        authServiceImproved.getProfiles(),
        authServiceImproved.getGroups()
      ]);

      setUsers(usersData);
      setProfiles(profilesData);
      setGroups(groupsData);
      setError('');
    } catch (err) {
      setError('Error cargando datos: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (user = null) => {
    setEditingUser(user);
    if (user) {
      setFormData({
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        password: '',
        telefono: user.telefono || '',
        id_perfil: user.id_perfil,
        id_grupo: user.id_grupo,
        estado: user.estado
      });
    } else {
      setFormData({
        nombre: '',
        apellido: '',
        email: '',
        password: '',
        telefono: '',
        id_perfil: '',
        id_grupo: '',
        estado: true
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      id_perfil: '',
      id_grupo: '',
      estado: true
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        // Actualizar usuario
        const updateData = { ...formData };
        if (!updateData.password) {
          delete updateData.password; // No actualizar contraseña si está vacía
        }
        await authServiceImproved.updateUser(editingUser.id_usuario, updateData);
      } else {
        // Crear nuevo usuario
        await authServiceImproved.register(formData);
      }

      handleCloseDialog();
      loadData();
    } catch (err) {
      setError('Error guardando usuario: ' + err.message);
    }
  };

  const handleDeactivate = async (userId) => {
    if (window.confirm('¿Está seguro de desactivar este usuario?')) {
      try {
        await authServiceImproved.deactivateUser(userId);
        loadData();
      } catch (err) {
        setError('Error desactivando usuario: ' + err.message);
      }
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      director: 'error',
      gerente: 'warning',
      financiero: 'success',
      supervisor: 'info',
      planificador: 'primary',
      asistente: 'default'
    };
    return colors[role] || 'default';
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'director':
      case 'gerente':
        return <BusinessIcon />;
      default:
        return <PersonIcon />;
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, display: 'flex', justifyContent: 'center' }}>
        <Typography>Cargando usuarios...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Gestión de Usuarios
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Nuevo Usuario
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Usuario</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Teléfono</TableCell>
                  <TableCell>Rol</TableCell>
                  <TableCell>Grupo</TableCell>
                  <TableCell>Estado</TableCell>
                  <TableCell>Último Acceso</TableCell>
                  <TableCell>Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id_usuario}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar
                          src={user.avatar}
                          alt={user.nombre}
                          sx={{ width: 40, height: 40 }}
                        >
                          {user.nombre?.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">
                            {user.nombre} {user.apellido}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {user.id_usuario}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.telefono || 'No especificado'}</TableCell>
                    <TableCell>
                      <Chip
                        icon={getRoleIcon(user.nombre_perfil)}
                        label={user.nombre_perfil}
                        color={getRoleColor(user.nombre_perfil)}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>{user.nombre_grupo}</TableCell>
                    <TableCell>
                      <Chip
                        label={user.estado ? 'Activo' : 'Inactivo'}
                        color={user.estado ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {user.ultimo_aceso 
                        ? new Date(user.ultimo_aceso).toLocaleDateString()
                        : 'Nunca'
                      }
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar">
                          <IconButton
                            size="small"
                            onClick={() => handleOpenDialog(user)}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Desactivar">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeactivate(user.id_usuario)}
                            disabled={!user.estado}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Dialogo para crear/editar usuario */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  label="Nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  fullWidth
                />
                <TextField
                  label="Apellido"
                  value={formData.apellido}
                  onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                  required
                  fullWidth
                />
              </Box>

              <TextField
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                fullWidth
              />

              <TextField
                label="Contraseña"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required={!editingUser}
                helperText={editingUser ? "Dejar en blanco para mantener la contraseña actual" : ""}
                fullWidth
              />

              <TextField
                label="Teléfono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                fullWidth
              />

              <Box sx={{ display: 'flex', gap: 2 }}>
                <FormControl fullWidth required>
                  <InputLabel>Rol</InputLabel>
                  <Select
                    value={formData.id_perfil}
                    onChange={(e) => setFormData({ ...formData, id_perfil: e.target.value })}
                    label="Rol"
                  >
                    {profiles.map((profile) => (
                      <MenuItem key={profile.id_perfil} value={profile.id_perfil}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <SecurityIcon fontSize="small" />
                          {profile.nombre_perfil} - {profile.descripcion}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth required>
                  <InputLabel>Grupo</InputLabel>
                  <Select
                    value={formData.id_grupo}
                    onChange={(e) => setFormData({ ...formData, id_grupo: e.target.value })}
                    label="Grupo"
                  >
                    {groups.map((group) => (
                      <MenuItem key={group.id_grupo} value={group.id_grupo}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <BusinessIcon fontSize="small" />
                          {group.nombre_grupo}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <FormControl fullWidth>
                <InputLabel>Estado</InputLabel>
                <Select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  label="Estado"
                >
                  <MenuItem value={true}>Activo</MenuItem>
                  <MenuItem value={false}>Inactivo</MenuItem>
                </Select>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancelar</Button>
            <Button type="submit" variant="contained">
              {editingUser ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default UserManager;