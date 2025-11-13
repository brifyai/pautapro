const express = require('express');
const { authenticateToken, requirePermission, withLogging, supabase, logger } = require('../server');

const router = express.Router();

// Middleware global para todas las rutas de órdenes
router.use(authenticateToken);
router.use('/api/v2/ordenes', requirePermission('ordenes.read'));

// GET /api/v2/ordenes - Listar órdenes con filtros avanzados
router.get('/', withLogging(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      id_cliente,
      estado,
      fecha_desde,
      fecha_hasta,
      tipo_orden,
      medio,
      sort_by = 'fecha_creacion',
      sort_order = 'desc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('ordenes')
      .select(`
        *,
        Clientes (
          id_cliente,
          nombrecliente,
          rut,
          email
        ),
        Campañas (
          id_campania,
          nombre
        ),
        Medios (
          id,
          nombremedios,
          tipo_medio
        ),
        Contratos (
          num_contrato,
          fecha_inicio,
          fecha_termino
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`numero_orden.ilike.%${search}%,observaciones.ilike.%${search}%`);
    }

    if (id_cliente) {
      query = query.eq('id_cliente', id_cliente);
    }

    if (estado) {
      query = query.eq('estado', estado);
    }

    if (fecha_desde) {
      query = query.gte('fecha_creacion', fecha_desde);
    }

    if (fecha_hasta) {
      query = query.lte('fecha_creacion', fecha_hasta);
    }

    if (tipo_orden) {
      query = query.eq('tipo_orden', tipo_orden);
    }

    // Aplicar ordenamiento
    query = query
      .order(sort_by, { ascending: sort_order.toLowerCase() === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: ordenes, error, count } = await query;

    if (error) {
      logger.error('Error consultando órdenes:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Enriquecer datos con métricas adicionales
    const ordenesEnriquecidas = await Promise.all(ordenes.map(async (orden) => {
      // Obtener alternativas de la orden
      const { data: alternativas } = await supabase
        .from('alternativas')
        .select(`
          *,
          Medios (nombremedios),
          Soportes (nombresoporte)
        `)
        .eq('id_orden', orden.id);

      return {
        ...orden,
        alternativas: alternativas || [],
        total_alternativas: alternativas?.length || 0
      };
    }));

    // Calcular estadísticas
    const estadisticas = {
      total_ordenes: count,
      ordenes_activas: ordenes.filter(o => o.estado === 'activa').length,
      ordenes_pendientes: ordenes.filter(o => o.estado === 'pendiente').length,
      ordenes_completadas: ordenes.filter(o => o.estado === 'completada').length,
      inversion_total: ordenes.reduce((sum, o) => sum + (o.total || 0), 0)
    };

    res.json({
      success: true,
      data: ordenesEnriquecidas,
      estadisticas,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        total_pages: Math.ceil(count / limit)
      },
      filters: {
        search,
        id_cliente,
        estado,
        fecha_desde,
        fecha_hasta,
        tipo_orden
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /ordenes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/v2/ordenes/:id - Obtener orden específica
router.get('/:id', withLogging(async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de orden inválido',
        code: 'INVALID_ORDER_ID'
      });
    }

    // Obtener orden con datos relacionados
    const { data: orden, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        Clientes (
          id_cliente,
          nombrecliente,
          rut,
          email,
          razonsocial
        ),
        Campañas (
          id_campania,
          nombre,
          descripcion
        ),
        Medios (
          id,
          nombremedios,
          tipo_medio
        ),
        Contratos (
          num_contrato,
          fecha_inicio,
          fecha_termino
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Orden no encontrada',
          code: 'ORDER_NOT_FOUND'
        });
      }
      
      logger.error('Error consultando orden:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Obtener alternativas asociadas
    const { data: alternativas } = await supabase
      .from('alternativas')
      .select(`
        *,
        Medios (nombremedios, tipo_medio),
        Soportes (nombresoporte),
        Programas (nombreprograma)
      `)
      .eq('id_orden', orden.id);

    // Obtener historial de estados
    const { data: historialEstados } = await supabase
      .from('historial_ordenes')
      .select(`
        *,
        Usuarios (nombre, apellido)
      `)
      .eq('id_orden', orden.id)
      .order('fecha_cambio', { ascending: false });

    res.json({
      success: true,
      data: {
        ...orden,
        alternativas: alternativas || [],
        historial_estados: historialEstados || [],
        estadisticas: {
          total_alternativas: alternativas?.length || 0,
          medios_utilizados: [...new Set(alternativas?.map(a => a.Medios?.nombremedios).filter(Boolean))],
          soportes_utilizados: [...new Set(alternativas?.map(a => a.Soportes?.nombresoporte).filter(Boolean))]
        }
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /ordenes/:id:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// POST /api/v2/ordenes - Crear nueva orden
router.post('/',
  requirePermission('ordenes.create'),
  withLogging(async (req, res) => {
    try {
      const {
        id_cliente,
        id_campania,
        numero_orden,
        tipo_orden,
        descripcion,
        observaciones,
        fecha_inicio,
        fecha_termino,
        total,
        iva,
        descuento,
        recargo,
        estado = 'pendiente'
      } = req.body;

      // Validaciones
      const erroresValidacion = [];

      if (!id_cliente) {
        erroresValidacion.push('El ID del cliente es obligatorio');
      }

      if (!numero_orden?.trim()) {
        erroresValidacion.push('El número de orden es obligatorio');
      }

      if (!tipo_orden?.trim()) {
        erroresValidacion.push('El tipo de orden es obligatorio');
      }

      if (erroresValidacion.length > 0) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: erroresValidacion
        });
      }

      // Verificar que el cliente existe
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .eq('id_cliente', id_cliente)
        .single();

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          code: 'CLIENT_NOT_FOUND'
        });
      }

      // Verificar que el número de orden no esté duplicado
      const { data: ordenExistente } = await supabase
        .from('ordenes')
        .select('id')
        .eq('numero_orden', numero_orden.trim())
        .single();

      if (ordenExistente) {
        return res.status(409).json({
          error: 'Ya existe una orden con este número',
          code: 'DUPLICATE_ORDER_NUMBER'
        });
      }

      // Si se proporciona campaña, verificar que existe
      if (id_campania) {
        const { data: campana } = await supabase
          .from('campañas')
          .select('id_campania')
          .eq('id_campania', id_campania)
          .single();

        if (!campana) {
          return res.status(404).json({
            error: 'Campaña no encontrada',
            code: 'CAMPAIGN_NOT_FOUND'
          });
        }
      }

      // Preparar datos de la orden
      const datosOrden = {
        id_cliente: parseInt(id_cliente),
        id_campania: id_campania ? parseInt(id_campania) : null,
        numero_orden: numero_orden.trim(),
        tipo_orden: tipo_orden.trim(),
        descripcion: descripcion?.trim() || null,
        observaciones: observaciones?.trim() || null,
        fecha_inicio: fecha_inicio || null,
        fecha_termino: fecha_termino || null,
        total: total ? parseFloat(total) : 0,
        iva: iva ? parseFloat(iva) : 0,
        descuento: descuento ? parseFloat(descuento) : 0,
        recargo: recargo ? parseFloat(recargo) : 0,
        estado: estado,
        fecha_creacion: new Date().toISOString(),
        creado_por: req.user.id_usuario
      };

      // Insertar orden
      const { data: nuevaOrden, error } = await supabase
        .from('ordenes')
        .insert([datosOrden])
        .select(`
          *,
          Clientes (nombrecliente),
          Campañas (nombre)
        `)
        .single();

      if (error) {
        logger.error('Error creando orden:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Registrar en historial de estados
      await supabase
        .from('historial_ordenes')
        .insert({
          id_orden: nuevaOrden.id,
          estado_anterior: null,
          estado_nuevo: estado,
          fecha_cambio: new Date().toISOString(),
          cambiado_por: req.user.id_usuario,
          observaciones: 'Orden creada'
        });

      // Enviar webhook si está configurado
      try {
        await enviarWebhook('orden.creada', {
          orden_id: nuevaOrden.id,
          cliente_id: nuevaOrden.id_cliente,
          numero_orden: nuevaOrden.numero_orden,
          estado: nuevaOrden.estado,
          total: nuevaOrden.total
        });
      } catch (webhookError) {
        logger.warn('Error enviando webhook de orden creada:', webhookError);
        // No fallar la operación por error de webhook
      }

      // Log de actividad
      logger.info('Orden creada exitosamente', {
        orderId: nuevaOrden.id,
        orderNumber: nuevaOrden.numero_orden,
        clientId: nuevaOrden.id_cliente,
        createdBy: req.user.id_usuario,
        data: datosOrden
      });

      res.status(201).json({
        success: true,
        message: 'Orden creada exitosamente',
        data: nuevaOrden
      });

    } catch (error) {
      logger.error('Error inesperado en POST /ordenes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// PUT /api/v2/ordenes/:id - Actualizar orden
router.put('/:id',
  requirePermission('ordenes.update'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validar que el ID sea numérico
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          error: 'ID de orden inválido',
          code: 'INVALID_ORDER_ID'
        });
      }

      // Verificar que la orden existe
      const { data: ordenExistente, error: ordenError } = await supabase
        .from('ordenes')
        .select('*')
        .eq('id', id)
        .single();

      if (ordenError) {
        if (ordenError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Orden no encontrada',
            code: 'ORDER_NOT_FOUND'
          });
        }
        
        logger.error('Error verificando orden:', ordenError);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Si se está actualizando el número de orden, verificar que no esté duplicado
      if (updateData.numero_orden && updateData.numero_orden !== ordenExistente.numero_orden) {
        const { data: ordenNumero } = await supabase
          .from('ordenes')
          .select('id')
          .eq('numero_orden', updateData.numero_orden)
          .neq('id', id)
          .single();

        if (ordenNumero) {
          return res.status(409).json({
            error: 'Ya existe otra orden con este número',
            code: 'DUPLICATE_ORDER_NUMBER'
          });
        }
      }

      // Si se está actualizando el cliente, verificar que existe
      if (updateData.id_cliente && updateData.id_cliente !== ordenExistente.id_cliente) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('id_cliente')
          .eq('id_cliente', updateData.id_cliente)
          .single();

        if (!cliente) {
          return res.status(404).json({
            error: 'Cliente no encontrado',
            code: 'CLIENT_NOT_FOUND'
          });
        }
      }

      // Preparar datos de actualización
      const datosActualizacion = {
        ...updateData,
        fecha_modificacion: new Date().toISOString()
      };

      // Remover campos que no se pueden actualizar directamente
      delete datosActualizacion.id;
      delete datosActualizacion.fecha_creacion;
      delete datosActualizacion.creado_por;

      // Convertir campos numéricos si existen
      if (datosActualizacion.id_cliente) datosActualizacion.id_cliente = parseInt(datosActualizacion.id_cliente);
      if (datosActualizacion.id_campania) datosActualizacion.id_campania = parseInt(datosActualizacion.id_campania);
      if (datosActualizacion.total) datosActualizacion.total = parseFloat(datosActualizacion.total);
      if (datosActualizacion.iva) datosActualizacion.iva = parseFloat(datosActualizacion.iva);
      if (datosActualizacion.descuento) datosActualizacion.descuento = parseFloat(datosActualizacion.descuento);
      if (datosActualizacion.recargo) datosActualizacion.recargo = parseFloat(datosActualizacion.recargo);

      // Actualizar orden
      const { data: ordenActualizada, error } = await supabase
        .from('ordenes')
        .update(datosActualizacion)
        .eq('id', id)
        .select(`
          *,
          Clientes (nombrecliente),
          Campañas (nombre)
        `)
        .single();

      if (error) {
        logger.error('Error actualizando orden:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Si cambió el estado, registrar en historial
      if (updateData.estado && updateData.estado !== ordenExistente.estado) {
        await supabase
          .from('historial_ordenes')
          .insert({
            id_orden: ordenActualizada.id,
            estado_anterior: ordenExistente.estado,
            estado_nuevo: updateData.estado,
            fecha_cambio: new Date().toISOString(),
            cambiado_por: req.user.id_usuario,
            observaciones: updateData.observaciones_estado || 'Estado actualizado'
          });

        // Enviar webhook de cambio de estado
        try {
          await enviarWebhook('orden.estado_cambiado', {
            orden_id: ordenActualizada.id,
            estado_anterior: ordenExistente.estado,
            estado_nuevo: updateData.estado,
            fecha_cambio: new Date().toISOString()
          });
        } catch (webhookError) {
          logger.warn('Error enviando webhook de cambio de estado:', webhookError);
        }
      }

      // Log de actividad
      logger.info('Orden actualizada exitosamente', {
        orderId: id,
        orderNumber: ordenActualizada.numero_orden,
        updatedBy: req.user.id_usuario,
        changes: datosActualizacion
      });

      res.json({
        success: true,
        message: 'Orden actualizada exitosamente',
        data: ordenActualizada
      });

    } catch (error) {
      logger.error('Error inesperado en PUT /ordenes/:id:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// POST /api/v2/ordenes/:id/alternativas - Agregar alternativa a orden
router.post('/:id/alternativas',
  requirePermission('alternativas.create'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;
      const alternativaData = req.body;

      // Verificar que la orden existe
      const { data: orden } = await supabase
        .from('ordenes')
        .select('id, numero_orden, estado')
        .eq('id', id)
        .single();

      if (!orden) {
        return res.status(404).json({
          error: 'Orden no encontrada',
          code: 'ORDER_NOT_FOUND'
        });
      }

      // Verificar que la orden está en estado que permite agregar alternativas
      if (!['pendiente', 'activa'].includes(orden.estado)) {
        return res.status(400).json({
          error: 'No se pueden agregar alternativas a una orden en este estado',
          code: 'INVALID_ORDER_STATE'
        });
      }

      // Preparar datos de la alternativa
      const datosAlternativa = {
        id_orden: parseInt(id),
        ...alternativaData,
        fecha_creacion: new Date().toISOString(),
        creado_por: req.user.id_usuario
      };

      // Insertar alternativa
      const { data: nuevaAlternativa, error } = await supabase
        .from('alternativas')
        .insert([datosAlternativa])
        .select(`
          *,
          Medios (nombremedios),
          Soportes (nombresoporte)
        `)
        .single();

      if (error) {
        logger.error('Error creando alternativa:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Log de actividad
      logger.info('Alternativa agregada a orden exitosamente', {
        orderId: id,
        alternativeId: nuevaAlternativa.id,
        addedBy: req.user.id_usuario
      });

      res.status(201).json({
        success: true,
        message: 'Alternativa agregada exitosamente',
        data: nuevaAlternativa
      });

    } catch (error) {
      logger.error('Error inesperado en POST /ordenes/:id/alternativas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// Función auxiliar para enviar webhooks
async function enviarWebhook(evento, data) {
  try {
    // Obtener webhooks activos para este evento
    const { data: webhooks } = await supabase
      .from('webhooks')
      .select('*')
      .eq('evento', evento)
      .eq('activo', true);

    if (!webhooks || webhooks.length === 0) return;

    // Enviar a cada webhook
    for (const webhook of webhooks) {
      try {
        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'PautaPro-API/2.0',
            'X-Webhook-Event': evento,
            'X-Webhook-Signature': generarFirma(webhook.secret, JSON.stringify(data))
          },
          body: JSON.stringify({
            evento,
            timestamp: new Date().toISOString(),
            data
          })
        });

        if (!response.ok) {
          logger.warn(`Webhook ${webhook.id} falló con status ${response.status}`);
          
          // Actualizar estadísticas del webhook
          await supabase
            .from('webhook_logs')
            .insert({
              webhook_id: webhook.id,
              evento,
              status: response.status,
              response_time: Date.now() - webhook.created_at.getTime()
            });
        } else {
          logger.info(`Webhook ${webhook.id} enviado exitosamente`);
        }
      } catch (webhookError) {
        logger.error(`Error enviando webhook ${webhook.id}:`, webhookError);
      }
    }
  } catch (error) {
    logger.error('Error procesando webhooks:', error);
  }
}

// Función auxiliar para generar firma de webhook
function generarFirma(secret, payload) {
  const crypto = require('crypto');
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

module.exports = router;