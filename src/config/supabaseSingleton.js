/**
 * Supabase Singleton - Optimización para evitar múltiples instancias de GoTrueClient
 * Implementa el patrón Singleton para garantizar una única instancia de Supabase
 */

import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

class SupabaseSingleton {
  constructor() {
    // Si ya existe una instancia, retornarla
    if (SupabaseSingleton.instance) {
      return SupabaseSingleton.instance;
    }

    // Validar que las variables de entorno existan
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Faltan variables de entorno de Supabase: VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
    }

    // Crear única instancia
    this.client = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      },
      realtime: {
        params: {
          eventsPerSecond: 10
        }
      }
    });

    // Guardar instancia
    SupabaseSingleton.instance = this;
    
    // Log para debugging
    console.log('✅ Supabase Singleton inicializado correctamente');
  }

  /**
   * Obtener la instancia del cliente Supabase
   * @returns {Object} Cliente Supabase
   */
  getClient() {
    return this.client;
  }

  /**
   * Obtener la instancia del singleton
   * @returns {SupabaseSingleton} Instancia del singleton
   */
  static getInstance() {
    if (!SupabaseSingleton.instance) {
      SupabaseSingleton.instance = new SupabaseSingleton();
    }
    return SupabaseSingleton.instance;
  }

  /**
   * Resetear la instancia (útil para testing)
   */
  static resetInstance() {
    SupabaseSingleton.instance = null;
  }

  /**
   * Verificar si hay una sesión activa
   * @returns {Promise<boolean>} True si hay sesión activa
   */
  async isAuthenticated() {
    try {
      const { data: { session } } = await this.client.auth.getSession();
      return !!session;
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      return false;
    }
  }

  /**
   * Obtener usuario actual
   * @returns {Promise<Object|null>} Datos del usuario o null
   */
  async getCurrentUser() {
    try {
      const { data: { user } } = await this.client.auth.getUser();
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }

  /**
   * Método wrapper para consultas a la base de datos
   * @param {string} table - Nombre de la tabla
   * @param {string} columns - Columnas a seleccionar
   * @param {Object} filters - Filtros a aplicar
   * @param {Object} options - Opciones adicionales (limit, order, etc.)
   * @returns {Promise<Array>} Resultados de la consulta
   */
  async query(table, columns = '*', filters = {}, options = {}) {
    try {
      let query = this.client.from(table).select(columns);
      
      // Aplicar filtros
      Object.entries(filters).forEach(([key, value]) => {
        if (typeof value === 'object' && value.order) {
          query = query.order(key, { ascending: value.ascending !== false });
        } else if (typeof value === 'object' && value.like) {
          query = query.ilike(key, value.like);
        } else if (typeof value === 'object' && value.in) {
          query = query.in(key, value.in);
        } else {
          query = query.eq(key, value);
        }
      });

      // Aplicar opciones adicionales
      if (options.limit) query = query.limit(options.limit);
      if (options.offset) query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      if (options.single) query = query.single();
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error(`Error en consulta genérica a ${table}:`, error);
      throw error;
    }
  }

  /**
   * Método wrapper para inserciones
   * @param {string} table - Nombre de la tabla
   * @param {Object|Array} data - Datos a insertar
   * @returns {Promise<Object>} Resultado de la inserción
   */
  async insert(table, data) {
    try {
      const { result, error } = await this.client.from(table).insert(data);
      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error insertando en ${table}:`, error);
      throw error;
    }
  }

  /**
   * Método wrapper para actualizaciones
   * @param {string} table - Nombre de la tabla
   * @param {Object} data - Datos a actualizar
   * @param {Object} filters - Filtros para identificar registros
   * @returns {Promise<Object>} Resultado de la actualización
   */
  async update(table, data, filters) {
    try {
      let query = this.client.from(table).update(data);
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { result, error } = await query;
      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error actualizando ${table}:`, error);
      throw error;
    }
  }

  /**
   * Método wrapper para eliminaciones
   * @param {string} table - Nombre de la tabla
   * @param {Object} filters - Filtros para identificar registros
   * @returns {Promise<Object>} Resultado de la eliminación
   */
  async delete(table, filters) {
    try {
      let query = this.client.from(table).delete();
      
      Object.entries(filters).forEach(([key, value]) => {
        query = query.eq(key, value);
      });
      
      const { result, error } = await query;
      if (error) throw error;
      return result;
    } catch (error) {
      console.error(`Error eliminando de ${table}:`, error);
      throw error;
    }
  }
}

// Crear y exportar la instancia única
const supabaseSingleton = new SupabaseSingleton();

// Exportar el cliente directamente para compatibilidad con código existente
export const supabase = supabaseSingleton.getClient();

// Exportar el singleton para acceso avanzado
export { supabaseSingleton as SupabaseSingleton };

// Exportar por defecto el cliente para compatibilidad
export default supabase;