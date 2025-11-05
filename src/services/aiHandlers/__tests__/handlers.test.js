/**
 * Tests Unitarios para AI Handlers
 * Prueba la funcionalidad de cada handler
 */

import { clientActionHandler } from '../clientActionHandler';
import { providerActionHandler } from '../providerActionHandler';
import { mediaActionHandler } from '../mediaActionHandler';
import { campaignActionHandler } from '../campaignActionHandler';
import { orderActionHandler } from '../orderActionHandler';

// Mock de Supabase
jest.mock('../../config/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      ilike: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      range: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: { id: 1 }, error: null }),
      distinct: jest.fn().mockReturnThis(),
      group_by: jest.fn().mockReturnThis(),
      not: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis()
    }))
  }
}));

describe('Client Action Handler', () => {
  describe('validateClientData', () => {
    test('debe validar datos requeridos en modo create', () => {
      const result = clientActionHandler.validateClientData({}, 'create');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('debe validar email válido', () => {
      const result = clientActionHandler.validateClientData(
        { nombre: 'Test', email: 'invalid-email' },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('email'))).toBe(true);
    });

    test('debe aceptar datos válidos', () => {
      const result = clientActionHandler.validateClientData(
        { nombre: 'Test Client', email: 'test@example.com' },
        'create'
      );
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });
  });

  describe('isValidEmail', () => {
    test('debe validar emails correctos', () => {
      expect(clientActionHandler.isValidEmail('test@example.com')).toBe(true);
      expect(clientActionHandler.isValidEmail('user.name@domain.co.uk')).toBe(true);
    });

    test('debe rechazar emails inválidos', () => {
      expect(clientActionHandler.isValidEmail('invalid')).toBe(false);
      expect(clientActionHandler.isValidEmail('test@')).toBe(false);
      expect(clientActionHandler.isValidEmail('@example.com')).toBe(false);
    });
  });

  describe('isValidPhone', () => {
    test('debe validar teléfonos correctos', () => {
      expect(clientActionHandler.isValidPhone('+56912345678')).toBe(true);
      expect(clientActionHandler.isValidPhone('(56) 9 1234-5678')).toBe(true);
      expect(clientActionHandler.isValidPhone('912345678')).toBe(true);
    });

    test('debe rechazar teléfonos inválidos', () => {
      expect(clientActionHandler.isValidPhone('123')).toBe(false);
      expect(clientActionHandler.isValidPhone('abc')).toBe(false);
    });
  });
});

describe('Provider Action Handler', () => {
  describe('validateProviderData', () => {
    test('debe validar datos requeridos en modo create', () => {
      const result = providerActionHandler.validateProviderData({}, 'create');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nombre'))).toBe(true);
      expect(result.errors.some(e => e.includes('RUT'))).toBe(true);
    });

    test('debe validar comisión en rango válido', () => {
      const result = providerActionHandler.validateProviderData(
        { nombre: 'Test', rut: '12345678-9', comision: 150 },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('comisión'))).toBe(true);
    });

    test('debe aceptar comisión válida', () => {
      const result = providerActionHandler.validateProviderData(
        { nombre: 'Test', rut: '12345678-9', comision: 15 },
        'create'
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('isValidPhone', () => {
    test('debe validar teléfonos', () => {
      expect(providerActionHandler.isValidPhone('+56912345678')).toBe(true);
      expect(providerActionHandler.isValidPhone('123')).toBe(false);
    });
  });
});

describe('Media Action Handler', () => {
  describe('validateMediaData', () => {
    test('debe validar nombre requerido en modo create', () => {
      const result = mediaActionHandler.validateMediaData({}, 'create');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('nombre'))).toBe(true);
    });

    test('debe validar costo no negativo', () => {
      const result = mediaActionHandler.validateMediaData(
        { nombre: 'Test', costo: -100 },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('costo'))).toBe(true);
    });

    test('debe aceptar datos válidos', () => {
      const result = mediaActionHandler.validateMediaData(
        { nombre: 'Radio Test', costo: 500000 },
        'create'
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('validateTemaData', () => {
    test('debe validar duración en rango válido', () => {
      const result = mediaActionHandler.validateTemaData(
        { nombre: 'Test', duracion: 5000 },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('duración'))).toBe(true);
    });

    test('debe aceptar duración válida', () => {
      const result = mediaActionHandler.validateTemaData(
        { nombre: 'Spot 30s', duracion: 30 },
        'create'
      );
      expect(result.valid).toBe(true);
    });
  });
});

describe('Campaign Action Handler', () => {
  describe('validateCampaignData', () => {
    test('debe validar datos requeridos en modo create', () => {
      const result = campaignActionHandler.validateCampaignData({}, 'create');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    test('debe validar que fecha inicio sea anterior a fecha fin', () => {
      const result = campaignActionHandler.validateCampaignData(
        {
          nombre: 'Test',
          cliente_id: 1,
          fecha_inicio: '2025-12-31',
          fecha_fin: '2025-01-01'
        },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('fecha'))).toBe(true);
    });

    test('debe aceptar datos válidos', () => {
      const result = campaignActionHandler.validateCampaignData(
        {
          nombre: 'Campaña Test',
          cliente_id: 1,
          fecha_inicio: '2025-01-01',
          fecha_fin: '2025-12-31'
        },
        'create'
      );
      expect(result.valid).toBe(true);
    });
  });
});

describe('Order Action Handler', () => {
  describe('validateOrderData', () => {
    test('debe validar datos requeridos en modo create', () => {
      const result = orderActionHandler.validateOrderData({}, 'create');
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('cliente'))).toBe(true);
      expect(result.errors.some(e => e.includes('proveedor'))).toBe(true);
    });

    test('debe validar monto no negativo', () => {
      const result = orderActionHandler.validateOrderData(
        {
          cliente_id: 1,
          proveedor_id: 1,
          fecha_entrega: '2025-12-15',
          monto_total: -1000
        },
        'create'
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('monto'))).toBe(true);
    });

    test('debe aceptar datos válidos', () => {
      const result = orderActionHandler.validateOrderData(
        {
          cliente_id: 1,
          proveedor_id: 1,
          fecha_entrega: '2025-12-15',
          monto_total: 1500000
        },
        'create'
      );
      expect(result.valid).toBe(true);
    });
  });

  describe('generateOrderNumber', () => {
    test('debe generar número de orden con formato correcto', async () => {
      const orderNumber = await orderActionHandler.generateOrderNumber();
      expect(orderNumber).toMatch(/^ORD-\d{8}-\d{4}$/);
    });
  });
});

describe('Handlers - Manejo de Errores', () => {
  test('clientActionHandler debe retornar error en caso de excepción', async () => {
    // Simular error en BD
    const result = await clientActionHandler.createClient(null);
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined();
  });

  test('providerActionHandler debe retornar error en caso de excepción', async () => {
    const result = await providerActionHandler.createProvider(null);
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined();
  });

  test('mediaActionHandler debe retornar error en caso de excepción', async () => {
    const result = await mediaActionHandler.createMedia(null);
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined();
  });

  test('campaignActionHandler debe retornar error en caso de excepción', async () => {
    const result = await campaignActionHandler.createCampaign(null);
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined();
  });

  test('orderActionHandler debe retornar error en caso de excepción', async () => {
    const result = await orderActionHandler.createOrder(null);
    expect(result.success).toBe(false);
    expect(result.code).toBeDefined();
  });
});

describe('Handlers - Respuestas Estandarizadas', () => {
  test('todas las respuestas deben tener estructura consistente', async () => {
    const result = await clientActionHandler.createClient({
      nombre: 'Test'
    });

    expect(result).toHaveProperty('success');
    expect(result).toHaveProperty('message');
    expect(result).toHaveProperty('code');
    expect(typeof result.success).toBe('boolean');
    expect(typeof result.message).toBe('string');
    expect(typeof result.code).toBe('string');
  });
});

describe('Handlers - Logging', () => {
  test('handlers deben tener logger configurado', () => {
    expect(clientActionHandler.logger).toBeDefined();
    expect(clientActionHandler.logger.info).toBeDefined();
    expect(clientActionHandler.logger.error).toBeDefined();
    expect(clientActionHandler.logger.warn).toBeDefined();

    expect(providerActionHandler.logger).toBeDefined();
    expect(mediaActionHandler.logger).toBeDefined();
    expect(campaignActionHandler.logger).toBeDefined();
    expect(orderActionHandler.logger).toBeDefined();
  });
});
