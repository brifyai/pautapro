/**
 * Media Action Handler
 * Maneja todas las operaciones relacionadas con medios y temas
 * Integrado con el Asistente IA Ejecutivo
 */

import { supabase } from '../../config/supabase';

class MediaActionHandler {
  constructor() {
    this.mediasTable = 'medios';
    this.temasTable = 'temas';
    this.logger = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, data) => console.log(`[MediaHandler] ${msg}`, data || ''),
      error: (msg, err) => console.error(`[MediaHandler ERROR] ${msg}`, err || ''),
      warn: (msg, data) => console.warn(`[MediaHandler WARN] ${msg}`, data || '')
    };
  }

  /**
   * Crear nuevo medio
   */
  async createMedia(data) {
    try {
      this.logger.info('Creando nuevo medio', data);

      // Validar datos
      const validation = this.validateMediaData(data, 'create');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos
      const mediaData = {
        nombre_medio: data.nombre || data.nombre_medio,
        descripcion: data.descripcion || data.description,
        tipo_medio: data.tipo || data.tipo_medio || 'Digital',
        costo_base: data.costo || data.costo_base || 0,
        alcance_estimado: data.alcance || data.alcance_estimado || 0,
        frecuencia_recomendada: data.frecuencia || data.frecuencia_recomendada || 'Semanal',
        estado: data.estado_medio || 'activo',
        fecha_creacion: new Date().toISOString(),
        proveedor_id: data.proveedor_id,
        url_medio: data.url || data.url_medio,
        contacto: data.contacto,
        notas: data.notas || data.notes,
        agencia_id: data.agencia_id || 1
      };

      const { data: result, error } = await supabase
        .from(this.mediasTable)
        .insert([mediaData])
        .select();

      if (error) {
        this.logger.error('Error al crear medio', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Medio creado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Medio "${mediaData.nombre_medio}" creado exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al crear medio', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Crear nuevo tema
   */
  async createTema(data) {
    try {
      this.logger.info('Creando nuevo tema', data);

      // Validar datos
      const validation = this.validateTemaData(data, 'create');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos
      const temaData = {
        nombre_tema: data.nombre || data.nombre_tema,
        descripcion: data.descripcion || data.description,
        tipo_contenido: data.tipo || data.tipo_contenido || 'General',
        duracion_segundos: data.duracion || data.duracion_segundos || 30,
        costo_produccion: data.costo || data.costo_produccion || 0,
        estado: data.estado_tema || 'activo',
        fecha_creacion: new Date().toISOString(),
        archivo_url: data.archivo_url || data.url,
        notas: data.notas || data.notes,
        agencia_id: data.agencia_id || 1
      };

      const { data: result, error } = await supabase
        .from(this.temasTable)
        .insert([temaData])
        .select();

      if (error) {
        this.logger.error('Error al crear tema', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Tema creado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Tema "${temaData.nombre_tema}" creado exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al crear tema', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Buscar medios con múltiples filtros
   */
  async searchMedias(filters = {}) {
    try {
      this.logger.info('Buscando medios', filters);

      let query = supabase.from(this.mediasTable).select('*');

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre_medio', `%${filters.nombre}%`);
      }
      if (filters.tipo) {
        query = query.eq('tipo_medio', filters.tipo);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.proveedor_id) {
        query = query.eq('proveedor_id', filters.proveedor_id);
      }
      if (filters.minCosto !== undefined) {
        query = query.gte('costo_base', filters.minCosto);
      }
      if (filters.maxCosto !== undefined) {
        query = query.lte('costo_base', filters.maxCosto);
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'nombre_medio';
      const orderDirection = filters.orderDirection || 'asc';
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
        this.logger.error('Error al buscar medios', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} medios`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} medio(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al buscar medios', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Buscar temas con múltiples filtros
   */
  async searchTemas(filters = {}) {
    try {
      this.logger.info('Buscando temas', filters);

      let query = supabase.from(this.temasTable).select('*');

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre_tema', `%${filters.nombre}%`);
      }
      if (filters.tipo) {
        query = query.eq('tipo_contenido', filters.tipo);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.minDuracion !== undefined) {
        query = query.gte('duracion_segundos', filters.minDuracion);
      }
      if (filters.maxDuracion !== undefined) {
        query = query.lte('duracion_segundos', filters.maxDuracion);
      }
      if (filters.minCosto !== undefined) {
        query = query.gte('costo_produccion', filters.minCosto);
      }
      if (filters.maxCosto !== undefined) {
        query = query.lte('costo_produccion', filters.maxCosto);
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'nombre_tema';
      const orderDirection = filters.orderDirection || 'asc';
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
        this.logger.error('Error al buscar temas', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} temas`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} tema(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al buscar temas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener medio por ID
   */
  async getMediaById(id) {
    try {
      this.logger.info('Obteniendo medio por ID', { id });

      const { data, error } = await supabase
        .from(this.mediasTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error al obtener medio', error);
        return {
          success: false,
          error: 'Medio no encontrado',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data,
        message: `Medio "${data.nombre_medio}" obtenido exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener medio', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener tema por ID
   */
  async getTemaById(id) {
    try {
      this.logger.info('Obteniendo tema por ID', { id });

      const { data, error } = await supabase
        .from(this.temasTable)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error al obtener tema', error);
        return {
          success: false,
          error: 'Tema no encontrado',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data,
        message: `Tema "${data.nombre_tema}" obtenido exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener tema', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Actualizar medio
   */
  async updateMedia(id, data) {
    try {
      this.logger.info('Actualizando medio', { id, data });

      // Validar datos
      const validation = this.validateMediaData(data, 'update');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos para actualización
      const updateData = {};
      if (data.nombre) updateData.nombre_medio = data.nombre;
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.tipo) updateData.tipo_medio = data.tipo;
      if (data.costo !== undefined) updateData.costo_base = data.costo;
      if (data.alcance !== undefined) updateData.alcance_estimado = data.alcance;
      if (data.frecuencia) updateData.frecuencia_recomendada = data.frecuencia;
      if (data.url) updateData.url_medio = data.url;
      if (data.contacto) updateData.contacto = data.contacto;
      if (data.notas) updateData.notas = data.notas;

      const { data: result, error } = await supabase
        .from(this.mediasTable)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al actualizar medio', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Medio actualizado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: 'Medio actualizado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al actualizar medio', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Actualizar tema
   */
  async updateTema(id, data) {
    try {
      this.logger.info('Actualizando tema', { id, data });

      // Validar datos
      const validation = this.validateTemaData(data, 'update');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos para actualización
      const updateData = {};
      if (data.nombre) updateData.nombre_tema = data.nombre;
      if (data.descripcion) updateData.descripcion = data.descripcion;
      if (data.tipo) updateData.tipo_contenido = data.tipo;
      if (data.duracion !== undefined) updateData.duracion_segundos = data.duracion;
      if (data.costo !== undefined) updateData.costo_produccion = data.costo;
      if (data.archivo_url) updateData.archivo_url = data.archivo_url;
      if (data.notas) updateData.notas = data.notas;

      const { data: result, error } = await supabase
        .from(this.temasTable)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al actualizar tema', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Tema actualizado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: 'Tema actualizado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al actualizar tema', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Cambiar estado del medio
   */
  async changeMediaStatus(id, newStatus) {
    try {
      this.logger.info('Cambiando estado del medio', { id, newStatus });

      const validStates = ['activo', 'inactivo', 'archivado'];
      if (!validStates.includes(newStatus)) {
        return {
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`,
          code: 'INVALID_STATE'
        };
      }

      const { data: result, error } = await supabase
        .from(this.mediasTable)
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
        message: `Estado del medio cambiado a "${newStatus}"`
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
   * Cambiar estado del tema
   */
  async changeTemaStatus(id, newStatus) {
    try {
      this.logger.info('Cambiando estado del tema', { id, newStatus });

      const validStates = ['activo', 'inactivo', 'archivado'];
      if (!validStates.includes(newStatus)) {
        return {
          success: false,
          error: `Estado inválido. Estados válidos: ${validStates.join(', ')}`,
          code: 'INVALID_STATE'
        };
      }

      const { data: result, error } = await supabase
        .from(this.temasTable)
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
        message: `Estado del tema cambiado a "${newStatus}"`
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
   * Eliminar medio
   */
  async deleteMedia(id, force = false) {
    try {
      this.logger.info('Eliminando medio', { id, force });

      if (!force) {
        const { data: plans, error: plansError } = await supabase
          .from('campana_planes')
          .select('id')
          .eq('medio_id', id)
          .limit(1);

        if (plansError) {
          this.logger.warn('Error al verificar planes', plansError);
        } else if (plans && plans.length > 0) {
          return {
            success: false,
            error: 'No se puede eliminar un medio con planes asociados. Use force=true para forzar la eliminación.',
            code: 'HAS_DEPENDENCIES',
            hasPlans: true
          };
        }
      }

      const { error } = await supabase
        .from(this.mediasTable)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error al eliminar medio', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Medio eliminado exitosamente');
      return {
        success: true,
        message: 'Medio eliminado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al eliminar medio', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Eliminar tema
   */
  async deleteTema(id, force = false) {
    try {
      this.logger.info('Eliminando tema', { id, force });

      if (!force) {
        const { data: plans, error: plansError } = await supabase
          .from('campana_temas')
          .select('id')
          .eq('tema_id', id)
          .limit(1);

        if (plansError) {
          this.logger.warn('Error al verificar planes', plansError);
        } else if (plans && plans.length > 0) {
          return {
            success: false,
            error: 'No se puede eliminar un tema con planes asociados. Use force=true para forzar la eliminación.',
            code: 'HAS_DEPENDENCIES',
            hasPlans: true
          };
        }
      }

      const { error } = await supabase
        .from(this.temasTable)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error al eliminar tema', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Tema eliminado exitosamente');
      return {
        success: true,
        message: 'Tema eliminado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al eliminar tema', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener estadísticas de medios
   */
  async getMediaStats() {
    try {
      this.logger.info('Obteniendo estadísticas de medios');

      // Total de medios
      const { count: totalMedias } = await supabase
        .from(this.mediasTable)
        .select('*', { count: 'exact', head: true });

      // Medios activos
      const { count: activeMedias } = await supabase
        .from(this.mediasTable)
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      // Medios por tipo
      const { data: mediasByType } = await supabase
        .from(this.mediasTable)
        .select('tipo_medio, count(*)')
        .group_by('tipo_medio');

      // Costo promedio
      const { data: costData } = await supabase
        .from(this.mediasTable)
        .select('costo_base');

      const avgCost = costData && costData.length > 0
        ? (costData.reduce((sum, m) => sum + (m.costo_base || 0), 0) / costData.length).toFixed(2)
        : 0;

      const stats = {
        totalMedias: totalMedias || 0,
        activeMedias: activeMedias || 0,
        inactiveMedias: (totalMedias || 0) - (activeMedias || 0),
        mediasByType: mediasByType || [],
        averageCost: parseFloat(avgCost)
      };

      this.logger.info('Estadísticas obtenidas', stats);
      return {
        success: true,
        data: stats,
        message: 'Estadísticas de medios obtenidas exitosamente'
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
   * Obtener estadísticas de temas
   */
  async getTemaStats() {
    try {
      this.logger.info('Obteniendo estadísticas de temas');

      // Total de temas
      const { count: totalTemas } = await supabase
        .from(this.temasTable)
        .select('*', { count: 'exact', head: true });

      // Temas activos
      const { count: activeTemas } = await supabase
        .from(this.temasTable)
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      // Temas por tipo
      const { data: temasByType } = await supabase
        .from(this.temasTable)
        .select('tipo_contenido, count(*)')
        .group_by('tipo_contenido');

      // Duración promedio
      const { data: durationData } = await supabase
        .from(this.temasTable)
        .select('duracion_segundos');

      const avgDuration = durationData && durationData.length > 0
        ? (durationData.reduce((sum, t) => sum + (t.duracion_segundos || 0), 0) / durationData.length).toFixed(0)
        : 0;

      const stats = {
        totalTemas: totalTemas || 0,
        activeTemas: activeTemas || 0,
        inactiveTemas: (totalTemas || 0) - (activeTemas || 0),
        temasByType: temasByType || [],
        averageDuration: parseInt(avgDuration)
      };

      this.logger.info('Estadísticas obtenidas', stats);
      return {
        success: true,
        data: stats,
        message: 'Estadísticas de temas obtenidas exitosamente'
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
   * Exportar medios a CSV
   */
  async exportMedias(filters = {}) {
    try {
      this.logger.info('Exportando medios', filters);

      const searchResult = await this.searchMedias({ ...filters, limit: 10000 });
      if (!searchResult.success) {
        return searchResult;
      }

      const medias = searchResult.data;

      const headers = [
        'ID',
        'Nombre',
        'Tipo',
        'Descripción',
        'Costo Base',
        'Alcance Estimado',
        'Frecuencia',
        'Estado',
        'Proveedor ID',
        'URL',
        'Contacto',
        'Fecha Creación'
      ];

      const rows = medias.map(m => [
        m.id,
        m.nombre_medio,
        m.tipo_medio,
        m.descripcion,
        m.costo_base,
        m.alcance_estimado,
        m.frecuencia_recomendada,
        m.estado,
        m.proveedor_id,
        m.url_medio,
        m.contacto,
        new Date(m.fecha_creacion).toLocaleDateString('es-CL')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      this.logger.info(`Exportados ${medias.length} medios`);
      return {
        success: true,
        data: csv,
        filename: `medios_${new Date().toISOString().split('T')[0]}.csv`,
        message: `${medias.length} medio(s) exportado(s) exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al exportar medios', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Exportar temas a CSV
   */
  async exportTemas(filters = {}) {
    try {
      this.logger.info('Exportando temas', filters);

      const searchResult = await this.searchTemas({ ...filters, limit: 10000 });
      if (!searchResult.success) {
        return searchResult;
      }

      const temas = searchResult.data;

      const headers = [
        'ID',
        'Nombre',
        'Tipo',
        'Descripción',
        'Duración (seg)',
        'Costo Producción',
        'Estado',
        'Archivo URL',
        'Fecha Creación'
      ];

      const rows = temas.map(t => [
        t.id,
        t.nombre_tema,
        t.tipo_contenido,
        t.descripcion,
        t.duracion_segundos,
        t.costo_produccion,
        t.estado,
        t.archivo_url,
        new Date(t.fecha_creacion).toLocaleDateString('es-CL')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      this.logger.info(`Exportados ${temas.length} temas`);
      return {
        success: true,
        data: csv,
        filename: `temas_${new Date().toISOString().split('T')[0]}.csv`,
        message: `${temas.length} tema(s) exportado(s) exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al exportar temas', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Validar datos del medio
   */
  validateMediaData(data, mode = 'create') {
    const errors = [];

    if (mode === 'create') {
      if (!data.nombre && !data.nombre_medio) {
        errors.push('El nombre del medio es requerido');
      }
    }

    if (data.costo !== undefined && data.costo < 0) {
      errors.push('El costo no puede ser negativo');
    }

    if (data.alcance !== undefined && data.alcance < 0) {
      errors.push('El alcance no puede ser negativo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar datos del tema
   */
  validateTemaData(data, mode = 'create') {
    const errors = [];

    if (mode === 'create') {
      if (!data.nombre && !data.nombre_tema) {
        errors.push('El nombre del tema es requerido');
      }
    }

    if (data.duracion !== undefined && (data.duracion < 0 || data.duracion > 3600)) {
      errors.push('La duración debe estar entre 0 y 3600 segundos');
    }

    if (data.costo !== undefined && data.costo < 0) {
      errors.push('El costo no puede ser negativo');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Obtener tipos de medios disponibles
   */
  async getMediaTypes() {
    try {
      this.logger.info('Obteniendo tipos de medios');

      const { data, error } = await supabase
        .from(this.mediasTable)
        .select('tipo_medio')
        .distinct();

      if (error) {
        this.logger.error('Error al obtener tipos', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      const types = data.map(d => d.tipo_medio).filter(Boolean);
      return {
        success: true,
        data: types,
        message: `Se encontraron ${types.length} tipo(s) de medio(s)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener tipos', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener tipos de contenido disponibles
   */
  async getContentTypes() {
    try {
      this.logger.info('Obteniendo tipos de contenido');

      const { data, error } = await supabase
        .from(this.temasTable)
        .select('tipo_contenido')
        .distinct();

      if (error) {
        this.logger.error('Error al obtener tipos', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      const types = data.map(d => d.tipo_contenido).filter(Boolean);
      return {
        success: true,
        data: types,
        message: `Se encontraron ${types.length} tipo(s) de contenido`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener tipos', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }
}

// Exportar instancia singleton
export const mediaActionHandler = new MediaActionHandler();
export default MediaActionHandler;
