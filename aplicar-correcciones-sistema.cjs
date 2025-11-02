const fs = require('fs');
const path = require('path');

console.log('🔧 APLICANDO CORRECCIONES A TODO EL SISTEMA');
console.log('==========================================');

// Lista de componentes que necesitan correcciones de mapeo de campos
const COMPONENTES_A_CORREGIR = [
  {
    archivo: 'src/pages/clientes/Clientes.jsx',
    tabla: 'clientes',
    campos_mapeo: {
      'nombre_cliente': 'nombre',
      'nombrecliente': 'nombre',
      'id_cliente': 'id'
    }
  },
  {
    archivo: 'src/pages/proveedores/Proveedores.jsx',
    tabla: 'proveedores',
    campos_mapeo: {
      'nombre_proveedor': 'nombre',
      'nombreproveedor': 'nombre',
      'id_proveedor': 'id'
    }
  },
  {
    archivo: 'src/pages/campanas/Campanas.jsx',
    tabla: 'campania',
    campos_mapeo: {
      'nombre_campania': 'nombre',
      'nombrecampania': 'nombre',
      'id_campania': 'id',
      'id_cliente': 'cliente_id'
    }
  },
  {
    archivo: 'src/pages/contratos/Contratos.jsx',
    tabla: 'contratos',
    campos_mapeo: {
      'id_proveedor': 'proveedor_id'
    }
  }
];

function aplicarCorreccionComponente(componente) {
  console.log(`\n🔧 Corrigiendo componente: ${componente.archivo}`);
  
  try {
    // Verificar si el archivo existe
    if (!fs.existsSync(componente.archivo)) {
      console.log(`⚠️  Archivo no encontrado: ${componente.archivo}`);
      return false;
    }
    
    // Leer el contenido actual
    let contenido = fs.readFileSync(componente.archivo, 'utf8');
    
    // Agregar import del mapeo de campos si no existe
    if (!contenido.includes('mapearDatos')) {
      // Buscar la línea de import de supabase
      const importSupabase = contenido.match(/import\s+\{[^}]*supabase[^}]*\}\s+from\s+['"][^'"]*supabase['"];?/);
      if (importSupabase) {
        contenido = contenido.replace(
          importSupabase[0],
          importSupabase[0] + '\nimport { mapearDatos } from \'../../config/mapeo-campos\';'
        );
        console.log('✅ Import de mapearDatos agregado');
      }
    }
    
    // Modificar la función fetch para usar mapeo de datos
    const fetchPattern = contenido.match(/const\s+fetch\w+\s*=\s*async\s*\(\)\s*=>\s*\{[\s\S]*?set\w+\(data\);[\s\S]*?\}/);
    if (fetchPattern) {
      let nuevoFetch = fetchPattern[0];
      
      // Reemplazar setMedios(data) por setMedios(mapearDatos('tabla', data))
      nuevoFetch = nuevoFetch.replace(
        /set\w+\(data\)/,
        `set${componente.tabla.charAt(0).toUpperCase() + componente.tabla.slice(1)}(mapearDatos('${componente.tabla}', data))`
      );
      
      // Agregar console.log para debugging
      nuevoFetch = nuevoFetch.replace(
        /const\s+\{\s*data,\s*error\s*\}\s*=\s*await supabase/,
        'const { data, error } = await supabase\n      console.log(\'Datos originales:\', data);\n      const datosMapeados = mapearDatos(\'' + componente.tabla + '\', data);\n      console.log(\'Datos mapeados:\', datosMapeados);\n      const { data'
      );
      
      contenido = contenido.replace(fetchPattern[0], nuevoFetch);
      console.log('✅ Función fetch actualizada con mapeo de datos');
    }
    
    // Guardar el archivo modificado
    fs.writeFileSync(componente.archivo, contenido);
    console.log(`✅ Componente ${componente.archivo} actualizado`);
    
    return true;
    
  } catch (error) {
    console.error(`❌ Error corrigiendo ${componente.archivo}:`, error.message);
    return false;
  }
}

