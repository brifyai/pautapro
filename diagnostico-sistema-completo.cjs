const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 DIAGNÓSTICO COMPLETO DEL SISTEMA');
console.log('====================================');

// Mapeo esperado de campos por tabla
const CAMPOS_ESPERADOS = {
  clientes: {
    campos_clave: ['id', 'nombre', 'rut', 'direccion', 'telefono', 'email'],
    alternativas: ['nombre_cliente', 'nombrecomercial', 'razon_social']
  },
  campania: {
    campos_clave: ['id', 'nombre', 'cliente_id', 'descripcion', 'fecha_inicio', 'fecha_termino'],
    alternativas: ['nombre_campana', 'nombrecampana', 'campaign_name']
  },
  medios: {
    campos_clave: ['id', 'nombre_medio', 'tipo_medio', 'descripcion', 'costo_por_unidad'],
    alternativas: ['nombre', 'nombredelmedio', 'medio_name', 'nombre_del_medio']
  },
  proveedores: {
    campos_clave: ['id', 'nombre', 'rut', 'direccion', 'telefono', 'email', 'tipo'],
    alternativas: ['nombre_proveedor', 'nombreproveedor', 'proveedor_name', 'razon_social']
  },
  contratos: {
    campos_clave: ['id', 'numero_contrato', 'proveedor_id', 'idmedios', 'tipo', 'fecha_inicio', 'fecha_termino', 'monto_total'],
    alternativas: ['id_medios', 'medio_id', 'id_medio', 'medio']
  },
  plan: {
    campos_clave: ['id', 'nombre', 'campana_id', 'descripcion', 'estado'],
    alternativas: ['nombre_plan', 'nombreplan', 'plan_name']
  },
  alternativa: {
    campos_clave: ['id', 'nombre', 'plan_id', 'medio_id', 'descripcion', 'cantidad', 'costo_unitario', 'costo_total'],
    alternativas: ['nombre_alternativa', 'nombrealternativa', 'alternative_name']
  },
  ordenesdepublicidad: {
    campos_clave: ['id', 'numero_orden', 'cliente_id', 'campana_id', 'plan_id', 'proveedor_id', 'contrato_id', 'estado', 'monto_total'],
    alternativas: ['numero_orden', 'orden_numero', 'order_number']
  }
};

async function diagnosticarSistemaCompleto() {
  try {
    console.log('\n📊 ANÁLISIS COMPLETO DE TABLAS\n');
    
    const resultados = {};
    const problemas = [];
    
    // Analizar cada tabla principal
    for (const [nombreTabla, config] of Object.entries(CAMPOS_ESPERADOS)) {
      console.log(`\n🔍 Analizando tabla: ${nombreTabla.toUpperCase()}`);
      console.log('='.repeat(50));
      
      try {
        // 1. Obtener estructura y datos
        const { data: datos, error } = await supabase
          .from(nombreTabla)
          .select('*')
          .limit(5); // Solo primeros 5 para análisis
        
        if (error) {
          console.error(`❌ Error accediendo a ${nombreTabla}:`, error.message);
          problemas.push({
            tabla: nombreTabla,
            tipo: 'acceso',
            error: error.message
          });
          continue;
        }
        
        if (!datos || datos.length === 0) {
          console.log(`⚠️  Tabla ${nombreTabla} está vacía`);
          resultados[nombreTabla] = {
            registros: 0,
            campos_encontrados: [],
            problemas: ['Tabla vacía']
          };
          continue;
        }
        
        // 2. Analizar estructura de campos
        const camposEncontrados = Object.keys(datos[0]);
        console.log(`📋 Campos encontrados (${camposEncontrados.length}):`);
        camposEncontrados.forEach(campo => console.log(`   - ${campo}`));
        
        // 3. Verificar campos clave
        const camposFaltantes = config.campos_clave.filter(campo => !camposEncontrados.includes(campo));
        const camposAlternativosEncontrados = config.alternativas.filter(alt => camposEncontrados.includes(alt));
        
        console.log(`\n✅ Campos clave presentes: ${config.campos_clave.length - camposFaltantes.length}/${config.campos_clave.length}`);
        if (camposFaltantes.length > 0) {
          console.log(`❌ Campos clave faltantes: ${camposFaltantes.join(', ')}`);
          problemas.push({
            tabla: nombreTabla,
            tipo: 'campos_faltantes',
            campos: camposFaltantes
          });
        }
        
        if (camposAlternativosEncontrados.length > 0) {
          console.log(`🔄 Campos alternativos encontrados: ${camposAlternativosEncontrados.join(', ')}`);
        }
        
        // 4. Analizar calidad de datos
        console.log(`\n📊 Análisis de calidad de datos (primer registro):`);
        const primerRegistro = datos[0];
        
        config.campos_clave.forEach(campo => {
          if (camposEncontrados.includes(campo)) {
            const valor = primerRegistro[campo];
            const tipo = typeof valor;
            const valido = valor !== null && valor !== undefined && valor !== '';
            
            console.log(`   ${campo}: "${valor}" (${tipo}) ${valido ? '✅' : '❌'}`);
            
            if (!valido) {
              problemas.push({
                tabla: nombreTabla,
                tipo: 'dato_invalido',
                campo: campo,
                valor: valor
              });
            }
          }
        });
        
        // 5. Verificar campos con valores nulos o problemáticos
        console.log(`\n🔍 Campos con valores problemáticos:`);
        camposEncontrados.forEach(campo => {
          const valores = datos.map(d => d[campo]);
          const nulos = valores.filter(v => v === null || v === undefined).length;
          const vacios = valores.filter(v => v === '').length;
          const undefineds = valores.filter(v => v === 'undefined').length;
          
          if (nulos > 0 || vacios > 0 || undefineds > 0) {
            console.log(`   ⚠️  ${campo}: ${nulos} nulos, ${vacios} vacíos, ${undefineds} 'undefined'`);
            
            if (undefineds > 0) {
              problemas.push({
                tabla: nombreTabla,
                tipo: 'valor_undefined',
                campo: campo,
                cantidad: undefineds
              });
            }
          }
        });
        
        // Guardar resultados
        resultados[nombreTabla] = {
          registros: datos.length,
          campos_encontrados: camposEncontrados,
          campos_faltantes: camposFaltantes,
          campos_alternativos: camposAlternativosEncontrados,
          muestra: datos[0]
        };
        
      } catch (error) {
        console.error(`❌ Error analizando ${nombreTabla}:`, error.message);
        problemas.push({
          tabla: nombreTabla,
          tipo: 'error_general',
          error: error.message
        });
      }
    }
    
    // 6. Resumen de problemas
    console.log('\n\n🚨 RESUMEN DE PROBLEMAS ENCONTRADOS');
    console.log('='.repeat(60));
    
    if (problemas.length === 0) {
      console.log('✅ No se encontraron problemas graves en el sistema');
    } else {
      console.log(`❌ Se encontraron ${problemas.length} problemas:\n`);
      
      // Agrupar problemas por tipo
      const problemasPorTipo = {};
      problemas.forEach(problema => {
        if (!problemasPorTipo[problema.tipo]) {
          problemasPorTipo[problema.tipo] = [];
        }
        problemasPorTipo[problema.tipo].push(problema);
      });
      
      Object.entries(problemasPorTipo).forEach(([tipo, lista]) => {
        console.log(`\n🔍 ${tipo.toUpperCase().replace('_', ' ')} (${lista.length} casos):`);
        lista.forEach((problema, index) => {
          console.log(`   ${index + 1}. Tabla: ${problema.tabla}`);
          if (problema.campos) console.log(`      Campos: ${problema.campos.join(', ')}`);
          if (problema.error) console.log(`      Error: ${problema.error}`);
          if (problema.campo) console.log(`      Campo: ${problema.campo}`);
        });
      });
    }
    
    // 7. Recomendaciones específicas
    console.log('\n\n💡 RECOMENDACIONES ESPECÍFICAS');
    console.log('='.repeat(40));
    
    Object.entries(resultados).forEach(([tabla, info]) => {
      console.log(`\n📋 ${tabla.toUpperCase()}:`);
      
      if (info.campos_faltantes.length > 0) {
        console.log(`   - Agregar campos faltantes: ${info.campos_faltantes.join(', ')}`);
      }
      
      if (info.campos_alternativos.length > 0) {
        console.log(`   - Considerar renombrar campos alternativos: ${info.campos_alternativos.join(', ')}`);
      }
      
      if (info.registros === 0) {
        console.log(`   - La tabla está vacía, considerar agregar datos de prueba`);
      }
    });
    
    // 8. Generar script de reparación
    console.log('\n\n🔧 GENERANDO SCRIPT DE REPARACIÓN...');
    generarScriptReparacion(problemas, resultados);
    
  } catch (error) {
    console.error('❌ Error general en diagnóstico:', error.message);
  }
}

