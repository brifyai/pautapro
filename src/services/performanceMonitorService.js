/**
 * Servicio de Monitoreo de Rendimiento
 * Proporciona métricas y alertas sobre el rendimiento de la aplicación
 */

class PerformanceMonitorService {
    constructor() {
        this.metrics = {
            pageLoadTime: 0,
            componentRenderTime: {},
            apiResponseTime: {},
            memoryUsage: 0,
            errorRate: 0,
            userInteractions: 0
        };
        
        this.observers = [];
        this.isMonitoring = false;
        this.performanceThresholds = {
            pageLoadTime: 3000, // 3 segundos
            componentRenderTime: 100, // 100ms
            apiResponseTime: 2000, // 2 segundos
            memoryUsage: 50 * 1024 * 1024, // 50MB
            errorRate: 5 // 5%
        };
        
        this.initializeObserver();
    }

    /**
     * Inicializa el Performance Observer API
     */
    initializeObserver() {
        if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
            try {
                // Observer para métricas de navegación
                const navObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'navigation') {
                            this.metrics.pageLoadTime = entry.loadEventEnd - entry.fetchStart;
                            this.checkThreshold('pageLoadTime', this.metrics.pageLoadTime);
                        }
                    }
                });
                
                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.push(navObserver);

                // Observer para métricas de recursos
                const resourceObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        if (entry.entryType === 'resource') {
                            const url = new URL(entry.name).pathname;
                            if (!this.metrics.apiResponseTime[url]) {
                                this.metrics.apiResponseTime[url] = [];
                            }
                            this.metrics.apiResponseTime[url].push(entry.duration);
                            
                            // Mantener solo las últimas 10 mediciones
                            if (this.metrics.apiResponseTime[url].length > 10) {
                                this.metrics.apiResponseTime[url].shift();
                            }
                            
                            const avgTime = this.metrics.apiResponseTime[url].reduce((a, b) => a + b, 0) / this.metrics.apiResponseTime[url].length;
                            this.checkThreshold('apiResponseTime', avgTime, url);
                        }
                    }
                });
                
                resourceObserver.observe({ entryTypes: ['resource'] });
                this.observers.push(resourceObserver);

                // Observer para métricas de paint
                const paintObserver = new PerformanceObserver((list) => {
                    for (const entry of list.getEntries()) {
                        console.log(`${entry.name}: ${entry.startTime}ms`);
                    }
                });
                
                paintObserver.observe({ entryTypes: ['paint'] });
                this.observers.push(paintObserver);

            } catch (error) {
                console.warn('Error inicializando Performance Observer:', error);
            }
        }
    }

    /**
     * Inicia el monitoreo de rendimiento
     */
    startMonitoring() {
        if (this.isMonitoring) return;
        
        this.isMonitoring = true;
        this.startTime = performance.now();
        
        // Monitorear uso de memoria si está disponible
        if ('memory' in performance) {
            this.monitorMemory();
        }
        
        // Monitorear interacciones del usuario
        this.monitorUserInteractions();
        
        // Monitorear errores
        this.monitorErrors();
        
        console.log('🚀 Monitoreo de rendimiento iniciado');
    }

    /**
     * Detiene el monitoreo de rendimiento
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        this.isMonitoring = false;
        
        // Detener todos los observers
        this.observers.forEach(observer => {
            observer.disconnect();
        });
        this.observers = [];
        
        console.log('⏹️ Monitoreo de rendimiento detenido');
    }

    /**
     * Monitorea el uso de memoria
     */
    monitorMemory() {
        if (!('memory' in performance)) return;

        const checkMemory = () => {
            if (!this.isMonitoring) return;

            const memory = performance.memory;
            this.metrics.memoryUsage = memory.usedJSHeapSize;

            // Solo verificar umbral si excede significativamente
            if (this.metrics.memoryUsage > this.performanceThresholds.memoryUsage * 1.8) {
                this.checkThreshold('memoryUsage', this.metrics.memoryUsage);
            }

            // Verificar cada 10 segundos en lugar de 5
            setTimeout(checkMemory, 10000);
        };

        checkMemory();
    }

    /**
     * Monitorea las interacciones del usuario
     */
    monitorUserInteractions() {
        const events = ['click', 'scroll', 'keydown', 'touchstart'];
        
        const countInteraction = () => {
            this.metrics.userInteractions++;
        };
        
        events.forEach(event => {
            document.addEventListener(event, countInteraction, { passive: true });
        });
    }

    /**
     * Monitorea los errores de la aplicación
     */
    monitorErrors() {
        const originalError = console.error;
        let errorCount = 0;
        let totalOperations = 0;

        console.error = (...args) => {
            errorCount++;
            // Solo contar errores críticos, no todos los console.error
            const errorMessage = args.join(' ');
            // Mostrar errores importantes pero filtrar los de autenticación que son normales
            if (errorMessage.includes('Error') || errorMessage.includes('Failed') ||
                (errorMessage.includes('400') && !errorMessage.includes('usuarios')) ||
                errorMessage.includes('500')) {
                originalError.apply(console, args);
            }
        };

        // Contar operaciones exitosas (ejemplo: llamadas API exitosas)
        const countSuccess = () => {
            totalOperations++;
        };

        // Calcular tasa de error cada 30 segundos en lugar de 10
        setInterval(() => {
            if (totalOperations > 0) {
                this.metrics.errorRate = (errorCount / totalOperations) * 100;
                // Solo alertar si la tasa de error es muy alta (> 20%)
                if (this.metrics.errorRate > 20) {
                    this.checkThreshold('errorRate', this.metrics.errorRate);
                }
            }
        }, 30000);
    }

    /**
     * Mide el tiempo de renderizado de un componente
     */
    measureComponentRender(componentName, renderFunction) {
        const startTime = performance.now();
        
        const result = renderFunction();
        
        const endTime = performance.now();
        const renderTime = endTime - startTime;
        
        if (!this.metrics.componentRenderTime[componentName]) {
            this.metrics.componentRenderTime[componentName] = [];
        }
        
        this.metrics.componentRenderTime[componentName].push(renderTime);
        
        // Mantener solo las últimas 10 mediciones
        if (this.metrics.componentRenderTime[componentName].length > 10) {
            this.metrics.componentRenderTime[componentName].shift();
        }
        
        const avgTime = this.metrics.componentRenderTime[componentName].reduce((a, b) => a + b, 0) / this.metrics.componentRenderTime[componentName].length;
        this.checkThreshold('componentRenderTime', avgTime, componentName);
        
        return result;
    }

    /**
     * Verifica si una métrica excede el umbral definido
     */
    checkThreshold(metricType, value, context = '') {
        const threshold = this.performanceThresholds[metricType];
        
        if (value > threshold) {
            this.triggerAlert(metricType, value, threshold, context);
        }
    }

    /**
     * Dispara una alerta de rendimiento
     */
    triggerAlert(metricType, value, threshold, context) {
        const alert = {
            type: 'performance',
            metric: metricType,
            value: value,
            threshold: threshold,
            context: context,
            timestamp: new Date().toISOString(),
            severity: this.getSeverityLevel(metricType, value, threshold)
        };

        // Reducir verbosidad de alertas de rendimiento en desarrollo
        if (alert.metric === 'memoryUsage' && alert.value < alert.threshold * 2.5) {
            // Solo mostrar alertas de memoria si excede 2.5 veces el umbral
            return;
        }

        // Solo mostrar alertas críticas o warnings importantes
        if (alert.severity === 'info') {
            return;
        }

        // Solo mostrar alertas de API si son muy lentas (> 5 segundos)
        if (alert.metric === 'apiResponseTime' && alert.value < 5000) {
            return;
        }

        console.warn('⚠️ Alerta de rendimiento:', alert);

        // Enviar a servicio de monitoreo externo si está configurado
        this.sendToMonitoringService(alert);

        // Mostrar notificación al usuario si es crítico
        if (alert.severity === 'critical') {
            this.showUserNotification(alert);
        }
    }

    /**
     * Determina el nivel de severidad de una alerta
     */
    getSeverityLevel(metricType, value, threshold) {
        const ratio = value / threshold;
        
        if (ratio >= 2) return 'critical';
        if (ratio >= 1.5) return 'warning';
        return 'info';
    }

    /**
     * Envía alertas a servicio de monitoreo externo
     */
    async sendToMonitoringService(alert) {
        // Aquí se podría integrar con servicios como:
        // - Google Analytics
        // - Sentry
        // - New Relic
        // - Datadog
        // - Custom monitoring endpoint
        
        try {
            // Ejemplo: enviar a endpoint personalizado
            // Usar import.meta.env en lugar de process.env para Vite
            const monitoringEndpoint = import.meta.env?.VITE_MONITORING_ENDPOINT ||
                                    import.meta.env?.REACT_APP_MONITORING_ENDPOINT;
            
            if (monitoringEndpoint) {
                await fetch(monitoringEndpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(alert)
                });
            }
        } catch (error) {
            console.warn('Error enviando alerta a servicio de monitoreo:', error);
        }
    }

    /**
     * Muestra notificación al usuario
     */
    showUserNotification(alert) {
        // Usar SweetAlert2 si está disponible
        if (typeof window !== 'undefined' && window.Swal) {
            window.Swal.fire({
                icon: 'warning',
                title: 'Alerta de Rendimiento',
                text: `${alert.metric}: ${alert.value.toFixed(2)}ms (umbral: ${alert.threshold}ms)`,
                toast: true,
                position: 'top-end',
                showConfirmButton: false,
                timer: 5000
            });
        }
    }

    /**
     * Obtiene métricas actuales
     */
    getMetrics() {
        return {
            ...this.metrics,
            isMonitoring: this.isMonitoring,
            uptime: this.isMonitoring ? performance.now() - this.startTime : 0
        };
    }

    /**
     * Obtiene reporte de rendimiento
     */
    getPerformanceReport() {
        const metrics = this.getMetrics();
        
        return {
            summary: {
                pageLoadTime: metrics.pageLoadTime,
                memoryUsage: metrics.memoryUsage,
                errorRate: metrics.errorRate,
                userInteractions: metrics.userInteractions,
                uptime: metrics.uptime
            },
            components: Object.entries(metrics.componentRenderTime).map(([name, times]) => ({
                name,
                average: times.reduce((a, b) => a + b, 0) / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                samples: times.length
            })),
            apiEndpoints: Object.entries(metrics.apiResponseTime).map(([endpoint, times]) => ({
                endpoint,
                average: times.reduce((a, b) => a + b, 0) / times.length,
                min: Math.min(...times),
                max: Math.max(...times),
                samples: times.length
            })),
            recommendations: this.generateRecommendations(metrics)
        };
    }

    /**
     * Genera recomendaciones basadas en las métricas
     */
    generateRecommendations(metrics) {
        const recommendations = [];
        
        if (metrics.pageLoadTime > this.performanceThresholds.pageLoadTime) {
            recommendations.push({
                type: 'performance',
                priority: 'high',
                title: 'Optimizar tiempo de carga',
                description: 'El tiempo de carga de la página es mayor al recomendado. Considera optimizar recursos y lazy loading.'
            });
        }
        
        if (metrics.memoryUsage > this.performanceThresholds.memoryUsage) {
            recommendations.push({
                type: 'memory',
                priority: 'high',
                title: 'Optimizar uso de memoria',
                description: 'El uso de memoria es elevado. Revisa posibles fugas de memoria y optimiza componentes.'
            });
        }
        
        if (metrics.errorRate > this.performanceThresholds.errorRate) {
            recommendations.push({
                type: 'reliability',
                priority: 'critical',
                title: 'Reducir tasa de errores',
                description: 'La tasa de errores es alta. Implementa mejor manejo de errores y validaciones.'
            });
        }
        
        // Recomendaciones por componente
        Object.entries(metrics.componentRenderTime).forEach(([component, times]) => {
            const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
            if (avgTime > this.performanceThresholds.componentRenderTime) {
                recommendations.push({
                    type: 'component',
                    priority: 'medium',
                    title: `Optimizar componente ${component}`,
                    description: `El tiempo de renderizado promedio es ${avgTime.toFixed(2)}ms. Considera usar memoización o lazy loading.`
                });
            }
        });
        
        return recommendations;
    }

    /**
     * Exporta métricas a formato JSON
     */
    exportMetrics() {
        const report = this.getPerformanceReport();
        
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `performance-report-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Instancia singleton del servicio
export const performanceMonitorService = new PerformanceMonitorService();

export default performanceMonitorService;