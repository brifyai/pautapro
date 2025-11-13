/**
 * 📋 EJEMPLO DE INTEGRACIÓN - SISTEMA DE FACTURACIÓN
 * 
 * Este ejemplo muestra cómo integrar PautaPro con un sistema de facturación
 * para automatizar la generación de facturas basadas en órdenes completadas.
 * 
 * @author PautaPro Development Team
 * @version 2.0.0
 */

const { PautaProClient, PautaProError } = require('../sdk/pautapro-client');

class FacturacionIntegrator {
  constructor(config = {}) {
    // Configurar cliente de PautaPro
    this.pautaPro = new PautaProClient({
      apiKey: config.apiKey,
      baseURL: config.baseURL || 'https://api.pautapro.com/v2',
      timeout: 30000,
      debug: config.debug || false,
      retryAttempts: 3
    });

    // Configuración del sistema de facturación externo
    this.facturacionConfig = {
      baseURL: config.facturacionURL,
      apiKey: config.facturacionAPIKey,
      clienteId: config.clienteIdFacturacion
    };

    // Mapeo de impuestos por región
    this.impuestosRegion = {
      1: { iva: 19, region: 'Tarapacá' },
      2: { iva: 19, region: 'Antofagasta' },
      // ... más regiones según necesidad
      7: { iva: 19, region: 'Metropolitana' }
    };
  }

  /**
   * 🚀 MÉTODO PRINCIPAL: Sincronización completa de facturación
   */
  async sincronizarFacturacion(periodo = {}) {
    const resultado = {
      facturas_generadas: [],
      errores: [],
      ordenes_procesadas: 0,
      total_facturado: 0,
      timestamp: new Date().toISOString()
    };

    try {
      console.log('🔄 Iniciando sincronización de facturación...');

      // 1. Obtener órdenes completadas en el período
      const ordenesCompletas = await this.obtenerOrdenesParaFacturar(periodo);
      console.log(`📦 Órdenes encontradas para facturar: ${ordenesCompletas.length}`);

      // 2. Agrupar órdenes por cliente
      const ordenesAgrupadas = this.agruparOrdenesPorCliente(ordenesCompletas);

      // 3. Procesar cada cliente
      for (const [clienteId, ordenes] of ordenesAgrupadas) {
        try {
          console.log(`👤 Procesando cliente ${clienteId}...`);

          // Obtener datos completos del cliente
          const clienteData = await this.pautaPro.obtenerCliente(clienteId);
          
          // Generar factura para el cliente
          const factura = await this.generarFacturaParaCliente(clienteData, ordenes);
          
          if (factura.success) {
            resultado.facturas_generadas.push(factura.data);
            resultado.ordenes_procesadas += ordenes.length;
            resultado.total_facturado += factura.data.total;
            
            console.log(`✅ Factura generada: ${factura.data.numero_factura} - $${factura.data.total.toLocaleString()}`);
          } else {
            resultado.errores.push({
              cliente_id: clienteId,
              error: factura.error,
              ordenes: ordenes.map(o => o.id)
            });
          }

        } catch (error) {
          console.error(`❌ Error procesando cliente ${clienteId}:`, error.message);
          resultado.errores.push({
            cliente_id: clienteId,
            error: error.message,
            stack: error.stack
          });
        }
      }

      // 4. Enviar reporte de sincronización
      await this.enviarReporteSincronizacion(resultado);

      return resultado;

    } catch (error) {
      console.error('💥 Error crítico en sincronización:', error);
      throw error;
    }
  }

  /**
   * 📊 Obtiene órdenes completadas que necesitan facturarse
   */
  async obtenerOrdenesParaFacturar(periodo) {
    try {
      const filtros = {
        estado: 'completada',
        fecha_desde: periodo.fecha_desde || this.getFechaHaciaAtras(30),
        fecha_hasta: periodo.fecha_hasta || new Date().toISOString().split('T')[0],
        limit: 1000 // Límite alto para obtener todas las órdenes
      };

      const response = await this.pautaPro.listarOrdenes(filtros);
      
      // Filtrar órdenes que ya fueron facturadas
      const ordenesNoFacturadas = response.data.filter(orden => 
        !orden.facturada && orden.total > 0
      );

      return ordenesNoFacturadas;

    } catch (error) {
      throw new Error(`Error obteniendo órdenes: ${error.message}`);
    }
  }

