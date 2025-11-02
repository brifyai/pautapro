const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔧 REPARACIÓN INTEGRAL DEL SISTEMA');
console.log('==================================');

// Mapeo de campos reales vs esperados
const MAPEO_CAMPOS = {
  clientes: {
    tabla_real: 'clientes',
    campos_reales: {
      id: 'id_cliente',
      nombre: 'nombrecliente',
      rut: 'rut',
      direccion: 'direccion',
      telefono: 'telefono',
      email: 'email'
    }
  },
  campania: {
    tabla_real: 'campania',
    campos_reales: {
      id: 'id_campania',
      nombre: 'nombrecampania',
      cliente_id: 'id_cliente',
      descripcion: 'descripcion',
      fecha_inicio: 'fecha_inicio',
      fecha_termino: 'fecha_fin'
    }
  },
  medios: {
    tabla_real: 'medios',
    campos_reales: {
      id: 'id',
      nombre: 'nombre_medio',
      tipo: 'tipo_medio',
      descripcion: 'descripcion',
      costo_por_unidad: null // No existe en la BD actual
    }
  },
  proveedores: {
    tabla_real: 'proveedores',
    campos_reales: {
      id: 'id_proveedor',
      nombre: 'nombreproveedor',
      rut: 'rut',
      direccion: 'direccion',
      telefono: 'telefono',
      email: 'email',
      tipo: null // No existe en la BD actual
    }
  },
  contratos: {
    tabla_real: 'contratos',
    campos_reales: {
      id: 'id',
      numero_contrato: 'numero_contrato',
      proveedor_id: 'id_proveedor',
      idmedios: 'idmedios',
      tipo: null, // No existe en la BD actual
      fecha_inicio: 'fecha_inicio',
      fecha_termino: 'fecha_fin',
      monto_total: 'monto'
    }
  },
  plan: {
    tabla_real: 'plan',
    campos_reales: {
      id: 'id',
      nombre: 'nombre_plan',
      campana_id: 'id_campania',
      descripcion: 'descripcion',
      estado: 'estado'
    }
  },
  alternativa: {
    tabla_real: 'alternativa',
    campos_reales: {
      id: 'id',
      nombre: null, // No existe en la BD actual
      plan_id: 'id_plan',
      medio_id: 'id_medios',
      descripcion: 'descripcion',
      cantidad: null, // No existe en la BD actual
      costo_unitario: 'costo',
      costo_total: null // No existe en la BD actual
    }
  },
  ordenesdepublicidad: {
    tabla_real: 'ordenesdepublicidad',
    campos_reales: {
      id: 'id_ordenes_de_comprar',
      numero_orden: 'numero_correlativo',
      cliente_id: 'id_cliente',
      campana_id: 'id_campania',
      plan_id: 'id_plan',
      proveedor_id: null, // No existe en la BD actual
      contrato_id: null, // No existe en la BD actual
      estado: 'estado',
      monto_total: 'monto_total'
    }
  }
};