function crearGuiaActualizacion() {
  const guia = `
# GUÍA DE ACTUALIZACIÓN DE COMPONENTES

## Problema Identificado
Los componentes del frontend estaban usando nombres de campos que no coinciden con los nombres reales en la base de datos.

## Solución Aplicada
1. Se creó un archivo de configuración de mapeo de campos en \`src/config/mapeo-campos.js\`
2. Se actualizó el componente Medios.jsx para usar el mapeo correcto
3. Se necesita actualizar los demás componentes del sistema

## Componentes que necesitan actualización manual:

### 1. Clientes (src/pages/clientes/Clientes.jsx)
- Usar \`mapearDatos('clientes', data)\` en la función fetchClientes
- Reemplazar referencias a \`nombrecliente\` por \`nombre\`
- Reemplazar referencias a \`id_cliente\` por \`id\`

### 2. Proveedores (src/pages/proveedores/Proveedores.jsx)
- Usar \`mapearDatos('proveedores', data)\` en la función fetchProveedores
- Reemplazar referencias a \`nombreproveedor\` por \`nombre\`
- Reemplazar referencias a \`id_proveedor\` por \`id\`

### 3. Campañas (src/pages/campanas/Campanas.jsx)
- Usar \`mapearDatos('campania', data)\` en la función fetchCampanas
- Reemplazar referencias a \`nombrecampania\` por \`nombre\`
- Reemplazar referencias a \`id_campania\` por \`id\`
- Reemplazar referencias a \`id_cliente\` por \`cliente_id\`

### 4. Contratos (src/pages/contratos/Contratos.jsx)
- Usar \`mapearDatos('contratos', data)\` en la función fetchContratos
- Reemplazar referencias a \`id_proveedor\` por \`proveedor_id\`

## Ejemplo de actualización:

### Antes:
\`\`\`javascript
const fetchMedios = async () => {
  const { data, error } = await supabase.from('medios').select('*');
  if (error) throw error;
  setMedios(data);
};
\`\`\`

### Después:
\`\`\`javascript
import { mapearDatos } from '../../config/mapeo-campos';

const fetchMedios = async () => {
  const { data, error } = await supabase.from('medios').select('*');
  if (error) throw error;
  const datosMapeados = mapearDatos('medios', data);
  setMedios(datosMapeados);
};
\`\`\`

## Pasos para verificar la solución:
1. Abrir cada módulo del sistema en el navegador
2. Verificar que los datos se muestren correctamente
3. Revisar la consola del navegador por errores
4. Probar CRUD (Crear, Leer, Actualizar, Eliminar) en cada módulo

## Archivos generados:
- \`src/config/mapeo-campos.js\` - Configuración de mapeo de campos
- \`mapeo-campos-config.json\` - Configuración en formato JSON
- \`diagnostico-sistema-completo.cjs\` - Script de diagnóstico
- \`reparar-sistema-integral.cjs\` - Script de reparación
`;

  fs.writeFileSync('GUIA-ACTUALIZACION.md', guia);
  console.log('✅ Guía de actualización guardada en: GUIA-ACTUALIZACION.md');
}

function main() {
  console.log('\n📋 INICIANDO CORRECCIONES AUTOMÁTICAS\n');
  
  let correccionesExitosas = 0;
  let correccionesFallidas = 0;
  
  // Aplicar correcciones a cada componente
  COMPONENTES_A_CORREGIR.forEach(componente => {
    const exito = aplicarCorreccionComponente(componente);
    if (exito) {
      correccionesExitosas++;
    } else {
      correccionesFallidas++;
    }
  });
  
  // Crear guía de actualización
  crearGuiaActualizacion();
  
  // Resumen
  console.log('\n\n📊 RESUMEN DE CORRECCIONES');
  console.log('='.repeat(40));
  console.log(`✅ Correcciones exitosas: ${correccionesExitosas}`);
  console.log(`❌ Correcciones fallidas: ${correccionesFallidas}`);
  console.log(`📁 Componentes procesados: ${COMPONENTES_A_CORREGIR.length}`);
  
  console.log('\n💡 PRÓXIMOS PASOS:');
  console.log('1. Revisa la guía GUIA-ACTUALIZACION.md');
  console.log('2. Verifica cada componente manualmente si es necesario');
  console.log('3. Prueba la aplicación en http://localhost:3002');
  console.log('4. Verifica que todos los módulos muestren datos correctamente');
  
  if (correccionesExitosas > 0) {
    console.log('\n🎉 ¡Algunas correcciones fueron aplicadas automáticamente!');
    console.log('   Recarga la aplicación para ver los cambios.');
  }
}

// Ejecutar correcciones
main();