  /**
   * 🔀 Agrupa órdenes por cliente para facturación
   */
  agruparOrdenesPorCliente(ordenes) {
    const agrupadas = new Map();
    
    ordenes.forEach(orden => {
      if (!agrupadas.has(orden.id_cliente)) {
        agrupadas.set(orden.id_cliente, []);
      }
      agrupadas.get(orden.id_cliente).push(orden);
    });

    return agrupadas;
  }

  /**
   * 🧾 Genera factura para un cliente específico
   */
  async generarFacturaParaCliente(clienteData, ordenes) {
    try {
      // 1. Preparar datos de la factura
      const datosFactura = this.prepararDatosFactura(clienteData, ordenes);

      // 2. Llamar al sistema de facturación externo
      const facturaResponse = await this.llamarSistemaFacturacion(datosFactura);

      if (facturaResponse.success) {
        // 3. Marcar órdenes como facturadas en PautaPro
        await this.marcarOrdenesComoFacturadas(ordenes, facturaResponse.data.numero_factura);

        // 4. Enviar webhook de factura generada
        await this.enviarWebhookFacturaGenerada(clienteData, ordenes, facturaResponse.data);

        return {
          success: true,
          data: facturaResponse.data
        };
      } else {
        return {
          success: false,
          error: facturaResponse.error
        };
      }

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 📝 Prepara los datos de la factura según el formato del sistema de facturación
   */
  prepararDatosFactura(clienteData, ordenes) {
    // Calcular totales
    const subtotal = ordenes.reduce((sum, orden) => sum + (orden.total || 0), 0);
    const impuesto = this.calcularImpuesto(clienteData.id_region, subtotal);
    const total = subtotal + impuesto;

    // Preparar items de la factura
    const items = ordenes.map(orden => ({
      descripcion: `Orden ${orden.numero_orden} - ${orden.descripcion || 'Servicios publicitarios'}`,
      cantidad: 1,
      precio_unitario: orden.total || 0,
      total: orden.total || 0,
      codigo_interno: `ORD-${orden.id}`
    }));

    return {
      // Datos del cliente
      cliente: {
        rut: clienteData.rut,
        razon_social: clienteData.razonsocial || clienteData.nombrecliente,
        direccion: clienteData.direccion || '',
        ciudad: clienteData.Comunas?.nombrecomuna || '',
        region: clienteData.Region?.nombreregion || '',
        email: clienteData.email
      },

      // Items de la factura
      items: items,
      subtotal: subtotal,
      impuesto: impuesto,
      total: total,

      // Metadatos
      fecha_emision: new Date().toISOString().split('T')[0],
      fecha_vencimiento: this.calcularFechaVencimiento(),
      observacion: `Facturación automática PautaPro - ${ordenes.length} órdenes`,
      referencia_externa: `PAUTAPRO-${Date.now()}`,
      
      // Configuración específica
      tipo_documento: 'factura_electronica',
      moneda: 'CLP',
      forma_pago: 'contado'
    };
  }

  /**
   * 🔗 Llama al sistema de facturación externo
   */
  async llamarSistemaFacturacion(datosFactura) {
    try {
      const response = await fetch(`${this.facturacionConfig.baseURL}/api/v1/facturas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.facturacionConfig.apiKey}`,
          'X-Client-Id': this.facturacionConfig.clienteId
        },
        body: JSON.stringify(datosFactura)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        return {
          success: true,
          data: result.data
        };
      } else {
        return {
          success: false,
          error: result.error || 'Error en sistema de facturación'
        };
      }

    } catch (error) {
      return {
        success: false,
        error: `Error de conexión: ${error.message}`
      };
    }
  }

  /**
   * ✅ Marca órdenes como facturadas en PautaPro
   */
  async marcarOrdenesComoFacturadas(ordenes, numeroFactura) {
    const updates = ordenes.map(orden => 
      this.pautaPro.actualizarOrden(orden.id, {
        facturada: true,
        numero_factura: numeroFactura,
        fecha_facturacion: new Date().toISOString()
      })
    );

    await Promise.allSettled(updates);
  }

  /**
   * 📨 Envía webhook cuando se genera una factura
   */
  async enviarWebhookFacturaGenerada(clienteData, ordenes, facturaData) {
    try {
      await this.pautaPro.registrarWebhook({
        url: 'https://mi-sistema.com/webhooks/facturas',
        events: ['factura.generada'],
        secret: 'mi-secret-webhook'
      });

      console.log(`📨 Webhook enviado para factura ${facturaData.numero_factura}`);
    } catch (error) {
      console.warn('⚠️  Error enviando webhook:', error.message);
    }
  }

  /**
   * 📊 Envía reporte de sincronización
   */
  async enviarReporteSincronizacion(resultado) {
    const reporte = {
      tipo: 'reporte_sincronizacion_facturacion',
      timestamp: resultado.timestamp,
      resumen: {
        facturas_generadas: resultado.facturas_generadas.length,
        ordenes_procesadas: resultado.ordenes_procesadas,
        total_facturado: resultado.total_facturado,
        errores: resultado.errores.length
      },
      detalles: resultado
    };

    // Aquí se puede enviar por email, Slack, etc.
    console.log('📊 Reporte de sincronización:', JSON.stringify(reporte, null, 2));
  }

  // ================== MÉTODOS AUXILIARES ==================

  /**
   * Calcula impuesto según región
   */
  calcularImpuesto(idRegion, monto) {
    const config = this.impuestosRegion[idRegion] || this.impuestosRegion[7]; // Default a RM
    return Math.round(monto * (config.iva / 100));
  }

  /**
   * Calcula fecha de vencimiento (30 días)
   */
  calcularFechaVencimiento() {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() + 30);
    return fecha.toISOString().split('T')[0];
  }

