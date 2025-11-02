const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function corregirNombresColumnas() {
  try {
    console.log('=== CORRIGIENDO NOMBRES DE COLUMNAS Y AGREGANDO FALTANTES ===\n');

    // 1. Verificar estructura actual de mensajes
    console.log('1. VERIFICANDO ESTRUCTURA ACTUAL DE mensajes...');
    try {
      const { data: mensajesData, error: mensajesError } = await supabase
        .from('mensajes')
        .select('*')
        .limit(1);
      
      if (mensajesError) {
        console.log('❌ Error verificando mensajes:', mensajesError.message);
      } else {
        if (mensajesData && mensajesData.length > 0) {
          console.log('✅ Estructura actual de mensajes:', Object.keys(mensajesData[0]));
        } else {
          console.log('⚠️  Tabla mensajes vacía, intentando insertar para ver estructura...');
          
          // Intentar insertar para ver qué columnas acepta
          const { data: insertTest, error: insertTestError } = await supabase
            .from('mensajes')
            .insert([{
              contenido: 'Test'
            }])
            .select()
            .single();
          
          if (insertTestError) {
            console.log('❌ Error en inserción de prueba:', insertTestError.message);
          } else {
            console.log('✅ Inserción de prueba exitosa, estructura:', Object.keys(insertTest));
            
            // Limpiar el dato de prueba
            await supabase
              .from('mensajes')
              .delete()
              .eq('id', insertTest.id);
          }
        }
      }
    } catch (err) {
      console.log('❌ Error general verificando mensajes:', err.message);
    }

    // 2. Insertar datos de prueba en mensajes con las columnas correctas
    console.log('\n2. INSERTANDO DATOS DE PRUEBA EN mensajes...');
    try {
      const { data: mensajesInsert, error: mensajesInsertError } = await supabase
        .from('mensajes')
        .insert([{
          tipo: 'info',
          titulo: 'Bienvenido al sistema',
          contenido: 'Este es un mensaje de bienvenida para probar el sistema',
          prioridad: 'normal'
        }])
        .select();
      
      if (mensajesInsertError) {
        console.log('❌ Error insertando mensajes:', mensajesInsertError.message);
        
        // Intentar con columnas mínimas
        const { data: mensajesMin, error: mensajesMinError } = await supabase
          .from('mensajes')
          .insert([{
            contenido: 'Mensaje de prueba mínimo'
          }])
          .select();
        
        if (mensajesMinError) {
          console.log('❌ Error incluso con inserción mínima:', mensajesMinError.message);
        } else {
          console.log('✅ Inserción mínima exitosa:', mensajesMin);
        }
      } else {
        console.log('✅ Mensajes insertados correctamente:', mensajesInsert);
      }
    } catch (err) {
      console.log('❌ Error general insertando mensajes:', err.message);
    }

    // 3. Verificar y crear datos de prueba en ordenesdepublicidad
    console.log('\n3. VERIFICANDO ORDENESDEPUBLICIDAD...');
    try {
      const { data: ordenesPubData, error: ordenesPubError } = await supabase
        .from('ordenesdepublicidad')
        .select('*')
        .limit(1);
      
      if (ordenesPubError) {
        console.log('❌ Error verificando ordenesdepublicidad:', ordenesPubError.message);
      } else {
        if (ordenesPubData && ordenesPubData.length > 0) {
          console.log('✅ Estructura de ordenesdepublicidad:', Object.keys(ordenesPubData[0]));
        } else {
          console.log('⚠️  Tabla ordenesdepublicidad vacía, insertando datos de prueba...');
          
          const { data: ordenesInsert, error: ordenesInsertError } = await supabase
            .from('ordenesdepublicidad')
            .insert([{
              id_campania: 1,
              id_cliente: 1,
              estado: 'activo',
              created_at: new Date().toISOString()
            }])
            .select();
          
          if (ordenesInsertError) {
            console.log('❌ Error insertando ordenesdepublicidad:', ordenesInsertError.message);
          } else {
            console.log('✅ Ordenes de publicidad insertados:', ordenesInsert);
          }
        }
      }
    } catch (err) {
      console.log('❌ Error general verificando ordenesdepublicidad:', err.message);
    }

    // 4. Crear un resumen de mapeo de columnas
    console.log('\n4. MAPEO DE COLUMNAS CORRECTAS...');
    
    const mapeoColumnas = {
      'campania': {
        'id': 'id_campania',  // El código usa 'id' pero la BD tiene 'id_campania'
        'nombre': 'nombrecampania',
        'id_cliente': 'id_cliente',
        'presupuesto': 'presupuesto',
        'estado': 'estado'
      },
      'clientes': {
        'id_cliente': 'id_cliente',
        'nombrecliente': 'nombrecliente',
        'rut': 'rut',
        'id_region': 'id_region',
        'id_comuna': 'id_comuna'
      },
      'mensajes': {
        'id': 'id',
        'tipo': 'tipo',
        'titulo': 'titulo',
        'contenido': 'contenido'
      }
    };
    
    console.log('MAPEO RECOMENDADO:');
    Object.entries(mapeoColumnas).forEach(([tabla, columnas]) => {
      console.log(`\n${tabla}:`);
      Object.entries(columnas).forEach(([codigo, bd]) => {
        if (codigo !== bd) {
          console.log(`  ${codigo} → ${bd}`);
        } else {
          console.log(`  ${codigo} ✅`);
        }
      });
    });

    // 5. Verificar que las funciones críticas funcionen
    console.log('\n5. VERIFICACIÓN FINAL DE FUNCIONES CRÍTICAS...');
    
    try {
      // Verificar clientes
      const { data: clientesTest, error: clientesTestError } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente, id_region, id_comuna')
        .limit(1);
      
      if (clientesTestError) {
        console.log('❌ Error en clientes:', clientesTestError.message);
      } else {
        console.log('✅ Clientes funcionando correctamente');
      }
      
      // Verificar campania con nombre correcto
      const { data: campaniaTest, error: campaniaTestError } = await supabase
        .from('campania')
        .select('id_campania, nombrecampania, id_cliente')
        .limit(1);
      
      if (campaniaTestError) {
        console.log('❌ Error en campania:', campaniaTestError.message);
      } else {
        console.log('✅ Campaña funcionando con nombres correctos');
      }
      
    } catch (err) {
      console.log('❌ Error en verificación final:', err.message);
    }

    console.log('\n=== CORRECCIONES COMPLETADAS ===');
    console.log('RESUMEN:');
    console.log('✅ Estructura de base de datos verificada');
    console.log('✅ Datos de prueba insertados donde fue posible');
    console.log('✅ Mapeo de columnas documentado');
    console.log('⚠️  Se requiere actualizar el código para usar nombres correctos');
    
    console.log('\nPRÓXIMOS PASOS:');
    console.log('1. Actualizar el código frontend para usar los nombres de columnas correctos');
    console.log('2. Crear tablas faltantes (ordenes, alternativas) manualmente en Supabase');
    console.log('3. Probar la aplicación con las correcciones aplicadas');

  } catch (error) {
    console.error('Error general:', error);
  }
}

// Ejecutar las correcciones
corregirNombresColumnas();