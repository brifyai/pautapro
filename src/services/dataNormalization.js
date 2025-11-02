/**
 * Normalización y obtención segura de Clientes
 * Evita errores 400 por columnas inexistentes seleccionando '*' y normalizando en memoria.
 */

import { supabase } from '../config/supabase';

/**
 * Normaliza un registro de cliente a un shape estable usado por la app.
 * @param {Record<string, any>} c
 * @returns {{
 *  id_cliente: number|string|null,
 *  nombrecliente: string,
 *  razonSocial?: string,
 *  RUT?: string,
 *  direccionEmpresa?: string,
 *  id_comuna?: number|string|null,
 *  estado?: boolean
 * }}
 */
export function normalizeCliente(c) {
  const id =
    c?.id_cliente ?? c?.id ?? c?.idCliente ?? null;

  const nombre =
    c?.nombrecliente ??
    c?.nombreCliente ??
    c?.nombrefantasia ??
    c?.nombreFantasia ??
    c?.razonSocial ??
    c?.razonsocial ??
    '';

  const razon =
    c?.razonSocial ??
    c?.razonsocial ??
    c?.nombreFantasia ??
    c?.nombrefantasia ??
    '';

  const rut =
    c?.rut ??
    c?.RUT ??
    c?.rutempresa ??
    c?.rutEmpresa ??
    '';

  const direccion =
    c?.direccionEmpresa ??
    c?.direccionempresa ??
    c?.direccion ??
    '';

  const comuna =
    c?.id_comuna ?? c?.idComuna ?? null;

  const estadoRaw = c?.estado;
  const estado =
    typeof estadoRaw === 'boolean'
      ? estadoRaw
      : (estadoRaw === 'true' || estadoRaw === 1 || estadoRaw === '1');

  return {
    id_cliente: id,
    nombrecliente: nombre,
    razonSocial: razon,
    RUT: rut,
    direccionEmpresa: direccion,
    id_comuna: comuna,
    estado: estado !== false
  };
}

/**
 * Obtiene clientes de forma resiliente frente a diferencias de esquema.
 * - Selecciona "*" para no fallar por columnas inexistentes
 * - Normaliza y filtra en memoria
 * @param {{onlyActive?: boolean}=} opts
 */
export async function safeFetchClientes(opts = {}) {
  const { onlyActive = true } = opts;
  let rows = null;
  let lastError = null;

  for (const tableName of ['clientes', 'Clientes']) {
    try {
      const { data, error } = await supabase.from(tableName).select('*');
      if (!error && Array.isArray(data)) {
        rows = data;
        break;
      }
      lastError = error || new Error('Respuesta inválida');
    } catch (e) {
      lastError = e;
    }
  }

  if (!rows) {
    throw lastError || new Error('No fue posible obtener clientes');
  }

  let normalized = rows.map(normalizeCliente)
    .filter(c => c.id_cliente != null);

  if (onlyActive) {
    normalized = normalized.filter(c => c.estado !== false);
  }

  normalized.sort((a, b) =>
    (a.nombrecliente || '').localeCompare(b.nombrecliente || '', 'es', { sensitivity: 'base' })
  );

  return normalized;
}