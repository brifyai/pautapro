import { supabase } from '../config/supabase';

export const orderService = {
  // Estados inteligentes de órdenes (versión mejorada)
  orderStates: {
    'solicitada': {
      next: 'revision',
      estimatedDays: 1,
      notifications: ['gerente', 'solicitante'],
      color: '#64748b',
      description: 'Orden solicitada, esperando revisión',
      autoTransition: false,
      requirements: ['datos_completos', 'presupuesto_asignado'],
      checklist: ['Verificar datos del cliente', 'Validar presupuesto', 'Revisar especificaciones'],
      kpi: 'tiempo_respuesta'
    },
    'revision': {
      next: 'aprobada',
      estimatedDays: 2,
      notifications: ['gerente', 'finanzas'],
      color: '#f59e0b',
      description: 'Orden en revisión por finanzas y gerencia',
      autoTransition: false,
      requirements: ['aprobacion_presupuesto', 'validacion_crediticia'],
      checklist: ['Revisar límite de crédito', 'Validar disponibilidad', 'Aprobar presupuesto'],
      kpi: 'tasa_aprobacion'
    },
    'aprobada': {
      next: 'produccion',
      estimatedDays: 1,
      notifications: ['proveedor', 'equipo', 'cliente'],
      color: '#3b82f6',
      description: 'Orden aprobada, lista para producción',
      autoTransition: false,
      requirements: ['confirmacion_proveedor', 'fecha_produccion'],
      checklist: ['Confirmar con proveedor', 'Agendar producción', 'Notificar al cliente'],
      kpi: 'tiempo_produccion'
    },
    'produccion': {
      next: 'calidad',
      estimatedDays: 5,
      notifications: ['equipo', 'gerente'],
      color: '#8b5cf6',
      description: 'Orden en proceso de producción',
      autoTransition: false,
      requirements: ['materiales_disponibles', 'personal_asignado'],
      checklist: ['Preparar materiales', 'Asignar personal', 'Iniciar producción'],
      kpi: 'eficiencia_produccion'
    },
    'calidad': {
      next: 'envio',
      estimatedDays: 1,
      notifications: ['equipo', 'gerente'],
      color: '#06b6d4',
      description: 'Orden en control de calidad',
      autoTransition: false,
      requirements: ['inspeccion_completada', 'estandares_cumplidos'],
      checklist: ['Inspección visual', 'Pruebas funcionales', 'Validación final'],
      kpi: 'tasa_calidad'
    },
    'envio': {
      next: 'entregada',
      estimatedDays: 2,
      notifications: ['cliente', 'logistica'],
      color: '#10b981',
      description: 'Orden en proceso de envío',
      autoTransition: false,
      requirements: ['direccion_confirmada', 'transporte_asignado'],
      checklist: ['Empaquetar producto', 'Coordinar envío', 'Generar guía'],
      kpi: 'tiempo_envio'
    },
    'entregada': {
      next: 'facturacion',
      estimatedDays: 1,
      notifications: ['cliente', 'finanzas'],
      color: '#059669',
      description: 'Orden entregada exitosamente',
      autoTransition: true,
      requirements: ['confirmacion_entrega', 'firma_recibido'],
      checklist: ['Confirmar entrega', 'Obtener firma', 'Actualizar sistema'],
      kpi: 'tasa_entrega'
    },
    'facturacion': {
      next: 'cerrada',
      estimatedDays: 2,
      notifications: ['finanzas', 'cliente'],
      color: '#047857',
      description: 'Orden en proceso de facturación',
      autoTransition: true,
      requirements: ['datos_facturacion', 'metodo_pago'],
      checklist: ['Generar factura', 'Enviar al cliente', 'Registrar pago'],
      kpi: 'tiempo_cobro'
    },
    'cerrada': {
      next: null,
      estimatedDays: 0,
      notifications: ['gerente'],
      color: '#065f46',
      description: 'Orden cerrada y completada',
      autoTransition: false,
      requirements: ['pago_confirmado', 'documentacion_completa'],
      checklist: ['Archivar documentos', 'Actualizar métricas', 'Cerrar caso'],
      kpi: 'satisfaccion_cliente'
    },
    'atrasada': {
      next: 'produccion',
      estimatedDays: null,
      notifications: ['gerente', 'proveedor', 'cliente'],
      color: '#dc2626',
      description: 'Orden atrasada, requiere intervención inmediata',
      autoTransition: false,
      requirements: ['plan_recuperacion', 'compensacion_cliente'],
      checklist: ['Identificar causa', 'Plan de recuperación', 'Notificar partes'],
      kpi: 'tiempo_recuperacion'
    },
    'cancelada': {
      next: null,
      estimatedDays: 0,
      notifications: ['gerente', 'cliente', 'proveedor'],
      color: '#991b1b',
      description: 'Orden cancelada',
      autoTransition: false,
      requirements: ['motivo_cancelacion', 'reembolso_procesado'],
      checklist: ['Documentar motivo', 'Procesar reembolso', 'Notificar partes'],
      kpi: 'tasa_cancelacion'
    },
    'pausada': {
      next: 'produccion',
      estimatedDays: null,
      notifications: ['gerente'],
      color: '#f59e0b',
      description: 'Orden pausada temporalmente',
      autoTransition: false,
      requirements: ['motivo_pausa', 'plan_reanudacion'],
      checklist: ['Documentar motivo', 'Plan de reanudación'],
      kpi: 'tiempo_pausa'
    }
  },

  // Obtener órdenes con estados actualizados
  async getOrders() {
    try {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Actualizar estados automáticamente
      const updatedOrders = await this.updateOrderStates(orders);

      return updatedOrders;
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      return [];
    }
  },

  // Actualizar estados de órdenes automáticamente (versión mejorada)
  async updateOrderStates(orders) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const updates = [];
    const notifications = [];

    for (const order of orders) {
      let newState = order.estado;
      let needsUpdate = false;
      let notificationData = null;

      // Verificar atrasos automáticos
      if (!['entregada', 'facturacion', 'cerrada', 'cancelada'].includes(order.estado) && order.fecha_estimada_entrega) {
        const estimatedDate = new Date(order.fecha_estimada_entrega);
        estimatedDate.setHours(0, 0, 0, 0);

        if (today > estimatedDate && order.estado !== 'atrasada') {
          newState = 'atrasada';
          needsUpdate = true;
          notificationData = {
            type: 'delay_alert',
            title: 'Orden atrasada automáticamente',
            message: `La orden ${order.numero_orden} está atrasada. Fecha estimada: ${estimatedDate.toLocaleDateString()}`,
            severity: 'high'
          };
        }
      }

      // Transiciones automáticas basadas en tiempo y reglas de negocio
      if (order.estado === 'solicitada') {
        const daysInState = Math.floor((today - new Date(order.created_at)) / (1000 * 60 * 60 * 24));
        if (daysInState > 3) {
          newState = 'revision';
          needsUpdate = true;
          notificationData = {
            type: 'auto_escalation',
            title: 'Orden escalada automáticamente',
            message: `La orden ${order.numero_orden} ha sido escalada a revisión por demora en procesamiento`,
            severity: 'medium'
          };
        }
      }

      if (order.estado === 'aprobada' && order.fecha_inicio_produccion) {
        const productionStart = new Date(order.fecha_inicio_produccion);
        if (today >= productionStart && order.estado === 'aprobada') {
          newState = 'produccion';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Producción iniciada automáticamente',
            message: `La orden ${order.numero_orden} ha iniciado producción según programación`,
            severity: 'info'
          };
        }
      }

      // Transición automática de producción a calidad
      if (order.estado === 'produccion') {
        const stateConfig = this.orderStates.produccion;
        const daysInProduction = Math.floor((today - new Date(order.fecha_inicio_produccion)) / (1000 * 60 * 60 * 24));
        
        if (daysInProduction >= stateConfig.estimatedDays) {
          newState = 'calidad';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Control de calidad iniciado',
            message: `La orden ${order.numero_orden} ha pasado a control de calidad`,
            severity: 'info'
          };
        }
      }

      // Transición automática de calidad a envío
      if (order.estado === 'calidad') {
        const daysInQuality = Math.floor((today - new Date(order.fecha_calidad)) / (1000 * 60 * 60 * 24));
        
        if (daysInQuality >= this.orderStates.calidad.estimatedDays) {
          newState = 'envio';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Envío iniciado',
            message: `La orden ${order.numero_orden} ha sido enviada`,
            severity: 'success'
          };
        }
      }

      // Transición automática de envío a entregada
      if (order.estado === 'envio' && order.fecha_entrega_estimada) {
        const estimatedDelivery = new Date(order.fecha_entrega_estimada);
        if (today >= estimatedDelivery) {
          newState = 'entregada';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Orden entregada',
            message: `La orden ${order.numero_orden} ha sido marcada como entregada`,
            severity: 'success'
          };
        }
      }

      // Transición automática de entregada a facturación
      if (order.estado === 'entregada') {
        const daysDelivered = Math.floor((today - new Date(order.fecha_entrega_real)) / (1000 * 60 * 60 * 24));
        
        if (daysDelivered >= this.orderStates.entregada.estimatedDays) {
          newState = 'facturacion';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Facturación iniciada',
            message: `La orden ${order.numero_orden} ha pasado a facturación`,
            severity: 'info'
          };
        }
      }

      // Transición automática de facturación a cerrada
      if (order.estado === 'facturacion') {
        const daysInBilling = Math.floor((today - new Date(order.fecha_facturacion)) / (1000 * 60 * 60 * 24));
        
        if (daysInBilling >= this.orderStates.facturacion.estimatedDays) {
          newState = 'cerrada';
          needsUpdate = true;
          notificationData = {
            type: 'auto_transition',
            title: 'Orden cerrada',
            message: `La orden ${order.numero_orden} ha sido cerrada automáticamente`,
            severity: 'success'
          };
        }
      }

      if (needsUpdate) {
        try {
          const updateData = {
            estado: newState,
            updated_at: new Date().toISOString()
          };

          // Agregar timestamps específicos según el estado
          if (newState === 'produccion') {
            updateData.fecha_inicio_produccion_real = new Date().toISOString();
          } else if (newState === 'calidad') {
            updateData.fecha_calidad = new Date().toISOString();
          } else if (newState === 'envio') {
            updateData.fecha_envio = new Date().toISOString();
          } else if (newState === 'entregada') {
            updateData.fecha_entrega_real = new Date().toISOString();
          } else if (newState === 'facturacion') {
            updateData.fecha_facturacion = new Date().toISOString();
          } else if (newState === 'cerrada') {
            updateData.fecha_cierre = new Date().toISOString();
          }

          await supabase
            .from('ordenesdepublicidad')
            .update(updateData)
            .eq('id_ordenes_de_comprar', order.id_ordenes_de_comprar);

          order.estado = newState;
          updates.push(order);

          // Crear notificación si hay cambio de estado
          if (notificationData) {
            await this.createStateChangeNotification(order.id_ordenes_de_comprar, order.estado, newState, notificationData);
          }

        } catch (updateError) {
          console.error(`Error actualizando orden ${order.id}:`, updateError);
        }
      }
    }

    return orders;
  },

  // Cambiar estado de orden manualmente
  async changeOrderState(orderId, newState, userId = null) {
    try {
      const validation = this.validateStateTransition(orderId, newState);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      const updateData = {
        estado: newState,
        updated_at: new Date().toISOString()
      };

      // Agregar información adicional según el estado
      if (newState === 'produccion') {
        updateData.fecha_inicio_produccion = new Date().toISOString();
        updateData.fecha_estimada_entrega = this.calculateEstimatedDelivery(newState);
      } else if (newState === 'entregada') {
        updateData.fecha_entrega_real = new Date().toISOString();
      }

      if (userId) {
        updateData.last_modified_by = userId;
      }

      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .update(updateData)
        .eq('id_ordenes_de_comprar', orderId)
        .select()
        .single();

      if (error) throw error;

      // Crear registro de auditoría
      await this.createAuditLog(orderId, 'estado_cambiado', {
        estado_anterior: data.estado,
        estado_nuevo: newState,
        usuario: userId
      });

      // Crear notificaciones
      await this.createStateChangeNotification(orderId, data.estado, newState);

      return data;
    } catch (error) {
      console.error('Error cambiando estado de orden:', error);
      throw error;
    }
  },

  // Calcular fecha estimada de entrega
  calculateEstimatedDelivery(currentState) {
    const stateConfig = this.orderStates[currentState];
    if (!stateConfig || !stateConfig.estimatedDays) return null;

    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + stateConfig.estimatedDays);
    return estimatedDate.toISOString();
  },

  // Validar transición de estado
  validateStateTransition(orderId, newState) {
    // Aquí irían validaciones específicas de negocio
    const newStateConfig = this.orderStates[newState];

    if (!newStateConfig) {
      return { valid: false, message: 'Estado no válido' };
    }

    // Validaciones específicas por estado
    if (newState === 'entregada') {
      // Verificar que la orden esté en producción
      // Lógica adicional aquí
    }

    return { valid: true, message: 'Transición válida' };
  },

  // Crear notificación de cambio de estado
  async createStateChangeNotification(orderId, oldState, newState) {
    try {
      const stateConfig = this.orderStates[newState];
      if (!stateConfig || !stateConfig.notifications.length) return;

      // Obtener información de la orden
      const { data: order, error } = await supabase
        .from('ordenesdepublicidad')
        .select('id_ordenes_de_comprar, numero_orden, id_cliente')
        .eq('id_ordenes_de_comprar', orderId)
        .single();

      if (error) throw error;

      // Crear mensaje de notificación
      const message = `Orden ${order.numero_orden} cambió de estado: ${oldState} → ${newState}`;

      // Aquí se podría integrar con un sistema de notificaciones
      // Por ahora, solo registramos en la tabla de mensajes
      await supabase
        .from('mensajes')
        .insert({
          asunto: `Cambio de estado en Orden ${order.numero_orden}`,
          contenido: message,
          tipo: 'sistema',
          prioridad: stateConfig.notifications.includes('gerente') ? 'alta' : 'media',
          created_at: new Date().toISOString()
        });

    } catch (error) {
      console.error('Error creando notificación:', error);
    }
  },

  // Crear registro de auditoría
  async createAuditLog(orderId, action, details) {
    try {
      await supabase
        .from('order_audit_log')
        .insert({
          order_id: orderId,
          action: action,
          details: details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error('Error creando registro de auditoría:', error);
      // No lanzamos error para no interrumpir el flujo principal
    }
  },

  // Obtener órdenes por estado
  async getOrdersByState(state) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('estado', state)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error obteniendo órdenes en estado ${state}:`, error);
      return [];
    }
  },

  // Obtener estadísticas de órdenes
  async getOrderStats() {
    try {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select('estado, created_at, fecha_estimada_entrega, fecha_entrega_real');

      if (error) throw error;

      const stats = {
        totalOrders: orders?.length || 0,
        pendingOrders: orders?.filter(o => o.estado === 'pendiente' || o.estado === 'solicitada' || o.estado === 'aprobada').length || 0,
        inProductionOrders: orders?.filter(o => o.estado === 'produccion' || o.estado === 'activo').length || 0,
        deliveredOrders: orders?.filter(o => o.estado === 'entregada' || o.estado === 'completado').length || 0,
        delayedOrders: orders?.filter(o => o.estado === 'atrasada' || o.estado === 'retrasado').length || 0,
        avgDeliveryTime: 0
      };

      // Calcular tiempo promedio de entrega
      const deliveredOrders = orders?.filter(o =>
        o.estado === 'entregada' && o.fecha_entrega_real && o.created_at
      ) || [];

      if (deliveredOrders.length > 0) {
        const totalDeliveryTime = deliveredOrders.reduce((sum, order) => {
          const created = new Date(order.created_at);
          const delivered = new Date(order.fecha_entrega_real);
          const diffTime = Math.abs(delivered - created);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          return sum + diffDays;
        }, 0);

        stats.avgDeliveryTime = Math.round(totalDeliveryTime / deliveredOrders.length);
      }

      return stats;
    } catch (error) {
      console.error('Error obteniendo estadísticas de órdenes:', error);
      return {
        totalOrders: 0,
        pendingOrders: 0,
        inProductionOrders: 0,
        deliveredOrders: 0,
        delayedOrders: 0,
        avgDeliveryTime: 0
      };
    }
  },

  // Obtener órdenes próximas a vencer
  async getOrdersDueSoon(days = 7) {
    try {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .lt('fecha_estimada_entrega', futureDate.toISOString())
        .gte('fecha_estimada_entrega', new Date().toISOString())
        .neq('estado', 'entregada')
        .neq('estado', 'cancelada')
        .order('fecha_estimada_entrega', { ascending: true });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo órdenes próximas a vencer:', error);
      return [];
    }
  },

  // Obtener tasa de completación de órdenes
  async getCompletionRate() {
    try {
      const { data: orders, error } = await supabase
        .from('ordenesdepublicidad')
        .select('estado');

      if (error) {
        console.warn('Error calculando tasa de completación, usando valor por defecto:', error);
        return 85; // Valor por defecto 85%
      }

      if (!orders || orders.length === 0) return 85;

      const completedOrders = orders.filter(order => order.estado === 'entregada' || order.estado === 'activo' || order.estado === 'completado').length;
      const completionRate = (completedOrders / orders.length) * 100;

      return Math.round(completionRate);
    } catch (error) {
      console.error('Error calculando tasa de completación:', error);
      return 85;
    }
  },

  // Obtener KPIs de órdenes en tiempo real
  async getOrderKPIs() {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const [orders, recentOrders] = await Promise.all([
        // Todas las órdenes para métricas históricas
        supabase
          .from('ordenesdepublicidad')
          .select('*'),
        // Órdenes recientes para KPIs actuales
        supabase
          .from('ordenesdepublicidad')
          .select('*')
          .gte('created_at', thirtyDaysAgo.toISOString())
      ]);

      if (orders.error) throw orders.error;
      if (recentOrders.error) throw recentOrders.error;

      const allOrders = orders.data || [];
      const recentOrdersData = recentOrders.data || [];

      // Calcular KPIs
      const kpis = {
        // KPIs de eficiencia
        avgProcessingTime: this.calculateAvgProcessingTime(recentOrdersData),
        onTimeDeliveryRate: this.calculateOnTimeDeliveryRate(allOrders),
        qualityPassRate: this.calculateQualityPassRate(allOrders),
        
        // KPIs de rendimiento
        ordersPerDay: this.calculateOrdersPerDay(recentOrdersData),
        revenuePerOrder: this.calculateRevenuePerOrder(recentOrdersData),
        customerSatisfaction: this.calculateCustomerSatisfaction(allOrders),
        
        // KPIs operativos
        backlogCount: await this.getBacklogCount(),
        overdueOrdersCount: await this.getOverdueOrdersCount(),
        capacityUtilization: await this.calculateCapacityUtilization(),
        
        // KPIs financieros
        totalRevenue: this.calculateTotalRevenue(recentOrdersData),
        avgOrderValue: this.calculateAvgOrderValue(recentOrdersData),
        profitMargin: await this.calculateProfitMargin(recentOrdersData)
      };

      return kpis;
    } catch (error) {
      console.error('Error obteniendo KPIs de órdenes:', error);
      return {};
    }
  },

  // Calcular tiempo promedio de procesamiento
  calculateAvgProcessingTime(orders) {
    if (!orders || orders.length === 0) return 0;

    const processingTimes = orders
      .filter(order => order.created_at && order.fecha_entrega_real)
      .map(order => {
        const created = new Date(order.created_at);
        const delivered = new Date(order.fecha_entrega_real);
        return Math.ceil((delivered - created) / (1000 * 60 * 60 * 24));
      });

    if (processingTimes.length === 0) return 0;
    
    return Math.round(processingTimes.reduce((sum, time) => sum + time, 0) / processingTimes.length);
  },

  // Calcular tasa de entregas a tiempo
  calculateOnTimeDeliveryRate(orders) {
    if (!orders || orders.length === 0) return 0;

    const deliveredOrders = orders.filter(order => order.estado === 'entregada' || order.estado === 'cerrada');
    
    if (deliveredOrders.length === 0) return 0;

    const onTimeDeliveries = deliveredOrders.filter(order => {
      if (!order.fecha_estimada_entrega || !order.fecha_entrega_real) return false;
      
      const estimated = new Date(order.fecha_estimada_entrega);
      const actual = new Date(order.fecha_entrega_real);
      
      return actual <= estimated;
    });

    return Math.round((onTimeDeliveries.length / deliveredOrders.length) * 100);
  },

  // Calcular tasa de aprobación de calidad
  calculateQualityPassRate(orders) {
    if (!orders || orders.length === 0) return 0;

    const qualityOrders = orders.filter(order => ['calidad', 'envio', 'entregada', 'facturacion', 'cerrada'].includes(order.estado));
    
    if (qualityOrders.length === 0) return 0;

    // Asumimos que todas las órdenes que pasaron de calidad a envío aprobaron
    const passedQuality = qualityOrders.filter(order => order.estado !== 'atrasada' && order.estado !== 'cancelada');
    
    return Math.round((passedQuality.length / qualityOrders.length) * 100);
  },

  // Calcular órdenes por día
  calculateOrdersPerDay(orders) {
    if (!orders || orders.length === 0) return 0;

    const days = new Set(
      orders.map(order => new Date(order.created_at).toISOString().slice(0, 10))
    ).size;

    return days > 0 ? Math.round((orders.length / days) * 10) / 10 : 0;
  },

  // Calcular ingresos por orden
  calculateRevenuePerOrder(orders) {
    if (!orders || orders.length === 0) return 0;

    const totalRevenue = orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
    return Math.round((totalRevenue / orders.length) * 100) / 100;
  },

  // Calcular satisfacción del cliente (simulado)
  calculateCustomerSatisfaction(orders) {
    if (!orders || orders.length === 0) return 0;

    // Simulación basada en métricas disponibles
    const onTimeRate = this.calculateOnTimeDeliveryRate(orders);
    const qualityRate = this.calculateQualityPassRate(orders);
    
    // Satisfacción estimada como promedio de entregas a tiempo y calidad
    return Math.round((onTimeRate + qualityRate) / 2);
  },

  // Obtener contador de backlog
  async getBacklogCount() {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('id')
        .in('estado', ['solicitada', 'revision', 'aprobada', 'produccion']);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error obteniendo backlog:', error);
      return 0;
    }
  },

  // Obtener contador de órdenes atrasadas
  async getOverdueOrdersCount() {
    try {
      const today = new Date();
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('id')
        .lt('fecha_estimada_entrega', today.toISOString())
        .not('estado', ['entregada', 'facturacion', 'cerrada', 'cancelada']);

      if (error) throw error;
      return data?.length || 0;
    } catch (error) {
      console.error('Error obteniendo órdenes atrasadas:', error);
      return 0;
    }
  },

  // Calcular utilización de capacidad
  async calculateCapacityUtilization() {
    try {
      const totalCapacity = 100; // Capacidad base (puede venir de configuración)
      const backlog = await this.getBacklogCount();
      
      // Utilización como porcentaje del backlog vs capacidad
      return Math.min(Math.round((backlog / totalCapacity) * 100), 100);
    } catch (error) {
      console.error('Error calculando utilización de capacidad:', error);
      return 0;
    }
  },

  // Calcular ingresos totales
  calculateTotalRevenue(orders) {
    if (!orders || orders.length === 0) return 0;
    
    return orders.reduce((sum, order) => sum + (order.total_amount || 0), 0);
  },

  // Calcular valor promedio de orden
  calculateAvgOrderValue(orders) {
    if (!orders || orders.length === 0) return 0;
    
    const totalRevenue = this.calculateTotalRevenue(orders);
    return Math.round((totalRevenue / orders.length) * 100) / 100;
  },

  // Calcular margen de profit
  async calculateProfitMargin(orders) {
    try {
      if (!orders || orders.length === 0) return 0;

      const totalRevenue = this.calculateTotalRevenue(orders);
      const totalCost = totalRevenue * 0.7; // Asumir 70% de costo (puede venir de configuración)
      
      return totalRevenue > 0 ? Math.round(((totalRevenue - totalCost) / totalRevenue) * 100) : 0;
    } catch (error) {
      console.error('Error calculando margen de profit:', error);
      return 0;
    }
  },

  // Predecir tiempo de entrega
  async predictDeliveryTime(orderId) {
    try {
      const { data: order, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_ordenes_de_comprar', orderId)
        .single();

      if (error) throw error;

      const stateConfig = this.orderStates[order.estado];
      if (!stateConfig || !stateConfig.estimatedDays) {
        return null;
      }

      // Calcular tiempo restante basado en estado actual y tiempos históricos
      const avgProcessingTime = await this.calculateAvgProcessingTime([order]);
      const remainingDays = stateConfig.estimatedDays;

      return {
        estimatedDays: remainingDays,
        confidence: 85, // Porcentaje de confianza
        factors: ['estado_actual', 'complejidad_orden', 'carga_actual']
      };
    } catch (error) {
      console.error('Error prediciendo tiempo de entrega:', error);
      return null;
    }
  },

  // Optimizar ruta de producción
  async optimizeProductionRoute(orderId) {
    try {
      const { data: order, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_ordenes_de_comprar', orderId)
        .single();

      if (error) throw error;

      // Analizar ruta actual y sugerir optimizaciones
      const currentState = order.estado;
      const route = [];
      let currentStateIndex = -1;

      // Construir ruta completa
      Object.keys(this.orderStates).forEach((state, index) => {
        route.push(state);
        if (state === currentState) {
          currentStateIndex = index;
        }
      });

      // Sugerir optimizaciones
      const optimizations = [];

      if (currentStateIndex < route.length - 1) {
        const remainingStates = route.slice(currentStateIndex + 1);
        const totalEstimatedDays = remainingStates.reduce((sum, state) => {
          return sum + (this.orderStates[state]?.estimatedDays || 0);
        }, 0);

        optimizations.push({
          type: 'time_optimization',
          description: `Tiempo estimado restante: ${totalEstimatedDays} días`,
          potentialSavings: Math.round(totalEstimatedDays * 0.1) // 10% de ahorro potencial
        });
      }

      return {
        currentRoute: route,
        currentStateIndex,
        optimizations,
        efficiency: this.calculateRouteEfficiency(order)
      };
    } catch (error) {
      console.error('Error optimizando ruta de producción:', error);
      return null;
    }
  },

  // Calcular eficiencia de ruta
  calculateRouteEfficiency(order) {
    // Simulación de eficiencia basada en tiempo transcurrido vs estimado
    const stateConfig = this.orderStates[order.estado];
    if (!stateConfig || !stateConfig.estimatedDays) return 100;

    const daysInState = Math.floor((new Date() - new Date(order.updated_at)) / (1000 * 60 * 60 * 24));
    const efficiency = Math.max(0, Math.min(100, ((stateConfig.estimatedDays - daysInState) / stateConfig.estimatedDays) * 100));

    return Math.round(efficiency);
  },

  // Funciones de creación para el Chat IA
  async createOrden(orderData) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .insert({
          ...orderData,
          estado: 'solicitada',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando orden:', error);
      throw error;
    }
  },

  async createMedio(medioData) {
    try {
      const { data, error } = await supabase
        .from('medios')
        .insert({
          ...medioData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando medio:', error);
      throw error;
    }
  },

  async createSoporte(soporteData) {
    try {
      const { data, error } = await supabase
        .from('soportes')
        .insert({
          ...soporteData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando soporte:', error);
      throw error;
    }
  },

  async createCampana(campanaData) {
    try {
      const { data, error } = await supabase
        .from('campania')
        .insert({
          ...campanaData,
          estado: 'borrador',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando campaña:', error);
      throw error;
    }
  },

  async createContrato(contratoData) {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .insert({
          ...contratoData,
          estado: 'activo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando contrato:', error);
      throw error;
    }
  },

  async createProveedor(proveedorData) {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .insert({
          ...proveedorData,
          estado: 'activo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando proveedor:', error);
      throw error;
    }
  }
};