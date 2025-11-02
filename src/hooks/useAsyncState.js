import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * Hook personalizado para manejar estados asíncronos con control de carga, errores y datos
 * @param {Object} options - Opciones de configuración
 * @param {Function} options.asyncFn - Función asíncrona a ejecutar
 * @param {any} options.initialData - Datos iniciales
 * @param {boolean} options.immediate - Si se ejecuta inmediatamente al montar
 * @param {Array} options.dependencies - Dependencias para re-ejecutar
 * @param {Function} options.onSuccess - Callback al ejecutar con éxito
 * @param {Function} options.onError - Callback al ocurrir error
 * @param {Function} options.onFinally - Callback siempre se ejecuta
 * @param {number} options.retryCount - Número de reintentos automáticos
 * @param {number} options.retryDelay - Delay entre reintentos (ms)
 * @returns {Object} Estado y funciones de control
 */
export const useAsyncState = ({
  asyncFn,
  initialData = null,
  immediate = false,
  dependencies = [],
  onSuccess,
  onError,
  onFinally,
  retryCount = 0,
  retryDelay = 1000
} = {}) => {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  
  const mountedRef = useRef(true);
  const retryCountRef = useRef(0);
  const abortControllerRef = useRef(null);

  // Limpiar referencias al desmontar
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Función para ejecutar la operación asíncrona
  const execute = useCallback(async (...args) => {
    if (!asyncFn) {
      console.warn('useAsyncState: No se proporcionó función asíncrona');
      return null;
    }

    // Cancelar operación anterior si existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Crear nuevo AbortController
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    retryCountRef.current = 0;

    const attemptExecution = async (attempt = 0) => {
      try {
        const result = await asyncFn(...args, {
          signal: abortControllerRef.current?.signal
        });

        // Verificar si el componente sigue montado
        if (!mountedRef.current) return result;

        setData(result);
        setLastUpdated(new Date());
        setError(null);
        
        if (onSuccess) {
          onSuccess(result);
        }
        
        return result;
      } catch (err) {
        // Ignorar errores de abort
        if (err.name === 'AbortError') {
          return null;
        }

        // Verificar si el componente sigue montado
        if (!mountedRef.current) return null;

        console.error(`useAsyncState: Error en intento ${attempt + 1}:`, err);
        
        // Reintentar si corresponde
        if (attempt < retryCount) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptExecution(attempt + 1);
        }

        const errorObj = {
          message: err.message || 'Error desconocido',
          originalError: err,
          timestamp: new Date(),
          attempt: attempt + 1
        };
        
        setError(errorObj);
        
        if (onError) {
          onError(errorObj);
        }
        
        throw errorObj;
      } finally {
        // Verificar si el componente sigue montado
        if (mountedRef.current) {
          setLoading(false);
          
          if (onFinally) {
            onFinally();
          }
        }
      }
    };

    return attemptExecution();
  }, [asyncFn, onSuccess, onError, onFinally, retryCount, retryDelay]);

  // Función para resetear el estado
  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
    setLastUpdated(null);
    retryCountRef.current = 0;
    
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, [initialData]);

  // Función para cancelar la operación actual
  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setLoading(false);
  }, []);

  // Función para refrescar los datos
  const refresh = useCallback(() => {
    if (data !== null) {
      return execute();
    }
    return Promise.resolve(null);
  }, [execute, data]);

  // Ejecución inmediata si se solicita
  useEffect(() => {
    if (immediate && asyncFn) {
      execute();
    }
  }, [immediate, asyncFn, execute]);

  // Re-ejecutar cuando cambian las dependencias
  useEffect(() => {
    if (dependencies.length > 0 && asyncFn) {
      execute();
    }
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    // Estado
    data,
    loading,
    error,
    lastUpdated,
    
    // Funciones de control
    execute,
    reset,
    cancel,
    refresh,
    
    // Estados derivados
    isLoading: loading,
    hasError: !!error,
    hasData: data !== null,
    isEmpty: !loading && !error && data === null,
    
    // Utilidades
    canRetry: !!error && retryCountRef.current < retryCount,
    retryCount: retryCountRef.current,
    maxRetries: retryCount
  };
};

/**
 * Hook para manejar múltiples operaciones asíncronas en paralelo
 */
export const useAsyncParallel = (operations = []) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [progress, setProgress] = useState(0);

  const executeAll = useCallback(async () => {
    if (operations.length === 0) return {};

    setLoading(true);
    setErrors({});
    setProgress(0);

    const operationPromises = operations.map(async (op, index) => {
      try {
        const result = await op.fn(...(op.args || []));
        setResults(prev => ({ ...prev, [op.key || index]: result }));
        setProgress((index + 1) / operations.length * 100);
        return { key: op.key || index, result, success: true };
      } catch (error) {
        setErrors(prev => ({ ...prev, [op.key || index]: error }));
        return { key: op.key || index, error, success: false };
      }
    });

    const allResults = await Promise.allSettled(operationPromises);
    setLoading(false);
    
    return allResults;
  }, [operations]);

  const reset = useCallback(() => {
    setResults({});
    setErrors({});
    setLoading(false);
    setProgress(0);
  }, []);

  return {
    results,
    loading,
    errors,
    progress,
    executeAll,
    reset,
    hasErrors: Object.keys(errors).length > 0,
    completedCount: Object.keys(results).length,
    totalCount: operations.length
  };
};

/**
 * Hook para manejar operaciones asíncronas en secuencia
 */
export const useAsyncSequence = (operations = []) => {
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(-1);

  const executeSequential = useCallback(async () => {
    if (operations.length === 0) return {};

    setLoading(true);
    setErrors({});
    setResults({});
    setCurrentStep(0);

    const sequenceResults = {};

    for (let i = 0; i < operations.length; i++) {
      const op = operations[i];
      setCurrentStep(i);
      
      try {
        const result = await op.fn(...(op.args || []));
        sequenceResults[op.key || i] = result;
        setResults({ ...sequenceResults });
      } catch (error) {
        setErrors(prev => ({ ...prev, [op.key || i]: error }));
        
        // Detener secuencia si hay error
        if (op.stopOnError !== false) {
          break;
        }
      }
    }

    setCurrentStep(-1);
    setLoading(false);
    
    return sequenceResults;
  }, [operations]);

  const reset = useCallback(() => {
    setResults({});
    setErrors({});
    setLoading(false);
    setCurrentStep(-1);
  }, []);

  return {
    results,
    loading,
    errors,
    currentStep,
    executeSequential,
    reset,
    hasErrors: Object.keys(errors).length > 0,
    completedCount: Object.keys(results).length,
    totalCount: operations.length,
    progress: currentStep >= 0 ? (currentStep / operations.length) * 100 : 0
  };
};

export default useAsyncState;