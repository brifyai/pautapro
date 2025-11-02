import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Grid,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Badge,
  Divider
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  MarkEmailRead as MarkReadIcon,
  Reply as ReplyIcon,
  Forward as ForwardIcon,
  Delete as DeleteIcon,
  Star as StarIcon,
  StarBorder as StarBorderIcon
} from '@mui/icons-material';

const CategorizedMessages = () => {
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMessage, setSelectedMessage] = useState(null);

  // Categorías de mensajes con configuración
  const messageCategories = {
    soporte: { 
      label: 'Soporte', 
      color: '#2196F3', 
      icon: '🎧',
      priority: 'media',
      autoAssign: 'soporte',
      responseTime: 4
    },
    aprobacion: { 
      label: 'Aprobaciones', 
      color: '#FF9800', 
      icon: '✅',
      priority: 'alta',
      autoAssign: 'gerente',
      responseTime: 24
    },
    cambio: { 
      label: 'Cambios', 
      color: '#9C27B0', 
      icon: '🔄',
      priority: 'alta',
      autoAssign: 'gerente',
      responseTime: 12
    },
    urgente: { 
      label: 'Urgente', 
      color: '#F44336', 
      icon: '🚨',
      priority: 'critica',
      autoAssign: 'gerente',
      responseTime: 1
    },
    info: { 
      label: 'Información', 
      color: '#4CAF50', 
      icon: 'ℹ️',
      priority: 'baja',
      autoAssign: null,
      responseTime: 48
    }
  };

  // Templates de respuestas rápidas
  const responseTemplates = {
    soporte: [
      'Hemos recibido tu solicitud de soporte y la estamos procesando.',
      'Nuestro equipo técnico está revisando tu caso.',
      'Para mejor asistencia, necesitamos más detalles sobre tu problema.'
    ],
    aprobacion: [
      'Tu solicitud ha sido recibida y está en proceso de aprobación.',
      'Gracias por tu paciencia, estamos revisando tu solicitud.',
      'Te notificaremos tan pronto haya una decisión sobre tu aprobación.'
    ],
    cambio: [
      'Hemos registrado tu solicitud de cambio.',
      'Tu solicitud está siendo evaluada por el equipo correspondiente.',
      'Te mantendremos informado sobre el progreso de tu solicitud.'
    ],
    urgente: [
      'Hemos recibido tu mensaje urgente y estamos atendiendo de inmediato.',
      'Tu caso tiene máxima prioridad en nuestro sistema.',
      'Un especialista está revisando tu solicitud ahora mismo.'
    ]
  };

  useEffect(() => {
    loadMessages();
  }, []);

  useEffect(() => {
    filterMessages();
  }, [messages, selectedCategory, searchTerm]);

  const loadMessages = async () => {
    try {
      // Simular carga de mensajes - en producción vendría de Supabase
      const mockMessages = [
        {
          id: 1,
          category: 'aprobacion',
          title: 'Aprobación de Campaña de Verano',
          content: 'Necesito aprobar la campaña de verano para el cliente TechCorp antes del viernes.',
          sender: 'Juan Pérez',
          senderEmail: 'juan@techcorp.com',
          timestamp: new Date('2024-01-15T10:30:00'),
          read: false,
          starred: false,
          priority: 'alta',
          campaignId: '123'
        },
        {
          id: 2,
          category: 'soporte',
          title: 'Problema con el sistema de reportes',
          content: 'No puedo generar los reportes mensuales, el sistema muestra un error 500.',
          sender: 'María González',
          senderEmail: 'maria@empresa.com',
          timestamp: new Date('2024-01-15T09:15:00'),
          read: true,
          starred: false,
          priority: 'media'
        },
        {
          id: 3,
          category: 'urgente',
          title: 'Campaña se detuvo inesperadamente',
          content: 'La campaña del cliente principal se detuvo hace 30 minutos, necesitamos ayuda urgente.',
          sender: 'Sistema Automático',
          senderEmail: 'sistema@pautapro.com',
          timestamp: new Date('2024-01-15T08:45:00'),
          read: false,
          starred: true,
          priority: 'critica'
        },
        {
          id: 4,
          category: 'cambio',
          title: 'Solicitud de cambio en fechas',
          content: 'El cliente solicita mover la fecha de inicio de la campaña de lunes a miércoles.',
          sender: 'Ana López',
          senderEmail: 'ana@cliente.com',
          timestamp: new Date('2024-01-14T16:20:00'),
          read: true,
          starred: false,
          priority: 'alta'
        },
        {
          id: 5,
          category: 'info',
          title: 'Nuevas funcionalidades disponibles',
          content: 'Hemos lanzado nuevas herramientas de análisis en el dashboard.',
          sender: 'Equipo PautaPro',
          senderEmail: 'info@pautapro.com',
          timestamp: new Date('2024-01-14T14:00:00'),
          read: true,
          starred: false,
          priority: 'baja'
        }
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error cargando mensajes:', error);
    }
  };

  const filterMessages = () => {
    let filtered = messages;

    // Filtrar por categoría
    if (selectedCategory !== 'todos') {
      filtered = filtered.filter(msg => msg.category === selectedCategory);
    }

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(msg =>
        msg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        msg.sender.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredMessages(filtered);
  };

  const handleMenuClick = (event, message) => {
    setAnchorEl(event.currentTarget);
    setSelectedMessage(message);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMessage(null);
  };

  const markAsRead = async (messageId) => {
    try {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, read: true } : msg
      ));
      handleMenuClose();
    } catch (error) {
      console.error('Error marcando mensaje como leído:', error);
    }
  };

  const toggleStar = async (messageId) => {
    try {
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
      ));
    } catch (error) {
      console.error('Error cambiando estrella:', error);
    }
  };

  const deleteMessage = async (messageId) => {
    try {
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      handleMenuClose();
    } catch (error) {
      console.error('Error eliminando mensaje:', error);
    }
  };

  const getCategoryStats = () => {
    const stats = {};
    Object.keys(messageCategories).forEach(category => {
      stats[category] = messages.filter(msg => msg.category === category).length;
    });
    return stats;
  };

  const getUnreadCount = (category) => {
    return messages.filter(msg => msg.category === category && !msg.read).length;
  };

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Hace ${days} día${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
    return 'Hace unos minutos';
  };

  const categoryStats = getCategoryStats();

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Centro de Mensajes
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Gestiona y categoriza todas las comunicaciones del sistema
        </Typography>
      </Box>

      {/* Barra de búsqueda y filtros */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              placeholder="Buscar mensajes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Button
                variant={selectedCategory === 'todos' ? 'contained' : 'outlined'}
                onClick={() => setSelectedCategory('todos')}
                startIcon={<Badge badgeContent={messages.length} color="primary">📬</Badge>}
              >
                Todos
              </Button>
              {Object.entries(messageCategories).map(([key, category]) => (
                <Button
                  key={key}
                  variant={selectedCategory === key ? 'contained' : 'outlined'}
                  onClick={() => setSelectedCategory(key)}
                  startIcon={
                    <Badge badgeContent={getUnreadCount(key)} color="error">
                      <span>{category.icon}</span>
                    </Badge>
                  }
                  sx={{
                    borderColor: category.color,
                    color: selectedCategory === key ? 'white' : category.color,
                    backgroundColor: selectedCategory === key ? category.color : 'transparent',
                    '&:hover': {
                      backgroundColor: selectedCategory === key ? category.color : `${category.color}20`,
                    }
                  }}
                >
                  {category.label}
                </Button>
              ))}
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Estadísticas de categorías */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          {Object.entries(messageCategories).map(([key, category]) => (
            <Grid item xs={12} sm={6} md={2.4} key={key}>
              <Card 
                sx={{ 
                  cursor: 'pointer',
                  border: selectedCategory === key ? `2px solid ${category.color}` : '1px solid #e0e0e0',
                  '&:hover': { boxShadow: 2 }
                }}
                onClick={() => setSelectedCategory(key)}
              >
                <CardContent sx={{ textAlign: 'center', p: 2 }}>
                  <Typography variant="h4" sx={{ mb: 1 }}>
                    {category.icon}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {category.label}
                  </Typography>
                  <Typography variant="h6" color={category.color}>
                    {categoryStats[key] || 0}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {getUnreadCount(key)} sin leer
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Lista de mensajes */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {selectedCategory === 'todos' ? 'Todos los mensajes' : messageCategories[selectedCategory]?.label}
          <span> ({filteredMessages.length})</span>
        </Typography>
        
        {filteredMessages.length === 0 ? (
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No hay mensajes en esta categoría
              </Typography>
            </CardContent>
          </Card>
        ) : (
          <Box>
            {filteredMessages.map((message) => {
              const category = messageCategories[message.category];
              return (
                <Card key={message.id} sx={{ mb: 2, border: message.read ? '1px solid #e0e0e0' : `2px solid ${category.color}` }}>
                  <CardContent>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} md={8}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                          <Avatar sx={{ bgcolor: category.color }}>
                            {category.icon}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="h6" sx={{ fontWeight: message.read ? 'normal' : 'bold' }}>
                              {message.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              De: {message.sender} • {formatTimestamp(message.timestamp)}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <IconButton
                              size="small"
                              onClick={() => toggleStar(message.id)}
                              color={message.starred ? 'warning' : 'default'}
                            >
                              {message.starred ? <StarIcon /> : <StarBorderIcon />}
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={(e) => handleMenuClick(e, message)}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Box>
                        </Box>
                        <Typography variant="body2" sx={{ mb: 2 }}>
                          {message.content}
                        </Typography>
                        <Chip
                          label={category.label}
                          size="small"
                          sx={{
                            backgroundColor: category.color,
                            color: 'white',
                            mr: 1
                          }}
                        />
                        <Chip
                          label={message.priority}
                          size="small"
                          color={message.priority === 'critica' ? 'error' : message.priority === 'alta' ? 'warning' : 'default'}
                          variant="outlined"
                        />
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        )}
      </Box>

      {/* Menú contextual */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedMessage && !selectedMessage.read && (
          <MenuItem onClick={() => markAsRead(selectedMessage.id)}>
            <MarkReadIcon sx={{ mr: 1 }} /> Marcar como leído
          </MenuItem>
        )}
        <MenuItem onClick={() => toggleStar(selectedMessage?.id)}>
          <StarIcon sx={{ mr: 1 }} /> {selectedMessage?.starred ? 'Quitar estrella' : 'Agregar estrella'}
        </MenuItem>
        <MenuItem>
          <ReplyIcon sx={{ mr: 1 }} /> Responder
        </MenuItem>
        <MenuItem>
          <ForwardIcon sx={{ mr: 1 }} /> Reenviar
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => deleteMessage(selectedMessage?.id)} sx={{ color: 'error' }}>
          <DeleteIcon sx={{ mr: 1 }} /> Eliminar
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CategorizedMessages;