import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  AlertTitle,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
  FormGroup
} from '@mui/material';
import {
  Security as SecurityIcon,
  AdminPanelSettings as AdminIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  Visibility as ViewIcon,
  VisibilityOff as VisibilityOffIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon,
  Assignment as AssignmentIcon,
  Assessment as AssessmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

const RoleManager = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDialog, setUserDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Definición de roles del sistema
  const systemRoles = {
    director: {
      name: 'Director',
      description: 'Acceso completo a todas las funciones del sistema',
      color: '#F44336',
      icon: '👔',
      level: 100,
      permissions: [
        'users.create', 'users.read', 'users.update', 'users.delete',
        'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
        'clients.create', 'clients.read', 'clients.update', 'clients.delete',
        'orders.create', 'orders.read', 'orders.update', 'orders.delete',
        'reports.create', 'reports.read', 'reports.update', 'reports.delete',
        'media.create', 'media.read', 'media.update', 'media.delete',
        'messages.create', 'messages.read', 'messages.update', 'messages.delete',
        'system.config', 'system.audit', 'system.backup'
      ]
    },
    gerente: {
      name: 'Gerente',
      description: 'Gestión completa de campañas y equipos',
      color: '#FF9800',
      icon: '👨‍💼',
      level: 80,
      permissions: [
        'campaigns.create', 'campaigns.read', 'campaigns.update', 'campaigns.delete',
        'clients.create', 'clients.read', 'clients.update',
        'orders.create', 'orders.read', 'orders.update',
        'reports.read', 'reports.create',
        'media.read', 'media.update',
        'messages.read', 'messages.create',
        'users.read'
      ]
    },
    supervisor: {
      name: 'Supervisor',
      description: 'Supervisión de campañas y equipos',
      color: '#2196F3',
      icon: '👨‍🔧',
      level: 60,
      permissions: [
        'campaigns.create', 'campaigns.read', 'campaigns.update',
        'clients.read', 'clients.update',
        'orders.create', 'orders.read', 'orders.update',
        'reports.read', 'reports.create',
        'media.read',
        'messages.read', 'messages.create'
      ]
    },
    planificador: {
      name: 'Planificador',
      description: 'Planificación de campañas y medios',
      color: '#4CAF50',
      icon: '📋',
      level: 40,
      permissions: [
        'campaigns.create', 'campaigns.read', 'campaigns.update',
        'clients.read',
        'orders.read',
        'reports.read',
        'media.read', 'media.update',
        'messages.read'
      ]
    },
    asistente: {
      name: 'Asistente',
      description: 'Apoyo administrativo y básico',
      color: '#9E9E9E',
      icon: '👤',
      level: 20,
      permissions: [
        'campaigns.read',
        'clients.read',
        'orders.read',
        'reports.read',
        'messages.read'
      ]
    }
  };

  // Definición de permisos del sistema
  const systemPermissions = {
    users: {
      label: 'Gestión de Usuarios',
      icon: <PeopleIcon />,
      permissions: {
        create: { label: 'Crear usuarios', description: 'Permite crear nuevos usuarios en el sistema' },
        read: { label: 'Ver usuarios', description: 'Permite ver la lista de usuarios' },
        update: { label: 'Editar usuarios', description: 'Permite modificar datos de usuarios' },
        delete: { label: 'Eliminar usuarios', description: 'Permite eliminar usuarios del sistema' }
      }
    },
    campaigns: {
      label: 'Gestión de Campañas',
      icon: <AssignmentIcon />,
      permissions: {
        create: { label: 'Crear campañas', description: 'Permite crear nuevas campañas' },
        read: { label: 'Ver campañas', description: 'Permite ver listado de campañas' },
        update: { label: 'Editar campañas', description: 'Permite modificar campañas existentes' },
        delete: { label: 'Eliminar campañas', description: 'Permite eliminar campañas' }
      }
    },
    clients: {
      label: 'Gestión de Clientes',
      icon: <PeopleIcon />,
      permissions: {
        create: { label: 'Crear clientes', description: 'Permite agregar nuevos clientes' },
        read: { label: 'Ver clientes', description: 'Permite ver información de clientes' },
        update: { label: 'Editar clientes', description: 'Permite modificar datos de clientes' },
        delete: { label: 'Eliminar clientes', description: 'Permite eliminar clientes' }
      }
    },
    orders: {
      label: 'Gestión de Órdenes',
      icon: <AssignmentIcon />,
      permissions: {
        create: { label: 'Crear órdenes', description: 'Permite crear nuevas órdenes de compra' },
        read: { label: 'Ver órdenes', description: 'Permite ver listado de órdenes' },
        update: { label: 'Editar órdenes', description: 'Permite modificar órdenes existentes' },
        delete: { label: 'Eliminar órdenes', description: 'Permite eliminar órdenes' }
      }
    },
    reports: {
      label: 'Reportes',
      icon: <AssessmentIcon />,
      permissions: {
        create: { label: 'Generar reportes', description: 'Permite crear nuevos reportes' },
        read: { label: 'Ver reportes', description: 'Permite ver reportes existentes' },
        update: { label: 'Editar reportes', description: 'Permite modificar configuración de reportes' },
        delete: { label: 'Eliminar reportes', description: 'Permite eliminar reportes' }
      }
    },
    media: {
      label: 'Gestión de Medios',
      icon: <SettingsIcon />,
      permissions: {
        create: { label: 'Crear medios', description: 'Permite agregar nuevos medios publicitarios' },
        read: { label: 'Ver medios', description: 'Permite ver información de medios' },
        update: { label: 'Editar medios', description: 'Permite modificar datos de medios' },
        delete: { label: 'Eliminar medios', description: 'Permite eliminar medios' }
      }
    },
    messages: {
      label: 'Mensajes',
      icon: <SettingsIcon />,
      permissions: {
        create: { label: 'Crear mensajes', description: 'Permite enviar mensajes' },
        read: { label: 'Ver mensajes', description: 'Permite ver mensajes recibidos' },
        update: { label: 'Editar mensajes', description: 'Permite modificar mensajes' },
        delete: { label: 'Eliminar mensajes', description: 'Permite eliminar mensajes' }
      }
    },
    system: {
      label: 'Sistema',
      icon: <SecurityIcon />,
      permissions: {
        config: { label: 'Configuración', description: 'Permite acceder a configuración del sistema' },
        audit: { label: 'Auditoría', description: 'Permite ver logs de auditoría' },
        backup: { label: 'Respaldo', description: 'Permite realizar respaldos del sistema' }
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Simular carga de datos - en producción vendría de Supabase
      const mockUsers = [
        {
          id: 1,
          name: 'Carlos Rodríguez',
          email: 'carlos@pautapro.com',
          role: 'director',
          status: 'active',
          lastLogin: new Date('2024-01-15T09:30:00'),
          createdAt: new Date('2023-01-10T10:00:00'),
          avatar: 'https://i.pravatar.cc/150?img=1'
        },
        {
          id: 2,
          name: 'María González',
          email: 'maria@pautapro.com',
          role: 'gerente',
          status: 'active',
          lastLogin: new Date('2024-01-15T08:45:00'),
          createdAt: new Date('2023-02-15T14:30:00'),
          avatar: 'https://i.pravatar.cc/150?img=5'
        },
        {
          id: 3,
          name: 'Juan Pérez',
          email: 'juan@pautapro.com',
          role: 'supervisor',
          status: 'active',
          lastLogin: new Date('2024-01-14T16:20:00'),
          createdAt: new Date('2023-03-20T11:15:00'),
          avatar: 'https://i.pravatar.cc/150?img=3'
        },
        {
          id: 4,
          name: 'Ana López',
          email: 'ana@pautapro.com',
          role: 'planificador',
          status: 'active',
          lastLogin: new Date('2024-01-10T12:00:00'),
          createdAt: new Date('2023-04-05T09:45:00'),
          avatar: 'https://i.pravatar.cc/150?img=9'
        },
        {
          id: 5,
          name: 'Roberto Silva',
          email: 'roberto@pautapro.com',
          role: 'asistente',
          status: 'active',
          lastLogin: new Date('2024-01-13T15:30:00'),
          createdAt: new Date('2023-05-12T16:20:00'),
          avatar: 'https://i.pravatar.cc/150?img=7'
        }
      ];
      
      setUsers(mockUsers);
      setRoles(Object.entries(systemRoles).map(([key, role]) => ({ id: key, ...role })));
      setPermissions(Object.entries(systemPermissions).map(([key, perm]) => ({ id: key, ...perm })));
      
    } catch (error) {
      console.error('Error cargando datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserRole = (roleKey) => {
    return systemRoles[roleKey] || null;
  };

  const hasPermission = (userRole, permission) => {
    const role = getUserRole(userRole);
    return role ? role.permissions.includes(permission) : false;
  };

  const getPermissionLevel = (userRole) => {
    const role = getUserRole(userRole);
    return role ? role.level : 0;
  };

  const canAccessResource = (userRole, resource, action) => {
    const permission = `${resource}.${action}`;
    return hasPermission(userRole, permission);
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      setUsers(prev => prev.map(user =>
        user.id === userId ? { ...user, role: newRole } : user
      ));
      
      // Registrar en auditoría
      console.log(`Rol de usuario ${userId} actualizado a ${newRole}`);
    } catch (error) {
      console.error('Error actualizando rol:', error);
    }
  };

  const toggleUserStatus = async (userId) => {
    try {
      setUsers(prev => prev.map(user =>
        user.id === userId 
          ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
          : user
      ));
    } catch (error) {
      console.error('Error cambiando estado:', error);
    }
  };

  const getRoleStats = () => {
    const stats = {};
    Object.keys(systemRoles).forEach(role => {
      stats[role] = users.filter(user => user.role === role).length;
    });
    return stats;
  };

  const getActiveUsersCount = () => {
    return users.filter(user => user.status === 'active').length;
  };

  const getRecentLogins = () => {
    return users
      .filter(user => user.lastLogin)
      .sort((a, b) => b.lastLogin - a.lastLogin)
      .slice(0, 5);
  };

  const formatLastLogin = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  const roleStats = getRoleStats();

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography>Cargando sistema de permisos...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" gutterBottom>
            Gestión de Roles y Permisos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Administra el acceso y permisos de los usuarios del sistema
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={loadData}
          >
            Actualizar
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setUserDialog(true)}
          >
            Nuevo Usuario
          </Button>
        </Box>
      </Box>

      {/* Estadísticas generales */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
                <Typography variant="h4">{users.length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de usuarios
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PersonIcon sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
                <Typography variant="h4">{getActiveUsersCount()}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Usuarios activos
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AdminIcon sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
                <Typography variant="h4">{roleStats.admin || 0}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Administradores
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SecurityIcon sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
                <Typography variant="h4">{Object.keys(systemPermissions).length}</Typography>
                <Typography variant="body2" color="text.secondary">
                  Módulos del sistema
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Distribución de roles */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Distribución de Roles
        </Typography>
        <Grid container spacing={2}>
          {Object.entries(systemRoles).map(([key, role]) => {
            const userCount = roleStats[key] || 0;
            const percentage = users.length > 0 ? (userCount / users.length) * 100 : 0;
            
            return (
              <Grid item xs={12} sm={6} md={2.4} key={key}>
                <Card sx={{ 
                  border: `2px solid ${role.color}`,
                  cursor: 'pointer',
                  '&:hover': { boxShadow: 2 }
                }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {role.icon}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {role.name}
                    </Typography>
                    <Typography variant="h6" color={role.color}>
                      {userCount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {Math.round(percentage)}% del total
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Box>

      {/* Lista de usuarios */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Usuarios del Sistema
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Usuario</TableCell>
                <TableCell>Rol</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Último acceso</TableCell>
                <TableCell>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => {
                const role = getUserRole(user.role);
                
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar src={user.avatar} sx={{ width: 32, height: 32 }}>
                          {user.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={role?.name || 'Sin rol'}
                        size="small"
                        sx={{
                          backgroundColor: role?.color || '#9E9E9E',
                          color: 'white'
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Switch
                          checked={user.status === 'active'}
                          onChange={() => toggleUserStatus(user.id)}
                          size="small"
                        />
                        <Typography variant="body2">
                          {user.status === 'active' ? 'Activo' : 'Inactivo'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.lastLogin ? formatLastLogin(user.lastLogin) : 'Nunca'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="Editar usuario">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setUserDialog(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Ver permisos">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setSelectedUser(user);
                              setRoleDialog(true);
                            }}
                          >
                            <SecurityIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Matriz de permisos por rol */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Matriz de Permisos
        </Typography>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Módulo / Permiso</TableCell>
                {Object.entries(systemRoles).map(([key, role]) => (
                  <TableCell key={key} align="center">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                      <span>{role.icon}</span>
                      <Typography variant="caption">{role.name}</Typography>
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(systemPermissions).map(([moduleKey, module]) => (
                <React.Fragment key={moduleKey}>
                  <TableRow>
                    <TableCell colSpan={Object.keys(systemRoles).length + 1} sx={{ backgroundColor: '#f5f5f5' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {module.icon}
                        <Typography variant="subtitle2">{module.label}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                  {Object.entries(module.permissions).map(([permKey, permission]) => (
                    <TableRow key={`${moduleKey}.${permKey}`}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2">{permission.label}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {permission.description}
                          </Typography>
                        </Box>
                      </TableCell>
                      {Object.entries(systemRoles).map(([roleKey, role]) => (
                        <TableCell key={roleKey} align="center">
                          <Checkbox
                            checked={role.permissions.includes(`${moduleKey}.${permKey}`)}
                            disabled
                            size="small"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Diálogo de edición de usuario */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selectedUser ? 'Editar Usuario' : 'Nuevo Usuario'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
            <TextField
              label="Nombre completo"
              defaultValue={selectedUser?.name || ''}
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              defaultValue={selectedUser?.email || ''}
              fullWidth
            />
            <TextField
              select
              label="Rol"
              defaultValue={selectedUser?.role || ''}
              fullWidth
            >
              {Object.entries(systemRoles).map(([key, role]) => (
                <MenuItem key={key} value={key}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <span>{role.icon}</span>
                    {role.name}
                  </Box>
                </MenuItem>
              ))}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Cancelar</Button>
          <Button onClick={() => setUserDialog(false)} variant="contained">
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Diálogo de permisos de usuario */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          Permisos de {selectedUser?.name}
        </DialogTitle>
        <DialogContent>
          {selectedUser && (
            <Box sx={{ pt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Rol actual: {getUserRole(selectedUser.role)?.name}
              </Typography>
              <Divider sx={{ my: 2 }} />
              
              {Object.entries(systemPermissions).map(([moduleKey, module]) => {
                const userRole = getUserRole(selectedUser.role);
                
                return (
                  <Box key={moduleKey} sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {module.icon}
                        {module.label}
                      </Box>
                    </Typography>
                    <FormGroup row>
                      {Object.entries(module.permissions).map(([permKey, permission]) => {
                        const hasPerm = userRole?.permissions.includes(`${moduleKey}.${permKey}`);
                        
                        return (
                          <FormControlLabel
                            key={permKey}
                            control={
                              <Checkbox
                                checked={hasPerm}
                                disabled
                                size="small"
                              />
                            }
                            label={permission.label}
                            sx={{ mr: 3 }}
                          />
                        );
                      })}
                    </FormGroup>
                  </Box>
                );
              })}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Cerrar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RoleManager;