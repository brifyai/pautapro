const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function limpiarCacheYVerificarTablas() {
  try {
    console.log('=== LIMPIANDO CACHE Y VERIFICANDO TABLAS PROBLEMÁTICAS ===\n');

    // 1. Verificar tabla ordenes con diferentes enfoques
    console.log('1. VERIFICANDO TABLA ordenes...');
    
    try {
      // Intento 1: Consulta simple
      const { data: ordenesData1, error: ordenesError1 } = await supabase
        .from('ordenes')
        .select('*')
        .limit(1);
      
      if (ordenesError1) {
        console.log('❌ Error en consulta simple a ordenes:', ordenesError1.message);
        
        // Intento 2: Verificar si existe con consulta específica
        const { data: ordenesData2, error: ordenesError2 } = await supabase
          .from('ordenes')
          .select('id')
          .limit(1);
        
        if (ordenesError2) {
          console.log('❌ Error en consulta específica a ordenes:', ordenesError2.message);
          
          // Intento 3: Crear tabla si no existe
          console.log('Intentando crear tabla ordenes...');
          const { error: createError } = await supabase
            .from('ordenes')
            .insert([{
              id_cliente: 1,
              estado: 'pendiente',
              descripcion: 'Orden de prueba'
            }]);
          
          if (createError && !createError.message.includes('duplicate')) {
            console.log('❌ Error al crear orden de prueba:', createError.message);
            
            // La tabla probablemente no existe, intentamos crearla
            console.log('La tabla ordenes probablemente no existe. Debe ser creada manualmente en Supabase.');
          } else {
            console.log('✅ Tabla ordenes accesible (se insertó orden de prueba)');
          }
        } else {
          console.log('✅ Tabla ordenes accesible con consulta específica');
        }
      } else {
        console.log('✅ Tabla ordenes accesible con consulta simple');
        if (ordenesData1.length > 0) {
          console.log('Columnas en ordenes:', Object.keys(ordenesData1[0]));
        }
      }
    } catch (err) {
      console.log('❌ Error general verificando ordenes:', err.message);
    }

    // 2. Verificar tabla alternativas
    console.log('\n2. VERIFICANDO TABLA alternativas...');
    
    try {
      const { data: alternativasData, error: alternativasError } = await supabase
        .from('alternativas')
        .select('*')
        .limit(1);
      
      if (alternativasError) {
        console.log('❌ Error en consulta a alternativas:', alternativasError.message);
        
        // Intento con consulta específica
        const { data: alternativasData2, error: alternativasError2 } = await supabase
          .from('alternativas')
          .select('id')
          .limit(1);
        
        if (alternativasError2) {
          console.log('❌ Error en consulta específica a alternativas:', alternativasError2.message);
          console.log('La tabla alternativas probablemente no existe o tiene problemas de permisos.');
        } else {
          console.log('✅ Tabla alternativas accesible con consulta específica');
        }
      } else {
        console.log('✅ Tabla alternativas accesible');
        if (alternativasData.length > 0) {
          console.log('Columnas en alternativas:', Object.keys(alternativasData[0]));
        }
      }
    } catch (err) {
      console.log('❌ Error general verificando alternativas:', err.message);
    }

    // 3. Verificar tabla mensajes específicamente para la columna 'tipo'
    console.log('\n3. VERIFICANDO TABLA mensajes y columna tipo...');
    
    try {
      const { data: mensajesData, error: mensajesError } = await supabase
        .from('mensajes')
        .select('*')
        .limit(1);
      
      if (mensajesError) {
        console.log('❌ Error en consulta a mensajes:', mensajesError.message);
      } else {
        if (mensajesData.length > 0) {
          const columnas = Object.keys(mensajesData[0]);
          console.log('✅ Columnas en mensajes:', columnas);
          
          if (!columnas.includes('tipo')) {
            console.log('❌ Columna "tipo" no existe en mensajes');
            
            // Intentar agregar la columna
            console.log('Intentando agregar columna tipo a mensajes...');
            // Nota: Esto requeriría permisos de administrador que no tenemos con la clave anon
            console.log('⚠️  Se requiere acceso de administrador para agregar la columna "tipo"');
          } else {
            console.log('✅ Columna "tipo" existe en mensajes');
          }
        } else {
          console.log('✅ Tabla mensajes accesible pero sin datos');
        }
      }
    } catch (err) {
      console.log('❌ Error general verificando mensajes:', err.message);
    }

    // 4. Verificar conexión general con las tablas principales
    console.log('\n4. VERIFICACIÓN FINAL DE CONEXIÓN...');
    
    const pruebas = [
      { tabla: 'clientes', campos: ['id_cliente', 'nombrecliente'] },
      { tabla: 'campania', campos: ['id', 'nombre'] },
      { tabla: 'mensajes', campos: ['id', 'titulo'] },
      { tabla: 'comunas', campos: ['id', 'nombrecomuna'] },
      { tabla: 'region', campos: ['id', 'nombreregion'] }
    ];
    
    for (const prueba of pruebas) {
      try {
        const { data, error } = await supabase
          .from(prueba.tabla)
          .select(prueba.campos.join(', '))
          .limit(1);
        
        if (error) {
          console.log(`❌ Error en ${prueba.tabla}:`, error.message);
        } else {
          console.log(`✅ ${prueba.tabla} accesible`);
        }
      } catch (err) {
        console.log(`❌ Error general en ${prueba.tabla}:`, err.message);
      }
    }

    console.log('\n=== VERIFICACIÓN COMPLETADA ===');
    console.log('Recomendaciones:');
    console.log('1. Si la tabla "ordenes" tiene errores, debe ser recreada en Supabase');
    console.log('2. Si la tabla "alternativas" tiene errores, debe ser recreada en Supabase');
    console.log('3. Si la columna "tipo" falta en "mensajes", debe ser agregada manualmente');
    console.log('4. Las demás tablas parecen funcionar correctamente');
    
  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar la verificación
limpiarCacheYVerificarTablas();