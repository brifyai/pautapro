
# GUÍA DE ACTUALIZACIÓN DE COMPONENTES

## Problema Identificado
Los componentes del frontend estaban usando nombres de campos que no coinciden con los nombres reales en la base de datos.

## Solución Aplicada
1. Se creó un archivo de configuración de mapeo de campos en `src/config/mapeo-campos.js`
2. Se actualizó el componente Medios.jsx para usar el mapeo correcto
3. Se necesita actualizar los demás componentes del sistema

## Componentes que necesitan actualización manual:

### 1. Clientes (src/pages/clientes/Clientes.jsx)
- Usar `mapearDatos('clientes', data)` en la función fetchClientes
- Reemplazar referencias a `nombrecliente` por `nombre`
- Reemplazar referencias a `id_cliente` por `id`

### 2. Proveedores (src/pages/proveedores/Proveedores.jsx)
- Usar `mapearDatos('proveedores', data)` en la función fetchProveedores
- Reemplazar referencias a `nombreproveedor` por `nombre`
- Reemplazar referencias a `id_proveedor` por `id`

### 3. Campañas (src/pages/campanas/Campanas.jsx)
- Usar `mapearDatos('campania', data)` en la función fetchCampanas
- Reemplazar referencias a `nombrecampania` por `nombre`
- Reemplazar referencias a `id_campania` por `id`
- Reemplazar referencias a `id_cliente` por `cliente_id`

### 4. Contratos (src/pages/contratos/Contratos.jsx)
- Usar `mapearDatos('contratos', data)` en la función fetchContratos
- Reemplazar referencias a `id_proveedor` por `proveedor_id`

## Ejemplo de actualización:

### Antes:
```javascript
const fetchMedios = async () => {
  const { data, error } = await supabase.from('medios').select('*');
  if (error) throw error;
  setMedios(data);
};
```

### Después:
```javascript
import { mapearDatos } from '../../config/mapeo-campos';

const fetchMedios = async () => {
  const { data, error } = await supabase.from('medios').select('*');
  if (error) throw error;
  const datosMapeados = mapearDatos('medios', data);
  setMedios(datosMapeados);
};
```

## Pasos para verificar la solución:
1. Abrir cada módulo del sistema en el navegador
2. Verificar que los datos se muestren correctamente
3. Revisar la consola del navegador por errores
4. Probar CRUD (Crear, Leer, Actualizar, Eliminar) en cada módulo

## Archivos generados:
- `src/config/mapeo-campos.js` - Configuración de mapeo de campos
- `mapeo-campos-config.json` - Configuración en formato JSON
- `diagnostico-sistema-completo.cjs` - Script de diagnóstico
- `reparar-sistema-integral.cjs` - Script de reparación
