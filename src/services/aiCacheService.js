/**
 * Servicio de caché para el Asistente IA
 * Almacena datos en memoria local para reducir llamadas a Supabase
 */
export const aiCacheService = {
  // ==================== CONFIGURACIÓN ====================

  cache: {},
  cacheTimestamps: {},
  cacheDuration: 5 * 60 * 1000, // 5 minutos en milisegundos

  // ==================== MÉTODOS BÁSICOS ====================

  set(key, value, duration = this.cacheDuration) {
    this.cache[key] = value;
    this.cacheTimestamps[key] = Date.now() + duration;
    console.log(`✅ Caché establecido: ${key}`);
  },

  get(key) {
    if (!this.cache.hasOwnProperty(key)) {
      return null;
    }

    // Verificar si el caché ha expirado
    if (Date.now() > this.cacheTimestamps[key]) {
      this.invalidate(key);
      return null;
    }

    return this.cache[key];
  },

  has(key) {
    return this.get(key) !== null;
  },

  invalidate(key) {
    delete this.cache[key];
    delete this.cacheTimestamps[key];
    console.log(`🗑️ Caché invalidado: ${key}`);
  },

  invalidatePattern(pattern) {
    const regex = new RegExp(pattern);
    const keysToDelete = Object.keys(this.cache).filter(key => regex.test(key));
    
    keysToDelete.forEach(key => {
      this.invalidate(key);
    });

    console.log(`🗑️ Caché invalidados (${keysToDelete.length}): ${pattern}`);
  },

  clear() {
    this.cache = {};
    this.cacheTimestamps = {};
    console.log('🗑️ Caché completamente limpiado');
  },

  // ==================== CACHÉ DE CLIENTES ====================

  setClientes(clientes) {
    this.set('clientes_all', clientes);
  },

  getClientes() {
    return this.get('clientes_all');
  },

  setClienteById(clienteId, cliente) {
    this.set(`cliente_${clienteId}`, cliente);
  },

  getClienteById(clienteId) {
    return this.get(`cliente_${clienteId}`);
  },

  invalidateClientes() {
    this.invalidatePattern('^cliente');
  },

  // ==================== CACHÉ DE PROVEEDORES ====================

  setProveedores(proveedores) {
    this.set('proveedores_all', proveedores);
  },

  getProveedores() {
    return this.get('proveedores_all');
  },

  setProveedorById(proveedorId, proveedor) {
    this.set(`proveedor_${proveedorId}`, proveedor);
  },

  getProveedorById(proveedorId) {
    return this.get(`proveedor_${proveedorId}`);
  },

  invalidateProveedores() {
    this.invalidatePattern('^proveedor');
  },

  // ==================== CACHÉ DE MEDIOS ====================

  setMedios(medios) {
    this.set('medios_all', medios);
  },

  getMedios() {
    return this.get('medios_all');
  },

  setMedioById(medioId, medio) {
    this.set(`medio_${medioId}`, medio);
  },

  getMedioById(medioId) {
    return this.get(`medio_${medioId}`);
  },

  invalidateMedios() {
    this.invalidatePattern('^medio');
  },

  // ==================== CACHÉ DE SOPORTES ====================

  setSoportes(soportes) {
    this.set('soportes_all', soportes);
  },

  getSoportes() {
    return this.get('soportes_all');
  },

  setSoporteById(soporteId, soporte) {
    this.set(`soporte_${soporteId}`, soporte);
  },

  getSoporteById(soporteId) {
    return this.get(`soporte_${soporteId}`);
  },

  invalidateSoportes() {
    this.invalidatePattern('^soporte');
  },

  // ==================== CACHÉ DE CAMPAÑAS ====================

  setCampanas(campanas) {
    this.set('campanas_all', campanas);
  },

  getCampanas() {
    return this.get('campanas_all');
  },

  setCampanaById(campanaId, campana) {
    this.set(`campana_${campanaId}`, campana);
  },

  getCampanaById(campanaId) {
    return this.get(`campana_${campanaId}`);
  },

  invalidateCampanas() {
    this.invalidatePattern('^campana');
  },

  // ==================== CACHÉ DE ÓRDENES ====================

  setOrdenes(ordenes) {
    this.set('ordenes_all', ordenes);
  },

  getOrdenes() {
    return this.get('ordenes_all');
  },

  setOrdenById(ordenId, orden) {
    this.set(`orden_${ordenId}`, orden);
  },

  getOrdenById(ordenId) {
    return this.get(`orden_${ordenId}`);
  },

  invalidateOrdenes() {
    this.invalidatePattern('^orden');
  },

  // ==================== CACHÉ DE BÚSQUEDAS ====================

  setSearchResults(tabla, termino, resultados) {
    const key = `search_${tabla}_${termino.toLowerCase()}`;
    this.set(key, resultados);
  },

  getSearchResults(tabla, termino) {
    const key = `search_${tabla}_${termino.toLowerCase()}`;
    return this.get(key);
  },

  invalidateSearchResults(tabla) {
    this.invalidatePattern(`^search_${tabla}`);
  },

  // ==================== CACHÉ DE ESTADÍSTICAS ====================

  setEstadisticas(estadisticas) {
    this.set('estadisticas', estadisticas, 10 * 60 * 1000); // 10 minutos
  },

  getEstadisticas() {
    return this.get('estadisticas');
  },

  invalidateEstadisticas() {
    this.invalidate('estadisticas');
  },

  // ==================== CACHÉ DE VALIDACIONES ====================

  setValidation(key, result) {
    this.set(`validation_${key}`, result, 2 * 60 * 1000); // 2 minutos
  },

  getValidation(key) {
    return this.get(`validation_${key}`);
  },

  invalidateValidations() {
    this.invalidatePattern('^validation_');
  },

  // ==================== ESTADÍSTICAS DE CACHÉ ====================

  getStats() {
    const keys = Object.keys(this.cache);
    const expired = keys.filter(key => Date.now() > this.cacheTimestamps[key]).length;
    const valid = keys.length - expired;

    return {
      totalKeys: keys.length,
      validKeys: valid,
      expiredKeys: expired,
      memoryUsage: JSON.stringify(this.cache).length,
      keys: keys
    };
  },

  printStats() {
    const stats = this.getStats();
    console.log('📊 Estadísticas de Caché:');
    console.log(`  Total: ${stats.totalKeys}`);
    console.log(`  Válidos: ${stats.validKeys}`);
    console.log(`  Expirados: ${stats.expiredKeys}`);
    console.log(`  Memoria: ${(stats.memoryUsage / 1024).toFixed(2)} KB`);
  },

  // ==================== LIMPIEZA AUTOMÁTICA ====================

  cleanExpired() {
    const now = Date.now();
    const expiredKeys = Object.keys(this.cacheTimestamps).filter(
      key => now > this.cacheTimestamps[key]
    );

    expiredKeys.forEach(key => {
      this.invalidate(key);
    });

    if (expiredKeys.length > 0) {
      console.log(`🧹 Limpieza automática: ${expiredKeys.length} entradas expiradas eliminadas`);
    }

    return expiredKeys.length;
  },

  // ==================== INVALIDACIÓN EN CASCADA ====================

  invalidateOnCreate(entityType) {
    switch (entityType) {
      case 'cliente':
        this.invalidateClientes();
        this.invalidateEstadisticas();
        break;
      case 'proveedor':
        this.invalidateProveedores();
        this.invalidateEstadisticas();
        break;
      case 'medio':
        this.invalidateMedios();
        this.invalidateEstadisticas();
        break;
      case 'soporte':
        this.invalidateSoportes();
        break;
      case 'campana':
        this.invalidateCampanas();
        this.invalidateEstadisticas();
        break;
      case 'orden':
        this.invalidateOrdenes();
        this.invalidateEstadisticas();
        break;
      default:
        this.clear();
    }
  },

  invalidateOnUpdate(entityType, entityId) {
    switch (entityType) {
      case 'cliente':
        this.invalidate(`cliente_${entityId}`);
        this.invalidate('clientes_all');
        this.invalidateEstadisticas();
        break;
      case 'proveedor':
        this.invalidate(`proveedor_${entityId}`);
        this.invalidate('proveedores_all');
        this.invalidateEstadisticas();
        break;
      case 'medio':
        this.invalidate(`medio_${entityId}`);
        this.invalidate('medios_all');
        break;
      case 'soporte':
        this.invalidate(`soporte_${entityId}`);
        this.invalidate('soportes_all');
        break;
      case 'campana':
        this.invalidate(`campana_${entityId}`);
        this.invalidate('campanas_all');
        this.invalidateEstadisticas();
        break;
      case 'orden':
        this.invalidate(`orden_${entityId}`);
        this.invalidate('ordenes_all');
        this.invalidateEstadisticas();
        break;
    }
  },

  invalidateOnDelete(entityType, entityId) {
    this.invalidateOnUpdate(entityType, entityId);
  },

  // ==================== WRAPPER PARA OPERACIONES CON CACHÉ ====================

  async getOrFetch(key, fetchFn, duration = this.cacheDuration) {
    // Intentar obtener del caché
    const cached = this.get(key);
    if (cached !== null) {
      console.log(`✅ Datos obtenidos del caché: ${key}`);
      return cached;
    }

    // Si no está en caché, obtener del servidor
    console.log(`🔄 Obteniendo del servidor: ${key}`);
    const data = await fetchFn();
    
    // Guardar en caché
    this.set(key, data, duration);
    
    return data;
  },

  // ==================== INICIALIZACIÓN ====================

  init() {
    // Limpiar caché expirado cada 5 minutos
    setInterval(() => {
      this.cleanExpired();
    }, 5 * 60 * 1000);

    console.log('✅ Servicio de caché inicializado');
  }
};

// Inicializar automáticamente
aiCacheService.init();

export default aiCacheService;
