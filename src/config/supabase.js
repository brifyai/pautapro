/**
 * Configuración de Supabase - Optimizada con Singleton
 * Este archivo ahora importa el singleton para evitar múltiples instancias
 */

import { supabase } from './supabaseSingleton.js'

// Re-exportar la instancia única del singleton
export { supabase }

// Export por defecto para compatibilidad
export default supabase
