/**
 * Order Action Handler
 * Maneja todas las operaciones relacionadas con órdenes de compra
 * Integrado con el Asistente IA Ejecutivo
 */

import { supabase } from '../../config/supabase';

class OrderActionHandler {
  constructor() {
    this.tableName = 'ordenes';
    this.detallesTable = 'orden_detalles';
    this.logger = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, data) => console.log(`[OrderHandler] ${msg}`, data || ''),
      error: (msg, err) => console.error(`[OrderHandler ERROR] ${msg}`, err || ''),
      warn: (msg, data) => console.warn(`[OrderHandler WARN] ${msg}`, data || '')
    };
  }

  /**
   * Crear nueva orden
   */
  async createOrder(data) {
    try {
      this.logger.info('Creando nueva orden', data);

      // Validar datos
      const validation = this.validateOrderData(data, 'create');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos
      const orderData = {
        numero_orden: data.numero_orden || await this.generateOrderNumber(),
        cliente_id: data.cliente_id,
        proveedor_id: data.proveedor_id,
        campana_id: data.campana_id,
        fecha_orden: new Date().toISOString(),
        fecha_entrega_esperada: data.fecha_entrega || data.fecha_entrega_esperada,
        monto_total: data.monto_total || 0,
        estado: data.estado_orden || 'pendiente',
        descripcion: data.descripcion || data.description,
        notas: data.notas || data.notes,
        prioridad: data.prioridad || 'normal',
        agencia_id: data.agencia_id || 1
      };

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([orderData])
        .select();

      if (error) {
        this.logger.error('Error al crear orden', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Orden creada exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Orden "${orderData.numero_orden}" creada exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al crear orden', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Buscar órdenes con múltiples filtros
   */
  async searchOrders(filters = {}) {
    try {
      this.logger.info('Buscando órdenes', filters);

      let query = supabase.from(this.tableName).select('*');

      // Aplicar filtros
      if (filters.numero_orden) {
        query = query.ilike('numero_orden', `%${filters.numero_orden}%`);
      }
      if (filters.cliente_id) {
        query = query.eq('cliente_id', filters.cliente_id);
      }
      if (filters.proveedor_id) {
        query = query.eq('proveedor_id', filters.proveedor_id);
      }
      if (filters.campana_id) {
        query = query.eq('campana_id', filters.campana_id);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.prioridad) {
        query = query.eq('prioridad', filters.prioridad);
      }
      if (filters.minMonto !== undefined) {
        query = query.gte('monto_total', filters.minMonto);
      }
      if (filters.maxMonto !== undefined) {
        query = query.lte('monto_total', filters.maxMonto);
      }
      if (filters.fechaDesde) {
        query = query.gte('fecha_orden', filters.fechaDesde);
      }
      if (filters.fechaHasta) {
        query = query.lte('fecha_orden', filters.fechaHasta);
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'fecha_orden';
      const orderDirection = filters.orderDirection || 'desc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error } = await query;

      if (error) {
        this.logger.error('Error al buscar órdenes', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontradas ${data.length} órdenes`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} orden(es)`
      };
    } catch (err) {
      this.logger.error('Excepción al buscar órdenes', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener orden por ID
   */
  async getOrderById(id) {
    try {
      this.logger.info('Obteniendo orden por ID', { id });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error al obtener orden', error);
        return {
          success: false,
          error: 'Orden no encontrada',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data,
        message: `Orden "${data.numero_orden}" obtenida exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener orden', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Actualizar orden
   */
  async updateOrder(id, data) {
    try {
      this.logger.info('Actualizando orden', { id, data });

      // Validar datos
      const validation = this.validateOrderData(data, 'update');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos para actualización
      const updateData = {};
      if (data.fecha_entrega) updateData.fecha_entrega_esperada = data.fecha_entrega;
      if (data.monto_total !== undefined) updateData.monto_total = data.monto_total;
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.notas) updateData.notas = data.notas;
      if (data.prioridad) updateData.prioridad = data.prioridad;

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al actualizar orden', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Orden actualizada exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: 'Orden actualizada exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al actualizar orden', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Cambiar estado de la orden
   */
  async changeOrderStatus(id, newStatus) {
    try {
      this.logger.info('Cambiando estado de la orden', { id, newStatus });

      const validStates = ['pendiente', 'confirmada', 'en_proceso', 'entregada', 'cancelada', 'rechazada'];
      if (!validStates.includes(newStatus)) {
        return {
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`,
          code: 'INVALID_STATE'
        };
      }

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ estado: newStatus })
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al cambiar estado', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Estado cambiado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Estado de la orden cambiado a "${newStatus}"`
      };
    } catch (err) {
      this.logger.error('Excepción al cambiar estado', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Cambiar prioridad de la orden
   */
  async changeOrderPriority(id, newPriority) {
    try {
      this.logger.info('Cambiando prioridad de la orden', { id, newPriority });

      const validPriorities = ['baja', 'normal', 'alta', 'urgente'];
      if (!validPriorities.includes(newPriority)) {
        return {
          success: false,
          error: `Prioridad inválida. Prioridades válidas: ${validPriorities.join(', ')}`,
          code: 'INVALID_PRIORITY'
        };
      }

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ prioridad: newPriority })
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al cambiar prioridad', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Prioridad cambiada exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Prioridad de la orden cambiada a "${newPriority}"`
      };
    } catch (err) {
      this.logger.error('Excepción al cambiar prioridad', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Eliminar orden
   */
  async deleteOrder(id, force = false) {
    try {
      this.logger.info('Eliminando orden', { id, force });

      // Verificar estado
      const orderResult = await this.getOrderById(id);
      if (!orderResult.success) {
        return orderResult;
      }

      const order = orderResult.data;
      if (!force && order.estado !== 'pendiente') {
        return {
          success: false,
          error: 'Solo se pueden eliminar órdenes en estado pendiente. Use force=true para forzar la eliminación.',
          code: 'INVALID_STATE',
          currentState: order.estado
        };
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error al eliminar orden', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Orden eliminada exitosamente');
      return {
        success: true,
        message: 'Orden eliminada exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al eliminar orden', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener detalles de una orden
   */
  async getOrderDetails(orderId) {
    try {
      this.logger.info('Obteniendo detalles de orden', { orderId });

      const { data, error } = await supabase
        .from(this.detallesTable)
        .select('*')
        .eq('orden_id', orderId);

      if (error) {
        this.logger.error('Error al obtener detalles', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} detalles`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} detalle(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener detalles', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Agregar detalle a orden
   */
  async addOrderDetail(orderId, detail) {
    try {
      this.logger.info('Agregando detalle a orden', { orderId, detail });

      const detailData = {
        orden_id: orderId,
        descripcion: detail.descripcion || detail.description,
        cantidad: detail.cantidad || detail.quantity || 1,
        precio_unitario: detail.precio_unitario || detail.unitPrice || 0,
        subtotal: (detail.cantidad || detail.quantity || 1) * (detail.precio_unitario || detail.unitPrice || 0)
      };

      const { data, error } = await supabase
        .from(this.detallesTable)
        .insert([detailData])
        .select();

      if (error) {
        this.logger.error('Error al agregar detalle', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Detalle agregado exitosamente', data[0]);
      return {
        success: true,
        data: data[0],
        message: 'Detalle agregado a la orden exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al agregar detalle', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener estadísticas de órdenes
   */
  async getOrderStats() {
    try {
      this.logger.info('Obteniendo estadísticas de órdenes');

      // Total de órdenes
      const { count: totalOrders } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Órdenes por estado
      const { data: ordersByStatus } = await supabase
        .from(this.tableName)
        .select('estado, count(*)')
        .group_by('estado');

      // Órdenes por prioridad
      const { data: ordersByPriority } = await supabase
        .from(this.tableName)
        .select('prioridad, count(*)')
        .group_by('prioridad');

      // Monto total
      const { data: amountData } = await supabase
        .from(this.tableName)
        .select('monto_total');

      const totalAmount = amountData && amountData.length > 0
        ? amountData.reduce((sum, o) => sum + (o.monto_total || 0), 0)
        : 0;

      const avgAmount = amountData && amountData.length > 0
        ? (totalAmount / amountData.length).toFixed(2)
        : 0;

      const stats = {
        totalOrders: totalOrders || 0,
        ordersByStatus: ordersByStatus || [],
        ordersByPriority: ordersByPriority || [],
        totalAmount: totalAmount,
        averageAmount: parseFloat(avgAmount)
      };

      this.logger.info('Estadísticas obtenidas', stats);
      return {
        success: true,
        data: stats,
        message: 'Estadísticas de órdenes obtenidas exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al obtener estadísticas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Exportar órdenes a CSV
   */
  async exportOrders(filters = {}) {
    try {
      this.logger.info('Exportando órdenes', filters);

      const searchResult = await this.searchOrders({ ...filters, limit: 10000 });
      if (!searchResult.success) {
        return searchResult;
      }

      const orders = searchResult.data;

      const headers = [
        'ID',
        'Número Orden',
        'Cliente ID',
        'Proveedor ID',
        'Campaña ID',
        'Fecha Orden',
        'Fecha Entrega Esperada',
        'Monto Total',
        'Estado',
        'Prioridad',
        'Descripción'
      ];

      const rows = orders.map(o => [
        o.id,
        o.numero_orden,
        o.cliente_id,
        o.proveedor_id,
        o.campana_id,
        new Date(o.fecha_orden).toLocaleDateString('es-CL'),
        new Date(o.fecha_entrega_esperada).toLocaleDateString('es-CL'),
        o.monto_total,
        o.estado,
        o.prioridad,
        o.descripcion
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      this.logger.info(`Exportadas ${orders.length} órdenes`);
      return {
        success: true,
        data: csv,
        filename: `ordenes_${new Date().toISOString().split('T')[0]}.csv`,
        message: `${orders.length} orden(es) exportada(s) exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al exportar órdenes', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Validar datos de la orden
   */
  validateOrderData(data, mode = 'create') {
    const errors = [];

    if (mode === 'create') {
      if (!data.cliente_id) {
        errors.push('El cliente es requerido');
      }
      if (!data.proveedor_id) {
        errors.push('El proveedor es requerido');
      }
      if (!data.fecha_entrega && !data.fecha_entrega_esperada) {
        errors.push('La fecha de entrega es requerida');
      }
    }

    // Validaciones opcionales
    if (data.monto_total !== undefined && data.monto_total < 0) {
      errors.push('El monto no puede ser negativo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Generar número de orden único
   */
  async generateOrderNumber() {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');

      // Obtener el último número de orden del día
      const { data, error } = await supabase
        .from(this.tableName)
        .select('numero_orden')
        .ilike('numero_orden', `ORD-${year}${month}${day}%`)
        .order('numero_orden', { ascending: false })
        .limit(1);

      let sequence = 1;
      if (data && data.length > 0) {
        const lastNumber = data[0].numero_orden;
        const lastSequence = parseInt(lastNumber.split('-')[3]);
        sequence = lastSequence + 1;
      }

      const orderNumber = `ORD-${year}${month}${day}-${String(sequence).padStart(4, '0')}`;
      return orderNumber;
    } catch (err) {
      this.logger.warn('Error al generar número de orden, usando timestamp', err);
      return `ORD-${Date.now()}`;
    }
  }

  /**
   * Obtener órdenes pendientes
   */
  async getPendingOrders() {
    try {
      this.logger.info('Obteniendo órdenes pendientes');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('estado', 'pendiente')
        .order('fecha_orden', { ascending: true });

      if (error) {
        this.logger.error('Error al obtener órdenes pendientes', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontradas ${data.length} órdenes pendientes`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} orden(es) pendiente(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener órdenes pendientes', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener órdenes urgentes
   */
  async getUrgentOrders() {
    try {
      this.logger.info('Obteniendo órdenes urgentes');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('prioridad', 'urgente')
        .in('estado', ['pendiente', 'confirmada', 'en_proceso'])
        .order('fecha_entrega_esperada', { ascending: true });

      if (error) {
        this.logger.error('Error al obtener órdenes urgentes', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontradas ${data.length} órdenes urgentes`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} orden(es) urgente(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener órdenes urgentes', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }
}

// Exportar instancia singleton
export const orderActionHandler = new OrderActionHandler();
export default OrderActionHandler;
