/**
 * Servicio para el manejo de versionamiento de órdenes
 * Implementa numeración correlativa inteligente con versión
 * Formato: ORD-YYYY-NNN-V (ej: ORD-2024-001-0, ORD-2024-001-1, etc.)
 */

import { supabase } from '../config/supabase';

class OrdenVersionamientoService {
  
  /**
   * Genera el próximo número de orden correlativo con versión
   * @param {number} anio - Año de la orden (opcional, usa el actual por defecto)
   * @returns {Promise<string>} - Número de orden formateado (ej: "ORD-2024-001-0")
   */
  async generarProximoNumeroOrden(anio = new Date().getFullYear()) {
    try {
      // 1. Buscar la última orden del año actual
      const { data: ultimaOrden, error } = await supabase
        .from('ordenesdepublicidad')
        .select('numero_correlativo, created_at')
        .like('numero_correlativo', `ORD-${anio}-%`)
        .order('numero_correlativo', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      let proximoNumero = 1;
      let version = 0;

      if (ultimaOrden) {
        // 2. Extraer el número y versión del correlativo existente
        const match = ultimaOrden.numero_correlativo.match(/ORD-(\d{4})-(\d+)-(\d+)/);
        if (match) {
          const [, anioExistente, numeroStr, versionStr] = match;
          const numeroExistente = parseInt(numeroStr);
          const versionExistente = parseInt(versionStr);
          
          // 3. Verificar si es una nueva versión de una orden existente
          // o un nuevo número correlativo
          const esMismaOrden = await this.esMismaOrdenReciente(ultimaOrden);
          
          if (esMismaOrden) {
            // Es una modificación de una orden existente -> incrementar versión
            proximoNumero = numeroExistente;
            version = versionExistente + 1;
          } else {
            // Es una orden completamente nueva -> siguiente número correlativo
            proximoNumero = numeroExistente + 1;
            version = 0;
          }
        }
      }

      // 4. Formatear el número con ceros a la izquierda (3 dígitos)
      const numeroFormateado = proximoNumero.toString().padStart(3, '0');
      
      // 5. Retornar el número formateado completo
      return `ORD-${anio}-${numeroFormateado}-${version}`;

    } catch (error) {
      console.error('Error generando próximo número de orden:', error);
      // En caso de error, generar un número básico
      const numeroFormateado = '001';
      const version = 0;
      return `ORD-${anio}-${numeroFormateado}-${version}`;
    }
  }

  /**
   * Verifica si una orden es una modificación reciente de una orden existente
   * @param {Object} ultimaOrden - Última orden encontrada
   * @returns {Promise<boolean>} - True si es la misma orden recientemente modificada
   */
  async esMismaOrdenReciente(ultimaOrden) {
    try {
      // Considerar "reciente" si fue creada en las últimas 24 horas
      const fechaCreacion = new Date(ultimaOrden.created_at);
      const ahora = new Date();
      const horasDiferencia = (ahora - fechaCreacion) / (1000 * 60 * 60);
      
      return horasDiferencia <= 24;
    } catch (error) {
      console.error('Error verificando si es misma orden reciente:', error);
      return false;
    }
  }

  /**
   * Crea una nueva versión de una orden existente
   * @param {string} numeroOrdenBase - Número de orden base (ej: "ORD-2024-001")
   * @param {Object} datosModificacion - Datos modificados de la orden
   * @returns {Promise<Object>} - Nueva orden creada
   */
  async crearNuevaVersion(numeroOrdenBase, datosModificacion) {
    try {
      // 1. Obtener la última versión de esta orden
      const { data: ultimaVersion, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .like('numero_correlativo', `${numeroOrdenBase}-%`)
        .order('numero_correlativo', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;

      // 2. Extraer información de la última versión
      const match = ultimaVersion.numero_correlativo.match(/ORD-(\d{4})-(\d+)-(\d+)/);
      if (!match) throw new Error('Formato de número de orden inválido');

      const [, anio, numero, versionStr] = match;
      const nuevaVersion = parseInt(versionStr) + 1;

      // 3. Crear nueva versión
      const nuevoNumeroCorrelativo = `${numeroOrdenBase}-${nuevaVersion}`;
      
      const nuevaOrden = {
        ...ultimaVersion,
        ...datosModificacion,
        id_ordenes_de_comprar: undefined, // Dejar que la BD genere nuevo ID
        numero_correlativo: nuevoNumeroCorrelativo,
        version_anterior: ultimaVersion.numero_correlativo,
        fecha_creacion_version: new Date().toISOString(),
        es_version: true
      };

      // Eliminar campos que no deben duplicarse
      delete nuevaOrden.created_at;
      delete nuevaOrden.updated_at;

      const { data: ordenCreada, error: errorCreacion } = await supabase
        .from('ordenesdepublicidad')
        .insert(nuevaOrden)
        .select()
        .single();

      if (errorCreacion) throw errorCreacion;

      // 4. Actualizar la orden anterior para marcarla como versionada
      await supabase
        .from('ordenesdepublicidad')
        .update({
          tiene_versiones_posteriores: true,
          ultima_version: nuevoNumeroCorrelativo
        })
        .eq('id_ordenes_de_comprar', ultimaVersion.id_ordenes_de_comprar);

      return ordenCreada;

    } catch (error) {
      console.error('Error creando nueva versión:', error);
      throw error;
    }
  }

  /**
   * Obtiene el historial de versiones de una orden
   * @param {string} numeroOrdenBase - Número de orden base (ej: "ORD-2024-001")
   * @returns {Promise<Array>} - Lista de versiones ordenadas de la más reciente a la más antigua
   */
  async obtenerHistorialVersiones(numeroOrdenBase) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .like('numero_correlativo', `${numeroOrdenBase}-%`)
        .order('numero_correlativo', { ascending: false });

      if (error) throw error;

      return data || [];

    } catch (error) {
      console.error('Error obteniendo historial de versiones:', error);
      throw error;
    }
  }

  /**
   * Obtiene la última versión de una orden
   * @param {string} numeroOrdenBase - Número de orden base (ej: "ORD-2024-001")
   * @returns {Promise<Object|null>} - Última versión o null si no existe
   */
  async obtenerUltimaVersion(numeroOrdenBase) {
    try {
      const { data, error } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .like('numero_correlativo', `${numeroOrdenBase}-%`)
        .order('numero_correlativo', { ascending: false })
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      return data || null;

    } catch (error) {
      console.error('Error obteniendo última versión:', error);
      throw error;
    }
  }

  /**
   * Verifica si una orden puede ser modificada
   * @param {string} numeroOrden - Número de orden completo
   * @returns {Promise<boolean>} - True si puede ser modificada
   */
  async puedeSerModificada(numeroOrden) {
    try {
      const { data: orden, error } = await supabase
        .from('ordenesdepublicidad')
        .select('estado, fecha_creacion_version')
        .eq('numero_correlativo', numeroOrden)
        .single();

      if (error) throw error;

      // No se puede modificar si está en producción o completada
      if (orden.estado === 'produccion' || orden.estado === 'completada') {
        return false;
      }

      // Si es una versión, verificar que no sea muy antigua
      if (orden.fecha_creacion_version) {
        const fechaVersion = new Date(orden.fecha_creacion_version);
        const ahora = new Date();
        const diasDiferencia = (ahora - fechaVersion) / (1000 * 60 * 60 * 24);
        
        // No permitir modificar versiones de más de 7 días
        if (diasDiferencia > 7) {
          return false;
        }
      }

      return true;

    } catch (error) {
      console.error('Error verificando si puede ser modificada:', error);
      return false;
    }
  }

  /**
   * Formatea el número de orden para visualización
   * @param {string} numeroOrden - Número de orden completo
   * @returns {Object} - Objeto con componentes formateados
   */
  parsearNumeroOrden(numeroOrden) {
    const match = numeroOrden.match(/ORD-(\d{4})-(\d+)-(\d+)/);
    
    if (!match) {
      return {
        completo: numeroOrden,
        prefijo: 'ORD',
        anio: '----',
        numero: '---',
        version: '-',
        esVersion: false
      };
    }

    const [, anio, numero, version] = match;
    
    return {
      completo: numeroOrden,
      prefijo: 'ORD',
      anio,
      numero,
      version,
      esVersion: parseInt(version) > 0,
      esOriginal: parseInt(version) === 0,
      versionNumerica: parseInt(version)
    };
  }

  /**
   * Genera un reporte de versiones de órdenes
   * @param {Object} filtros - Filtros para el reporte
   * @returns {Promise<Array>} - Datos del reporte
   */
  async generarReporteVersiones(filtros = {}) {
    try {
      let query = supabase
        .from('ordenesdepublicidad')
        .select(`
          *,
          Clientes (nombrecliente, razonSocial),
          Campania (nombrecampania),
          usuarios_registro (nombre, email)
        `);

      // Aplicar filtros
      if (filtros.anio) {
        query = query.like('numero_correlativo', `ORD-${filtros.anio}-%`);
      }

      if (filtros.cliente_id) {
        query = query.eq('id_cliente', filtros.cliente_id);
      }

      if (filtros.estado) {
        query = query.eq('estado', filtros.estado);
      }

      if (filtros.fecha_inicio) {
        query = query.gte('created_at', filtros.fecha_inicio);
      }

      if (filtros.fecha_fin) {
        query = query.lte('created_at', filtros.fecha_fin);
      }

      const { data, error } = await query
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Procesar datos para el reporte
      return (data || []).map(orden => {
        const parsed = this.parsearNumeroOrden(orden.numero_correlativo);
        
        return {
          ...orden,
          ...parsed,
          tipo_version: parsed.esOriginal ? 'Original' : `Versión ${parsed.version}`,
          puede_modificar: parsed.esOriginal || (parsed.esVersion && parsed.versionNumerica <= 2)
        };
      });

    } catch (error) {
      console.error('Error generando reporte de versiones:', error);
      throw error;
    }
  }
}

// Exportar instancia única del servicio
export const ordenVersionamientoService = new OrdenVersionamientoService();
export default ordenVersionamientoService;