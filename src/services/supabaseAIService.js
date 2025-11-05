import { supabase } from '../config/supabase';

/**
 * Servicio centralizado para todas las operaciones del Asistente IA con Supabase
 * Proporciona métodos para CRUD de todas las entidades del sistema
 */
export const supabaseAIService = {
  // ==================== CLIENTES ====================
  
  async getClientes(filtros = {}) {
    try {
      let query = supabase.from('clientes').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.region) query = query.eq('region', filtros.region);
      if (filtros.comuna) query = query.eq('comuna', filtros.comuna);
      if (filtros.tipo_cliente) query = query.eq('tipo_cliente', filtros.tipo_cliente);
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo clientes:', error);
      throw error;
    }
  },

  async searchClientes(termino) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando clientes:', error);
      throw error;
    }
  },

  async getClienteById(clienteId) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .eq('id_cliente', clienteId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo cliente:', error);
      throw error;
    }
  },

  async createCliente(clienteData) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .insert({
          ...clienteData,
          estado: 'activo',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creando cliente:', error);
      throw error;
    }
  },

  async updateCliente(clienteId, clienteData) {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .update({
          ...clienteData,
          updated_at: new Date().toISOString()
        })
        .eq('id_cliente', clienteId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando cliente:', error);
      throw error;
    }
  },

  async deleteCliente(clienteId) {
    try {
      const { error } = await supabase
        .from('clientes')
        .delete()
        .eq('id_cliente', clienteId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error eliminando cliente:', error);
      throw error;
    }
  },

  // ==================== PROVEEDORES ====================

  async getProveedores(filtros = {}) {
    try {
      let query = supabase.from('proveedores').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.tipo_proveedor) query = query.eq('tipo_proveedor', filtros.tipo_proveedor);
      if (filtros.region) query = query.eq('region', filtros.region);
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo proveedores:', error);
      throw error;
    }
  },

  async searchProveedores(termino) {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando proveedores:', error);
      throw error;
    }
  },

  async getProveedorById(proveedorId) {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .select('*')
        .eq('id_proveedor', proveedorId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo proveedor:', error);
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
  },

  async updateProveedor(proveedorId, proveedorData) {
    try {
      const { data, error } = await supabase
        .from('proveedores')
        .update({
          ...proveedorData,
          updated_at: new Date().toISOString()
        })
        .eq('id_proveedor', proveedorId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando proveedor:', error);
      throw error;
    }
  },

  // ==================== MEDIOS ====================

  async getMedios(filtros = {}) {
    try {
      let query = supabase.from('medios').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.tipo_medio) query = query.eq('tipo_medio', filtros.tipo_medio);
      if (filtros.id_proveedor) query = query.eq('id_proveedor', filtros.id_proveedor);
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo medios:', error);
      throw error;
    }
  },

  async searchMedios(termino) {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando medios:', error);
      throw error;
    }
  },

  async getMedioById(medioId) {
    try {
      const { data, error } = await supabase
        .from('medios')
        .select('*')
        .eq('id_medio', medioId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo medio:', error);
      throw error;
    }
  },

  async createMedio(medioData) {
    try {
      const { data, error } = await supabase
        .from('medios')
        .insert({
          ...medioData,
          estado: 'activo',
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

  // ==================== SOPORTES ====================

  async getSoportes(filtros = {}) {
    try {
      let query = supabase.from('soportes').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.id_medio) query = query.eq('id_medio', filtros.id_medio);
      if (filtros.tipo_soporte) query = query.eq('tipo_soporte', filtros.tipo_soporte);
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo soportes:', error);
      throw error;
    }
  },

  async searchSoportes(termino) {
    try {
      const { data, error } = await supabase
        .from('soportes')
        .select('*')
        .ilike('nombre', `%${termino}%`)
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando soportes:', error);
      throw error;
    }
  },

  async getSoporteById(soporteId) {
    try {
      const { data, error } = await supabase
        .from('soportes')
        .select('*')
        .eq('id_soporte', soporteId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo soporte:', error);
      throw error;
    }
  },

  async createSoporte(soporteData) {
    try {
      const { data, error } = await supabase
        .from('soportes')
        .insert({
          ...soporteData,
          estado: 'activo',
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

  // ==================== CAMPAÑAS ====================

  async getCampanas(filtros = {}) {
    try {
      let query = supabase.from('campania').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.id_cliente) query = query.eq('id_cliente', filtros.id_cliente);
      
      const { data, error } = await query.order('nombrecampania', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo campañas:', error);
      throw error;
    }
  },

  async searchCampanas(termino) {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('*')
        .ilike('nombrecampania', `%${termino}%`)
        .order('nombrecampania', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando campañas:', error);
      throw error;
    }
  },

  async getCampanaById(campanaId) {
    try {
      const { data, error } = await supabase
        .from('campania')
        .select('*')
        .eq('id_campania', campanaId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo campaña:', error);
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

  async updateCampana(campanaId, campanaData) {
    try {
      const { data, error } = await supabase
        .from('campania')
        .update({
          ...campanaData,
          updated_at: new Date().toISOString()
        })
        .eq('id_campania', campanaId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando campaña:', error);
      throw error;
    }
  },

  // ==================== ÓRDENES ====================

  async getOrdenes(filtros = {}) {
    try {
      let query = supabase.from('ordenesdepublicidad').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.id_cliente) query = query.eq('id_cliente', filtros.id_cliente);
      if (filtros.id_campania) query = query.eq('id_campania', filtros.id_campania);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      throw error;
    }
  },

  async searchOrdenes(termino) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .ilike('numero_orden', `%${termino}%`)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error buscando órdenes:', error);
      throw error;
    }
  },

  async getOrdenById(ordenId) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .eq('id_ordenes_de_comprar', ordenId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      throw error;
    }
  },

  async createOrden(ordenData) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .insert({
          ...ordenData,
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

  async updateOrden(ordenId, ordenData) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .update({
          ...ordenData,
          updated_at: new Date().toISOString()
        })
        .eq('id_ordenes_de_comprar', ordenId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error actualizando orden:', error);
      throw error;
    }
  },

  async deleteOrden(ordenId) {
    try {
      const { error } = await supabase
        .from('ordenesdepublicidad')
        .delete()
        .eq('id_ordenes_de_comprar', ordenId);
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error eliminando orden:', error);
      throw error;
    }
  },

  // ==================== CONTRATOS ====================

  async getContratos(filtros = {}) {
    try {
      let query = supabase.from('contratos').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      if (filtros.id_proveedor) query = query.eq('id_proveedor', filtros.id_proveedor);
      if (filtros.id_cliente) query = query.eq('id_cliente', filtros.id_cliente);
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo contratos:', error);
      throw error;
    }
  },

  async getContratoById(contratoId) {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('id_contrato', contratoId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo contrato:', error);
      throw error;
    }
  },

  async getContratosByClienteAndProveedor(clienteId, proveedorId) {
    try {
      const { data, error } = await supabase
        .from('contratos')
        .select('*')
        .eq('id_cliente', clienteId)
        .eq('id_proveedor', proveedorId)
        .eq('estado', 'activo');
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo contratos:', error);
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

  // ==================== AGENCIAS ====================

  async getAgencias(filtros = {}) {
    try {
      let query = supabase.from('agencias').select('*');
      
      if (filtros.estado) query = query.eq('estado', filtros.estado);
      
      const { data, error } = await query.order('nombre', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error obteniendo agencias:', error);
      throw error;
    }
  },

  async getAgenciaById(agenciaId) {
    try {
      const { data, error } = await supabase
        .from('agencias')
        .select('*')
        .eq('id_agencia', agenciaId)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error obteniendo agencia:', error);
      throw error;
    }
  },

  // ==================== UTILIDADES ====================

  async searchByName(tabla, nombre) {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .ilike('nombre', `%${nombre}%`)
        .limit(10);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error buscando en ${tabla}:`, error);
      throw error;
    }
  },

  async validateEntity(tabla, id, idField = 'id') {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('id')
        .eq(idField, id)
        .single();
      
      if (error) throw error;
      return !!data;
    } catch (error) {
      return false;
    }
  },

  async getRelatedData(tabla, id, idField = 'id') {
    try {
      const { data, error } = await supabase
        .from(tabla)
        .select('*')
        .eq(idField, id);
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error obteniendo datos relacionados de ${tabla}:`, error);
      throw error;
    }
  },

  // ==================== ESTADÍSTICAS ====================

  async getEstadisticas() {
    try {
      const [clientes, proveedores, ordenes, campanas] = await Promise.all([
        supabase.from('clientes').select('id_cliente'),
        supabase.from('proveedores').select('id_proveedor'),
        supabase.from('ordenesdepublicidad').select('id_ordenes_de_comprar'),
        supabase.from('campania').select('id_campania')
      ]);

      return {
        totalClientes: clientes.data?.length || 0,
        totalProveedores: proveedores.data?.length || 0,
        totalOrdenes: ordenes.data?.length || 0,
        totalCampanas: campanas.data?.length || 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas:', error);
      return {
        totalClientes: 0,
        totalProveedores: 0,
        totalOrdenes: 0,
        totalCampanas: 0
      };
    }
  }
};

export default supabaseAIService;
