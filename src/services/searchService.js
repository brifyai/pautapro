/**
 * Servicio de Búsqueda Global Inteligente para CRM
 * Proporciona búsqueda avanzada across todas las entidades del sistema
 */

import { supabase } from '../config/supabase';

class SearchService {
  constructor() {
    this.searchHistory = [];
    this.searchIndex = new Map();
    this.recentSearches = [];
    this.maxRecentSearches = 10;
    this.searchSuggestions = [];
    this.initializeSearchIndex();
  }

  /**
   * Inicializar índice de búsqueda
   */
  async initializeSearchIndex() {
    try {
      await this.buildSearchIndex();
    } catch (error) {
      console.error('Error initializing search index:', error);
    }
  }

  /**
   * Construir índice de búsqueda con todas las entidades
   */
  async buildSearchIndex() {
    try {
      const [clients, orders, campaigns, products, plans] = await Promise.all([
        this.fetchClients(),
        this.fetchOrders(),
        this.fetchCampaigns(),
        this.fetchProducts(),
        this.fetchPlans()
      ]);

      this.searchIndex.clear();

      // Indexar clientes
      clients.forEach(client => {
        const searchableText = [
          client.nombrecliente,
          client.razonsocial,
          client.rut,
          client.email,
          client.telefono
        ].filter(Boolean).join(' ').toLowerCase();

        this.searchIndex.set(`client_${client.id_cliente}`, {
          id: client.id_cliente,
          type: 'client',
          title: client.nombrecliente || client.razonsocial,
          subtitle: client.razonsocial || client.rut,
          description: `Cliente - RUT: ${client.rut}`,
          url: `/clientes/${client.id_cliente}`,
          searchableText,
          data: client,
          relevance: this.calculateRelevance('client', client)
        });
      });

      // Indexar órdenes
      orders.forEach(order => {
        const searchableText = [
          order.id_orden.toString(),
          order.nombrecliente,
          order.razonsocial,
          order.estado,
          order.total?.toString(),
          order.fecha_orden
        ].filter(Boolean).join(' ').toLowerCase();

        this.searchIndex.set(`order_${order.id_orden}`, {
          id: order.id_orden,
          type: 'order',
          title: `Orden #${order.id_orden}`,
          subtitle: order.nombrecliente || order.razonsocial,
          description: `Orden - Estado: ${order.estado} - Total: $${order.total}`,
          url: `/ordenes/${order.id_orden}`,
          searchableText,
          data: order,
          relevance: this.calculateRelevance('order', order)
        });
      });

      // Indexar campañas
      campaigns.forEach(campaign => {
        const searchableText = [
          campaign.nombrecampania,
          campaign.nombredelproducto,
          campaign.estado,
          campaign.descripcion
        ].filter(Boolean).join(' ').toLowerCase();

        this.searchIndex.set(`campaign_${campaign.id_campania}`, {
          id: campaign.id_campania,
          type: 'campaign',
          title: campaign.nombrecampania,
          subtitle: campaign.nombredelproducto || 'Sin producto',
          description: `Campaña - Estado: ${campaign.estado}`,
          url: `/campaigns/${campaign.id_campania}`,
          searchableText,
          data: campaign,
          relevance: this.calculateRelevance('campaign', campaign)
        });
      });

      // Indexar productos
      products.forEach(product => {
        const searchableText = [
          product.nombredelproducto,
          product.descripcion,
          product.categoria
        ].filter(Boolean).join(' ').toLowerCase();

        this.searchIndex.set(`product_${product.id_producto}`, {
          id: product.id_producto,
          type: 'product',
          title: product.nombredelproducto,
          subtitle: product.categoria || 'Sin categoría',
          description: `Producto - ${product.descripcion || 'Sin descripción'}`,
          url: `/productos/${product.id_producto}`,
          searchableText,
          data: product,
          relevance: this.calculateRelevance('product', product)
        });
      });

      // Indexar planes
      plans.forEach(plan => {
        const searchableText = [
          plan.nombreplan,
          plan.descripcion,
          plan.estado
        ].filter(Boolean).join(' ').toLowerCase();

        this.searchIndex.set(`plan_${plan.id_plan}`, {
          id: plan.id_plan,
          type: 'plan',
          title: plan.nombreplan,
          subtitle: `Plan - ${plan.estado}`,
          description: plan.descripcion || 'Sin descripción',
          url: `/planes/${plan.id_plan}`,
          searchableText,
          data: plan,
          relevance: this.calculateRelevance('plan', plan)
        });
      });

      console.log(`Search index built with ${this.searchIndex.size} items`);
    } catch (error) {
      console.error('Error building search index:', error);
      throw error;
    }
  }

