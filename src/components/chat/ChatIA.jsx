import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  IconButton,
  Typography,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  SmartToy as BotIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { aiIntegrationService } from '../../services/aiIntegrationService';
import { aiCacheService } from '../../services/aiCacheService';
import ResultsRenderer from './ResultsRenderer';
import ActionConfirmation from './ActionConfirmation';
import { supabase } from '../../config/supabase';

const ChatIA = ({ userRole = 'asistente' }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [pendingAction, setPendingAction] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [aiConfig, setAiConfig] = useState({ enabled: true, modules: {} });
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Cargar configuración de IA al montar el componente
  useEffect(() => {
    loadAIConfig();
    
    // Mensaje de bienvenida
    const welcomeMessage = {
      id: Date.now(),
      text: `🤖 **¡Hola! Soy tu Asistente IA Ejecutivo de PautaPro**\n\nEstoy aquí para ayudarte con **TODAS** las operaciones del sistema mediante lenguaje natural.\n\n**¿Qué puedo hacer por ti?**\n\n• 📋 Crear órdenes, clientes, proveedores, campañas\n• 🔍 Buscar y analizar información\n• 📊 Generar reportes y exportaciones\n• 🚀 Navegar a cualquier sección\n• 💬 Responder preguntas sobre el sistema\n\n**Ejemplos:**\n• "Crea una orden para TechCorp por $1.000.000"\n• "Muéstrame todos los clientes de Santiago"\n• "Llévame a gestión de campañas"\n• "Genera un reporte de órdenes del último mes"\n\n**Estado:** ${aiConfig.enabled ? '✅ Activo' : '❌ Deshabilitado'}\n\n¿En qué puedo ayudarte hoy?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  const loadAIConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracion_ia')
        .select('*')
        .single();

      if (!error && data) {
        setAiConfig({
          enabled: data.ai_enabled ?? true,
          modules: data.modules ?? {}
        });
      }
    } catch (error) {
      console.error('Error cargando configuración IA:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    // Verificar si la IA está habilitada
    if (!aiConfig.enabled) {
      setNotification({
        open: true,
        message: 'La IA está deshabilitada. Habilita el Asistente IA en Configuración de IA.',
        severity: 'warning'
      });
      return;
    }

    const userMessage = {
      id: Date.now(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Procesar mensaje con el servicio de IA integrado
      const response = await aiIntegrationService.processMessage(inputMessage, {
        userRole,
        modules: aiConfig.modules
      });

      // Manejar diferentes tipos de respuestas
      if (response.type === 'action') {
        // Si requiere confirmación, mostrar diálogo
        if (response.requiresConfirmation) {
          setPendingAction(response);
          setShowConfirmation(true);
          
          const confirmationMessage = {
            id: Date.now() + 1,
            text: response.message,
            sender: 'bot',
            timestamp: new Date(),
            requiresConfirmation: true
          };
          setMessages(prev => [...prev, confirmationMessage]);
        } else {
          // Ejecutar acción directamente
          await executeAction(response);
        }
      } else {
        // Respuesta de texto normal
        const botMessage = {
          id: Date.now() + 1,
          text: response.message,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error('Error procesando mensaje:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `❌ **Error al procesar tu solicitud**\n\n${error.message || 'Ha ocurrido un error inesperado'}\n\nPor favor, intenta nuevamente o contacta al soporte técnico.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const executeAction = async (action) => {
    try {
      setIsLoading(true);
      
      // Mostrar mensaje de procesamiento
      const processingMessage = {
        id: Date.now(),
        text: `🔄 **Ejecutando: ${action.action}**\n\nProcesando tu solicitud...`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);

      // Ejecutar la acción
      const result = await aiIntegrationService.executeAction(action);

      // Mostrar resultado
      const resultMessage = {
        id: Date.now() + 1,
        text: result.message,
        sender: 'bot',
        timestamp: new Date(),
        data: result.data
      };
      setMessages(prev => [...prev, resultMessage]);

      // Mostrar notificación si es exitoso
      if (result.success) {
        setNotification({
          open: true,
          message: result.successMessage || 'Acción completada exitosamente',
          severity: 'success'
        });
      }

    } catch (error) {
      console.error('Error ejecutando acción:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        text: `❌ **Error ejecutando la acción**\n\n${error.message || 'Ha ocurrido un error'}\n\nPor favor, intenta nuevamente.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);

      setNotification({
        open: true,
        message: `Error: ${error.message}`,
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
      setPendingAction(null);
      setShowConfirmation(false);
    }
  };

  const handleConfirmAction = () => {
    if (pendingAction) {
      executeAction(pendingAction);
    }
  };

  const handleCancelAction = () => {
    setPendingAction(null);
    setShowConfirmation(false);
    
    const cancelMessage = {
      id: Date.now(),
      text: '❌ **Acción cancelada**\n\nLa acción ha sido cancelada. Si necesitas ayuda con otra cosa, estoy aquí para asistirte.',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, cancelMessage]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    const clearMessage = {
      id: Date.now(),
      text: '🗑️ **Chat limpiado**\n\nEl historial ha sido eliminado. ¿En qué puedo ayudarte ahora?',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages([clearMessage]);
  };

  return (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', maxHeight: '100vh' }}>
      {/* Header del chat */}
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 2,
        p: 2,
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
        borderRadius: 2,
        border: '1px solid rgba(102, 126, 234, 0.2)'
      }}>
        <Typography variant="h6" sx={{ 
          fontWeight: 600, 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🤖 Asistente IA PautaPro
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            label={aiConfig.enabled ? 'Activo' : 'Inactivo'}
            color={aiConfig.enabled ? 'success' : 'default'}
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
          <Chip
            label={userRole.charAt(0).toUpperCase() + userRole.slice(1)}
            variant="outlined"
            size="small"
            sx={{ fontSize: '0.75rem' }}
          />
          <Button
            size="small"
            onClick={clearChat}
            sx={{ fontSize: '0.75rem', minWidth: 'auto' }}
          >
            Limpiar
          </Button>
        </Box>
      </Box>
      
      {/* Contenedor del chat */}
      <Box sx={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        border: '2px solid rgba(102, 126, 234, 0.2)',
        borderRadius: 2,
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)',
        maxHeight: 'calc(100vh - 200px)',
        minHeight: '300px'
      }}>
        {/* Header interno del chat */}
        <Box sx={{
          p: 2,
          background: 'linear-gradient(135deg, var(--gradient-primary, #667eea) 0%, var(--gradient-secondary, #764ba2) 100%)',
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              💬 Chat con IA Ejecutiva
            </Typography>
            <Chip
              label="NLP Avanzado"
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
            Integración Supabase
          </Typography>
        </Box>
        
        {/* Área de mensajes */}
        <Box sx={{
          flex: 1,
          p: 2,
          overflow: 'auto',
          background: 'rgba(255,255,255,0.5)',
          minHeight: 0,
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'rgba(0,0,0,0.05)' },
          '&::-webkit-scrollbar-thumb': { background: '#667eea', borderRadius: '3px' }
        }}>
          {messages.map((message) => (
            <Box key={message.id} sx={{ mb: 2, minWidth: 0 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 1,
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                minWidth: 0
              }}>
                {message.sender === 'bot' && (
                  <Box sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : 'rgba(102, 126, 234, 0.1)',
                  p: 1.5,
                  borderRadius: 2,
                  maxWidth: '80%',
                  minWidth: 0,
                  wordBreak: 'break-word',
                  overflowWrap: 'break-word',
                  ...(message.sender === 'user' && {
                    color: 'white !important',
                    '& .MuiTypography-root': {
                      color: 'white !important'
                    }
                  })
                }}>
                  {message.data ? (
                    <ResultsRenderer data={message.data} />
                  ) : (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.85rem',
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        ...(message.sender === 'user' && {
                          color: 'white !important',
                          '& *': { color: 'white !important' }
                        })
                      }}
                    >
                      {message.text}
                    </Typography>
                  )}
                </Box>
                
                {message.sender === 'user' && (
                  <Box sx={{ 
                    width: 32, 
                    height: 32, 
                    borderRadius: '50%', 
                    background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)', 
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
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <CircularProgress size={16} sx={{ color: 'white' }} />
              </Box>
              <Box sx={{ 
                background: 'rgba(102, 126, 234, 0.1)', 
                p: 1.5, 
                borderRadius: 2
              }}>
                <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                  Procesando con IA...
                </Typography>
              </Box>
            </Box>
          )}
          
          <div ref={messagesEndRef} />
        </Box>
        
        {/* Área de input */}
        <Box sx={{
          p: 2,
          borderTop: '1px solid rgba(102, 126, 234, 0.2)',
          background: 'rgba(255,255,255,0.8)',
          borderRadius: '0 0 12px 12px',
          flexShrink: 0
        }}>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Escribe tu mensaje aquí... (Ej: crea una orden para TechCorp por $1.000.000)"
              variant="outlined"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading || !aiConfig.enabled}
              multiline
              maxRows={3}
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
              disabled={isLoading || !inputMessage.trim() || !aiConfig.enabled}
              sx={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                '&:hover': {
                  background: 'linear-gradient(135deg, #764ba2 0%, #f093fb 100%)',
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

      {/* Diálogo de confirmación */}
      <ActionConfirmation
        open={showConfirmation}
        action={pendingAction}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      {/* Notificaciones */}
      <Snackbar
        open={notification.open}
        autoHideDuration={6000}
        onClose={() => setNotification({ ...notification, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
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

export default ChatIA;