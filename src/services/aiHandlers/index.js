/**
 * AI Handlers Index
 * Centraliza todos los handlers de acciones para el Asistente IA
 * Proporciona una interfaz unificada para acceder a todas las operaciones
 */

import { clientActionHandler } from './clientActionHandler';
import { providerActionHandler } from './providerActionHandler';
import { mediaActionHandler } from './mediaActionHandler';
import { campaignActionHandler } from './campaignActionHandler';
import { orderActionHandler } from './orderActionHandler';

/**
 * Registro centralizado de handlers
 */
export const aiHandlers = {
  client: clientActionHandler,
  provider: providerActionHandler,
  media: mediaActionHandler,
  campaign: campaignActionHandler,
  order: orderActionHandler
};

/**
 * Mapeo de intenciones a handlers y métodos
 */
export const intentionHandlerMap = {
  // CLIENTE - CREATE
  'CREATE_CLIENT': {
    handler: 'client',
    method: 'createClient',
    description: 'Crear un nuevo cliente',
    requiredParams: ['nombre'],
    optionalParams: ['email', 'telefono', 'direccion', 'ciudad', 'region', 'tipo_cliente']
  },

  // CLIENTE - READ
  'SEARCH_CLIENTS': {
    handler: 'client',
    method: 'searchClients',
    description: 'Buscar clientes',
    requiredParams: [],
    optionalParams: ['nombre', 'email', 'estado', 'tipo_cliente', 'limit', 'offset']
  },
  'GET_CLIENT': {
    handler: 'client',
    method: 'getClientById',
    description: 'Obtener cliente por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_CLIENT_STATS': {
    handler: 'client',
    method: 'getClientStats',
    description: 'Obtener estadísticas de clientes',
    requiredParams: [],
    optionalParams: []
  },

  // CLIENTE - UPDATE
  'UPDATE_CLIENT': {
    handler: 'client',
    method: 'updateClient',
    description: 'Actualizar cliente',
    requiredParams: ['id'],
    optionalParams: ['nombre', 'email', 'telefono', 'direccion', 'ciudad', 'region', 'notas']
  },
  'CHANGE_CLIENT_STATUS': {
    handler: 'client',
    method: 'changeClientStatus',
    description: 'Cambiar estado del cliente',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },

  // CLIENTE - DELETE
  'DELETE_CLIENT': {
    handler: 'client',
    method: 'deleteClient',
    description: 'Eliminar cliente',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // CLIENTE - EXPORT
  'EXPORT_CLIENTS': {
    handler: 'client',
    method: 'exportClients',
    description: 'Exportar clientes a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  },

  // PROVEEDOR - CREATE
  'CREATE_PROVIDER': {
    handler: 'provider',
    method: 'createProvider',
    description: 'Crear un nuevo proveedor',
    requiredParams: ['nombre', 'rut'],
    optionalParams: ['email', 'telefono', 'direccion', 'ciudad', 'region', 'tipo', 'comision']
  },

  // PROVEEDOR - READ
  'SEARCH_PROVIDERS': {
    handler: 'provider',
    method: 'searchProviders',
    description: 'Buscar proveedores',
    requiredParams: [],
    optionalParams: ['nombre', 'rut', 'tipo', 'estado', 'region', 'limit', 'offset']
  },
  'GET_PROVIDER': {
    handler: 'provider',
    method: 'getProviderById',
    description: 'Obtener proveedor por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_PROVIDER_STATS': {
    handler: 'provider',
    method: 'getProviderStats',
    description: 'Obtener estadísticas de proveedores',
    requiredParams: [],
    optionalParams: []
  },

  // PROVEEDOR - UPDATE
  'UPDATE_PROVIDER': {
    handler: 'provider',
    method: 'updateProvider',
    description: 'Actualizar proveedor',
    requiredParams: ['id'],
    optionalParams: ['nombre', 'email', 'telefono', 'direccion', 'ciudad', 'region', 'tipo', 'comision']
  },
  'CHANGE_PROVIDER_STATUS': {
    handler: 'provider',
    method: 'changeProviderStatus',
    description: 'Cambiar estado del proveedor',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },

  // PROVEEDOR - DELETE
  'DELETE_PROVIDER': {
    handler: 'provider',
    method: 'deleteProvider',
    description: 'Eliminar proveedor',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // PROVEEDOR - EXPORT
  'EXPORT_PROVIDERS': {
    handler: 'provider',
    method: 'exportProviders',
    description: 'Exportar proveedores a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  },

  // MEDIO - CREATE
  'CREATE_MEDIA': {
    handler: 'media',
    method: 'createMedia',
    description: 'Crear un nuevo medio',
    requiredParams: ['nombre'],
    optionalParams: ['tipo', 'descripcion', 'costo', 'alcance', 'frecuencia', 'proveedor_id']
  },

  // TEMA - CREATE
  'CREATE_TEMA': {
    handler: 'media',
    method: 'createTema',
    description: 'Crear un nuevo tema',
    requiredParams: ['nombre'],
    optionalParams: ['tipo', 'descripcion', 'duracion', 'costo', 'archivo_url']
  },

  // MEDIO - READ
  'SEARCH_MEDIAS': {
    handler: 'media',
    method: 'searchMedias',
    description: 'Buscar medios',
    requiredParams: [],
    optionalParams: ['nombre', 'tipo', 'estado', 'proveedor_id', 'minCosto', 'maxCosto', 'limit', 'offset']
  },
  'GET_MEDIA': {
    handler: 'media',
    method: 'getMediaById',
    description: 'Obtener medio por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_MEDIA_STATS': {
    handler: 'media',
    method: 'getMediaStats',
    description: 'Obtener estadísticas de medios',
    requiredParams: [],
    optionalParams: []
  },

  // TEMA - READ
  'SEARCH_TEMAS': {
    handler: 'media',
    method: 'searchTemas',
    description: 'Buscar temas',
    requiredParams: [],
    optionalParams: ['nombre', 'tipo', 'estado', 'minDuracion', 'maxDuracion', 'limit', 'offset']
  },
  'GET_TEMA': {
    handler: 'media',
    method: 'getTemaById',
    description: 'Obtener tema por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_TEMA_STATS': {
    handler: 'media',
    method: 'getTemaStats',
    description: 'Obtener estadísticas de temas',
    requiredParams: [],
    optionalParams: []
  },

  // MEDIO - UPDATE
  'UPDATE_MEDIA': {
    handler: 'media',
    method: 'updateMedia',
    description: 'Actualizar medio',
    requiredParams: ['id'],
    optionalParams: ['nombre', 'tipo', 'descripcion', 'costo', 'alcance', 'frecuencia', 'url', 'contacto']
  },
  'CHANGE_MEDIA_STATUS': {
    handler: 'media',
    method: 'changeMediaStatus',
    description: 'Cambiar estado del medio',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },

  // TEMA - UPDATE
  'UPDATE_TEMA': {
    handler: 'media',
    method: 'updateTema',
    description: 'Actualizar tema',
    requiredParams: ['id'],
    optionalParams: ['nombre', 'tipo', 'descripcion', 'duracion', 'costo', 'archivo_url']
  },
  'CHANGE_TEMA_STATUS': {
    handler: 'media',
    method: 'changeTemaStatus',
    description: 'Cambiar estado del tema',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },

  // MEDIO - DELETE
  'DELETE_MEDIA': {
    handler: 'media',
    method: 'deleteMedia',
    description: 'Eliminar medio',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // TEMA - DELETE
  'DELETE_TEMA': {
    handler: 'media',
    method: 'deleteTema',
    description: 'Eliminar tema',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // MEDIO - EXPORT
  'EXPORT_MEDIAS': {
    handler: 'media',
    method: 'exportMedias',
    description: 'Exportar medios a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  },

  // TEMA - EXPORT
  'EXPORT_TEMAS': {
    handler: 'media',
    method: 'exportTemas',
    description: 'Exportar temas a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  },

  // CAMPAÑA - CREATE
  'CREATE_CAMPAIGN': {
    handler: 'campaign',
    method: 'createCampaign',
    description: 'Crear una nueva campaña',
    requiredParams: ['nombre', 'cliente_id', 'fecha_inicio', 'fecha_fin'],
    optionalParams: ['descripcion', 'presupuesto', 'objetivo', 'publico_objetivo']
  },

  // CAMPAÑA - READ
  'SEARCH_CAMPAIGNS': {
    handler: 'campaign',
    method: 'searchCampaigns',
    description: 'Buscar campañas',
    requiredParams: [],
    optionalParams: ['nombre', 'cliente_id', 'estado', 'minPresupuesto', 'maxPresupuesto', 'limit', 'offset']
  },
  'GET_CAMPAIGN': {
    handler: 'campaign',
    method: 'getCampaignById',
    description: 'Obtener campaña por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_CAMPAIGN_STATS': {
    handler: 'campaign',
    method: 'getCampaignStats',
    description: 'Obtener estadísticas de campañas',
    requiredParams: [],
    optionalParams: []
  },
  'GET_CAMPAIGN_SUMMARY': {
    handler: 'campaign',
    method: 'getCampaignSummary',
    description: 'Obtener resumen de campaña',
    requiredParams: ['id'],
    optionalParams: []
  },

  // CAMPAÑA - UPDATE
  'UPDATE_CAMPAIGN': {
    handler: 'campaign',
    method: 'updateCampaign',
    description: 'Actualizar campaña',
    requiredParams: ['id'],
    optionalParams: ['nombre', 'descripcion', 'fecha_inicio', 'fecha_fin', 'presupuesto', 'objetivo']
  },
  'CHANGE_CAMPAIGN_STATUS': {
    handler: 'campaign',
    method: 'changeCampaignStatus',
    description: 'Cambiar estado de la campaña',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },

  // CAMPAÑA - DELETE
  'DELETE_CAMPAIGN': {
    handler: 'campaign',
    method: 'deleteCampaign',
    description: 'Eliminar campaña',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // CAMPAÑA - EXPORT
  'EXPORT_CAMPAIGNS': {
    handler: 'campaign',
    method: 'exportCampaigns',
    description: 'Exportar campañas a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  },

  // ORDEN - CREATE
  'CREATE_ORDER': {
    handler: 'order',
    method: 'createOrder',
    description: 'Crear una nueva orden',
    requiredParams: ['cliente_id', 'proveedor_id', 'fecha_entrega'],
    optionalParams: ['campana_id', 'monto_total', 'descripcion', 'prioridad']
  },

  // ORDEN - READ
  'SEARCH_ORDERS': {
    handler: 'order',
    method: 'searchOrders',
    description: 'Buscar órdenes',
    requiredParams: [],
    optionalParams: ['numero_orden', 'cliente_id', 'proveedor_id', 'estado', 'prioridad', 'minMonto', 'maxMonto', 'limit', 'offset']
  },
  'GET_ORDER': {
    handler: 'order',
    method: 'getOrderById',
    description: 'Obtener orden por ID',
    requiredParams: ['id'],
    optionalParams: []
  },
  'GET_ORDER_STATS': {
    handler: 'order',
    method: 'getOrderStats',
    description: 'Obtener estadísticas de órdenes',
    requiredParams: [],
    optionalParams: []
  },
  'GET_PENDING_ORDERS': {
    handler: 'order',
    method: 'getPendingOrders',
    description: 'Obtener órdenes pendientes',
    requiredParams: [],
    optionalParams: []
  },
  'GET_URGENT_ORDERS': {
    handler: 'order',
    method: 'getUrgentOrders',
    description: 'Obtener órdenes urgentes',
    requiredParams: [],
    optionalParams: []
  },

  // ORDEN - UPDATE
  'UPDATE_ORDER': {
    handler: 'order',
    method: 'updateOrder',
    description: 'Actualizar orden',
    requiredParams: ['id'],
    optionalParams: ['fecha_entrega', 'monto_total', 'descripcion', 'notas', 'prioridad']
  },
  'CHANGE_ORDER_STATUS': {
    handler: 'order',
    method: 'changeOrderStatus',
    description: 'Cambiar estado de la orden',
    requiredParams: ['id', 'estado'],
    optionalParams: []
  },
  'CHANGE_ORDER_PRIORITY': {
    handler: 'order',
    method: 'changeOrderPriority',
    description: 'Cambiar prioridad de la orden',
    requiredParams: ['id', 'prioridad'],
    optionalParams: []
  },

  // ORDEN - DELETE
  'DELETE_ORDER': {
    handler: 'order',
    method: 'deleteOrder',
    description: 'Eliminar orden',
    requiredParams: ['id'],
    optionalParams: ['force']
  },

  // ORDEN - EXPORT
  'EXPORT_ORDERS': {
    handler: 'order',
    method: 'exportOrders',
    description: 'Exportar órdenes a CSV',
    requiredParams: [],
    optionalParams: ['filters']
  }
};

/**
 * Ejecutar una acción basada en intención
 */
export async function executeIntention(intention, params = {}) {
  try {
    const handlerConfig = intentionHandlerMap[intention];

    if (!handlerConfig) {
      return {
        success: false,
        error: `Intención no reconocida: ${intention}`,
        code: 'UNKNOWN_INTENTION'
      };
    }

    const handler = aiHandlers[handlerConfig.handler];
    if (!handler) {
      return {
        success: false,
        error: `Handler no encontrado: ${handlerConfig.handler}`,
        code: 'HANDLER_NOT_FOUND'
      };
    }

    const method = handler[handlerConfig.method];
    if (!method) {
      return {
        success: false,
        error: `Método no encontrado: ${handlerConfig.method}`,
        code: 'METHOD_NOT_FOUND'
      };
    }

    // Validar parámetros requeridos
    const missingParams = handlerConfig.requiredParams.filter(p => !params[p]);
    if (missingParams.length > 0) {
      return {
        success: false,
        error: `Parámetros requeridos faltantes: ${missingParams.join(', ')}`,
        code: 'MISSING_PARAMS',
        missingParams
      };
    }

    // Ejecutar método
    const result = await method.call(handler, params);
    return result;
  } catch (err) {
    console.error('[executeIntention] Error:', err);
    return {
      success: false,
      error: err.message,
      code: 'EXECUTION_ERROR'
    };
  }
}

/**
 * Obtener información sobre una intención
 */
export function getIntentionInfo(intention) {
  const config = intentionHandlerMap[intention];
  if (!config) {
    return null;
  }

  return {
    intention,
    ...config,
    handler: config.handler
  };
}

/**
 * Listar todas las intenciones disponibles
 */
export function listAvailableIntentions() {
  return Object.entries(intentionHandlerMap).map(([intention, config]) => ({
    intention,
    description: config.description,
    handler: config.handler,
    method: config.method,
    requiredParams: config.requiredParams,
    optionalParams: config.optionalParams
  }));
}

/**
 * Filtrar intenciones por handler
 */
export function getIntentionsByHandler(handlerName) {
  return Object.entries(intentionHandlerMap)
    .filter(([_, config]) => config.handler === handlerName)
    .map(([intention, config]) => ({
      intention,
      description: config.description,
      method: config.method,
      requiredParams: config.requiredParams,
      optionalParams: config.optionalParams
    }));
}

/**
 * Obtener estadísticas de handlers
 */
export async function getHandlersStats() {
  try {
    const stats = {};

    for (const [name, handler] of Object.entries(aiHandlers)) {
      const statsMethod = `get${name.charAt(0).toUpperCase() + name.slice(1)}Stats`;
      if (handler[statsMethod]) {
        const result = await handler[statsMethod]();
        stats[name] = result.success ? result.data : null;
      }
    }

    return {
      success: true,
      data: stats,
      message: 'Estadísticas de handlers obtenidas'
    };
  } catch (err) {
    console.error('[getHandlersStats] Error:', err);
    return {
      success: false,
      error: err.message,
      code: 'EXCEPTION'
    };
  }
}

export default {
  aiHandlers,
  intentionHandlerMap,
  executeIntention,
  getIntentionInfo,
  listAvailableIntentions,
  getIntentionsByHandler,
  getHandlersStats
};