  /**
   * Calcular relevancia para un elemento
   */
  calculateRelevance(type, data) {
    let relevance = 1;

    // Factores de relevancia basados en el tipo
    switch (type) {
      case 'client':
        relevance = data.estado === 'activo' ? 3 : 1;
        break;
      case 'order':
        relevance = data.estado === 'activa' ? 3 : data.estado === 'pendiente' ? 2 : 1;
        break;
      case 'campaign':
        relevance = data.estado === 'activa' ? 3 : 1;
        break;
      case 'product':
        relevance = 2;
        break;
      case 'plan':
        relevance = data.estado === 'activo' ? 2 : 1;
        break;
    }

    // Factores de relevancia basados en la fecha
    if (data.created_at) {
      const daysSinceCreation = (Date.now() - new Date(data.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation < 7) relevance += 1;
      if (daysSinceCreation < 30) relevance += 0.5;
    }

    return relevance;
  }

  /**
   * Realizar búsqueda global
   */
  async search(query, options = {}) {
    try {
      const {
        types = ['client', 'order', 'campaign', 'product', 'plan'],
        limit = 20,
        sortBy = 'relevance'
      } = options;

      if (!query || query.trim().length < 2) {
        return { results: [], suggestions: [], total: 0 };
      }

      const normalizedQuery = query.toLowerCase().trim();
      
      // Agregar a búsquedas recientes
      this.addToRecentSearches(query);

      // Realizar búsqueda en el índice
      const results = [];
      const queryWords = normalizedQuery.split(' ').filter(word => word.length > 0);

      for (const [key, item] of this.searchIndex) {
        if (!types.includes(item.type)) continue;

        const score = this.calculateSearchScore(item, queryWords);
        if (score > 0) {
          results.push({
            ...item,
            searchScore: score
          });
        }
      }

      // Ordenar resultados
      results.sort((a, b) => {
        if (sortBy === 'relevance') {
          return (b.searchScore * b.relevance) - (a.searchScore * a.relevance);
        } else if (sortBy === 'date') {
          return new Date(b.data.created_at || 0) - new Date(a.data.created_at || 0);
        }
        return 0;
      });

      const limitedResults = results.slice(0, limit);
      const suggestions = this.generateSuggestions(normalizedQuery, limitedResults);

      return {
        results: limitedResults,
        suggestions,
        total: results.length,
        query
      };
    } catch (error) {
      console.error('Error performing search:', error);
      throw error;
    }
  }

  /**
   * Calcular puntuación de búsqueda
   */
  calculateSearchScore(item, queryWords) {
    let score = 0;
    const searchableText = item.searchableText;

    for (const word of queryWords) {
      // Coincidencia exacta en título
      if (item.title.toLowerCase().includes(word)) {
        score += 10;
      }
      
      // Coincidencia exacta en subtítulo
      if (item.subtitle && item.subtitle.toLowerCase().includes(word)) {
        score += 7;
      }
      
      // Coincidencia exacta en cualquier parte
      if (searchableText.includes(word)) {
        score += 3;
      }
      
      // Coincidencia parcial
      if (searchableText.includes(word.substring(0, Math.max(2, word.length - 1)))) {
        score += 1;
      }
    }

    // Bonus por coincidencia de frase completa
    if (searchableText.includes(queryWords.join(' '))) {
      score += 15;
    }

    return score;
  }

  /**
   * Generar sugerencias de búsqueda
   */
  generateSuggestions(query, results) {
    const suggestions = new Set();

    // Extraer palabras clave de los resultados
    results.forEach(result => {
      const words = result.searchableText.split(' ');
      words.forEach(word => {
        if (word.includes(query) && word.length > query.length) {
          suggestions.add(word);
        }
      });
    });

    // Agregar sugerencias basadas en búsquedas populares
    this.getPopularSearches().forEach(popularSearch => {
      if (popularSearch.includes(query)) {
        suggestions.add(popularSearch);
      }
    });

    return Array.from(suggestions).slice(0, 5);
  }

  /**
   * Obtener búsquedas populares
   */
  getPopularSearches() {
    // Aquí podrías implementar lógica para obtener búsquedas populares
    // Por ahora, retornamos algunas sugerencias comunes
    return [
      'cliente activo',
      'orden pendiente',
      'campaña activa',
      'producto',
      'plan'
    ];
  }

  /**
   * Agregar a búsquedas recientes
   */
  addToRecentSearches(query) {
    // Eliminar si ya existe
    this.recentSearches = this.recentSearches.filter(search => search !== query);
    
    // Agregar al principio
    this.recentSearches.unshift(query);
    
    // Limitar número de búsquedas recientes
    this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    
    // Guardar en localStorage
    localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
  }

  /**
   * Obtener búsquedas recientes
   */
  getRecentSearches() {
    try {
      const saved = localStorage.getItem('recentSearches');
      if (saved) {
        this.recentSearches = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading recent searches:', error);
    }
    return this.recentSearches;
  }

  /**
   * Limpiar búsquedas recientes
   */
  clearRecentSearches() {
    this.recentSearches = [];
    localStorage.removeItem('recentSearches');
  }

  /**
   * Búsqueda rápida por tipo
   */
  async quickSearch(type, query, limit = 10) {
    try {
      const results = await this.search(query, { types: [type], limit });
      return results.results;
    } catch (error) {
      console.error(`Error in quick search for type ${type}:`, error);
      return [];
    }
  }

  /**
   * Búsqueda avanzada con filtros
   */
  async advancedSearch(criteria) {
    try {
      const {
        query,
        types,
        dateRange,
        status,
        limit = 50
      } = criteria;

      let baseResults = await this.search(query, { types, limit: 100 });

      // Aplicar filtros adicionales
      if (dateRange) {
        baseResults.results = baseResults.results.filter(result => {
          const createdAt = new Date(result.data.created_at);
          return createdAt >= dateRange.start && createdAt <= dateRange.end;
        });
      }

      if (status) {
        baseResults.results = baseResults.results.filter(result => {
          return result.data.estado === status;
        });
      }

      baseResults.results = baseResults.results.slice(0, limit);
      baseResults.total = baseResults.results.length;

      return baseResults;
    } catch (error) {
      console.error('Error in advanced search:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de búsqueda
   */
  getSearchStats() {
    return {
      indexedItems: this.searchIndex.size,
      recentSearches: this.recentSearches.length,
      indexByType: this.getIndexStatsByType()
    };
  }

  /**
   * Obtener estadísticas del índice por tipo
   */
  getIndexStatsByType() {
    const stats = {};
    for (const [key, item] of this.searchIndex) {
      stats[item.type] = (stats[item.type] || 0) + 1;
    }
    return stats;
  }

  /**
   * Actualizar índice para un tipo específico
   */
  async updateIndexForType(type) {
    try {
      switch (type) {
        case 'client':
          const clients = await this.fetchClients();
          clients.forEach(client => {
            const key = `client_${client.id_cliente}`;
            this.searchIndex.delete(key);
            
            const searchableText = [
              client.nombrecliente,
              client.razonsocial,
              client.rut,
              client.email,
              client.telefono
            ].filter(Boolean).join(' ').toLowerCase();

            this.searchIndex.set(key, {
              id: client.id_cliente,
              type: 'client',
              title: client.nombrecliente || client.razonsocial,
              subtitle: client.razonsocial || client.rut,
              description: `Cliente - RUT: ${client.rut}`,
              url: `/clientes/${client.id_cliente}`,
              searchableText,
              data: client,
              relevance: this.calculateRelevance('client', client)
            });
          });
          break;

        case 'order':
          const orders = await this.fetchOrders();
          orders.forEach(order => {
            const key = `order_${order.id_orden}`;
            this.searchIndex.delete(key);
            
            const searchableText = [
              order.id_orden.toString(),
              order.nombrecliente,
              order.razonsocial,
              order.estado,
              order.total?.toString(),
              order.fecha_orden
            ].filter(Boolean).join(' ').toLowerCase();

            this.searchIndex.set(key, {
              id: order.id_orden,
              type: 'order',
              title: `Orden #${order.id_orden}`,
              subtitle: order.nombrecliente || order.razonsocial,
              description: `Orden - Estado: ${order.estado} - Total: $${order.total}`,
              url: `/ordenes/${order.id_orden}`,
              searchableText,
              data: order,
              relevance: this.calculateRelevance('order', order)
            });
          });
          break;

        // Implementar para otros tipos según sea necesario
      }

      console.log(`Updated search index for type: ${type}`);
    } catch (error) {
      console.error(`Error updating index for type ${type}:`, error);
      throw error;
    }
  }

  // Métodos para obtener datos de la base de datos
  async fetchClients() {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async fetchOrders() {
    const { data, error } = await supabase
      .from('ordenes')
      .select(`
        *,
        clientes (nombrecliente, razonsocial)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async fetchCampaigns() {
    const { data, error } = await supabase
      .from('campanas')
      .select(`
        *,
        productos (nombredelproducto)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async fetchProducts() {
    const { data, error } = await supabase
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async fetchPlans() {
    const { data, error } = await supabase
      .from('planes')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }
}

export default new SearchService();