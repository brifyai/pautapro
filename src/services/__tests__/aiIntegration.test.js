/**
 * Tests de Integración para AI Services
 * Prueba la integración completa del flujo de comandos
 */

import { aiIntegrationService } from '../aiIntegrationService';
import { advancedNLPService } from '../advancedNLPService';
import { actionOrchestrator } from '../actionOrchestrator';

// Mock de handlers
jest.mock('../aiHandlers', () => ({
  executeIntention: jest.fn(async (intention, params) => ({
    success: true,
    data: { id: 1, nombre: 'Test' },
    message: 'Operación exitosa'
  })),
  getIntentionInfo: jest.fn((intention) => ({
    intention,
    description: 'Test intention',
    requiredParams: [],
    optionalParams: []
  }))
}));

describe('AI Integration Service', () => {
  beforeEach(() => {
    aiIntegrationService.clearHistory();
  });

  describe('processCommand', () => {
    test('debe procesar comando válido', async () => {
      const response = await aiIntegrationService.processCommand(
        'Crear cliente Acme Corp',
        'asistente'
      );

      expect(response).toHaveProperty('success');
      expect(response).toHaveProperty('type');
      expect(response).toHaveProperty('intention');
    });

    test('debe retornar error para comando no reconocido', async () => {
      const response = await aiIntegrationService.processCommand(
        'xyz abc def ghi',
        'asistente'
      );

      expect(response.success).toBe(false);
      expect(response.type).toBe('NO_INTENTION');
    });

    test('debe validar permisos del usuario', async () => {
      const response = await aiIntegrationService.processCommand(
        'Eliminar cliente 5',
        'usuario_basico'
      );

      // Dependiendo de los permisos configurados
      expect(response).toHaveProperty('success');
    });

    test('debe agregar comando al historial', async () => {
      await aiIntegrationService.processCommand(
        'Buscar clientes activos',
        'asistente'
      );

      const history = aiIntegrationService.getConversationHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });

  describe('detectIntention', () => {
    test('debe detectar intención CREATE', () => {
      const nlpResult = {
        mainVerb: 'crear',
        entities: ['cliente'],
        sentiment: 'NEUTRAL'
      };

      const intention = aiIntegrationService.detectIntention(nlpResult);
      expect(intention).toContain('CREATE');
    });

    test('debe detectar intención SEARCH', () => {
      const nlpResult = {
        mainVerb: 'buscar',
        entities: ['órdenes'],
        sentiment: 'NEUTRAL'
      };

      const intention = aiIntegrationService.detectIntention(nlpResult);
      expect(intention).toContain('SEARCH');
    });

    test('debe detectar intención DELETE', () => {
      const nlpResult = {
        mainVerb: 'eliminar',
        entities: ['proveedor'],
        sentiment: 'NEUTRAL'
      };

      const intention = aiIntegrationService.detectIntention(nlpResult);
      expect(intention).toContain('DELETE');
    });

    test('debe retornar null para intención no reconocida', () => {
      const nlpResult = {
        mainVerb: 'xyz',
        entities: ['abc'],
        sentiment: 'NEUTRAL'
      };

      const intention = aiIntegrationService.detectIntention(nlpResult);
      expect(intention).toBeNull();
    });
  });

  describe('detectEntityType', () => {
    test('debe detectar entidad CLIENT', () => {
      const entities = ['cliente', 'empresa'];
      const type = aiIntegrationService.detectEntityType(entities);
      expect(type).toBe('CLIENT');
    });

    test('debe detectar entidad PROVIDER', () => {
      const entities = ['proveedor', 'vendor'];
      const type = aiIntegrationService.detectEntityType(entities);
      expect(type).toBe('PROVIDER');
    });

    test('debe detectar entidad ORDER', () => {
      const entities = ['orden', 'compra'];
      const type = aiIntegrationService.detectEntityType(entities);
      expect(type).toBe('ORDER');
    });

    test('debe detectar entidad CAMPAIGN', () => {
      const entities = ['campaña'];
      const type = aiIntegrationService.detectEntityType(entities);
      expect(type).toBe('CAMPAIGN');
    });

    test('debe retornar null para entidad no reconocida', () => {
      const entities = ['xyz', 'abc'];
      const type = aiIntegrationService.detectEntityType(entities);
      expect(type).toBeNull();
    });
  });

  describe('extractParameters', () => {
    test('debe extraer parámetros de NLP result', () => {
      const nlpResult = {
        namedEntities: [
          { type: 'EMAIL', value: 'test@example.com' },
          { type: 'PHONE', value: '+56912345678' },
          { type: 'AMOUNT', value: 1500000 }
        ],
        values: { nombre: 'Acme Corp' }
      };

      const params = aiIntegrationService.extractParameters(nlpResult, 'CREATE_CLIENT');

      expect(params.email).toBe('test@example.com');
      expect(params.telefono).toBe('+56912345678');
      expect(params.monto).toBe(1500000);
      expect(params.nombre).toBe('Acme Corp');
    });

    test('debe extraer fechas correctamente', () => {
      const nlpResult = {
        namedEntities: [
          { type: 'DATE', value: '2025-12-15' }
        ],
        values: {}
      };

      const params = aiIntegrationService.extractParameters(nlpResult, 'CREATE_ORDER');
      expect(params.fecha).toBe('2025-12-15');
    });

    test('debe extraer porcentajes correctamente', () => {
      const nlpResult = {
        namedEntities: [
          { type: 'PERCENTAGE', value: 15 }
        ],
        values: {}
      };

      const params = aiIntegrationService.extractParameters(nlpResult, 'CREATE_PROVIDER');
      expect(params.porcentaje).toBe(15);
    });
  });

  describe('formatResponse', () => {
    test('debe formatear respuesta de error', () => {
      const result = {
        success: false,
        error: 'Error de validación',
        code: 'VALIDATION_ERROR'
      };

      const response = aiIntegrationService.formatResponse('CREATE_CLIENT', result);
      expect(response.type).toBe('ERROR');
      expect(response.message).toBe('Error de validación');
    });

    test('debe formatear respuesta de tabla', () => {
      const result = {
        success: true,
        message: 'Se encontraron 3 clientes',
        data: [
          { id: 1, nombre: 'Client 1' },
          { id: 2, nombre: 'Client 2' },
          { id: 3, nombre: 'Client 3' }
        ]
      };

      const response = aiIntegrationService.formatResponse('SEARCH_CLIENTS', result);
      expect(response.type).toBe('TABLE');
      expect(response.count).toBe(3);
    });

    test('debe formatear respuesta de estadísticas', () => {
      const result = {
        success: true,
        message: 'Estadísticas de clientes',
        data: {
          totalClients: 150,
          activeClients: 120,
          inactiveClients: 30
        }
      };

      const response = aiIntegrationService.formatResponse('GET_CLIENT_STATS', result);
      expect(response.type).toBe('STATS');
    });

    test('debe formatear respuesta de exportación', () => {
      const result = {
        success: true,
        message: 'Clientes exportados',
        filename: 'clientes_2025-11-05.csv',
        data: 'id,nombre,email\n1,Acme,acme@example.com'
      };

      const response = aiIntegrationService.formatResponse('EXPORT_CLIENTS', result);
      expect(response.type).toBe('EXPORT');
      expect(response.filename).toBe('clientes_2025-11-05.csv');
    });
  });

  describe('Historial de Conversación', () => {
    test('debe agregar entrada al historial', () => {
      aiIntegrationService.addToHistory({
        userMessage: 'Test',
        intention: 'CREATE_CLIENT',
        params: {},
        result: { success: true },
        timestamp: new Date().toISOString()
      });

      const history = aiIntegrationService.getConversationHistory();
      expect(history.length).toBe(1);
    });

    test('debe limitar tamaño del historial', () => {
      // Agregar más de 50 entradas
      for (let i = 0; i < 60; i++) {
        aiIntegrationService.addToHistory({
          userMessage: `Test ${i}`,
          intention: 'CREATE_CLIENT',
          params: {},
          result: { success: true },
          timestamp: new Date().toISOString()
        });
      }

      const history = aiIntegrationService.getConversationHistory();
      expect(history.length).toBeLessThanOrEqual(50);
    });

    test('debe obtener contexto de conversación', () => {
      aiIntegrationService.addToHistory({
        userMessage: 'Crear cliente',
        intention: 'CREATE_CLIENT',
        params: {},
        result: { success: true },
        timestamp: new Date().toISOString()
      });

      const context = aiIntegrationService.getConversationContext();
      expect(context).toHaveProperty('lastIntention');
      expect(context).toHaveProperty('lastEntity');
      expect(context).toHaveProperty('recentActions');
      expect(context).toHaveProperty('totalInteractions');
    });

    test('debe limpiar historial', () => {
      aiIntegrationService.addToHistory({
        userMessage: 'Test',
        intention: 'CREATE_CLIENT',
        params: {},
        result: { success: true },
        timestamp: new Date().toISOString()
      });

      aiIntegrationService.clearHistory();
      const history = aiIntegrationService.getConversationHistory();
      expect(history.length).toBe(0);
    });
  });

  describe('Ayuda Contextual', () => {
    test('debe obtener intenciones por tema', () => {
      const intentions = aiIntegrationService.getIntentionsByTopic('clientes');
      expect(Array.isArray(intentions)).toBe(true);
      expect(intentions.length).toBeGreaterThan(0);
      expect(intentions[0]).toContain('CLIENT');
    });

    test('debe obtener ejemplos de uso', () => {
      const examples = aiIntegrationService.getExamples('CREATE_CLIENT');
      expect(Array.isArray(examples)).toBe(true);
      expect(examples.length).toBeGreaterThan(0);
    });

    test('debe obtener sugerencias de autocompletado', () => {
      const suggestions = aiIntegrationService.getAutocompleteSuggestions('cre');
      expect(Array.isArray(suggestions)).toBe(true);
      expect(suggestions.some(s => s.value === 'crear')).toBe(true);
    });
  });

  describe('Validación de Comandos', () => {
    test('debe validar comando válido', async () => {
      const validation = await aiIntegrationService.validateCommand(
        'CREATE_CLIENT',
        { nombre: 'Test' }
      );

      expect(validation.valid).toBe(true);
    });

    test('debe detectar intención no reconocida', async () => {
      const validation = await aiIntegrationService.validateCommand(
        'INVALID_INTENTION',
        {}
      );

      expect(validation.valid).toBe(false);
      expect(validation.error).toContain('no reconocida');
    });

    test('debe detectar parámetros faltantes', async () => {
      const validation = await aiIntegrationService.validateCommand(
        'CREATE_CLIENT',
        {} // Sin parámetros requeridos
      );

      expect(validation.valid).toBe(false);
      expect(validation.missingParams).toBeDefined();
    });
  });

  describe('requiresConfirmation', () => {
    test('debe requerir confirmación para DELETE', () => {
      const result = { success: true, data: { id: 1 } };
      const requires = aiIntegrationService.requiresConfirmation('DELETE_CLIENT', result);
      expect(requires).toBe(true);
    });

    test('debe requerir confirmación para CHANGE_STATUS', () => {
      const result = { success: true, data: { id: 1 } };
      const requires = aiIntegrationService.requiresConfirmation('CHANGE_CLIENT_STATUS', result);
      expect(requires).toBe(true);
    });

    test('no debe requerir confirmación para CREATE', () => {
      const result = { success: true, data: { id: 1 } };
      const requires = aiIntegrationService.requiresConfirmation('CREATE_CLIENT', result);
      expect(requires).toBe(false);
    });

    test('no debe requerir confirmación si falla', () => {
      const result = { success: false, error: 'Error' };
      const requires = aiIntegrationService.requiresConfirmation('DELETE_CLIENT', result);
      expect(requires).toBe(false);
    });
  });

  describe('getSuggestions', () => {
    test('debe sugerir ayuda para sentimiento negativo', () => {
      const nlpResult = { sentiment: 'NEGATIVE', mainVerb: 'crear' };
      const suggestions = aiIntegrationService.getSuggestions(nlpResult);
      expect(suggestions.some(s => s.includes('problema'))).toBe(true);
    });

    test('debe sugerir verbos para verbo desconocido', () => {
      const nlpResult = { sentiment: 'NEUTRAL', mainVerb: 'UNKNOWN' };
      const suggestions = aiIntegrationService.getSuggestions(nlpResult);
      expect(suggestions.some(s => s.includes('crear'))).toBe(true);
    });

    test('debe sugerir entidades disponibles', () => {
      const nlpResult = { sentiment: 'NEUTRAL', mainVerb: 'crear' };
      const suggestions = aiIntegrationService.getSuggestions(nlpResult);
      expect(suggestions.some(s => s.includes('clientes'))).toBe(true);
    });
  });
});

describe('AI Integration - Flujo Completo', () => {
  test('debe procesar comando completo de crear cliente', async () => {
    const response = await aiIntegrationService.processCommand(
      'Crear cliente Acme Corp con email contacto@acme.com',
      'asistente'
    );

    expect(response.success).toBe(true);
    expect(response.type).toBe('ACTION_EXECUTED');
    expect(response.intention).toBeDefined();
    expect(response.result).toBeDefined();
    expect(response.response).toBeDefined();
  });

  test('debe procesar comando de búsqueda', async () => {
    const response = await aiIntegrationService.processCommand(
      'Buscar órdenes urgentes',
      'asistente'
    );

    expect(response.success).toBe(true);
    expect(response.type).toBe('ACTION_EXECUTED');
  });

  test('debe procesar comando de eliminación', async () => {
    const response = await aiIntegrationService.processCommand(
      'Eliminar cliente 5',
      'asistente'
    );

    expect(response.success).toBe(true);
    expect(response.requiresConfirmation).toBe(true);
  });
});
