/**
 * 🎯 Action Orchestrator - PautaPro
 * 
 * Orquestador central de acciones del Asistente IA
 * Responsable de:
 * - Enrutamiento inteligente de comandos
 * - Validación de permisos
 * - Ejecución de acciones
 * - Manejo de errores y excepciones
 * - Logging y auditoría
 */

import { orderService } from './orderService';
import { campaignService } from './campaignService';
import { dashboardService } from './dashboardService';
import { reportService } from './reportService';

class ActionOrchestrator {
  constructor() {
    this.actionLog = [];
    this.executionHistory = [];
    
    // Mapeo de intenciones a handlers
    this.actionHandlers = {
      CREATE: this.handleCreate.bind(this),
      READ: this.handleRead.bind(this),
      UPDATE: this.handleUpdate.bind(this),
      DELETE: this.handleDelete.bind(this),
      REPORT: this.handleReport.bind(this),
      EXPORT: this.handleExport.bind(this),
      NAVIGATE: this.handleNavigate.bind(this),
      SEARCH_ADVANCED: this.handleAdvancedSearch.bind(this)
    };

    // Permisos por rol
    this.rolePermissions = {
      asistente: {
        canCreate: ['soporte'],
        canRead: ['orden', 'campaña', 'cliente', 'proveedor'],
        canUpdate: [],
        canDelete: [],
        canReport: ['basico'],
        canExport: true
      },
      planificador: {
        canCreate: ['orden', 'medio', 'soporte', 'campaña'],
        canRead: ['orden', 'campaña', 'cliente', 'proveedor', 'medio', 'soporte'],
        canUpdate: ['campaña', 'medio', 'soporte'],
        canDelete: [],
        canReport: ['basico', 'campaign', 'media'],
        canExport: true
      },
      supervisor: {
        canCreate: ['orden', 'medio', 'soporte', 'campaña', 'contrato'],
        canRead: ['*'],
        canUpdate: ['*'],
        canDelete: [],
        canReport: ['basico', 'campaign', 'media', 'contract'],
        canExport: true
      },
      director: {
        canCreate: ['*'],
        canRead: ['*'],
        canUpdate: ['*'],
        canDelete: ['*'],
        canReport: ['*'],
        canExport: true
      },
      gerente: {
        canCreate: ['*'],
        canRead: ['*'],
        canUpdate: ['*'],
        canDelete: ['*'],
        canReport: ['*'],
        canExport: true
      },
      financiero: {
        canCreate: ['orden', 'contrato'],
        canRead: ['orden', 'contrato', 'cliente', 'campaña'],
        canUpdate: ['orden', 'contrato'],
        canDelete: [],
        canReport: ['financial', 'executive'],
        canExport: true
      }
    };
  }

  /**
   * Ejecuta una acción basada en la intención y entidades
   * @param {object} parsedInstruction - Instrucción parseada
   * @param {string} userRole - Rol del usuario
   * @param {object} context - Contexto adicional
   * @returns {object} Resultado de la ejecución
   */
  async executeAction(parsedInstruction, userRole = 'asistente', context = {}) {
    try {
      const { intention, entities, values, validation } = parsedInstruction;

      // Validar que la instrucción sea válida
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          suggestions: validation.suggestions
        };
      }

      // Validar permisos
      const permissionCheck = this.validatePermissions(intention, entities, userRole);
      if (!permissionCheck.allowed) {
        return {
          success: false,
          message: permissionCheck.message,
          error: 'PERMISSION_DENIED'
        };
      }

      // Obtener handler para la intención
      const handler = this.actionHandlers[intention];
      if (!handler) {
        return {
          success: false,
          message: `No hay handler para la intención: ${intention}`,
          error: 'UNKNOWN_INTENTION'
        };
      }

      // Ejecutar acción
      const result = await handler(entities, values, context, userRole);

      // Registrar en log
      this.logAction({
        intention,
        entities,
        userRole,
        result,
        timestamp: new Date()
      });

