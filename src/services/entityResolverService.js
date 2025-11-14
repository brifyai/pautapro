/**
 * Servicio de Resolución de Entidades
 * Convierte nombres extraídos por NLP en IDs reales de la base de datos
 */

import { supabase } from '../config/supabase';

export const entityResolverService = {
  /**
   * Busca cliente por nombre y devuelve ID
   */
  async resolveCliente(clienteName) {
    try {
      if (!clienteName) return null;
      
      // Buscar por nombre exacto o similar
      const { data, error } = await supabase
        .from('clientes')
        .select('id, razonsocial, rut')
        .or(`razonsocial.ilike.%${clienteName}%`)
        .limit(5);

      if (error) throw error;
      
      if (data && data.length > 0) {
        // Devolver el primer match más relevante
        return {
          id: data[0].id,
          nombre: data[0].razonsocial,
          razonSocial: data[0].razonsocial,
          rut: data[0].rut,
          confidence: this.calculateMatchConfidence(clienteName, data[0].razonsocial)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error resolviendo cliente:', error);
      return null;
    }
  },

  /**
   * Busca medio por nombre y devuelve ID
   */
  async resolveMedio(medioName) {
    try {
      if (!medioName) return null;
      
      const { data, error } = await supabase
        .from('medios')
        .select('id, nombredelmedio, tipo_medio')
        .ilike('nombredelmedio', `%${medioName}%`)
        .limit(5);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          id: data[0].id,
          nombre: data[0].nombredelmedio,
          tipo: data[0].tipo_medio,
          confidence: this.calculateMatchConfidence(medioName, data[0].nombredelmedio)
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error resolviendo medio:', error);
      return null;
    }
  },

  /**
   * Busca o crea campaña
   */
  async resolveOrCreateCampana(campanaData, clienteId) {
    try {
      if (!campanaData.nombrecampania || !clienteId) return null;
      
      // Primero buscar si existe
      const { data: existing, error: searchError } = await supabase
        .from('campania')
        .select('id, nombrecampania')
        .eq('nombrecampania', campanaData.nombrecampania)
        .eq('id_cliente', clienteId)
        .single();

      if (searchError && searchError.code !== 'PGRST116') {
        throw searchError;
      }

      if (existing) {
        return {
          id: existing.id,
          nombre: existing.nombrecampania,
          created: false
        };
      }

      // Si no existe, crearla
      const { data: created, error: createError } = await supabase
        .from('campania')
        .insert({
          ...campanaData,
          id_cliente: clienteId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (createError) throw createError;

      return {
        id: created.id,
        nombre: created.nombrecampania,
        created: true
      };
    } catch (error) {
      console.error('Error resolviendo/creando campaña:', error);
      return null;
    }
  },

  /**
   * Busca contrato activo para cliente y medio
   */
  async resolveContrato(clienteId, medioId) {
    try {
      if (!clienteId || !medioId) return null;
      
      const { data, error } = await supabase
        .from('contratos')
        .select(`
          id, 
          nombrecontrato,
          id_proveedor,
          Proveedores(id, nombreproveedor, rutproveedor),
          FormaDePago(id, nombreformadepago)
        `)
        .eq('id_cliente', clienteId)
        .eq('id_medio', medioId)
        .eq('estado', 'activo')
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          id: data[0].id,
          nombre: data[0].nombrecontrato,
          proveedor: data[0].Proveedores,
          formaPago: data[0].FormaDePago
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error resolviendo contrato:', error);
      return null;
    }
  },

  /**
   * Busca soporte para medio
   */
  async resolveSoporte(medioId) {
    try {
      if (!medioId) return null;
      
      const { data, error } = await supabase
        .from('soportes')
        .select('id, nombreidentificador, tipo_soporte')
        .eq('id_medio', medioId)
        .limit(1);

      if (error) throw error;
      
      if (data && data.length > 0) {
        return {
          id: data[0].id,
          nombre: data[0].nombreidentificador,
          tipo: data[0].tipo_soporte
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error resolviendo soporte:', error);
      return null;
    }
  },

  /**
   * Resuelve todas las entidades para una orden
   */
  async resolveOrderEntities(entities, structure) {
    try {
      const resolved = {
        cliente: null,
        medio: null,
        campana: null,
        contrato: null,
        soporte: null,
        errors: []
      };

      // Resolver cliente
      resolved.cliente = await this.resolveCliente(entities.cliente);
      if (!resolved.cliente) {
        resolved.errors.push(`No se encontró el cliente "${entities.cliente}"`);
        return resolved;
      }

      // Resolver medio
      resolved.medio = await this.resolveMedio(entities.medio);
      if (!resolved.medio) {
        resolved.errors.push(`No se encontró el medio "${entities.medio}"`);
        return resolved;
      }

      // Resolver o crear campaña
      resolved.campana = await this.resolveOrCreateCampana(
        structure.campana, 
        resolved.cliente.id
      );
      if (!resolved.campana) {
        resolved.errors.push('No se pudo crear o encontrar la campaña');
        return resolved;
      }

      // Resolver contrato
      resolved.contrato = await this.resolveContrato(
        resolved.cliente.id, 
        resolved.medio.id
      );
      if (!resolved.contrato) {
        resolved.errors.push('No se encontró un contrato activo para este cliente y medio');
        return resolved;
      }

      // Resolver soporte
      resolved.soporte = await this.resolveSoporte(resolved.medio.id);
      if (!resolved.soporte) {
        resolved.errors.push('No se encontró un soporte para este medio');
        return resolved;
      }

      return resolved;
    } catch (error) {
      console.error('Error resolviendo entidades:', error);
      return {
        cliente: null,
        medio: null,
        campana: null,
        contrato: null,
        soporte: null,
        errors: [error.message]
      };
    }
  },

  /**
   * Prepara la estructura final de la orden con IDs resueltos
   */
  prepareOrderStructure(structure, resolved) {
    const finalStructure = JSON.parse(JSON.stringify(structure));
    
    // Actualizar IDs en la orden
    finalStructure.orden.id_cliente = resolved.cliente.id;
    finalStructure.orden.id_campana = resolved.campana.id;
    finalStructure.orden.id_medio = resolved.medio.id;
    
    // Actualizar IDs en la campaña
    finalStructure.campana.id_cliente = resolved.cliente.id;
    
    // Actualizar IDs en las alternativas
    finalStructure.alternativas[0].id_medio = resolved.medio.id;
    finalStructure.alternativas[0].id_soporte = resolved.soporte.id;
    finalStructure.alternativas[0].id_contrato = resolved.contrato.id;
    
    // Agregar información adicional
    finalStructure.resolved = {
      cliente: resolved.cliente,
      medio: resolved.medio,
      campana: resolved.campana,
      contrato: resolved.contrato,
      soporte: resolved.soporte
    };
    
    return finalStructure;
  },

  /**
   * Calcula confianza del match entre texto buscado y encontrado
   */
  calculateMatchConfidence(searchText, ...foundTexts) {
    let maxConfidence = 0;
    
    for (const foundText of foundTexts) {
      if (!foundText) continue;
      
      const search = searchText.toLowerCase().trim();
      const found = foundText.toLowerCase().trim();
      
      // Exact match
      if (search === found) {
        return 100;
      }
      
      // Contains match
      if (found.includes(search) || search.includes(found)) {
        const confidence = Math.round((Math.min(search.length, found.length) / Math.max(search.length, found.length)) * 100);
        maxConfidence = Math.max(maxConfidence, confidence);
      }
      
      // Levenshtein distance (simplificado)
      const distance = this.levenshteinDistance(search, found);
      const maxLength = Math.max(search.length, found.length);
      const similarity = Math.round(((maxLength - distance) / maxLength) * 100);
      maxConfidence = Math.max(maxConfidence, similarity);
    }
    
    return maxConfidence;
  },

  /**
   * Calcula distancia de Levenshtein (versión simplificada)
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  },

  /**
   * Sugiere alternativas cuando no se encuentra una entidad
   */
  async suggestAlternatives(entityType, searchText) {
    try {
      let suggestions = [];
      
      switch (entityType) {
        case 'cliente':
          const { data: clientes } = await supabase
            .from('clientes')
            .select('id, razonsocial')
            .ilike('razonsocial', `%${searchText}%`)
            .limit(5);
          
          suggestions = clientes?.map(c => ({
            id: c.id,
            nombre: c.razonsocial,
            tipo: 'Cliente'
          })) || [];
          break;
          
        case 'medio':
          const { data: medios } = await supabase
            .from('medios')
            .select('id, nombredelmedio, tipo_medio')
            .ilike('nombredelmedio', `%${searchText}%`)
            .limit(5);
          
          suggestions = medios?.map(m => ({
            id: m.id,
            nombre: m.nombredelmedio,
            tipo: 'Medio'
          })) || [];
          break;
      }
      
      return suggestions;
    } catch (error) {
      console.error('Error obteniendo sugerencias:', error);
      return [];
    }
  }
};

export default entityResolverService;