// Mapeo de campos actualizado automáticamente
const mapeoConfig = {
  "alternativas": {
    "id": "id_alternativa",
    "nombre": "nombre_alternativa",
    "plan_id": "id_plan",
    "medio_id": "id_medio",
    "soporte_id": "id_soporte",
    "descripcion": "descripcion",
    "costo_unitario": "costo_unitario",
    "duracion_segundos": "duracion_segundos",
    "estado": "estado",
    "created_at": "created_at",
    "updated_at": "updated_at"
  },
  "planes": {
    "id": "id_plan",
    "nombre": "nombre_plan",
    "campania_id": "id_campania",
    "cliente_id": "id_cliente",
    "descripcion": "descripcion",
    "presupuesto_total": "presupuesto_total",
    "fecha_inicio": "fecha_inicio",
    "fecha_fin": "fecha_fin",
    "estado": "estado",
    "created_at": "created_at",
    "updated_at": "updated_at"
  }
};

export { mapeoConfig };

export const mapearDatos = (tabla, datos) => {
  const mapeo = mapeoConfig[tabla];
  if (!mapeo || !datos) return datos;
  
  if (Array.isArray(datos)) {
    return datos.map(item => mapearItem(item, mapeo));
  } else {
    return mapearItem(datos, mapeo);
  }
};

const mapearItem = (item, mapeo) => {
  const mapeado = {};
  Object.keys(mapeo).forEach(frontendCampo => {
    const bdCampo = mapeo[frontendCampo];
    mapeado[frontendCampo] = item[bdCampo];
  });
  return mapeado;
};

export const getCampoReal = (tabla, campoFrontend) => {
  const mapeo = mapeoConfig[tabla];
  return mapeo && mapeo[campoFrontend] ? mapeo[campoFrontend] : campoFrontend;
};