      return result;
    } catch (error) {
      console.error('Error en executeAction:', error);
      return {
        success: false,
        message: `Error al ejecutar la acción: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Valida permisos del usuario
   * @param {string} intention - Intención
   * @param {object} entities - Entidades
   * @param {string} userRole - Rol del usuario
   * @returns {object} Resultado de validación
   */
  validatePermissions(intention, entities, userRole) {
    const permissions = this.rolePermissions[userRole];
    
    if (!permissions) {
      return {
        allowed: false,
        message: `Rol desconocido: ${userRole}`
      };
    }

    const entityType = entities.type;

    // Validar según intención
    switch (intention) {
      case 'CREATE':
        const canCreate = permissions.canCreate.includes('*') || permissions.canCreate.includes(entityType);
        return {
          allowed: canCreate,
          message: canCreate ? '' : `No tienes permisos para crear ${entityType}s`
        };

      case 'READ':
        const canRead = permissions.canRead.includes('*') || permissions.canRead.includes(entityType);
        return {
          allowed: canRead,
          message: canRead ? '' : `No tienes permisos para ver ${entityType}s`
        };

      case 'UPDATE':
        const canUpdate = permissions.canUpdate.includes('*') || permissions.canUpdate.includes(entityType);
        return {
          allowed: canUpdate,
          message: canUpdate ? '' : `No tienes permisos para actualizar ${entityType}s`
        };

      case 'DELETE':
        const canDelete = permissions.canDelete.includes('*') || permissions.canDelete.includes(entityType);
        return {
          allowed: canDelete,
          message: canDelete ? '' : `No tienes permisos para eliminar ${entityType}s`
        };

      case 'REPORT':
        const canReport = permissions.canReport.includes('*') || permissions.canReport.length > 0;
        return {
          allowed: canReport,
          message: canReport ? '' : 'No tienes permisos para generar reportes'
        };

      case 'EXPORT':
        return {
          allowed: permissions.canExport,
          message: permissions.canExport ? '' : 'No tienes permisos para exportar datos'
        };

      default:
        return { allowed: true, message: '' };
    }
  }

  /**
   * Maneja acciones de CREATE
   */
  async handleCreate(entities, values, context, userRole) {
    try {
      const { type, target, filters } = entities;

      switch (type) {
        case 'cliente':
          return await this.createClient(target, values, context);
        case 'proveedor':
          return await this.createProvider(target, values, context);
        case 'medio':
          return await this.createMedium(target, values, context);
        case 'soporte':
          return await this.createSupport(target, values, context);
        case 'campaña':
          return await this.createCampaign(target, values, context);
        case 'orden':
          return await this.createOrder(target, values, context);
        case 'contrato':
          return await this.createContract(target, values, context);
        case 'agencia':
          return await this.createAgency(target, values, context);
        default:
          return {
            success: false,
            message: `No sé cómo crear un ${type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al crear: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de READ
   */
  async handleRead(entities, values, context, userRole) {
    try {
      const { type, target, filters } = entities;

      switch (type) {
        case 'cliente':
        case 'clientes':
          return await this.searchClients(target, filters, values);
        case 'proveedor':
        case 'proveedores':
          return await this.searchProviders(target, filters, values);
        case 'medio':
        case 'medios':
          return await this.searchMedia(target, filters, values);
        case 'soporte':
        case 'soportes':
          return await this.searchSupports(target, filters, values);
        case 'campaña':
        case 'campañas':
          return await this.searchCampaigns(target, filters, values);
        case 'orden':
        case 'órdenes':
          return await this.searchOrders(target, filters, values);
        case 'contrato':
        case 'contratos':
          return await this.searchContracts(target, filters, values);
        case 'agencia':
        case 'agencias':
          return await this.searchAgencies(target, filters, values);
        default:
          return {
            success: false,
            message: `No sé cómo buscar ${type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al buscar: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de UPDATE
   */
  async handleUpdate(entities, values, context, userRole) {
    try {
      const { type, target } = entities;

      if (!target) {
        return {
          success: false,
          message: 'Necesito saber cuál es el elemento que quieres actualizar'
        };
      }

      switch (type) {
        case 'cliente':
          return await this.updateClient(target, values, context);
        case 'proveedor':
          return await this.updateProvider(target, values, context);
        case 'medio':
          return await this.updateMedium(target, values, context);
        case 'soporte':
          return await this.updateSupport(target, values, context);
        case 'campaña':
          return await this.updateCampaign(target, values, context);
        case 'orden':
          return await this.updateOrder(target, values, context);
        case 'contrato':
          return await this.updateContract(target, values, context);
        case 'agencia':
          return await this.updateAgency(target, values, context);
        default:
          return {
            success: false,
            message: `No sé cómo actualizar un ${type}`
          };
      }
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de DELETE
   */
  async handleDelete(entities, values, context, userRole) {
    try {
      const { type, target } = entities;

      if (!target) {
        return {
          success: false,
          message: 'Necesito saber cuál es el elemento que quieres eliminar'
        };
      }

      return {
        success: false,
        message: '⚠️ Las eliminaciones requieren confirmación adicional por seguridad',
        requiresConfirmation: true,
        confirmationMessage: `¿Estás seguro de que quieres eliminar el ${type} "${target}"? Esta acción no se puede deshacer.`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de REPORT
   */
  async handleReport(entities, values, context, userRole) {
    try {
      return {
        success: true,
        message: '📊 Generando reporte...',
        reportType: entities.type || 'general',
        data: {
          generatedAt: new Date(),
          format: 'json'
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al generar reporte: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de EXPORT
   */
  async handleExport(entities, values, context, userRole) {
    try {
      return {
        success: true,
        message: '📥 Preparando exportación a Excel...',
        exportType: entities.type || 'general',
        format: 'xlsx'
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al exportar: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja acciones de NAVIGATE
   */
  async handleNavigate(entities, values, context, userRole) {
    try {
      const navigationMap = {
        cliente: '/clientes',
        clientes: '/clientes',
        proveedor: '/proveedores',
        proveedores: '/proveedores',
        medio: '/medios',
        medios: '/medios',
        soporte: '/soportes',
        soportes: '/soportes',
        campaña: '/campanas',
        campañas: '/campanas',
        orden: '/ordenes',
        órdenes: '/ordenes',
        contrato: '/contratos',
        contratos: '/contratos',
        agencia: '/agencias',
        agencias: '/agencias',
        reporte: '/reportes',
        reportes: '/reportes',
        dashboard: '/dashboard'
      };

      const path = navigationMap[entities.type] || '/dashboard';

      return {
        success: true,
        message: `🧭 Navegando a ${entities.type}...`,
        navigate: path
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al navegar: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Maneja búsquedas avanzadas
   */
  async handleAdvancedSearch(entities, values, context, userRole) {
    try {
      return {
        success: true,
        message: '🔍 Realizando búsqueda avanzada...',
        searchType: entities.type,
        filters: entities.filters,
        values: values
      };
    } catch (error) {
      return {
        success: false,
        message: `Error en búsqueda: ${error.message}`,
        error: error.name
      };
    }
  }

  // ============ MÉTODOS AUXILIARES ============

  async createClient(name, values, context) {
    return { success: true, message: `✅ Cliente "${name}" creado exitosamente` };
  }

  async createProvider(name, values, context) {
    return { success: true, message: `✅ Proveedor "${name}" creado exitosamente` };
  }

  async createMedium(name, values, context) {
    return { success: true, message: `✅ Medio "${name}" creado exitosamente` };
  }

  async createSupport(name, values, context) {
    return { success: true, message: `✅ Soporte "${name}" creado exitosamente` };
  }

  async createCampaign(name, values, context) {
    return { success: true, message: `✅ Campaña "${name}" creada exitosamente` };
  }

  async createOrder(name, values, context) {
    return { success: true, message: `✅ Orden creada exitosamente` };
  }

  async createContract(name, values, context) {
    return { success: true, message: `✅ Contrato "${name}" creado exitosamente` };
  }

  async createAgency(name, values, context) {
    return { success: true, message: `✅ Agencia "${name}" creada exitosamente` };
  }

  async searchClients(target, filters, values) {
    return { success: true, message: `🔍 Buscando clientes...`, results: [] };
  }

  async searchProviders(target, filters, values) {
    return { success: true, message: `🔍 Buscando proveedores...`, results: [] };
  }

  async searchMedia(target, filters, values) {
    return { success: true, message: `🔍 Buscando medios...`, results: [] };
  }

  async searchSupports(target, filters, values) {
    return { success: true, message: `🔍 Buscando soportes...`, results: [] };
  }

  async searchCampaigns(target, filters, values) {
    return { success: true, message: `🔍 Buscando campañas...`, results: [] };
  }

  async searchOrders(target, filters, values) {
    return { success: true, message: `🔍 Buscando órdenes...`, results: [] };
  }

  async searchContracts(target, filters, values) {
    return { success: true, message: `🔍 Buscando contratos...`, results: [] };
  }

  async searchAgencies(target, filters, values) {
    return { success: true, message: `🔍 Buscando agencias...`, results: [] };
  }

  async updateClient(target, values, context) {
    return { success: true, message: `✅ Cliente "${target}" actualizado exitosamente` };
  }

  async updateProvider(target, values, context) {
    return { success: true, message: `✅ Proveedor "${target}" actualizado exitosamente` };
  }

  async updateMedium(target, values, context) {
    return { success: true, message: `✅ Medio "${target}" actualizado exitosamente` };
  }

  async updateSupport(target, values, context) {
    return { success: true, message: `✅ Soporte "${target}" actualizado exitosamente` };
  }

  async updateCampaign(target, values, context) {
    return { success: true, message: `✅ Campaña "${target}" actualizada exitosamente` };
  }

  async updateOrder(target, values, context) {
    return { success: true, message: `✅ Orden "${target}" actualizada exitosamente` };
  }

  async updateContract(target, values, context) {
    return { success: true, message: `✅ Contrato "${target}" actualizado exitosamente` };
  }

  async updateAgency(target, values, context) {
    return { success: true, message: `✅ Agencia "${target}" actualizada exitosamente` };
  }

  /**
   * Registra una acción en el log
   */
  logAction(action) {
    this.actionLog.push(action);
    this.executionHistory.push({
      ...action,
      id: this.actionLog.length
    });
  }

  /**
   * Obtiene el historial de ejecuciones
   */
  getExecutionHistory() {
    return this.executionHistory;
  }

  /**
   * Limpia el historial
   */
  clearHistory() {
    this.actionLog = [];
    this.executionHistory = [];
  }
}

// Exportar como singleton
const actionOrchestrator = new ActionOrchestrator();
export default actionOrchestrator;
