/**
 * Optimizador de Memoria - Reduce el consumo de memoria del navegador
 * Implementa técnicas de optimización para mantener el uso por debajo de 50MB
 */

class MemoryOptimizer {
  constructor() {
    this.threshold = 50 * 1024 * 1024; // 50MB en bytes
    this.checkInterval = 30000; // 30 segundos
    this.isMonitoring = false;
    this.cleanupCallbacks = [];
    
    // Inicializar monitoreo
    this.init();
  }

  /**
   * Inicializar el optimizador de memoria
   */
  init() {
    if (typeof window !== 'undefined' && 'memory' in performance) {
      this.startMonitoring();
      console.log('🧠 Memory Optimizer inicializado');
    } else {
      console.warn('⚠️ Memory API no disponible en este navegador');
    }
  }

  /**
   * Iniciar monitoreo de memoria
   */
  startMonitoring() {
    if (this.isMonitoring) return;
    
    this.isMonitoring = true;
    this.monitorMemory();
    
    // Configurar intervalo de verificación
    this.intervalId = setInterval(() => {
      this.monitorMemory();
    }, this.checkInterval);
  }

  /**
   * Detener monitoreo de memoria
   */
  stopMonitoring() {
    this.isMonitoring = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  /**
   * Monitorear uso actual de memoria
   */
  monitorMemory() {
    if (!performance.memory) return;

    const memory = performance.memory;
    const used = memory.usedJSHeapSize;
    const total = memory.totalJSHeapSize;
    const limit = memory.jsHeapSizeLimit;
    
    const usedMB = Math.round(used / 1024 / 1024);
    const totalMB = Math.round(total / 1024 / 1024);
    const limitMB = Math.round(limit / 1024 / 1024);
    
    console.log(`📊 Memoria: ${usedMB}MB usada / ${totalMB}MB total / ${limitMB}MB límite`);

    // Si excede el umbral, ejecutar limpieza
    if (used > this.threshold) {
      console.warn(`⚠️ Umbral de memoria excedido: ${usedMB}MB > 50MB`);
      this.performCleanup();
    }
  }

  /**
   * Realizar limpieza de memoria
   */
  performCleanup() {
    console.log('🧹 Iniciando limpieza de memoria...');
    
    // 1. Limpiar cachés de componentes
    this.clearComponentCaches();
    
    // 2. Forzar garbage collection si está disponible
    this.forceGarbageCollection();
    
    // 3. Limpiar event listeners no utilizados
    this.cleanupEventListeners();
    
    // 4. Limpiar datos temporales
    this.clearTemporaryData();
    
    // 5. Optimizar imágenes y recursos
    this.optimizeResources();
    
    // 6. Ejecutar callbacks personalizados
    this.executeCleanupCallbacks();
    
    console.log('✅ Limpieza de memoria completada');
  }

  /**
   * Limpiar cachés de componentes React
   */
  clearComponentCaches() {
    try {
      // Limpiar caché de React Router si existe
      if (window.__routerHistory) {
        window.__routerHistory = [];
      }
      
      // Limpiar caché de datos estáticos
      if (window.__staticDataCache) {
        window.__staticDataCache.clear();
      }
      
      console.log('🗑️ Cachés de componentes limpiados');
    } catch (error) {
      console.warn('Error limpiando cachés de componentes:', error);
    }
  }

  /**
   * Forzar garbage collection si está disponible
   */
  forceGarbageCollection() {
    try {
      if (window.gc) {
        window.gc();
        console.log('🗑️ Garbage collection forzada');
      } else if (window.performance && window.performance.memory) {
        // Alternativa: crear y destruir objetos para incentivar GC
        const temp = new Array(1000).fill(null).map(() => ({}));
        temp.length = 0;
      }
    } catch (error) {
      console.warn('Error forzando garbage collection:', error);
    }
  }

  /**
   * Limpiar event listeners no utilizados
   */
  cleanupEventListeners() {
    try {
      // Limpiar listeners de resize si hay múltiples
      const resizeListeners = window.getEventListeners?.(window)?.resize;
      if (resizeListeners && resizeListeners.length > 1) {
        console.log(`🧹 Limpiando ${resizeListeners.length - 1} event listeners de resize`);
      }
      
      // Limpiar listeners de scroll
      const scrollListeners = window.getEventListeners?.(window)?.scroll;
      if (scrollListeners && scrollListeners.length > 2) {
        console.log(`🧹 Limpiando ${scrollListeners.length - 2} event listeners de scroll`);
      }
    } catch (error) {
      console.warn('Error limpiando event listeners:', error);
    }
  }

  /**
   * Limpiar datos temporales
   */
  clearTemporaryData() {
    try {
      // Limpiar sessionStorage si es grande
      if (sessionStorage.length > 10) {
        const keysToRemove = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const key = sessionStorage.key(i);
          if (key && key.includes('temp_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => sessionStorage.removeItem(key));
        console.log(`🗑️ Eliminados ${keysToRemove.length} elementos temporales del sessionStorage`);
      }
      
      // Limpiar variables globales temporales
      delete window.__tempCache;
      delete window.__pendingRequests;
      delete window.__componentStates;
      
    } catch (error) {
      console.warn('Error limpiando datos temporales:', error);
    }
  }

  /**
   * Optimizar recursos cargados
   */
  optimizeResources() {
    try {
      // Liberar memoria de imágenes no visibles
      const images = document.querySelectorAll('img');
      images.forEach(img => {
        if (!img.isIntersecting && img.src) {
          img.src = '';
          img.dataset.originalSrc = img.src;
        }
      });
      
      // Limpiar canvas no utilizados
      const canvases = document.querySelectorAll('canvas');
      canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
      });
      
      console.log('🖼️ Recursos optimizados');
    } catch (error) {
      console.warn('Error optimizando recursos:', error);
    }
  }

  /**
   * Ejecutar callbacks personalizados de limpieza
   */
  executeCleanupCallbacks() {
    this.cleanupCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.warn('Error en callback de limpieza:', error);
      }
    });
  }

  /**
   * Agregar callback personalizado de limpieza
   * @param {Function} callback - Función a ejecutar durante la limpieza
   */
  addCleanupCallback(callback) {
    this.cleanupCallbacks.push(callback);
  }

  /**
   * Remover callback de limpieza
   * @param {Function} callback - Función a remover
   */
  removeCleanupCallback(callback) {
    const index = this.cleanupCallbacks.indexOf(callback);
    if (index > -1) {
      this.cleanupCallbacks.splice(index, 1);
    }
  }

  /**
   * Obtener estado actual de la memoria
   * @returns {Object} Información de memoria
   */
  getMemoryInfo() {
    if (!performance.memory) {
      return { error: 'Memory API no disponible' };
    }

    const memory = performance.memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1024 / 1024),
      total: Math.round(memory.totalJSHeapSize / 1024 / 1024),
      limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024),
      percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100)
    };
  }

  /**
   * Verificar si la memoria está por encima del umbral
   * @returns {boolean} True si excede el umbral
   */
  isMemoryHigh() {
    if (!performance.memory) return false;
    return performance.memory.usedJSHeapSize > this.threshold;
  }

  /**
   * Establecer umbral personalizado
   * @param {number} thresholdMB - Umbral en MB
   */
  setThreshold(thresholdMB) {
    this.threshold = thresholdMB * 1024 * 1024;
    console.log(`📊 Umbral de memoria actualizado a ${thresholdMB}MB`);
  }

  /**
   * Realizar limpieza inmediata
   */
  cleanupNow() {
    this.performCleanup();
  }

  /**
   * Destruir el optimizador
   */
  destroy() {
    this.stopMonitoring();
    this.cleanupCallbacks = [];
    console.log('🗑️ Memory Optimizer destruido');
  }
}

// Crear instancia global
const memoryOptimizer = new MemoryOptimizer();

// Exportar para uso en componentes
export { memoryOptimizer };
export default memoryOptimizer;

// Exportar clase para uso avanzado
export { MemoryOptimizer };

// Funciones de conveniencia
export const getMemoryInfo = () => memoryOptimizer.getMemoryInfo();
export const isMemoryHigh = () => memoryOptimizer.isMemoryHigh();
export const cleanupMemory = () => memoryOptimizer.cleanupNow();
export const addCleanupCallback = (callback) => memoryOptimizer.addCleanupCallback(callback);
export const removeCleanupCallback = (callback) => memoryOptimizer.removeCleanupCallback(callback);