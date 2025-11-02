import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Paper,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Alert,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  Download as DownloadIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { orderService } from '../../services/orderService';
import { reportService } from '../../services/reportService';

const ChatIA = ({ userRole = 'asistente' }) => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente IA de PautaPro. Puedo ayudarte a:\n\n• Crear órdenes, medios, soportes, campañas, contratos y proveedores\n• Generar reportes con cruces de información\n• Exportar datos a Excel\n• Responder preguntas sobre el sistema\n\n¿En qué puedo asistirte hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Definir permisos por rol
  const rolePermissions = {
    asistente: {
      canCreate: ['orden', 'soporte'],
      canReport: ['basico'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede acceder a datos financieros sensibles']
    },
    planificador: {
      canCreate: ['orden', 'medio', 'soporte', 'campana'],
      canReport: ['basico', 'campaign', 'media'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede aprobar presupuestos']
    },
    supervisor: {
      canCreate: ['orden', 'medio', 'soporte', 'campana', 'contrato'],
      canReport: ['basico', 'campaign', 'media', 'contract'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede eliminar registros']
    },
    director: {
      canCreate: ['orden', 'medio', 'soporte', 'campana', 'contrato', 'proveedor'],
      canReport: ['basico', 'campaign', 'media', 'contract', 'financial'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede cambiar bases de datos']
    },
    gerente: {
      canCreate: ['orden', 'medio', 'soporte', 'campana', 'contrato', 'proveedor'],
      canReport: ['basico', 'campaign', 'media', 'contract', 'financial', 'executive'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede cambiar bases de datos']
    },
    financiero: {
      canCreate: ['orden', 'contrato'],
      canReport: ['basico', 'financial', 'executive'],
      canExport: true,
      restrictions: ['No puede modificar configuración del sistema', 'No puede cambiar bases de datos', 'Solo puede ver datos financieros']
    }
  };

  const currentPermissions = rolePermissions[userRole] || rolePermissions.asistente;

  // Base de conocimiento del sistema
  const knowledgeBase = {
    ordenes: {
      description: 'Las órdenes son solicitudes de trabajo que se asignan a proveedores para ejecutar acciones de publicidad',
      fields: ['cliente', 'campana', 'medio', 'soporte', 'fecha_inicio', 'fecha_termino', 'presupuesto'],
      process: 'Para crear una orden, necesitas seleccionar un cliente, una campaña, el medio y soporte, y definir las fechas y presupuesto'
    },
    medios: {
      description: 'Los medios son los canales de comunicación donde se publica la publicidad (TV, radio, prensa, digital, etc.)',
      fields: ['nombre', 'tipo', 'proveedor', 'contacto', 'costo_base'],
      process: 'Para crear un medio, debes especificar el nombre, tipo de medio, proveedor asociado y costos'
    },
    soportes: {
      description: 'Los soportes son las ubicaciones específicas dentro de un medio (programa de TV, sección de diario, sitio web, etc.)',
      fields: ['nombre', 'medio', 'tipo', 'dimensiones', 'costo'],
      process: 'Para crear un soporte, necesitas asociarlo a un medio existente y definir sus características'
    },
    campanas: {
      description: 'Las campañas son conjuntos de acciones publicitarias con objetivos comunes',
      fields: ['nombre', 'cliente', 'fecha_inicio', 'fecha_termino', 'presupuesto_total', 'objetivos'],
      process: 'Para crear una campaña, debes definir el cliente, fechas, presupuesto y objetivos'
    },
    contratos: {
      description: 'Los contratos son acuerdos formales con proveedores para la ejecución de servicios',
      fields: ['proveedor', 'tipo_servicio', 'fecha_inicio', 'fecha_termino', 'condiciones', 'monto'],
      process: 'Para crear un contrato, necesitas un proveedor y definir las condiciones del servicio'
    },
    proveedores: {
      description: 'Los proveedores son empresas o personas que brindan servicios de publicidad',
      fields: ['nombre', 'rut', 'direccion', 'contacto', 'servicios', 'condiciones_pago'],
      process: 'Para crear un proveedor, debes registrar sus datos básicos y servicios ofrecidos'
    }
  };

  const quickActions = [
    { label: 'Crear Orden', type: 'crear', entity: 'orden', icon: '📋' },
    { label: 'Crear Medio', type: 'crear', entity: 'medio', icon: '📺' },
    { label: 'Crear Soporte', type: 'crear', entity: 'soporte', icon: '📰' },
    { label: 'Crear Campaña', type: 'crear', entity: 'campana', icon: '🎯' },
    { label: 'Crear Contrato', type: 'crear', entity: 'contrato', icon: '📄' },
    { label: 'Crear Proveedor', type: 'crear', entity: 'proveedor', icon: '🏢' },
    { label: 'Generar Reporte', type: 'reporte', entity: 'general', icon: '📊' },
    { label: 'Exportar a Excel', type: 'exportar', entity: 'datos', icon: '📈' }
  ].filter(action => {
    if (action.type === 'crear') {
      return currentPermissions.canCreate.includes(action.entity);
    }
    return true;
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setShowQuickActions(false);

    try {
      const response = await processMessage(inputMessage);
      const botMessage = {
        id: Date.now() + 1,
        text: response,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Lo siento, ha ocurrido un error al procesar tu solicitud. Por favor, intenta nuevamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const processMessage = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Detectar intenciones de creación
    if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) {
      for (const entity of Object.keys(knowledgeBase)) {
        if (lowerMessage.includes(entity)) {
          if (currentPermissions.canCreate.includes(entity)) {
            return `Entiendo que quieres crear un ${entity}. ${knowledgeBase[entity].description}.\n\n${knowledgeBase[entity].process}\n\n¿Te gustaría que te ayude a crearlo ahora?`;
          } else {
            return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear ${entity}s.\n\nRestricciones aplicables:\n${currentPermissions.restrictions.join('\n')}`;
          }
        }
      }
    }

    // Detectar solicitudes de reportes
    if (lowerMessage.includes('reporte') || lowerMessage.includes('informe')) {
      return `Puedo generar los siguientes tipos de reportes según tu rol de ${userRole}:\n\n${currentPermissions.canReport.map(type => `• ${type}`).join('\n')}\n\n¿Qué tipo de reporte necesitas? Puedo incluir cruces de información y exportarlo a Excel.`;
    }

    // Detectar solicitudes de exportación
    if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
      if (currentPermissions.canExport) {
        return 'Puedo exportar datos a Excel. ¿Qué información específica necesitas exportar? Puedo incluir:\n\n• Órdenes y su estado\n• Campañas y su rendimiento\n• Proveedores y contratos\n• Reportes personalizados con cruces de información';
      } else {
        return 'Lo siento, no tienes permisos para exportar datos.';
      }
    }

    // Responder preguntas sobre el sistema
    for (const [key, value] of Object.entries(knowledgeBase)) {
      if (lowerMessage.includes(key)) {
        return `${value.description}\n\nCampos requeridos: ${value.fields.join(', ')}\n\n${value.process}`;
      }
    }

    // Respuesta por defecto
    return `Entiendo tu consulta. Como asistente IA de PautaPro, puedo ayudarte con:\n\n• Creación de: ${currentPermissions.canCreate.join(', ')}\n• Generación de reportes: ${currentPermissions.canReport.join(', ')}\n• Exportación de datos: ${currentPermissions.canExport ? 'Sí' : 'No'}\n\nRestricciones de tu rol:\n${currentPermissions.restrictions.join('\n')}\n\n¿Podrías ser más específico sobre lo que necesitas?`;
  };

  const handleQuickAction = (action) => {
    if (action.type === 'crear') {
      setCreateType(action.entity);
      setShowCreateDialog(true);
    } else if (action.type === 'reporte') {
      setInputMessage('Quiero generar un reporte');
      handleSendMessage();
    } else if (action.type === 'exportar') {
      setInputMessage('Quiero exportar datos a Excel');
      handleSendMessage();
    }
  };

  const handleCreateEntity = async (entityType, formData) => {
    try {
      let result;
      switch (entityType) {
        case 'orden':
          result = await orderService.createOrden(formData);
          break;
        case 'medio':
          result = await orderService.createMedio(formData);
          break;
        case 'soporte':
          result = await orderService.createSoporte(formData);
          break;
        case 'campana':
          result = await orderService.createCampana(formData);
          break;
        case 'contrato':
          result = await orderService.createContrato(formData);
          break;
        case 'proveedor':
          result = await orderService.createProveedor(formData);
          break;
        default:
          throw new Error('Tipo de entidad no válido');
      }

      setNotification({
        open: true,
        message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} creado exitosamente`,
        severity: 'success'
      });

      const successMessage = {
        id: Date.now(),
        text: `✅ ${entityType.charAt(0).toUpperCase() + entityType.slice(1)} creado exitosamente con ID: ${result.id}`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);

      setShowCreateDialog(false);
    } catch (error) {
      setNotification({
        open: true,
        message: `Error al crear ${entityType}: ${error.message}`,
        severity: 'error'
      });
    }
  };

  const exportToExcel = (data, filename) => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Reporte');
    XLSX.writeFile(wb, `${filename}.xlsx`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header del chat - mismo diseño que Actividad Reciente */}
      <Typography variant="h6" gutterBottom className="text-gradient" sx={{ fontWeight: 600, mb: 3 }}>
        🤖 Asistente IA PautaPro
      </Typography>
      
      {/* Contenedor del chat */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)'
      }}>
        {/* Header interno del chat */}
        <Box sx={{
          p: 2,
          background: 'linear-gradient(135deg, var(--gradient-primary) 0%, var(--gradient-secondary) 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              💬 Chat Inteligente
            </Typography>
            <Chip
              label="Activo"
              size="small"
              sx={{
                background: 'rgba(255,255,255,0.2)',
                color: 'white',
                fontWeight: 600,
                fontSize: '0.7rem'
              }}
            />
          </Box>
          <Typography variant="caption" sx={{ opacity: 0.9 }}>
            Acceso: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </Typography>
        </Box>
        
        {/* Área de mensajes */}
        <Box sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          background: 'rgba(255,255,255,0.5)',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)' },
          '&::-webkit-scrollbar-thumb': { background: 'var(--gradient-primary)', borderRadius: '3px' }
        }}>
        {messages.map((message) => (
          <Box key={message.id} sx={{ mb: 2 }}>
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              gap: 1, 
              justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              {message.sender === 'bot' && (
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: 'var(--gradient-primary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BotIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              )}
              
              <Box sx={{
                background: message.sender === 'user'
                  ? 'var(--gradient-primary)'
                  : 'rgba(102, 126, 234, 0.1)',
                p: 1.5,
                borderRadius: 2,
                maxWidth: '80%',
                ...(message.sender === 'user' && {
                  color: 'white !important',
                  '& .MuiTypography-root': {
                    color: 'white !important'
                  }
                })
              }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.85rem',
                    lineHeight: 1.4,
                    whiteSpace: 'pre-line',
                    ...(message.sender === 'user' && {
                      color: 'white !important',
                      '& *': { color: 'white !important' }
                    })
                  }}
                >
                  {message.text}
                </Typography>
              </Box>
              
              {message.sender === 'user' && (
                <Box sx={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%', 
                  background: 'var(--gradient-secondary)', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <PersonIcon sx={{ fontSize: 16, color: 'white' }} />
                </Box>
              )}
            </Box>
          </Box>
        ))}
        
        {isLoading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Box sx={{ 
              width: 32, 
              height: 32, 
              borderRadius: '50%', 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center'
            }}>
              <BotIcon sx={{ fontSize: 16, color: 'white' }} />
            </Box>
            <Box sx={{ 
              background: 'rgba(102, 126, 234, 0.1)', 
              p: 1.5, 
              borderRadius: 2
            }}>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                Escribiendo...
              </Typography>
            </Box>
          </Box>
        )}
        
        <div ref={messagesEndRef} />
      </Box>
      
      {/* Acciones rápidas */}
      {showQuickActions && (
        <Box sx={{ px: 2, py: 1, background: 'rgba(255,255,255,0.8)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
            Acciones rápidas:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {quickActions.map((action, index) => (
              <Chip 
                key={index}
                label={`${action.icon} ${action.label}`}
                size="small" 
                variant="outlined"
                onClick={() => handleQuickAction(action)}
                sx={{ 
                  fontSize: '0.7rem', 
                  height: 24,
                  borderColor: 'var(--gradient-primary)',
                  color: 'var(--gradient-primary)',
                  '&:hover': {
                    background: 'var(--gradient-primary)',
                    color: 'white'
                  }
                }}
              />
            ))}
          </Box>
        </Box>
      )}
      
      {/* Área de input */}
      <Box sx={{
        p: 2,
        borderTop: '1px solid rgba(102, 126, 234, 0.2)',
        background: 'rgba(255,255,255,0.8)',
        borderRadius: '0 0 12px 12px'
      }}>
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <TextField
            fullWidth
            size="small"
            placeholder="Escribe tu mensaje aquí..."
            variant="outlined"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            sx={{
              '& .MuiOutlinedInput-root': {
                background: 'white',
                borderRadius: 2,
              },
              '& .MuiOutlinedInput-input': {
                padding: '8px 12px',
                fontSize: '0.85rem'
              }
            }}
          />
          <IconButton
            size="small"
            onClick={handleSendMessage}
            disabled={isLoading || !inputMessage.trim()}
            sx={{
              background: 'var(--gradient-primary)',
              color: 'white',
              '&:hover': {
                background: 'var(--gradient-secondary)',
              },
              '&:disabled': {
                background: 'rgba(0,0,0,0.12)',
                color: 'rgba(0,0,0,0.26)'
              }
            }}
          >
            <SendIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Box>
      </Box>
      </Box>

      {/* Diálogo para crear entidades */}
      <Dialog 
        open={showCreateDialog} 
        onClose={() => setShowCreateDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Crear {createType.charAt(0).toUpperCase() + createType.slice(1)}
          <IconButton
            aria-label="close"
            onClick={() => setShowCreateDialog(false)}
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
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {knowledgeBase[createType]?.description}
          </Typography>
          <CreateEntityForm 
            entityType={createType}
            onSubmit={(data) => handleCreateEntity(createType, data)}
            onCancel={() => setShowCreateDialog(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
      >
        <Alert 
          onClose={() => setNotification({ ...notification, open: false })} 
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

// Componente para formularios de creación
const CreateEntityForm = ({ entityType, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleInputChange = (field) => (e) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };

  const renderFormFields = () => {
    switch (entityType) {
      case 'orden':
        return (
          <>
            <TextField
              fullWidth
              label="Cliente"
              margin="normal"
              onChange={handleInputChange('cliente')}
            />
            <TextField
              fullWidth
              label="Campaña"
              margin="normal"
              onChange={handleInputChange('campana')}
            />
            <TextField
              fullWidth
              label="Medio"
              margin="normal"
              onChange={handleInputChange('medio')}
            />
            <TextField
              fullWidth
              label="Soporte"
              margin="normal"
              onChange={handleInputChange('soporte')}
            />
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={handleInputChange('fecha_inicio')}
            />
            <TextField
              fullWidth
              label="Fecha Término"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={handleInputChange('fecha_termino')}
            />
            <TextField
              fullWidth
              label="Presupuesto"
              type="number"
              margin="normal"
              onChange={handleInputChange('presupuesto')}
            />
          </>
        );
      case 'medio':
        return (
          <>
            <TextField
              fullWidth
              label="Nombre del Medio"
              margin="normal"
              onChange={handleInputChange('nombre')}
            />
            <TextField
              fullWidth
              label="Tipo de Medio"
              margin="normal"
              onChange={handleInputChange('tipo')}
            />
            <TextField
              fullWidth
              label="Proveedor"
              margin="normal"
              onChange={handleInputChange('proveedor')}
            />
            <TextField
              fullWidth
              label="Contacto"
              margin="normal"
              onChange={handleInputChange('contacto')}
            />
            <TextField
              fullWidth
              label="Costo Base"
              type="number"
              margin="normal"
              onChange={handleInputChange('costo_base')}
            />
          </>
        );
      case 'campana':
        return (
          <>
            <TextField
              fullWidth
              label="Nombre de Campaña"
              margin="normal"
              onChange={handleInputChange('nombre')}
            />
            <TextField
              fullWidth
              label="Cliente"
              margin="normal"
              onChange={handleInputChange('cliente')}
            />
            <TextField
              fullWidth
              label="Fecha Inicio"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={handleInputChange('fecha_inicio')}
            />
            <TextField
              fullWidth
              label="Fecha Término"
              type="date"
              margin="normal"
              InputLabelProps={{ shrink: true }}
              onChange={handleInputChange('fecha_termino')}
            />
            <TextField
              fullWidth
              label="Presupuesto Total"
              type="number"
              margin="normal"
              onChange={handleInputChange('presupuesto_total')}
            />
            <TextField
              fullWidth
              label="Objetivos"
              multiline
              rows={3}
              margin="normal"
              onChange={handleInputChange('objetivos')}
            />
          </>
        );
      default:
        return (
          <Typography variant="body2" color="text.secondary">
            Formulario para crear {entityType} en desarrollo...
          </Typography>
        );
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {renderFormFields()}
      <DialogActions sx={{ mt: 2 }}>
        <Button onClick={onCancel}>Cancelar</Button>
        <Button type="submit" variant="contained">Crear</Button>
      </DialogActions>
    </form>
  );
};

export default ChatIA;