/**
 * Provider Action Handler
 * Maneja todas las operaciones relacionadas con proveedores
 * Integrado con el Asistente IA Ejecutivo
 */

import { supabase } from '../../config/supabase';

class ProviderActionHandler {
  constructor() {
    this.tableName = 'proveedores';
    this.logger = this.createLogger();
  }

  createLogger() {
    return {
      info: (msg, data) => console.log(`[ProviderHandler] ${msg}`, data || ''),
      error: (msg, err) => console.error(`[ProviderHandler ERROR] ${msg}`, err || ''),
      warn: (msg, data) => console.warn(`[ProviderHandler WARN] ${msg}`, data || '')
    };
  }

  /**
   * Crear nuevo proveedor
   */
  async createProvider(data) {
    try {
      this.logger.info('Creando nuevo proveedor', data);

      // Validar datos
      const validation = this.validateProviderData(data, 'create');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos
      const providerData = {
        nombre_proveedor: data.nombre || data.nombre_proveedor,
        rut_proveedor: data.rut || data.rut_proveedor,
        email: data.email,
        telefono: data.telefono || data.phone,
        direccion: data.direccion || data.address,
        ciudad: data.ciudad || data.city,
        region: data.region || data.estado,
        comuna: data.comuna,
        tipo_proveedor: data.tipo || data.tipo_proveedor || 'General',
        estado: data.estado_proveedor || 'activo',
        fecha_registro: new Date().toISOString(),
        contacto_principal: data.contacto || data.contacto_principal,
        notas: data.notas || data.notes,
        comision_porcentaje: data.comision || data.comision_porcentaje || 0,
        dias_pago: data.dias_pago || 30,
        agencia_id: data.agencia_id || 1
      };

      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([providerData])
        .select();

      if (error) {
        this.logger.error('Error al crear proveedor', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Proveedor creado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Proveedor "${providerData.nombre_proveedor}" creado exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al crear proveedor', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Buscar proveedores con múltiples filtros
   */
  async searchProviders(filters = {}) {
    try {
      this.logger.info('Buscando proveedores', filters);

      let query = supabase.from(this.tableName).select('*');

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre_proveedor', `%${filters.nombre}%`);
      }
      if (filters.rut) {
        query = query.eq('rut_proveedor', filters.rut);
      }
      if (filters.tipo) {
        query = query.eq('tipo_proveedor', filters.tipo);
      }
      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }
      if (filters.region) {
        query = query.eq('region', filters.region);
      }
      if (filters.ciudad) {
        query = query.ilike('ciudad', `%${filters.ciudad}%`);
      }
      if (filters.email) {
        query = query.ilike('email', `%${filters.email}%`);
      }

      // Ordenamiento
      const orderBy = filters.orderBy || 'nombre_proveedor';
      const orderDirection = filters.orderDirection || 'asc';
      query = query.order(orderBy, { ascending: orderDirection === 'asc' });

      // Paginación
      if (filters.limit) {
        query = query.limit(filters.limit);
      }
      if (filters.offset) {
        query = query.range(filters.offset, filters.offset + (filters.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) {
        this.logger.error('Error al buscar proveedores', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info(`Encontrados ${data.length} proveedores`);
      return {
        success: true,
        data,
        count: data.length,
        message: `Se encontraron ${data.length} proveedor(es)`
      };
    } catch (err) {
      this.logger.error('Excepción al buscar proveedores', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener proveedor por ID
   */
  async getProviderById(id) {
    try {
      this.logger.info('Obteniendo proveedor por ID', { id });

      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        this.logger.error('Error al obtener proveedor', error);
        return {
          success: false,
          error: 'Proveedor no encontrado',
          code: 'NOT_FOUND'
        };
      }

      return {
        success: true,
        data,
        message: `Proveedor "${data.nombre_proveedor}" obtenido exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener proveedor', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Actualizar proveedor
   */
  async updateProvider(id, data) {
    try {
      this.logger.info('Actualizando proveedor', { id, data });

      // Validar datos
      const validation = this.validateProviderData(data, 'update');
      if (!validation.valid) {
        return {
          success: false,
          error: validation.errors.join(', '),
          code: 'VALIDATION_ERROR'
        };
      }

      // Preparar datos para actualización
      const updateData = {};
      if (data.nombre) updateData.nombre_proveedor = data.nombre;
      if (data.email) updateData.email = data.email;
      if (data.telefono) updateData.telefono = data.telefono;
      if (data.direccion) updateData.direccion = data.direccion;
      if (data.ciudad) updateData.ciudad = data.ciudad;
      if (data.region) updateData.region = data.region;
      if (data.comuna) updateData.comuna = data.comuna;
      if (data.tipo) updateData.tipo_proveedor = data.tipo;
      if (data.contacto) updateData.contacto_principal = data.contacto;
      if (data.notas) updateData.notas = data.notas;
      if (data.comision !== undefined) updateData.comision_porcentaje = data.comision;
      if (data.dias_pago) updateData.dias_pago = data.dias_pago;

      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) {
        this.logger.error('Error al actualizar proveedor', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Proveedor actualizado exitosamente', result[0]);
      return {
        success: true,
        data: result[0],
        message: `Proveedor actualizado exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al actualizar proveedor', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Cambiar estado del proveedor
   */
  async changeProviderStatus(id, newStatus) {
    try {
      this.logger.info('Cambiando estado del proveedor', { id, newStatus });

      const validStates = ['activo', 'inactivo', 'suspendido', 'bloqueado'];
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
        message: `Estado del proveedor cambiado a "${newStatus}"`
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
   * Eliminar proveedor
   */
  async deleteProvider(id, force = false) {
    try {
      this.logger.info('Eliminando proveedor', { id, force });

      // Verificar si el proveedor tiene órdenes asociadas
      if (!force) {
        const { data: orders, error: ordersError } = await supabase
          .from('ordenes')
          .select('id')
          .eq('proveedor_id', id)
          .limit(1);

        if (ordersError) {
          this.logger.warn('Error al verificar órdenes', ordersError);
        } else if (orders && orders.length > 0) {
          return {
            success: false,
            error: 'No se puede eliminar un proveedor con órdenes asociadas. Use force=true para forzar la eliminación.',
            code: 'HAS_DEPENDENCIES',
            hasOrders: true
          };
        }
      }

      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);

      if (error) {
        this.logger.error('Error al eliminar proveedor', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      this.logger.info('Proveedor eliminado exitosamente');
      return {
        success: true,
        message: 'Proveedor eliminado exitosamente'
      };
    } catch (err) {
      this.logger.error('Excepción al eliminar proveedor', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Obtener estadísticas de proveedores
   */
  async getProviderStats() {
    try {
      this.logger.info('Obteniendo estadísticas de proveedores');

      // Total de proveedores
      const { count: totalProviders } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true });

      // Proveedores activos
      const { count: activeProviders } = await supabase
        .from(this.tableName)
        .select('*', { count: 'exact', head: true })
        .eq('estado', 'activo');

      // Proveedores por tipo
      const { data: providersByType } = await supabase
        .from(this.tableName)
        .select('tipo_proveedor, count(*)')
        .group_by('tipo_proveedor');

      // Proveedores por región
      const { data: providersByRegion } = await supabase
        .from(this.tableName)
        .select('region, count(*)')
        .group_by('region');

      // Comisión promedio
      const { data: commissionData } = await supabase
        .from(this.tableName)
        .select('comision_porcentaje');

      const avgCommission = commissionData && commissionData.length > 0
        ? (commissionData.reduce((sum, p) => sum + (p.comision_porcentaje || 0), 0) / commissionData.length).toFixed(2)
        : 0;

      const stats = {
        totalProviders: totalProviders || 0,
        activeProviders: activeProviders || 0,
        inactiveProviders: (totalProviders || 0) - (activeProviders || 0),
        providersByType: providersByType || [],
        providersByRegion: providersByRegion || [],
        averageCommission: parseFloat(avgCommission)
      };

      this.logger.info('Estadísticas obtenidas', stats);
      return {
        success: true,
        data: stats,
        message: 'Estadísticas de proveedores obtenidas exitosamente'
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
   * Exportar proveedores a CSV
   */
  async exportProviders(filters = {}) {
    try {
      this.logger.info('Exportando proveedores', filters);

      // Obtener datos
      const searchResult = await this.searchProviders({ ...filters, limit: 10000 });
      if (!searchResult.success) {
        return searchResult;
      }

      const providers = searchResult.data;

      // Crear CSV
      const headers = [
        'ID',
        'Nombre',
        'RUT',
        'Email',
        'Teléfono',
        'Dirección',
        'Ciudad',
        'Región',
        'Comuna',
        'Tipo',
        'Estado',
        'Contacto Principal',
        'Comisión %',
        'Días de Pago',
        'Fecha Registro'
      ];

      const rows = providers.map(p => [
        p.id,
        p.nombre_proveedor,
        p.rut_proveedor,
        p.email,
        p.telefono,
        p.direccion,
        p.ciudad,
        p.region,
        p.comuna,
        p.tipo_proveedor,
        p.estado,
        p.contacto_principal,
        p.comision_porcentaje,
        p.dias_pago,
        new Date(p.fecha_registro).toLocaleDateString('es-CL')
      ]);

      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell || ''}"`).join(','))
      ].join('\n');

      this.logger.info(`Exportados ${providers.length} proveedores`);
      return {
        success: true,
        data: csv,
        filename: `proveedores_${new Date().toISOString().split('T')[0]}.csv`,
        message: `${providers.length} proveedor(es) exportado(s) exitosamente`
      };
    } catch (err) {
      this.logger.error('Excepción al exportar proveedores', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }

  /**
   * Validar datos del proveedor
   */
  validateProviderData(data, mode = 'create') {
    const errors = [];

    if (mode === 'create') {
      if (!data.nombre && !data.nombre_proveedor) {
        errors.push('El nombre del proveedor es requerido');
      }
      if (!data.rut && !data.rut_proveedor) {
        errors.push('El RUT del proveedor es requerido');
      }
    }

    // Validaciones opcionales
    if (data.email && !this.isValidEmail(data.email)) {
      errors.push('El email no es válido');
    }

    if (data.telefono && !this.isValidPhone(data.telefono)) {
      errors.push('El teléfono no es válido');
    }

    if (data.comision !== undefined && (data.comision < 0 || data.comision > 100)) {
      errors.push('La comisión debe estar entre 0 y 100');
    }

    if (data.dias_pago && (data.dias_pago < 0 || data.dias_pago > 365)) {
      errors.push('Los días de pago deben estar entre 0 y 365');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Validar formato de email
   */
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validar formato de teléfono
   */
  isValidPhone(phone) {
    const phoneRegex = /^[\d\s\-\+\(\)]{7,}$/;
    return phoneRegex.test(phone);
  }

  /**
   * Obtener tipos de proveedores disponibles
   */
  async getProviderTypes() {
    try {
      this.logger.info('Obteniendo tipos de proveedores');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('tipo_proveedor')
        .distinct();

      if (error) {
        this.logger.error('Error al obtener tipos', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      const types = data.map(d => d.tipo_proveedor).filter(Boolean);
      return {
        success: true,
        data: types,
        message: `Se encontraron ${types.length} tipo(s) de proveedor(es)`
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
   * Obtener regiones disponibles
   */
  async getRegions() {
    try {
      this.logger.info('Obteniendo regiones');

      const { data, error } = await supabase
        .from(this.tableName)
        .select('region')
        .distinct()
        .not('region', 'is', null);

      if (error) {
        this.logger.error('Error al obtener regiones', error);
        return {
          success: false,
          error: error.message,
          code: 'DATABASE_ERROR'
        };
      }

      const regions = data.map(d => d.region).filter(Boolean);
      return {
        success: true,
        data: regions,
        message: `Se encontraron ${regions.length} región(es)`
      };
    } catch (err) {
      this.logger.error('Excepción al obtener regiones', err);
      return {
        success: false,
        error: err.message,
        code: 'EXCEPTION'
      };
    }
  }
}

// Exportar instancia singleton
export const providerActionHandler = new ProviderActionHandler();
export default ProviderActionHandler;