async function repararSistemaIntegral() {
  try {
    console.log('\n📋 INICIANDO REPARACIÓN DE MAPEO DE CAMPOS\n');
    
    const resultados = {};
    
    // Procesar cada tabla
    for (const [nombreLogico, config] of Object.entries(MAPEO_CAMPOS)) {
      console.log(`\n🔧 Procesando tabla: ${nombreLogico.toUpperCase()}`);
      console.log('='.repeat(50));
      
      try {
        // 1. Verificar que la tabla existe y tiene datos
        const { data: datosExistentes, error: errorExistencia } = await supabase
          .from(config.tabla_real)
          .select('*')
          .limit(1);
        
        if (errorExistencia) {
          console.error(`❌ Error accediendo a ${config.tabla_real}:`, errorExistencia.message);
          continue;
        }
        
        if (!datosExistentes || datosExistentes.length === 0) {
          console.log(`⚠️  Tabla ${config.tabla_real} está vacía, omitiendo`);
          continue;
        }
        
        console.log(`✅ Tabla ${config.tabla_real} accesible`);
        
        // 2. Crear vista estandarizada si no existe
        const nombreVista = `vista_${nombreLogico}_estandarizada`;
        console.log(`🔄 Creando vista estandarizada: ${nombreVista}`);
        
        await crearVistaEstandarizada(nombreLogico, config, nombreVista);
        
        // 3. Verificar que la vista funciona
        const { data: vistaDatos, error: errorVista } = await supabase
          .from(nombreVista)
          .select('*')
          .limit(3);
        
        if (errorVista) {
          console.error(`❌ Error verificando vista ${nombreVista}:`, errorVista.message);
        } else {
          console.log(`✅ Vista ${nombreVista} creada correctamente`);
          console.log(`📊 Muestra de datos estandarizados:`);
          vistaDatos.forEach((registro, index) => {
            console.log(`   ${index + 1}. ID: ${registro.id}, Nombre: ${registro.nombre || 'N/A'}`);
          });
        }
        
        resultados[nombreLogico] = {
          tabla_real: config.tabla_real,
          vista_creada: nombreVista,
          funciona: !errorVista,
          registros: vistaDatos?.length || 0
        };
        
      } catch (error) {
        console.error(`❌ Error procesando ${nombreLogico}:`, error.message);
      }
    }
    
    // 4. Generar archivo de configuración para el frontend
    console.log('\n📝 GENERANDO ARCHIVO DE CONFIGURACIÓN PARA FRONTEND');
    generarConfiguracionFrontend(MAPEO_CAMPOS);
    
    // 5. Resumen final
    console.log('\n\n🎉 RESUMEN DE REPARACIÓN');
    console.log('='.repeat(40));
    
    Object.entries(resultados).forEach(([tabla, info]) => {
      const estado = info.funciona ? '✅' : '❌';
      console.log(`${estado} ${tabla}: ${info.vista_creada} (${info.registros} regs)`);
    });
    
    console.log('\n💡 PRÓXIMOS PASOS:');
    console.log('1. Actualiza los componentes del frontend para usar las nuevas vistas');
    console.log('2. Revisa el archivo config/mapeo-campos.js generado');
    console.log('3. Prueba cada módulo del sistema');
    console.log('4. Verifica que los datos se muestren correctamente');
    
  } catch (error) {
    console.error('❌ Error general en reparación:', error.message);
  }
}

async function crearVistaEstandarizada(nombreLogico, config, nombreVista) {
  try {
    // Construir SELECT con mapeo de campos
    const camposSelect = [];
    const camposMapeados = [];
    
    // Agregar todos los campos reales
    Object.entries(config.campos_reales).forEach(([campoLogico, campoReal]) => {
      if (campoReal) {
        camposSelect.push(`${campoReal}`);
        camposMapeados.push(`${campoReal} as ${campoLogico}`);
      }
    });
    
    // Agregar campos adicionales que no tienen mapeo
    if (nombreLogico === 'clientes') {
      camposMapeados.push(`'Cliente' as tipo_entidad`);
    } else if (nombreLogico === 'proveedores') {
      camposMapeados.push(`'Proveedor' as tipo_entidad`);
    }
    
    // Crear la vista
    const sqlVista = `
      CREATE OR REPLACE VIEW ${nombreVista} AS
      SELECT ${camposMapeados.join(', ')}
      FROM ${config.tabla_real}
    `;
    
    console.log(`🔄 Ejecutando SQL: ${sqlVista.substring(0, 100)}...`);
    
    // Como no podemos ejecutar SQL directo, usaremos un enfoque alternativo
    // Crearemos una función que simule la vista
    
    console.log(`⚠️  No se puede crear vista directamente. Se usará mapeo en frontend.`);
    
  } catch (error) {
    console.error(`❌ Error creando vista ${nombreVista}:`, error.message);
  }
}

