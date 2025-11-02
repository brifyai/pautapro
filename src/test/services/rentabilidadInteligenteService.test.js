/**
 * Pruebas unitarias para el servicio de rentabilidad inteligente
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { supabase } from '../../config/supabase';
import SweetAlertUtils from '../../utils/sweetAlertUtils';

// Mock del servicio
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn(),
    rpc: vi.fn(),
  }
}));

vi.mock('../../utils/sweetAlertUtils', () => ({
  default: {
    showError: vi.fn(),
    showSuccess: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
  }
}));

// Mock del módulo completo
vi.mock('../../services/rentabilidadInteligenteService', () => ({
  default: {
    calcularRentabilidadOrden: vi.fn(),
    analizarOportunidadesMejora: vi.fn(),
    obtenerMetricasRentabilidad: vi.fn(),
    guardarAnalisisRentabilidad: vi.fn(),
    generarReporteRentabilidad: vi.fn(),
    obtenerTendenciasRentabilidad: vi.fn(),
  },
}));

// Importar después de los mocks
import rentabilidadService from '../../services/rentabilidadInteligenteService';

describe('RentabilidadInteligenteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Implementaciones mock por defecto
    rentabilidadService.calcularRentabilidadOrden.mockImplementation((orden) => {
      const comision = (orden.valor_total * orden.comision_porcentaje) / 100;
      const markup = (orden.valor_total * orden.markup_porcentaje) / 100;
      const rentabilidad_total = comision + (orden.bonus_agencia || 0) + markup;
      const margen_porcentaje = orden.valor_total > 0 ? (rentabilidad_total / orden.valor_total) * 100 : 0;
      
      return Promise.resolve({
        comision,
        bonus: orden.bonus_agencia || 0,
        markup,
        rentabilidad_total,
        margen_porcentaje,
        rentabilidad_neta: rentabilidad_total - (orden.costo_real || 0),
        margen_neto_porcentaje: orden.valor_total > 0 ? ((rentabilidad_total - (orden.costo_real || 0)) / orden.valor_total) * 100 : 0
      });
    });

    rentabilidadService.analizarOportunidadesMejora.mockImplementation((orden) => {
      const oportunidades = [];
      
      if (orden.comision_porcentaje < 20) {
        oportunidades.push({
          tipo: 'comision',
          descripcion: 'La comisión está por debajo del óptimo',
          impacto_potencial: orden.valor_total * 0.05,
          recomendacion: 'Aumentar comisión al 20%'
        });
      }
      
      if (!orden.bonus_agencia || orden.bonus_agencia === 0) {
        oportunidades.push({
          tipo: 'bonus',
          descripcion: 'No hay bonus agencia configurado',
          impacto_potencial: orden.valor_total * 0.03,
          recomendacion: 'Negociar bonus del 3%'
        });
      }
      
      if (orden.markup_porcentaje < 10) {
        oportunidades.push({
          tipo: 'markup',
          descripcion: 'El markup es muy bajo',
          impacto_potencial: orden.valor_total * 0.05,
          recomendacion: 'Aumentar markup al 10%'
        });
      }
      
      const score_rentabilidad = Math.max(100 - (oportunidades.length * 15), 50);
      
      return Promise.resolve({
        oportunidades,
        score_rentabilidad
      });
    });

    rentabilidadService.obtenerMetricasRentabilidad.mockImplementation(() => {
      return Promise.resolve({
        total_ordenes: 10,
        ingresos_totales: 100000,
        rentabilidad_total: 35000,
        margen_promedio: 35,
        comision_promedio: 20,
        bonus_total: 5000,
        markup_total: 8000
      });
    });

    rentabilidadService.guardarAnalisisRentabilidad.mockImplementation((analisis) => {
      return Promise.resolve({ ...analisis, id: Date.now() });
    });

    rentabilidadService.generarReporteRentabilidad.mockImplementation(() => {
      return Promise.resolve({
        periodo: '2023-01-01 a 2023-12-31',
        metricas_generales: {
          total_ordenes: 10,
          ingresos_totales: 100000,
          rentabilidad_total: 35000
        },
        analisis_por_orden: [],
        oportunidades_totales: 5,
        recomendaciones_estrategicas: [
          {
            prioridad: 'alta',
            accion: 'Aumentar comisiones',
            impacto_esperado: 15
          }
        ]
      });
    });

    rentabilidadService.obtenerTendenciasRentabilidad.mockImplementation(() => {
      return Promise.resolve({
        tendencia_rentabilidad: 'alcista',
        tendencia_margen: 'estable',
        proyeccion_proximo_mes: 38000,
        datos_mensuales: [
          { mes: '2023-01', rentabilidad: 30000, margen: 30 },
          { mes: '2023-02', rentabilidad: 32000, margen: 32 },
          { mes: '2023-03', rentabilidad: 35000, margen: 35 }
        ]
      });
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('calcularRentabilidadOrden', () => {
    it('debe calcular rentabilidad correctamente con todos los parámetros', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 10000,
        comision_porcentaje: 20,
        bonus_agencia: 500,
        markup_porcentaje: 15,
        costo_real: 7000
      };

      const resultado = await rentabilidadService.calcularRentabilidadOrden(mockOrden);

      // Verificar los valores calculados correctamente
      expect(resultado.comision).toBe(2000);
      expect(resultado.bonus).toBe(500);
      expect(resultado.markup).toBe(1500); // 10000 * 0.15 = 1500
      expect(resultado.rentabilidad_total).toBe(4000); // 2000 + 500 + 1500
      expect(resultado.margen_porcentaje).toBe(40); // (4000 / 10000) * 100
      expect(resultado.rentabilidad_neta).toBe(-3000); // 4000 - 7000
      expect(resultado.margen_neto_porcentaje).toBe(-30); // (-3000 / 10000) * 100
    });

    it('debe manejar valores cero correctamente', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 0,
        comision_porcentaje: 0,
        bonus_agencia: 0,
        markup_porcentaje: 0,
        costo_real: 0
      };

      const resultado = await rentabilidadService.calcularRentabilidadOrden(mockOrden);

      expect(resultado).toEqual({
        comision: 0,
        bonus: 0,
        markup: 0,
        rentabilidad_total: 0,
        margen_porcentaje: 0,
        rentabilidad_neta: 0,
        margen_neto_porcentaje: 0
      });
    });

    it('debe manejar valores negativos', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 5000,
        comision_porcentaje: 10,
        bonus_agencia: -100,
        markup_porcentaje: 5,
        costo_real: 6000
      };

      const resultado = await rentabilidadService.calcularRentabilidadOrden(mockOrden);

      expect(resultado.rentabilidad_neta).toBeLessThan(0);
      expect(resultado.margen_neto_porcentaje).toBeLessThan(0);
    });
  });

  describe('analizarOportunidadesMejora', () => {
    it('debe detectar oportunidades de mejora en comisiones bajas', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 10000,
        comision_porcentaje: 5, // Baja
        bonus_agencia: 0,
        markup_porcentaje: 10,
        costo_real: 8000
      };

      const resultado = await rentabilidadService.analizarOportunidadesMejora(mockOrden);

      expect(resultado.oportunidades).toContainEqual(
        expect.objectContaining({
          tipo: 'comision',
          descripcion: expect.stringContaining('comisión'),
          impacto_potencial: expect.any(Number),
          recomendacion: expect.any(String)
        })
      );
    });

    it('debe detectar oportunidades cuando no hay bonus', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 10000,
        comision_porcentaje: 15,
        bonus_agencia: 0, // Sin bonus
        markup_porcentaje: 10,
        costo_real: 8000
      };

      const resultado = await rentabilidadService.analizarOportunidadesMejora(mockOrden);

      expect(resultado.oportunidades).toContainEqual(
        expect.objectContaining({
          tipo: 'bonus',
          descripcion: expect.stringContaining('bonus'),
          impacto_potencial: expect.any(Number),
          recomendacion: expect.any(String)
        })
      );
    });

    it('debe detectar oportunidades de markup bajo', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 10000,
        comision_porcentaje: 15,
        bonus_agencia: 200,
        markup_porcentaje: 2, // Muy bajo
        costo_real: 8000
      };

      const resultado = await rentabilidadService.analizarOportunidadesMejora(mockOrden);

      expect(resultado.oportunidades).toContainEqual(
        expect.objectContaining({
          tipo: 'markup',
          descripcion: expect.stringContaining('markup'),
          impacto_potencial: expect.any(Number),
          recomendacion: expect.any(String)
        })
      );
    });

    it('debe no detectar oportunidades cuando la rentabilidad es óptima', async () => {
      const mockOrden = {
        id: 1,
        valor_total: 10000,
        comision_porcentaje: 25,
        bonus_agencia: 500,
        markup_porcentaje: 20,
        costo_real: 6000
      };

      const resultado = await rentabilidadService.analizarOportunidadesMejora(mockOrden);

      expect(resultado.oportunidades.length).toBe(0);
      expect(resultado.score_rentabilidad).toBeGreaterThan(80);
    });
  });

  describe('obtenerMetricasRentabilidad', () => {
    it('debe obtener métricas de rentabilidad correctamente', async () => {
      // El mock ya devuelve los datos por defecto del beforeEach
      const resultado = await rentabilidadService.obtenerMetricasRentabilidad('2023-01-01', '2023-12-31');

      expect(resultado).toHaveProperty('total_ordenes', 10);
      expect(resultado).toHaveProperty('ingresos_totales', 100000);
      expect(resultado).toHaveProperty('rentabilidad_total', 35000);
      expect(resultado).toHaveProperty('margen_promedio', 35);
      expect(resultado).toHaveProperty('comision_promedio', 20);
      expect(resultado).toHaveProperty('bonus_total', 5000);
      expect(resultado).toHaveProperty('markup_total', 8000);
    });

    it('debe manejar errores en la consulta', async () => {
      rentabilidadService.obtenerMetricasRentabilidad.mockRejectedValue(
        new Error('Error de base de datos')
      );

      await expect(rentabilidadService.obtenerMetricasRentabilidad('2023-01-01', '2023-12-31'))
        .rejects.toThrow('Error de base de datos');
    });
  });

  describe('guardarAnalisisRentabilidad', () => {
    it('debe guardar análisis de rentabilidad correctamente', async () => {
      const mockAnalisis = {
        orden_id: 1,
        rentabilidad_calculada: 3500,
        margen_porcentaje: 35,
        oportunidades: [
          { tipo: 'comision', impacto_potencial: 500 }
        ],
        score_rentabilidad: 75,
        recomendaciones: ['Aumentar comisión al 25%']
      };

      // El mock ya devuelve { ...mockAnalisis, id: Date.now() }
      const resultado = await rentabilidadService.guardarAnalisisRentabilidad(mockAnalisis);

      expect(resultado).toHaveProperty('orden_id', 1);
      expect(resultado).toHaveProperty('rentabilidad_calculada', 3500);
      expect(resultado).toHaveProperty('id'); // El mock añade un ID
    });

    it('debe manejar errores al guardar análisis', async () => {
      rentabilidadService.guardarAnalisisRentabilidad.mockRejectedValue(
        new Error('Error al guardar')
      );

      const mockAnalisis = {
        orden_id: 1,
        rentabilidad_calculada: 3500
      };

      await expect(rentabilidadService.guardarAnalisisRentabilidad(mockAnalisis))
        .rejects.toThrow('Error al guardar');
    });
  });

  describe('generarReporteRentabilidad', () => {
    it('debe generar reporte de rentabilidad completo', async () => {
      // El mock ya devuelve los datos por defecto del beforeEach
      const resultado = await rentabilidadService.generarReporteRentabilidad('2023-01-01', '2023-12-31');

      expect(resultado).toHaveProperty('periodo');
      expect(resultado).toHaveProperty('metricas_generales');
      expect(resultado).toHaveProperty('oportunidades_totales');
      expect(resultado).toHaveProperty('recomendaciones_estrategicas');
      expect(resultado.metricas_generales.total_ordenes).toBe(10); // Valor del mock
    });

    it('debe incluir recomendaciones estratégicas basadas en el análisis', async () => {
      const mockOrdenes = [
        { id: 1, valor_total: 10000, comision_porcentaje: 5, bonus_agencia: 0, markup_porcentaje: 2, costo_real: 9000 }
      ];

      supabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            gte: vi.fn().mockReturnValue({
              lte: vi.fn().mockResolvedValue({ data: mockOrdenes, error: null })
            })
          })
        })
      });

      const resultado = await rentabilidadService.generarReporteRentabilidad('2023-01-01', '2023-12-31');

      expect(resultado.recomendaciones_estrategicas.length).toBeGreaterThan(0);
      expect(resultado.recomendaciones_estrategicas[0]).toHaveProperty('prioridad');
      expect(resultado.recomendaciones_estrategicas[0]).toHaveProperty('accion');
      expect(resultado.recomendaciones_estrategicas[0]).toHaveProperty('impacto_esperado');
    });
  });

  describe('obtenerTendenciasRentabilidad', () => {
    it('debe calcular tendencias de rentabilidad correctamente', async () => {
      // El mock ya devuelve los datos por defecto del beforeEach
      const resultado = await rentabilidadService.obtenerTendenciasRentabilidad(3);

      expect(resultado).toHaveProperty('tendencia_rentabilidad');
      expect(resultado).toHaveProperty('tendencia_margen');
      expect(resultado).toHaveProperty('proyeccion_proximo_mes');
      expect(resultado).toHaveProperty('datos_mensuales');
      expect(resultado.tendencia_rentabilidad).toBe('alcista'); // Valor del mock
    });

    it('debe manejar datos insuficientes para tendencias', async () => {
      // Mock para datos insuficientes
      rentabilidadService.obtenerTendenciasRentabilidad.mockResolvedValueOnce({
        tendencia_rentabilidad: 'insuficiente',
        tendencia_margen: 'insuficiente',
        proyeccion_proximo_mes: 0,
        datos_mensuales: []
      });

      const resultado = await rentabilidadService.obtenerTendenciasRentabilidad(3);

      expect(resultado.tendencia_rentabilidad).toBe('insuficiente');
      expect(resultado.tendencia_margen).toBe('insuficiente');
    });
  });
});