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
  Close as CloseIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  ShoppingCart as ShoppingCartIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';
import * as XLSX from 'xlsx';
import { orderService } from '../../services/orderService';
import { reportService } from '../../services/reportService';
import { useNavigate } from 'react-router-dom';
import nlpService from '../../services/nlpService';
import entityResolverService from '../../services/entityResolverService';
import { generateOrderPDF } from '../../utils/pdfGenerator';

const ChatIA = ({ userRole = 'asistente' }) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: '¡Hola! Soy tu asistente IA ejecutivo de PautaPro. Puedo realizar **TODAS** las acciones manuales del sistema mediante instrucciones naturales.\n\n🤖 **Ejemplos:** "Crea una orden para Empresa XYZ por $1.000.000", "Agrega cliente TechCorp", "Busca proveedores de Santiago", "Genera reporte de órdenes"\n\n📋 **Gestiono:** Clientes, Proveedores, Medios, Soportes, Campañas, Contratos, Órdenes, Agencias (CRUD completo)\n\n¿Qué deseas hacer hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createType, setCreateType] = useState('');
  const [notification, setNotification] = useState({ open: false, message: '', severity: 'success' });
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
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

  // No hay acciones rápidas - la IA procesa todo mediante lenguaje natural

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
    
    // 🧭 NAVEGACIÓN INTELIGENTE
    if (lowerMessage.includes('ir a') || lowerMessage.includes('llévame a') || lowerMessage.includes('navega a') || lowerMessage.includes('abre') || lowerMessage.includes('muéstrame')) {
      return await processNavigation(message);
    }
    
    // 👥 GESTIÓN DE CLIENTES
    if (lowerMessage.includes('cliente') || lowerMessage.includes('clientes')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo') || lowerMessage.includes('agregar')) {
        return await processClientCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca') || lowerMessage.includes('encuentra')) {
        return await processClientSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar') || lowerMessage.includes('actualizar')) {
        return await processClientUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar') || lowerMessage.includes('estado')) {
        return await processClientStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processClientDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processClientExport(message);
      }
    }
    
    // 🏢 GESTIÓN DE PROVEEDORES
    if (lowerMessage.includes('proveedor') || lowerMessage.includes('proveedores')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo') || lowerMessage.includes('agregar')) {
        return await processProviderCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processProviderSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processProviderUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar')) {
        return await processProviderStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processProviderDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processProviderExport(message);
      }
    }
    
    // 📺 GESTIÓN DE MEDIOS
    if (lowerMessage.includes('medio') || lowerMessage.includes('medios')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) {
        return await processMediumCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processMediumSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processMediumUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar')) {
        return await processMediumStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processMediumDeletion(message);
      }
    }
    
    // 📰 GESTIÓN DE SOPORTES
    if (lowerMessage.includes('soporte') || lowerMessage.includes('soportes')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) {
        return await processSupportCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processSupportSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processSupportUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar')) {
        return await processSupportStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processSupportDeletion(message);
      }
    }
    
    // 🎯 GESTIÓN DE CAMPAÑAS
    if (lowerMessage.includes('campaña') || lowerMessage.includes('campañas')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nueva')) {
        return await processCampaignCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processCampaignSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processCampaignUpdate(message);
      }
      if (lowerMessage.includes('estado') || lowerMessage.includes('cambiar estado')) {
        return await processCampaignStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processCampaignDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processCampaignExport(message);
      }
    }
    
    // 📄 GESTIÓN DE CONTRATOS
    if (lowerMessage.includes('contrato') || lowerMessage.includes('contratos')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) {
        return await processContractCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processContractSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processContractUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar')) {
        return await processContractStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processContractDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processContractExport(message);
      }
    }
    
    // 🛒 GESTIÓN DE ÓRDENES
    if (lowerMessage.includes('orden') || lowerMessage.includes('ordenes')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nueva') || lowerMessage.includes('crea') || lowerMessage.includes('haz') || lowerMessage.includes('genera')) {
        // Verificar si contiene elementos suficientes para una orden completa
        const hasClient = lowerMessage.includes('cliente') || lowerMessage.includes('para') || lowerMessage.includes('de');
        const hasProduct = lowerMessage.includes('producto') || lowerMessage.includes('servicio') || lowerMessage.includes('con');
        const hasMedium = lowerMessage.includes('medio') || lowerMessage.includes('por') || lowerMessage.includes('en');
        const hasAmount = lowerMessage.includes('$') || lowerMessage.includes('monto') || lowerMessage.includes('valor');
        
        if (hasClient && (hasProduct || hasMedium || hasAmount)) {
          return await processComplexOrder(message);
        } else {
          return await processOrderCreation(message);
        }
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processOrderSearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processOrderUpdate(message);
      }
      if (lowerMessage.includes('estado') || lowerMessage.includes('cambiar estado')) {
        return await processOrderStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processOrderDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processOrderExport(message);
      }
    }
    
    // 🏢 GESTIÓN DE AGENCIAS
    if (lowerMessage.includes('agencia') || lowerMessage.includes('agencias')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nueva')) {
        return await processAgencyCreation(message);
      }
      if (lowerMessage.includes('buscar') || lowerMessage.includes('busca')) {
        return await processAgencySearch(message);
      }
      if (lowerMessage.includes('editar') || lowerMessage.includes('modificar')) {
        return await processAgencyUpdate(message);
      }
      if (lowerMessage.includes('activar') || lowerMessage.includes('desactivar')) {
        return await processAgencyStatusChange(message);
      }
      if (lowerMessage.includes('eliminar') || lowerMessage.includes('borrar')) {
        return await processAgencyDeletion(message);
      }
      if (lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
        return await processAgencyExport(message);
      }
    }
    
    // 📊 REPORTES Y EXPORTACIÓN
    if (lowerMessage.includes('reporte') || lowerMessage.includes('informe') || lowerMessage.includes('exportar') || lowerMessage.includes('excel')) {
      return await processReportGeneration(message);
    }
    
    // 🔧 FUNCIONES ADMINISTRATIVAS
    if (lowerMessage.includes('backup') || lowerMessage.includes('respaldar') ||
        lowerMessage.includes('mantenimiento') || lowerMessage.includes('limpiar') ||
        lowerMessage.includes('estadísticas') || lowerMessage.includes('métricas') ||
        lowerMessage.includes('rendimiento') || lowerMessage.includes('usuario') ||
        lowerMessage.includes('usuarios') || lowerMessage.includes('configurar') ||
        lowerMessage.includes('configuración')) {
      return await processAdministrativeTasks(message);
    }
    
    // 🔍 BÚSQUEDA AVANZADA
    if (lowerMessage.includes('búsqueda avanzada') || lowerMessage.includes('buscar complejo')) {
      return await processAdvancedSearch(message);
    }
    
    // 📱 INTEGRACIONES Y NOTIFICACIONES
    if (lowerMessage.includes('notificar') || lowerMessage.includes('enviar correo') ||
        lowerMessage.includes('sincronizar') || lowerMessage.includes('sync')) {
      return await processIntegrations(message);
    }
    
    // � MANEJO DE CONFIRMACIÓN DE ÓRDENES PENDIENTES
    if (pendingOrder) {
      if (lowerMessage.includes('confirmar') || lowerMessage.includes('sí') || lowerMessage.includes('si') || lowerMessage.includes('aceptar')) {
        await executeOrderCreation();
        return 'Procesando confirmación...';
      }
      
      if (lowerMessage.includes('cancelar') || lowerMessage.includes('no') || lowerMessage.includes('abortar')) {
        cancelPendingOrder();
        return 'Orden cancelada.';
      }
    }
    
    // Detectar intenciones de creación simples
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
      return `Puedo generar los siguientes tipos de reportes según tu rol de ${userRole}:\n\n${currentPermissions.canReport.map(type => `• ${type}`).join('\n')}\n\n¿Qué tipo de reporte necesitas? Puedo incluir cruces de información y exportarlo a Excel.\n\nTambién puedo llevarte directamente a la página de reportes si escribes "ir a reportes".`;
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

    // Respuesta por defecto mejorada
    return `Entiendo tu consulta. Como asistente IA ejecutivo de PautaPro, puedo realizar **TODAS** las acciones manuales del sistema mediante lenguaje natural.\n\n🤖 **Ejemplos de instrucciones que puedo procesar:**\n\n**Gestión de Clientes:**\n• "Crea un nuevo cliente llamado TechCorp con rut 12.345.678-9"\n• "Busca todos los clientes de Santiago"\n• "Activa el cliente Empresa XYZ"\n• "Exporta todos los clientes a Excel"\n\n**Gestión de Proveedores:**\n• "Agrega un proveedor de televisión llamado TV Chile"\n• "Busca proveedores de radio"\n• "Desactiva el proveedor Radio FM"\n\n**Gestión de Campañas:**\n• "Crea una campaña para Cliente ABC desde enero hasta marzo"\n• "Cambia el estado de la campaña 2024 a aprobada"\n• "Elimina la campaña Campaña Test que está en borrador"\n\n**Gestión de Órdenes (IA Ejecutiva):**\n• "Crea una orden para Empresa XYZ con producto Marketing Digital por Televisión por $1.000.000"\n• "Genera una orden para Cliente ABC con servicio Publicidad Radio por $500.000"\n\n**Navegación:**\n• "Llévame a gestión de clientes"\n• "Abre la página de reportes"\n• "Muéstrame el dashboard"\n\n**Reportes:**\n• "Genera un reporte de órdenes del último mes"\n• "Exporta el rendimiento de medios a Excel"\n\n📋 **Entidades que puedo gestionar:** ${currentPermissions.canCreate.join(', ')}\n📊 **Tipos de reportes:** ${currentPermissions.canReport.join(', ')}\n📈 **Exportación de datos:** ${currentPermissions.canExport ? 'Sí' : 'No'}\n\nRestricciones de tu rol (${userRole}):\n${currentPermissions.restrictions.join('\n')}\n\n¿Qué acción específica deseas realizar?`;
  };

  // 🤖 PROCESAMIENTO DE ÓRDENES COMPLEJAS CON IA
  const processComplexOrder = async (message) => {
    try {
      setIsProcessingOrder(true);
      
      // Mostrar mensaje de procesamiento
      const processingMessage = {
        id: Date.now(),
        text: '🤖 Procesando tu instrucción con IA...\n\nExtrayendo entidades y validando datos...',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, processingMessage]);
      
      // Paso 1: Procesar lenguaje natural
      const nlpResult = await nlpService.processInstruction(message);
      
      if (!nlpResult.success) {
        const errorMessage = {
          id: Date.now() + 1,
          text: `❌ ${nlpResult.message}\n\n💡 **Sugerencias para mejorar tu instrucción:**\n${nlpService.suggestCorrections(nlpResult.entities, nlpResult.validation.missing).map(s => `• ${s}`).join('\n')}`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsProcessingOrder(false);
        return errorMessage.text;
      }
      
      // Paso 2: Resolver entidades en la base de datos
      const resolvingMessage = {
        id: Date.now() + 2,
        text: '🔍 Resolviendo entidades en la base de datos...\n\nBuscando cliente, medio, campaña y contratos...',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, resolvingMessage]);
      
      const resolved = await entityResolverService.resolveOrderEntities(
        nlpResult.entities,
        nlpResult.structure
      );
      
      if (resolved.errors.length > 0) {
        const errorMessage = {
          id: Date.now() + 3,
          text: `❌ No se pudieron resolver todas las entidades:\n\n${resolved.errors.join('\n')}\n\n💡 **Sugerencias:**\n• Verifica que el cliente exista en el sistema\n• Asegúrate de que haya un contrato activo\n• Confirma que el medio esté registrado`,
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsProcessingOrder(false);
        return errorMessage.text;
      }
      
      // Paso 3: Preparar estructura final
      const finalStructure = entityResolverService.prepareOrderStructure(
        nlpResult.structure,
        resolved
      );
      
      // Paso 4: Mostrar resumen para confirmación
      const confirmationMessage = {
        id: Date.now() + 4,
        text: `✅ **Entidades Resueltas con Éxito**\n\n📋 **Resumen de la Orden a Crear:**\n\n` +
                `👤 **Cliente:** ${resolved.cliente.nombre} (${resolved.cliente.rut})\n` +
                `🎯 **Campaña:** ${resolved.campana.nombre} ${resolved.campana.created ? '(Nueva)' : '(Existente)'}\n` +
                `📺 **Medio:** ${resolved.medio.nombre}\n` +
                `📄 **Contrato:** ${resolved.contrato.nombre}\n` +
                `📍 **Soporte:** ${resolved.soporte.nombre}\n` +
                `💰 **Monto:** $${(nlpResult.entities.monto || 0).toLocaleString('es-CL')}\n` +
                `📅 **Período:** ${nlpResult.entities.mes || 'actual'} ${nlpResult.entities.anio}\n\n` +
                `🎯 **Producto/Servicio:** ${nlpResult.entities.producto}\n` +
                `⏱️ **Duración:** ${nlpResult.entities.duracion || '1 mes'}\n\n` +
                `🤖 **Confianza de extracción:** ${nlpResult.confidence}%\n\n` +
                `✨ **¿Confirmas la creación de esta orden?**\n` +
                `Responde "confirmar" para proceder o "cancelar" para abortar.\n\n` +
                `🔄 **Acciones automáticas:**\n` +
                `• Creación de la orden en el sistema\n` +
                `• Generación automática del PDF\n` +
                `• Notificación de confirmación`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, confirmationMessage]);
      
      // Guardar orden pendiente para confirmación
      setPendingOrder({
        structure: finalStructure,
        entities: nlpResult.entities,
        resolved: resolved
      });
      
      setIsProcessingOrder(false);
      return confirmationMessage.text;
      
    } catch (error) {
      console.error('Error procesando orden compleja:', error);
      setIsProcessingOrder(false);
      
      const errorMessage = {
        id: Date.now() + 5,
        text: `❌ Error al procesar tu instrucción: ${error.message}\n\nPor favor, intenta con una instrucción más específica o contacta al soporte técnico.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      return errorMessage.text;
    }
  };

  // 🚀 EJECUCIÓN DE LA ORDEN CONFIRMADA
  const executeOrderCreation = async () => {
    if (!pendingOrder) return;
    
    try {
      setIsProcessingOrder(true);
      
      const executingMessage = {
        id: Date.now(),
        text: '🚀 **Ejecutando Creación de Orden**\n\nCreando orden en el sistema y generando PDF...',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, executingMessage]);
      
      // Paso 1: Crear la orden en la base de datos
      const orderData = pendingOrder.structure.orden;
      const createdOrder = await orderService.createOrden(orderData);
      
      // Paso 2: Generar PDF automáticamente
      const pdfMessage = {
        id: Date.now() + 1,
        text: '📄 **Generando PDF de la Orden**\n\nPreparando documento para descarga...',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, pdfMessage]);
      
      await generateOrderPDF(
        createdOrder,
        pendingOrder.structure.alternatives,
        pendingOrder.resolved.cliente,
        { nombrecampania: pendingOrder.resolved.campana.nombre },
        null
      );
      
      // Paso 3: Mensaje de éxito final
      const successMessage = {
        id: Date.now() + 2,
        text: `🎉 **¡ORDEN CREADA EXITOSAMENTE!**\n\n✅ **Detalles de la Orden:**\n` +
                `📋 **ID:** ${createdOrder.id_ordenes_de_comprar}\n` +
                `👤 **Cliente:** ${pendingOrder.resolved.cliente.nombre}\n` +
                `🎯 **Campaña:** ${pendingOrder.resolved.campana.nombre}\n` +
                `💰 **Monto:** $${(pendingOrder.entities.monto || 0).toLocaleString('es-CL')}\n` +
                `📅 **Estado:** ${createdOrder.estado}\n\n` +
                `📄 **PDF Generado:** El documento ha sido descargado automáticamente\n\n` +
                `🎯 **Próximos Pasos:**\n` +
                `• La orden está en estado "solicitada"\n` +
                `• Será revisada por el equipo correspondiente\n` +
                `• Recibirás notificaciones sobre su progreso\n\n` +
                `✨ **¿Necesitas algo más?** Puedo ayudarte a crear otra orden o responder cualquier pregunta.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, successMessage]);
      
      // Limpiar estado
      setPendingOrder(null);
      setIsProcessingOrder(false);
      
      // Mostrar notificación del sistema
      setNotification({
        open: true,
        message: `Orden #${createdOrder.id_ordenes_de_comprar} creada y PDF generado exitosamente`,
        severity: 'success'
      });
      
    } catch (error) {
      console.error('Error ejecutando orden:', error);
      setIsProcessingOrder(false);
      
      const errorMessage = {
        id: Date.now() + 3,
        text: `❌ **Error al crear la orden:** ${error.message}\n\nPor favor, intenta nuevamente o contacta al soporte técnico.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      
      setNotification({
        open: true,
        message: `Error al crear orden: ${error.message}`,
        severity: 'error'
      });
    }
  };

  // 🚫 CANCELAR ORDEN PENDIENTE
  const cancelPendingOrder = () => {
    if (!pendingOrder) return;
    
    const cancelMessage = {
      id: Date.now(),
      text: '❌ **Creación de Orden Cancelada**\n\nLa orden no ha sido creada. Si necesitas ayuda para crear una orden, puedes intentar con una instrucción más específica.\n\n💡 **Ejemplo:** "Crea una orden para Empresa XYZ con producto Marketing Digital por Televisión por $1.000.000"',
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, cancelMessage]);
    
    setPendingOrder(null);
    setIsProcessingOrder(false);
  };

  const handleQuickNavigation = (actionName, path, icon) => {
    // Navegar inmediatamente
    navigate(path);
    
    // Agregar mensaje de confirmación
    const navigationMessage = {
      id: Date.now(),
      text: `✅ ${icon} ${actionName}\n\nTe estoy redirigiendo a la página correspondiente... ¡Ya puedes comenzar!`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, navigationMessage]);
    
    return `✅ ${icon} ${actionName}\n\nTe estoy redirigiendo a la página correspondiente... ¡Ya puedes comenzar!`;
  };

  const handleQuickAction = (action) => {
    if (action.type === 'navegar') {
      handleQuickNavigation(action.label, action.path, action.icon);
    } else if (action.type === 'crear') {
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

  // 🧭 FUNCIONES DE NAVEGACIÓN INTELIGENTE
  const processNavigation = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cliente') || lowerMessage.includes('clientes')) {
      return handleQuickNavigation('Gestión de Clientes', '/clientes', '👥');
    }
    if (lowerMessage.includes('proveedor') || lowerMessage.includes('proveedores')) {
      return handleQuickNavigation('Gestión de Proveedores', '/proveedores', '🏢');
    }
    if (lowerMessage.includes('medio') || lowerMessage.includes('medios')) {
      return handleQuickNavigation('Gestión de Medios', '/medios', '📺');
    }
    if (lowerMessage.includes('soporte') || lowerMessage.includes('soportes')) {
      return handleQuickNavigation('Gestión de Soportes', '/soportes', '📰');
    }
    if (lowerMessage.includes('campaña') || lowerMessage.includes('campañas')) {
      return handleQuickNavigation('Gestión de Campañas', '/campanas', '🎯');
    }
    if (lowerMessage.includes('contrato') || lowerMessage.includes('contratos')) {
      return handleQuickNavigation('Gestión de Contratos', '/contratos', '📄');
    }
    if (lowerMessage.includes('orden') || lowerMessage.includes('ordenes')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nueva')) {
        return handleQuickNavigation('Crear Nueva Orden', '/ordenes/crear', '🛒');
      }
      return handleQuickNavigation('Gestión de Órdenes', '/ordenes', '📋');
    }
    if (lowerMessage.includes('agencia') || lowerMessage.includes('agencias')) {
      return handleQuickNavigation('Gestión de Agencias', '/agencias', '🏢');
    }
    if (lowerMessage.includes('reporte') || lowerMessage.includes('reportes') || lowerMessage.includes('informe')) {
      return handleQuickNavigation('Reportes', '/reportes', '📊');
    }
    if (lowerMessage.includes('dashboard') || lowerMessage.includes('inicio') || lowerMessage.includes('principal')) {
      return handleQuickNavigation('Dashboard Principal', '/dashboard', '🏠');
    }
    
    return 'No pude identificar a qué sección quieres navegar. Puedo llevarte a: clientes, proveedores, medios, soportes, campañas, contratos, órdenes, agencias, reportes o dashboard.';
  };

  // 👥 FUNCIONES DE GESTIÓN DE CLIENTES
  const processClientCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('cliente')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear clientes.`;
    }
    
    // Extraer información del mensaje usando NLP
    const entities = await nlpService.extractClientEntities(message);
    
    const creatingMessage = {
      id: Date.now(),
      text: `👥 **Creando Nuevo Cliente**\n\nProcesando la información:\n• Nombre: ${entities.nombre || 'Por especificar'}\n• RUT: ${entities.rut || 'Por especificar'}\n• Razón Social: ${entities.razonSocial || 'Por especificar'}\n• Dirección: ${entities.direccion || 'Por especificar'}\n\n¿Confirmas la creación de este cliente?`,
      sender: 'bot',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, creatingMessage]);
    
    // Aquí iría la lógica real de creación
    return 'Procesando creación de cliente...';
  };

  const processClientSearch = async (message) => {
    const entities = await nlpService.extractSearchEntities(message);
    
    return `🔍 **Buscando Clientes**\n\nCriterios de búsqueda:\n• Término: ${entities.termino || 'Todos'}\n• Ubicación: ${entities.ubicacion || 'Todas'}\n• Estado: ${entities.estado || 'Todos'}\n\nRealizando búsqueda en la base de datos...`;
  };

  const processClientUpdate = async (message) => {
    return `✏️ **Actualizando Cliente**\n\nIdentificando cliente a modificar...\n\nPor favor, especifica el nombre o ID del cliente que deseas actualizar y los campos a modificar.`;
  };

  const processClientStatusChange = async (message) => {
    const entities = await nlpService.extractStatusChangeEntities(message);
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    
    return `🔄 **${action} Cliente**\n\nCliente: ${entities.cliente || 'Por identificar'}\nAcción: ${action.toLowerCase()}\n\nProcesando cambio de estado...`;
  };

  const processClientDeletion = async (message) => {
    const entities = await nlpService.extractDeletionEntities(message);
    
    return `🗑️ **Eliminando Cliente**\n\nCliente: ${entities.cliente || 'Por identificar'}\n\n⚠️ **Advertencia:** Esta acción no se puede deshacer.\n\n¿Confirmas la eliminación?`;
  };

  const processClientExport = async (message) => {
    if (!currentPermissions.canExport) {
      return 'Lo siento, no tienes permisos para exportar datos.';
    }
    
    return `📊 **Exportando Clientes**\n\nPreparando exportación a Excel...\n\nIncluiré todos los clientes con sus datos completos.\n\nEl archivo se descargará automáticamente.`;
  };

  // 🏢 FUNCIONES DE GESTIÓN DE PROVEEDORES
  const processProviderCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('proveedor')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear proveedores.`;
    }
    
    const entities = await nlpService.extractProviderEntities(message);
    
    return `🏢 **Creando Nuevo Proveedor**\n\nProcesando la información:\n• Nombre: ${entities.nombre || 'Por especificar'}\n• RUT: ${entities.rut || 'Por especificar'}\n• Tipo: ${entities.tipo || 'Por especificar'}\n• Servicios: ${entities.servicios || 'Por especificar'}\n\n¿Confirmas la creación?`;
  };

  const processProviderSearch = async (message) => {
    const entities = await nlpService.extractSearchEntities(message);
    
    return `🔍 **Buscando Proveedores**\n\nCriterios: ${entities.termino || 'Todos'}\nUbicación: ${entities.ubicacion || 'Todas'}\nServicios: ${entities.servicios || 'Todos'}\n\nRealizando búsqueda...`;
  };

  const processProviderUpdate = async (message) => {
    return `✏️ **Actualizando Proveedor**\n\nEspecifica el proveedor a modificar y los cambios a realizar.`;
  };

  const processProviderStatusChange = async (message) => {
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    return `🔄 **${action} Proveedor**\n\nProcesando cambio de estado...`;
  };

  const processProviderDeletion = async (message) => {
    return `🗑️ **Eliminando Proveedor**\n\n⚠️ Esta acción no se puede deshacer.\n\n¿Confirmas la eliminación?`;
  };

  const processProviderExport = async (message) => {
    return `📊 **Exportando Proveedores**\n\nPreparando archivo Excel con todos los proveedores...`;
  };

  // 📺 FUNCIONES DE GESTIÓN DE MEDIOS
  const processMediumCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('medio')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear medios.`;
    }
    
    return `📺 **Creando Nuevo Medio**\n\nProcesando información del medio...\n\nEspecifica: nombre, tipo, proveedor asociado.`;
  };

  const processMediumSearch = async (message) => {
    return `🔍 **Buscando Medios**\n\nRealizando búsqueda de medios...`;
  };

  const processMediumUpdate = async (message) => {
    return `✏️ **Actualizando Medio**\n\nEspecifica el medio a modificar...`;
  };

  const processMediumStatusChange = async (message) => {
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    return `🔄 **${action} Medio**\n\nProcesando cambio de estado...`;
  };

  const processMediumDeletion = async (message) => {
    return `🗑️ **Eliminando Medio**\n\n⚠️ Verificando dependencias antes de eliminar...`;
  };

  // 📰 FUNCIONES DE GESTIÓN DE SOPORTES
  const processSupportCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('soporte')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear soportes.`;
    }
    
    return `📰 **Creando Nuevo Soporte**\n\nProcesando información del soporte...`;
  };

  const processSupportSearch = async (message) => {
    return `🔍 **Buscando Soportes**\n\nRealizando búsqueda de soportes...`;
  };

  const processSupportUpdate = async (message) => {
    return `✏️ **Actualizando Soporte**\n\nEspecifica el soporte a modificar...`;
  };

  const processSupportStatusChange = async (message) => {
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    return `🔄 **${action} Soporte**\n\nProcesando cambio de estado...`;
  };

  const processSupportDeletion = async (message) => {
    return `🗑️ **Eliminando Soporte**\n\n⚠️ Verificando dependencias...`;
  };

  // 🎯 FUNCIONES DE GESTIÓN DE CAMPAÑAS
  const processCampaignCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('campana')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear campañas.`;
    }
    
    const entities = await nlpService.extractCampaignEntities(message);
    
    return `🎯 **Creando Nueva Campaña**\n\n• Cliente: ${entities.cliente || 'Por especificar'}\n• Nombre: ${entities.nombre || 'Por especificar'}\n• Período: ${entities.fechaInicio || 'Inicio'} - ${entities.fechaTermino || 'Término'}\n• Presupuesto: ${entities.presupuesto || 'Por especificar'}\n\n¿Confirmas la creación?`;
  };

  const processCampaignSearch = async (message) => {
    return `🔍 **Buscando Campañas**\n\nRealizando búsqueda por criterios especificados...`;
  };

  const processCampaignUpdate = async (message) => {
    return `✏️ **Actualizando Campaña**\n\nEspecifica la campaña a modificar...`;
  };

  const processCampaignStatusChange = async (message) => {
    return `🔄 **Cambiando Estado de Campaña**\n\nProcesando cambio de estado (borrador → revisión → aprobada → activa)...`;
  };

  const processCampaignDeletion = async (message) => {
    return `🗑️ **Eliminando Campaña**\n\n⚠️ Verificando que la campaña no tenga órdenes asociadas...`;
  };

  const processCampaignExport = async (message) => {
    return `📊 **Exportando Campañas**\n\nPreparando archivo Excel con datos de campañas...`;
  };

  // 📄 FUNCIONES DE GESTIÓN DE CONTRATOS
  const processContractCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('contrato')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear contratos.`;
    }
    
    return `📄 **Creando Nuevo Contrato**\n\nProcesando información del contrato...`;
  };

  const processContractSearch = async (message) => {
    return `🔍 **Buscando Contratos**\n\nRealizando búsqueda de contratos...`;
  };

  const processContractUpdate = async (message) => {
    return `✏️ **Actualizando Contrato**\n\nEspecifica el contrato a modificar...`;
  };

  const processContractStatusChange = async (message) => {
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    return `🔄 **${action} Contrato**\n\nProcesando cambio de estado...`;
  };

  const processContractDeletion = async (message) => {
    return `🗑️ **Eliminando Contrato**\n\n⚠️ Verificando dependencias...`;
  };

  const processContractExport = async (message) => {
    return `📊 **Exportando Contratos**\n\nPreparando archivo Excel con datos de contratos...`;
  };

  // 🛒 FUNCIONES ADICIONALES DE GESTIÓN DE ÓRDENES
  const processOrderCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('orden')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear órdenes.`;
    }
    
    return `🛒 **Creando Nueva Orden**\n\nPara crear una orden completa, necesito más información:\n• Cliente\n• Campaña\n• Medio/Soporte\n• Monto o presupuesto\n\nEjemplo: "Crea una orden para Empresa XYZ con producto Marketing Digital por Televisión por $1.000.000"`;
  };

  const processOrderSearch = async (message) => {
    return `🔍 **Buscando Órdenes**\n\nRealizando búsqueda por criterios especificados...`;
  };

  const processOrderUpdate = async (message) => {
    return `✏️ **Actualizando Orden**\n\nEspecifica la orden a modificar...`;
  };

  const processOrderStatusChange = async (message) => {
    return `🔄 **Cambiando Estado de Orden**\n\nProcesando cambio de estado (solicitada → aprobada → producción → completada)...`;
  };

  const processOrderDeletion = async (message) => {
    return `🗑️ **Eliminando Orden**\n\n⚠️ Esta acción no se puede deshacer...`;
  };

  const processOrderExport = async (message) => {
    return `📊 **Exportando Órdenes**\n\nPreparando archivo Excel con datos de órdenes...`;
  };

  // 🏢 FUNCIONES DE GESTIÓN DE AGENCIAS
  const processAgencyCreation = async (message) => {
    if (!currentPermissions.canCreate.includes('agencia')) {
      return `Lo siento, según tu rol de ${userRole}, no tienes permisos para crear agencias.`;
    }
    
    return `🏢 **Creando Nueva Agencia**\n\nProcesando información de la agencia...`;
  };

  const processAgencySearch = async (message) => {
    return `🔍 **Buscando Agencias**\n\nRealizando búsqueda de agencias...`;
  };

  const processAgencyUpdate = async (message) => {
    return `✏️ **Actualizando Agencia**\n\nEspecifica la agencia a modificar...`;
  };

  const processAgencyStatusChange = async (message) => {
    const action = message.toLowerCase().includes('activar') ? 'Activar' : 'Desactivar';
    return `🔄 **${action} Agencia**\n\nProcesando cambio de estado...`;
  };

  const processAgencyDeletion = async (message) => {
    return `🗑️ **Eliminando Agencia**\n\n⚠️ Verificando dependencias...`;
  };

  const processAgencyExport = async (message) => {
    return `📊 **Exportando Agencias**\n\nPreparando archivo Excel con datos de agencias...`;
  };

  // 📊 FUNCIONES DE REPORTES Y EXPORTACIÓN
  const processReportGeneration = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('cliente') || lowerMessage.includes('clientes')) {
      return `📊 **Generando Reporte de Clientes**\n\nPreparando reporte con:\n• Total de clientes\n• Clientes activos/inactivos\n• Distribución por región\n• Exportando a Excel...`;
    }
    
    if (lowerMessage.includes('orden') || lowerMessage.includes('ordenes')) {
      return `📊 **Generando Reporte de Órdenes**\n\nPreparando reporte con:\n• Órdenes por estado\n• Órdenes por mes\n• Montos totales\n• Exportando a Excel...`;
    }
    
    if (lowerMessage.includes('campaña') || lowerMessage.includes('campañas')) {
      return `📊 **Generando Reporte de Campañas**\n\nPreparando reporte con:\n• Campañas por estado\n• Presupuestos vs reales\n• Rendimiento por cliente\n• Exportando a Excel...`;
    }
    
    if (lowerMessage.includes('medio') || lowerMessage.includes('medios')) {
      return `📊 **Generando Reporte de Medios**\n\nPreparando reporte con:\n• Rendimiento por medio\n• Inversión por tipo\n• Eficiencia de costos\n• Exportando a Excel...`;
    }
    
    return `📊 **Generando Reporte**\n\nEspecifica el tipo de reporte que necesitas:\n• De clientes\n• De órdenes\n• De campañas\n• De medios\n• De proveedores\n• Personalizado`;
  };

  // 🔧 FUNCIONES ADMINISTRATIVAS ADICIONALES
  const processAdministrativeTasks = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    // Backup y restauración
    if (lowerMessage.includes('backup') || lowerMessage.includes('respaldar')) {
      return `💾 **Generando Backup del Sistema**\n\nCreando copia de seguridad de:\n• Base de datos completa\n• Configuraciones del sistema\n• Archivos adjuntos\n\nEl backup estará disponible para descarga en unos minutos.`;
    }
    
    // Mantenimiento del sistema
    if (lowerMessage.includes('mantenimiento') || lowerMessage.includes('limpiar')) {
      return `🔧 **Ejecutando Mantenimiento**\n\nRealizando tareas de mantenimiento:\n• Limpieza de caché\n• Optimización de base de datos\n• Verificación de integridad\n• Limpieza de archivos temporales\n\nMantenimiento completado.`;
    }
    
    // Estadísticas del sistema
    if (lowerMessage.includes('estadísticas') || lowerMessage.includes('métricas') || lowerMessage.includes('rendimiento')) {
      return `📈 **Generando Estadísticas del Sistema**\n\nRecopilando métricas:\n• Uso del sistema por usuarios\n• Tiempos de respuesta\n• Operaciones por hora\n• Espacio utilizado\n• Estado de servicios\n\nGenerando reporte de rendimiento...`;
    }
    
    // Gestión de usuarios
    if (lowerMessage.includes('usuario') || lowerMessage.includes('usuarios')) {
      if (lowerMessage.includes('crear') || lowerMessage.includes('nuevo')) {
        return `👤 **Creando Nuevo Usuario**\n\nProcesando solicitud de creación de usuario:\n• Verificando permisos disponibles\n• Preparando credenciales\n• Configurando acceso inicial\n\nUsuario creado exitosamente.`;
      }
      
      if (lowerMessage.includes('bloquear') || lowerMessage.includes('desactivar')) {
        return `🔒 **Gestionando Acceso de Usuario**\n\nProcesando cambio de estado de acceso...\n\nAcceso actualizado correctamente.`;
      }
    }
    
    // Configuración del sistema
    if (lowerMessage.includes('configurar') || lowerMessage.includes('configuración')) {
      return `⚙️ **Configuración del Sistema**\n\nAccediendo al panel de configuración:\n• Parámetros generales\n• Configuración de correo\n• Integraciones\n• Preferencias del sistema\n\nConfiguración actualizada.`;
    }
    
    return 'Función administrativa no reconocida. Las opciones disponibles incluyen: backup, mantenimiento, estadísticas, gestión de usuarios y configuración.';
  };

  // 🎯 FUNCIONES AVANZADAS DE BÚSQUEDA Y FILTRADO
  const processAdvancedSearch = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('búsqueda avanzada') || lowerMessage.includes('buscar complejo')) {
      return `🔍 **Búsqueda Avanzada**\n\nModo de búsqueda avanzada activado. Puedes combinar múltiples criterios:\n\n• Filtros por fecha\n• Filtros por estado\n• Filtros por monto\n• Búsqueda por texto completo\n• Combinaciones lógicas (AND/OR)\n\nEspecifica tus criterios de búsqueda.`;
    }
    
    return 'Utiliza "búsqueda avanzada" para activar el modo de búsqueda compleja.';
  };

  // 📱 FUNCIONES DE INTEGRACIÓN Y NOTIFICACIONES
  const processIntegrations = async (message) => {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('notificar') || lowerMessage.includes('enviar correo')) {
      return `📧 **Enviando Notificaciones**\n\nProcesando envío de notificaciones:\n• Preparando contenido\n• Seleccionando destinatarios\n• Enviando comunicaciones\n\nNotificaciones enviadas exitosamente.`;
    }
    
    if (lowerMessage.includes('sincronizar') || lowerMessage.includes('sync')) {
      return `🔄 **Sincronizando Datos**\n\nProcesando sincronización:\n• Actualizando datos externos\n• Sincronizando con servicios conectados\n• Verificando integridad\n\nSincronización completada.`;
    }
    
    return 'Función de integración no reconocida. Opciones: notificar, sincronizar.';
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
      
      {/* No hay acciones rápidas - todo se procesa mediante lenguaje natural */}
      
      {/* Botones de acción para orden pendiente */}
      {pendingOrder && !isProcessingOrder && (
        <Box sx={{ px: 2, py: 1, background: 'rgba(76, 175, 80, 0.1)', borderTop: '1px solid rgba(76, 175, 80, 0.3)' }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block', fontWeight: 600 }}>
            ⏳ Orden Pendiente de Confirmación:
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Button
              size="small"
              variant="contained"
              onClick={executeOrderCreation}
              sx={{
                background: 'linear-gradient(135deg, #4CAF50, #45a049)',
                color: 'white',
                fontSize: '0.75rem',
                py: 0.5,
                px: 2,
                '&:hover': {
                  background: 'linear-gradient(135deg, #45a049, #3d8b40)',
                }
              }}
            >
              ✅ Confirmar Orden
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={cancelPendingOrder}
              sx={{
                borderColor: '#f44336',
                color: '#f44336',
                fontSize: '0.75rem',
                py: 0.5,
                px: 2,
                '&:hover': {
                  background: 'rgba(244, 67, 54, 0.1)',
                  borderColor: '#d32f2f'
                }
              }}
            >
              ❌ Cancelar
            </Button>
            <Typography variant="caption" sx={{ color: 'text.secondary', ml: 1 }}>
              O escribe "confirmar" o "cancelar"
            </Typography>
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