function generarConfiguracionFrontend(mapeoCampos) {
  const configFrontend = {
    version: '1.0.0',
    descripcion: 'Mapeo de campos entre frontend y backend',
    generado: new Date().toISOString(),
    tablas: {}
  };
  
  Object.entries(mapeoCampos).forEach(([nombreLogico, config]) => {
    configFrontend.tablas[nombreLogico] = {
      tabla_real: config.tabla_real,
      mapeo_campos: config.campos_reales,
      consulta_estandar: Object.values(config.campos_reales).filter(Boolean).join(', ')
    };
  });
  
  // Generar archivo JavaScript para el frontend
  const jsContent = `
/**
 * CONFIGURACIÓN DE MAPEO DE CAMPOS
 * Generado automáticamente: ${new Date().toISOString()}
 * 
 * Este archivo contiene el mapeo entre los nombres de campos lógicos 
 * del frontend y los nombres reales en la base de datos.
 */

export const MAPEO_CAMPOS = ${JSON.stringify(configFrontend.tablas, null, 2)};

/**
 * Función para obtener el nombre real del campo en la base de datos
 * @param {string} tabla - Nombre lógico de la tabla
 * @param {string} campo - Nombre lógico del campo
 * @returns {string|null} - Nombre real del campo o null si no existe
 */
export function getCampoReal(tabla, campo) {
  const mapeo = MAPEO_CAMPOS[tabla];
  if (!mapeo || !mapeo.mapeo_campos) {
    return null;
  }
  return mapeo.mapeo_campos[campo] || null;
}

/**
 * Función para construir una consulta con campos mapeados
 * @param {string} tabla - Nombre lógico de la tabla
 * @param {Array} campos - Lista de campos lógicos a seleccionar
 * @returns {string} - Lista de campos reales para la consulta
 */
export function construirConsulta(tabla, campos = ['*']) {
  const mapeo = MAPEO_CAMPOS[tabla];
  if (!mapeo) {
    return campos.join(', ');
  }
  
  if (campos.includes('*')) {
    return mapeo.consulta_estandar || '*';
  }
  
  return campos
    .map(campo => {
      const campoReal = getCampoReal(tabla, campo);
      return campoReal ? \`\${campoReal} as \${campo}\` : campo;
    })
    .join(', ');
}

/**
 * Función para mapear datos de respuesta al formato esperado
 * @param {string} tabla - Nombre lógico de la tabla
 * @param {Array|Object} datos - Datos obtenidos de la API
 * @returns {Array|Object} - Datos con nombres de campos estandarizados
 */
export function mapearDatos(tabla, datos) {
  const mapeo = MAPEO_CAMPOS[tabla];
  if (!mapeo || !mapeo.mapeo_campos) {
    return datos;
  }
  
  const mapeoInverso = {};
  Object.entries(mapeo.mapeo_campos).forEach(([logico, real]) => {
    if (real) {
      mapeoInverso[real] = logico;
    }
  });
  
  const mapearItem = (item) => {
    const mapeado = {};
    Object.entries(item).forEach(([campoReal, valor]) => {
      const campoLogico = mapeoInverso[campoReal] || campoReal;
      mapeado[campoLogico] = valor;
    });
    return mapeado;
  };
  
  if (Array.isArray(datos)) {
    return datos.map(mapearItem);
  } else {
    return mapearItem(datos);
  }
}

console.log('🔧 Configuración de mapeo de campos cargada');
console.log('Tablas configuradas:', Object.keys(MAPEO_CAMPOS));
`;
  
  // Guardar archivo de configuración
  require('fs').writeFileSync('src/config/mapeo-campos.js', jsContent);
  console.log('✅ Archivo de configuración guardado en: src/config/mapeo-campos.js');
  
  // También guardar versión JSON para referencia
  require('fs').writeFileSync('mapeo-campos-config.json', JSON.stringify(configFrontend, null, 2));
  console.log('✅ Configuración JSON guardada en: mapeo-campos-config.json');
}

// Ejecutar reparación integral
repararSistemaIntegral();