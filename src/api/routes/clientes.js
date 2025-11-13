const express = require('express');
const { authenticateToken, requirePermission, withLogging, supabase, logger } = require('../server');

const router = express.Router();

// Middleware global para todas las rutas de clientes
router.use(authenticateToken);
router.use('/api/v2/clientes', requirePermission('clientes.read'));

// GET /api/v2/clientes - Listar clientes con filtros avanzados
router.get('/', withLogging(async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search,
      id_region,
      id_comuna,
      id_grupo,
      id_tipo_cliente,
      estado,
      sort_by = 'nombrecliente',
      sort_order = 'asc'
    } = req.query;

    const offset = (page - 1) * limit;

    // Construir query base
    let query = supabase
      .from('clientes')
      .select(`
        *,
        Grupos (
          id_grupo,
          nombre_grupo
        ),
        TiposCliente (
          id,
          nombretipocliente
        ),
        Region (
          id,
          nombreregion
        ),
        Comunas (
          id,
          nombrecomuna
        )
      `, { count: 'exact' });

    // Aplicar filtros
    if (search) {
      query = query.or(`nombrecliente.ilike.%${search}%,rut.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (id_region) {
      query = query.eq('id_region', id_region);
    }

    if (id_comuna) {
      query = query.eq('id_comuna', id_comuna);
    }

    if (id_grupo) {
      query = query.eq('id_grupo', id_grupo);
    }

    if (id_tipo_cliente) {
      query = query.eq('id_tipo_cliente', id_tipo_cliente);
    }

    if (estado !== undefined) {
      query = query.eq('estado', estado === 'true');
    }

    // Aplicar ordenamiento
    query = query
      .order(sort_by, { ascending: sort_order.toLowerCase() === 'asc' })
      .range(offset, offset + parseInt(limit) - 1);

    const { data: clientes, error, count } = await query;

    if (error) {
      logger.error('Error consultando clientes:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Enriquecer datos con métricas adicionales
    const clientesEnriquecidos = await Promise.all(clientes.map(async (cliente) => {
      // Obtener estadísticas del cliente
      const { data: ordenStats } = await supabase
        .from('ordenes')
        .select('id, estado, total')
        .eq('id_cliente', cliente.id_cliente);

      const { data: campanaStats } = await supabase
        .from('campañas')
        .select('id, estado')
        .eq('id_cliente', cliente.id_cliente);

      return {
        ...cliente,
        estadisticas: {
          total_ordenes: ordenStats?.length || 0,
          ordenes_activas: ordenStats?.filter(o => o.estado === 'activa').length || 0,
          total_campanas: campanaStats?.length || 0,
          campanas_activas: campanaStats?.filter(c => c.estado === 'activa').length || 0,
          inversion_total: ordenStats?.reduce((sum, o) => sum + (o.total || 0), 0) || 0
        }
      };
    }));

    res.json({
      success: true,
      data: clientesEnriquecidos,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        total_pages: Math.ceil(count / limit)
      },
      filters: {
        search,
        id_region,
        id_comuna,
        id_grupo,
        id_tipo_cliente,
        estado
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /clientes:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// GET /api/v2/clientes/:id - Obtener cliente específico
router.get('/:id', withLogging(async (req, res) => {
  try {
    const { id } = req.params;

    // Validar que el ID sea numérico
    if (!/^\d+$/.test(id)) {
      return res.status(400).json({
        error: 'ID de cliente inválido',
        code: 'INVALID_CLIENT_ID'
      });
    }

    // Obtener cliente con datos relacionados
    const { data: cliente, error } = await supabase
      .from('clientes')
      .select(`
        *,
        Grupos (
          id_grupo,
          nombre_grupo
        ),
        TiposCliente (
          id,
          nombretipocliente
        ),
        Region (
          id,
          nombreregion
        ),
        Comunas (
          id,
          nombrecomuna
        ),
        ContactoCliente (*),
        Comisiones (*),
        Productos (*)
      `)
      .eq('id_cliente', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          code: 'CLIENT_NOT_FOUND'
        });
      }
      
      logger.error('Error consultando cliente:', error);
      return res.status(500).json({
        error: 'Error interno del servidor',
        code: 'DATABASE_ERROR'
      });
    }

    // Obtener estadísticas adicionales
    const { data: ordenes } = await supabase
      .from('ordenes')
      .select('id, estado, total, created_at')
      .eq('id_cliente', cliente.id_cliente)
      .order('created_at', { ascending: false })
      .limit(10);

    const { data: campanas } = await supabase
      .from('campañas')
      .select('id, nombre, estado, created_at')
      .eq('id_cliente', cliente.id_cliente)
      .order('created_at', { ascending: false })
      .limit(10);

    // Calcular métricas de rendimiento
    const ordenesActivas = ordenes?.filter(o => o.estado === 'activa').length || 0;
    const inversionTotal = ordenes?.reduce((sum, o) => sum + (o.total || 0), 0) || 0;
    const promedioOrdenes = ordenes?.length > 0 ? inversionTotal / ordenes.length : 0;

    res.json({
      success: true,
      data: {
        ...cliente,
        estadisticas: {
          total_ordenes: ordenes?.length || 0,
          ordenes_activas: ordenesActivas,
          total_campanas: campanas?.length || 0,
          inversion_total: inversionTotal,
          promedio_por_orden: promedioOrdenes,
          ordenes_recientes: ordenes || [],
          campanas_recientes: campanas || []
        }
      }
    });

  } catch (error) {
    logger.error('Error inesperado en GET /clientes/:id:', error);
    res.status(500).json({
      error: 'Error interno del servidor',
      code: 'INTERNAL_ERROR'
    });
  }
}));

// POST /api/v2/clientes - Crear nuevo cliente
router.post('/', 
  requirePermission('clientes.create'),
  withLogging(async (req, res) => {
    try {
      const {
        nombrecliente,
        nombrefantasia,
        razonsocial,
        rut,
        id_region,
        id_comuna,
        direccion,
        email,
        telefono,
        giro,
        id_grupo,
        id_tipo_cliente,
        nombrerepresentantelegal,
        rut_representante
      } = req.body;

      // Validaciones
      const erroresValidacion = [];

      if (!nombrecliente?.trim()) {
        erroresValidacion.push('El nombre del cliente es obligatorio');
      }

      if (!rut?.trim()) {
        erroresValidacion.push('El RUT es obligatorio');
      }

      if (!email?.trim()) {
        erroresValidacion.push('El email es obligatorio');
      }

      if (erroresValidacion.length > 0) {
        return res.status(400).json({
          error: 'Datos de entrada inválidos',
          code: 'VALIDATION_ERROR',
          details: erroresValidacion
        });
      }

      // Verificar que el RUT no esté duplicado
      const { data: clienteExistente } = await supabase
        .from('clientes')
        .select('id_cliente')
        .eq('rut', rut.trim())
        .single();

      if (clienteExistente) {
        return res.status(409).json({
          error: 'Ya existe un cliente con este RUT',
          code: 'DUPLICATE_RUT'
        });
      }

      // Validar formato de RUT (básico)
      if (!/^\d{7,8}[0-9Kk]$/.test(rut.replace(/[.-]/g, ''))) {
        return res.status(400).json({
          error: 'Formato de RUT inválido',
          code: 'INVALID_RUT_FORMAT'
        });
      }

      // Preparar datos del cliente
      const datosCliente = {
        nombrecliente: nombrecliente.trim(),
        nombrefantasia: nombrefantasia?.trim() || null,
        razonsocial: razonsocial?.trim() || null,
        rut: rut.trim(),
        id_region: id_region ? parseInt(id_region) : null,
        id_comuna: id_comuna ? parseInt(id_comuna) : null,
        direccion: direccion?.trim() || null,
        email: email.trim().toLowerCase(),
        telcelular: telefono || null,
        giro: giro?.trim() || null,
        id_grupo: id_grupo ? parseInt(id_grupo) : null,
        id_tipo_cliente: id_tipo_cliente ? parseInt(id_tipo_cliente) : null,
        nombrerepresentantelegal: nombrerepresentantelegal?.trim() || null,
        rut_representante: rut_representante?.trim() || null,
        estado: true,
        fechacreacion: new Date().toISOString(),
        fechaultimamodificacion: new Date().toISOString()
      };

      // Insertar cliente
      const { data: nuevoCliente, error } = await supabase
        .from('clientes')
        .insert([datosCliente])
        .select(`
          *,
          Grupos (nombre_grupo),
          TiposCliente (nombretipocliente),
          Region (nombreregion),
          Comunas (nombrecomuna)
        `)
        .single();

      if (error) {
        logger.error('Error creando cliente:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Log de actividad
      logger.info('Cliente creado exitosamente', {
        clientId: nuevoCliente.id_cliente,
        createdBy: req.user.id_usuario,
        data: datosCliente
      });

      res.status(201).json({
        success: true,
        message: 'Cliente creado exitosamente',
        data: nuevoCliente
      });

    } catch (error) {
      logger.error('Error inesperado en POST /clientes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// PUT /api/v2/clientes/:id - Actualizar cliente
router.put('/:id',
  requirePermission('clientes.update'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Validar que el ID sea numérico
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido',
          code: 'INVALID_CLIENT_ID'
        });
      }

      // Verificar que el cliente existe
      const { data: clienteExistente, error: clienteError } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', id)
        .single();

      if (clienteError) {
        if (clienteError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Cliente no encontrado',
            code: 'CLIENT_NOT_FOUND'
          });
        }
        
        logger.error('Error verificando cliente:', clienteError);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Si se está actualizando el RUT, verificar que no esté duplicado
      if (updateData.rut && updateData.rut !== clienteExistente.rut) {
        const { data: clienteRut } = await supabase
          .from('clientes')
          .select('id_cliente')
          .eq('rut', updateData.rut)
          .neq('id_cliente', id)
          .single();

        if (clienteRut) {
          return res.status(409).json({
            error: 'Ya existe otro cliente con este RUT',
            code: 'DUPLICATE_RUT'
          });
        }
      }

      // Preparar datos de actualización
      const datosActualizacion = {
        ...updateData,
        fechaultimamodificacion: new Date().toISOString()
      };

      // Remover campos que no se pueden actualizar directamente
      delete datosActualizacion.id_cliente;
      delete datosActualizacion.fechacreacion;

      // Convertir campos numéricos si existen
      if (datosActualizacion.id_region) datosActualizacion.id_region = parseInt(datosActualizacion.id_region);
      if (datosActualizacion.id_comuna) datosActualizacion.id_comuna = parseInt(datosActualizacion.id_comuna);
      if (datosActualizacion.id_grupo) datosActualizacion.id_grupo = parseInt(datosActualizacion.id_grupo);
      if (datosActualizacion.id_tipo_cliente) datosActualizacion.id_tipo_cliente = parseInt(datosActualizacion.id_tipo_cliente);

      // Actualizar cliente
      const { data: clienteActualizado, error } = await supabase
        .from('clientes')
        .update(datosActualizacion)
        .eq('id_cliente', id)
        .select(`
          *,
          Grupos (nombre_grupo),
          TiposCliente (nombretipocliente),
          Region (nombreregion),
          Comunas (nombrecomuna)
        `)
        .single();

      if (error) {
        logger.error('Error actualizando cliente:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Log de actividad
      logger.info('Cliente actualizado exitosamente', {
        clientId: id,
        updatedBy: req.user.id_usuario,
        changes: datosActualizacion
      });

      res.json({
        success: true,
        message: 'Cliente actualizado exitosamente',
        data: clienteActualizado
      });

    } catch (error) {
      logger.error('Error inesperado en PUT /clientes/:id:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// DELETE /api/v2/clientes/:id - Eliminar cliente (soft delete)
router.delete('/:id',
  requirePermission('clientes.delete'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;

      // Validar que el ID sea numérico
      if (!/^\d+$/.test(id)) {
        return res.status(400).json({
          error: 'ID de cliente inválido',
          code: 'INVALID_CLIENT_ID'
        });
      }

      // Verificar que el cliente existe
      const { data: clienteExistente, error: clienteError } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .eq('id_cliente', id)
        .single();

      if (clienteError) {
        if (clienteError.code === 'PGRST116') {
          return res.status(404).json({
            error: 'Cliente no encontrado',
            code: 'CLIENT_NOT_FOUND'
          });
        }
        
        logger.error('Error verificando cliente:', clienteError);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Verificar que no tenga órdenes activas
      const { data: ordenesActivas } = await supabase
        .from('ordenes')
        .select('id')
        .eq('id_cliente', id)
        .eq('estado', 'activa')
        .limit(1);

      if (ordenesActivas && ordenesActivas.length > 0) {
        return res.status(409).json({
          error: 'No se puede eliminar un cliente con órdenes activas',
          code: 'CLIENT_HAS_ACTIVE_ORDERS'
        });
      }

      // Soft delete - marcar como inactivo
      const { error } = await supabase
        .from('clientes')
        .update({ 
          estado: false,
          fechaultimamodificacion: new Date().toISOString()
        })
        .eq('id_cliente', id);

      if (error) {
        logger.error('Error eliminando cliente:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      // Log de actividad
      logger.info('Cliente eliminado exitosamente', {
        clientId: id,
        clientName: clienteExistente.nombrecliente,
        deletedBy: req.user.id_usuario
      });

      res.json({
        success: true,
        message: 'Cliente eliminado exitosamente'
      });

    } catch (error) {
      logger.error('Error inesperado en DELETE /clientes/:id:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// GET /api/v2/clientes/:id/ordenes - Órdenes del cliente
router.get('/:id/ordenes',
  requirePermission('ordenes.read'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 20,
        estado,
        fecha_desde,
        fecha_hasta
      } = req.query;

      const offset = (page - 1) * limit;

      // Verificar que el cliente existe
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .eq('id_cliente', id)
        .single();

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          code: 'CLIENT_NOT_FOUND'
        });
      }

      // Construir query para órdenes
      let query = supabase
        .from('ordenes')
        .select(`
          *,
          Campañas (nombre),
          Medios (nombremedios)
        `, { count: 'exact' })
        .eq('id_cliente', id);

      // Aplicar filtros
      if (estado) {
        query = query.eq('estado', estado);
      }

      if (fecha_desde) {
        query = query.gte('fecha_creacion', fecha_desde);
      }

      if (fecha_hasta) {
        query = query.lte('fecha_creacion', fecha_hasta);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .order('fecha_creacion', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      const { data: ordenes, error, count } = await query;

      if (error) {
        logger.error('Error consultando órdenes del cliente:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        data: {
          cliente: {
            id: cliente.id_cliente,
            nombre: cliente.nombrecliente
          },
          ordenes: ordenes || [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error inesperado en GET /clientes/:id/ordenes:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

// GET /api/v2/clientes/:id/campañas - Campañas del cliente
router.get('/:id/campañas',
  requirePermission('campañas.read'),
  withLogging(async (req, res) => {
    try {
      const { id } = req.params;
      const {
        page = 1,
        limit = 20,
        estado
      } = req.query;

      const offset = (page - 1) * limit;

      // Verificar que el cliente existe
      const { data: cliente } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .eq('id_cliente', id)
        .single();

      if (!cliente) {
        return res.status(404).json({
          error: 'Cliente no encontrado',
          code: 'CLIENT_NOT_FOUND'
        });
      }

      // Construir query para campañas
      let query = supabase
        .from('campañas')
        .select('*', { count: 'exact' })
        .eq('id_cliente', id);

      // Aplicar filtros
      if (estado) {
        query = query.eq('estado', estado);
      }

      // Aplicar paginación y ordenamiento
      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + parseInt(limit) - 1);

      const { data: campanas, error, count } = await query;

      if (error) {
        logger.error('Error consultando campañas del cliente:', error);
        return res.status(500).json({
          error: 'Error interno del servidor',
          code: 'DATABASE_ERROR'
        });
      }

      res.json({
        success: true,
        data: {
          cliente: {
            id: cliente.id_cliente,
            nombre: cliente.nombrecliente
          },
          campañas: campanas || [],
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            total_pages: Math.ceil(count / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Error inesperado en GET /clientes/:id/campañas:', error);
      res.status(500).json({
        error: 'Error interno del servidor',
        code: 'INTERNAL_ERROR'
      });
    }
  })
);

module.exports = router;