function generarScriptReparacion(problemas, resultados) {
  const reparaciones = [];
  
  problemas.forEach(problema => {
    switch (problema.tipo) {
      case 'valor_undefined':
        reparaciones.push({
          tabla: problema.tabla,
          campo: problema.campo,
          accion: 'reparar_undefined',
          sql: `UPDATE ${problema.tabla} SET ${problema.campo} = NULL WHERE ${problema.campo} = 'undefined'`
        });
        break;
      
      case 'dato_invalido':
        if (problema.campo.includes('nombre')) {
          reparaciones.push({
            tabla: problema.tabla,
            campo: problema.campo,
            accion: 'generar_nombre',
            sql: `UPDATE ${problema.tabla} SET ${problema.campo} = 'Sin Nombre' WHERE ${problema.campo} IS NULL OR ${problema.campo} = ''`
          });
        }
        break;
    }
  });
  
  if (reparaciones.length > 0) {
    console.log(`\n📝 Se generaron ${reparaciones.length} reparaciones automáticas:`);
    reparaciones.forEach((rep, index) => {
      console.log(`\n${index + 1}. ${rep.tabla}.${rep.campo} - ${rep.accion}`);
      console.log(`   SQL: ${rep.sql}`);
    });
    
    // Guardar script de reparación
    const scriptContent = `
// Script de reparación generado automáticamente
const reparaciones = ${JSON.stringify(reparaciones, null, 2)};

console.log('🔧 EJECUTANDO REPARACIONES AUTOMÁTICAS');
console.log('=======================================');

async function ejecutarReparaciones() {
  for (const reparacion of reparaciones) {
    try {
      console.log(\`\\n🔄 Reparando \${reparacion.tabla}.\${reparacion.campo}...\`);
      
      const { error } = await supabase
        .from(reparacion.tabla)
        .update({ [reparacion.campo]: null })
        .eq(reparacion.campo, 'undefined');
      
      if (error) {
        console.error(\`❌ Error: \${error.message}\`);
      } else {
        console.log(\`✅ Reparación completada\`);
      }
    } catch (error) {
      console.error(\`❌ Error general: \${error.message}\`);
    }
  }
}

ejecutarReparaciones();
`;
    
    require('fs').writeFileSync('reparar-sistema.cjs', scriptContent);
    console.log('\n💾 Script de reparación guardado en: reparar-sistema.cjs');
    console.log('   Ejecuta con: node reparar-sistema.cjs');
    
  } else {
    console.log('\n✅ No se requieren reparaciones automáticas');
  }
}

// Ejecutar diagnóstico completo
diagnosticarSistemaCompleto();