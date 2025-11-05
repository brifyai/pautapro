/**
 * 👥 Client Action Handler - PautaPro
 * 
 * Manejador de acciones para gestión de clientes
 * Responsable de:
 * - Crear clientes
 * - Buscar clientes
 * - Actualizar clientes
 * - Eliminar clientes
 * - Validar datos de clientes
 */

import { supabase } from '../config/supabase';

class ClientActionHandler {
  constructor() {
    this.tableName = 'clientes';
    this.requiredFields = ['nombre', 'rut'];
    this.optionalFields = ['razon_social', 'direccion', 'telefono', 'email', 'contacto', 'tipo_cliente', 'estado'];
  }

  /**
   * Crea un nuevo cliente
   */
  async createClient(data, context = {}) {
    try {
      // Validar datos requeridos
      const validation = this.validateClientData(data, true);
      if (!validation.valid) {
        return {
          success: false,
          message: validation.message,
          errors: validation.errors
        };
      }

      // Preparar datos
      const clientData = {
        nombre: data.nombre || data.target,
        rut: data.rut || data.values?.rut?.[0],
        razon_social: data.razon_social || data.nombre,
        direccion: data.direccion || data.values?.location,
        telefono: data.telefono || data.values?.telefono?.[0],
        email: data.email || data.values?.email?.[0],
        contacto: data.contacto,
        tipo_cliente: data.tipo_cliente || 'general',
        estado: 'activo',
        created_at: new Date().toISOString(),
        agencia_id: context.agencia_id || 1
      };

      // Insertar en base de datos
      const { data: result, error } = await supabase
        .from(this.tableName)
        .insert([clientData])
        .select();

      if (error) {
        return {
          success: false,
          message: `Error al crear cliente: ${error.message}`,
          error: error.code
        };
      }

      return {
        success: true,
        message: `✅ Cliente "${clientData.nombre}" creado exitosamente`,
        data: result[0],
        id: result[0].id_clientes
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al crear cliente: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Busca clientes
   */
  async searchClients(filters = {}, context = {}) {
    try {
      let query = supabase.from(this.tableName).select('*');

      // Aplicar filtros
      if (filters.nombre) {
        query = query.ilike('nombre', `%${filters.nombre}%`);
      }

      if (filters.rut) {
        query = query.eq('rut', filters.rut);
      }

      if (filters.estado) {
        query = query.eq('estado', filters.estado);
      }

      if (filters.tipo_cliente) {
        query = query.eq('tipo_cliente', filters.tipo_cliente);
      }

      if (filters.location) {
        query = query.ilike('direccion', `%${filters.location}%`);
      }

      // Filtros de rango
      if (filters.min_amount) {
        query = query.gte('presupuesto_total', filters.min_amount);
      }

      if (filters.max_amount) {
        query = query.lte('presupuesto_total', filters.max_amount);
      }

      // Ejecutar búsqueda
      const { data, error, count } = await query.limit(100);

      if (error) {
        return {
          success: false,
          message: `Error al buscar clientes: ${error.message}`,
          error: error.code
        };
      }

      return {
        success: true,
        message: `🔍 Se encontraron ${data.length} cliente(s)`,
        data,
        count: data.length,
        results: data.map(client => ({
          id: client.id_clientes,
          nombre: client.nombre,
          rut: client.rut,
          estado: client.estado,
          tipo: client.tipo_cliente,
          contacto: client.contacto,
          email: client.email
        }))
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al buscar clientes: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Actualiza un cliente
   */
  async updateClient(target, data, context = {}) {
    try {
      // Buscar cliente
      const { data: clients, error: searchError } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.%${target}%,rut.eq.${target}`)
        .limit(1);

      if (searchError || !clients || clients.length === 0) {
        return {
          success: false,
          message: `No se encontró cliente: ${target}`
        };
      }

      const client = clients[0];

      // Preparar datos a actualizar
      const updateData = {};
      for (const field of this.optionalFields) {
        if (data[field]) {
          updateData[field] = data[field];
        }
      }

      if (Object.keys(updateData).length === 0) {
        return {
          success: false,
          message: 'No hay datos para actualizar'
        };
      }

      // Actualizar
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update(updateData)
        .eq('id_clientes', client.id_clientes)
        .select();

      if (error) {
        return {
          success: false,
          message: `Error al actualizar cliente: ${error.message}`,
          error: error.code
        };
      }

      return {
        success: true,
        message: `✅ Cliente "${client.nombre}" actualizado exitosamente`,
        data: result[0]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al actualizar cliente: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Cambia el estado de un cliente
   */
  async changeClientStatus(target, newStatus, context = {}) {
    try {
      // Validar estado
      const validStates = ['activo', 'inactivo', 'suspendido'];
      if (!validStates.includes(newStatus.toLowerCase())) {
        return {
          success: false,
          message: `Estado inválido. Estados válidos: ${validStates.join(', ')}`
        };
      }

      // Buscar cliente
      const { data: clients, error: searchError } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.%${target}%,rut.eq.${target}`)
        .limit(1);

      if (searchError || !clients || clients.length === 0) {
        return {
          success: false,
          message: `No se encontró cliente: ${target}`
        };
      }

      const client = clients[0];

      // Actualizar estado
      const { data: result, error } = await supabase
        .from(this.tableName)
        .update({ estado: newStatus.toLowerCase() })
        .eq('id_clientes', client.id_clientes)
        .select();

      if (error) {
        return {
          success: false,
          message: `Error al cambiar estado: ${error.message}`,
          error: error.code
        };
      }

      return {
        success: true,
        message: `✅ Cliente "${client.nombre}" ${newStatus.toLowerCase()}`,
        data: result[0]
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al cambiar estado: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Elimina un cliente
   */
  async deleteClient(target, context = {}) {
    try {
      // Buscar cliente
      const { data: clients, error: searchError } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.%${target}%,rut.eq.${target}`)
        .limit(1);

      if (searchError || !clients || clients.length === 0) {
        return {
          success: false,
          message: `No se encontró cliente: ${target}`
        };
      }

      const client = clients[0];

      // Verificar si tiene órdenes
      const { data: orders, error: ordersError } = await supabase
        .from('ordenes_de_compra')
        .select('id_ordenes_de_comprar')
        .eq('cliente_id', client.id_clientes)
        .limit(1);

      if (orders && orders.length > 0) {
        return {
          success: false,
          message: `No se puede eliminar cliente con órdenes asociadas. Considera desactivarlo en su lugar.`,
          requiresConfirmation: true
        };
      }

      // Eliminar
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id_clientes', client.id_clientes);

      if (error) {
        return {
          success: false,
          message: `Error al eliminar cliente: ${error.message}`,
          error: error.code
        };
      }

      return {
        success: true,
        message: `✅ Cliente "${client.nombre}" eliminado exitosamente`
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al eliminar cliente: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Obtiene estadísticas de un cliente
   */
  async getClientStats(target, context = {}) {
    try {
      // Buscar cliente
      const { data: clients, error: searchError } = await supabase
        .from(this.tableName)
        .select('*')
        .or(`nombre.ilike.%${target}%,rut.eq.${target}`)
        .limit(1);

      if (searchError || !clients || clients.length === 0) {
        return {
          success: false,
          message: `No se encontró cliente: ${target}`
        };
      }

      const client = clients[0];

      // Obtener órdenes
      const { data: orders } = await supabase
        .from('ordenes_de_compra')
        .select('*')
        .eq('cliente_id', client.id_clientes);

      // Obtener campañas
      const { data: campaigns } = await supabase
        .from('campanas')
        .select('*')
        .eq('cliente_id', client.id_clientes);

      // Calcular estadísticas
      const totalOrders = orders?.length || 0;
      const totalCampaigns = campaigns?.length || 0;
      const totalInvested = orders?.reduce((sum, o) => sum + (o.presupuesto || 0), 0) || 0;

      return {
        success: true,
        message: `📊 Estadísticas del cliente "${client.nombre}"`,
        stats: {
          cliente: client.nombre,
          rut: client.rut,
          estado: client.estado,
          totalOrdenes: totalOrders,
          totalCampanas: totalCampaigns,
          inversionTotal: totalInvested,
          promedioPorOrden: totalOrders > 0 ? totalInvested / totalOrders : 0,
          contacto: client.contacto,
          email: client.email,
          telefono: client.telefono
        }
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al obtener estadísticas: ${error.message}`,
        error: error.name
      };
    }
  }

  /**
   * Valida datos de cliente
   */
  validateClientData(data, isCreation = false) {
    const errors = [];

    // Validar campos requeridos en creación
    if (isCreation) {
      if (!data.nombre && !data.target) {
        errors.push('El nombre del cliente es requerido');
      }
      if (!data.rut && !data.values?.rut?.[0]) {
        errors.push('El RUT del cliente es requerido');
      }
    }

    // Validar formato de RUT si se proporciona
    if (data.rut || data.values?.rut?.[0]) {
      const rut = data.rut || data.values.rut[0];
      if (!/^\d{1,2}\.\d{3}\.\d{3}-[\dkK]$/.test(rut)) {
        errors.push('Formato de RUT inválido. Debe ser: XX.XXX.XXX-X');
      }
    }

    // Validar email si se proporciona
    if (data.email || data.values?.email?.[0]) {
      const email = data.email || data.values.email[0];
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        errors.push('Formato de email inválido');
      }
    }

    // Validar teléfono si se proporciona
    if (data.telefono || data.values?.telefono?.[0]) {
      const telefono = data.telefono || data.values.telefono[0];
      if (!/^\+?56?9?\d{8,9}$/.test(telefono.replace(/\D/g, ''))) {
        errors.push('Formato de teléfono inválido');
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.length === 0 ? 'Datos válidos' : errors.join('; '),
      errors
    };
  }

  /**
   * Exporta clientes a formato JSON
   */
  async exportClients(filters = {}, format = 'json') {
    try {
      const searchResult = await this.searchClients(filters);

      if (!searchResult.success) {
        return searchResult;
      }

      return {
        success: true,
        message: `📥 Exportando ${searchResult.count} cliente(s)`,
        data: searchResult.results,
        format,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        message: `Error al exportar: ${error.message}`,
        error: error.name
      };
    }
  }
}

// Exportar como singleton
const clientActionHandler = new ClientActionHandler();
export default clientActionHandler;