  /**
   * Obtiene fecha hacia atrás en días
   */
  getFechaHaciaAtras(dias) {
    const fecha = new Date();
    fecha.setDate(fecha.getDate() - dias);
    return fecha.toISOString().split('T')[0];
  }
}

// ================== EJEMPLO DE USO ==================

async function ejemploUso() {
  console.log('🚀 EJEMPLO DE INTEGRACIÓN - SISTEMA DE FACTURACIÓN');
  console.log('=' .repeat(50));

  // Configuración
  const config = {
    // API de PautaPro
    apiKey: 'pk_live_1234567890abcdef1234567890abcdef',
    baseURL: 'https://api.pautapro.com/v2',
    debug: true,

    // Sistema de facturación externo
    facturacionURL: 'https://mi-facturador.com/api',
    facturacionAPIKey: 'fact_1234567890abcdef',
    clienteIdFacturacion: 'cliente_abc123'
  };

  try {
    // Crear integrador
    const integrador = new FacturacionIntegrator(config);

    // Ejecutar sincronización
    const resultado = await integrador.sincronizarFacturacion({
      fecha_desde: '2024-11-01',
      fecha_hasta: '2024-11-30'
    });

    console.log('\n✅ SINCRONIZACIÓN COMPLETADA');
    console.log(`📦 Facturas generadas: ${resultado.facturas_generadas.length}`);
    console.log(`💰 Total facturado: $${resultado.total_facturado.toLocaleString()}`);
    console.log(`❌ Errores: ${resultado.errores.length}`);

    if (resultado.errores.length > 0) {
      console.log('\n⚠️  ERRORES ENCONTRADOS:');
      resultado.errores.forEach((error, index) => {
        console.log(`${index + 1}. Cliente ${error.cliente_id}: ${error.error}`);
      });
    }

  } catch (error) {
    console.error('💥 Error en el ejemplo:', error.message);
    console.error(error.stack);
  }
}

// Ejecutar ejemplo si se llama directamente
if (require.main === module) {
  ejemploUso();
}

module.exports = {
  FacturacionIntegrator,
  ejemploUso
};