const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase (credenciales correctas del .env)
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🔍 VERIFICACIÓN COMPLETA DE MEDIOS');
console.log('==================================');

async function verificarMedios() {
  try {
    // 1. Verificar tabla medios
    console.log('\n📋 1. Verificando tabla medios...');
    const { data: medios, error: errorMedios } = await supabase
      .from('medios')
      .select('*')
      .order('id', { ascending: true });
    
    if (errorMedios) {
      console.error('❌ Error obteniendo medios:', errorMedios.message);
      return;
    }
    
    console.log(`✅ Encontrados ${medios.length} medios:`);
    medios.forEach((medio, index) => {
      console.log(`  ${index + 1}. ID: ${medio.id}, Nombre: ${medio.nombre}, Tipo: ${medio.tipo || 'N/A'}`);
      console.log(`     Descripción: ${medio.descripcion || 'N/A'}`);
      console.log(`     Costo: ${medio.costo_por_unidad || 'N/A'}`);
      console.log(`     Creado: ${medio.created_at}`);
      console.log('');
    });
    
    // 2. Verificar estructura de la tabla medios
    console.log('\n🏗️  2. Verificando estructura de tabla medios...');
    
    // Intentar obtener un registro para ver la estructura
    if (medios.length > 0) {
      console.log('Campos encontrados:', Object.keys(medios[0]));
    }
    
    // 3. Verificar otras tablas relacionadas
    console.log('\n📊 3. Verificando tablas relacionadas...');
    
    const tablas = [
      { nombre: 'clientes', descripcion: 'Clientes' },
      { nombre: 'campania', descripcion: 'Campañas' },
      { nombre: 'proveedores', descripcion: 'Proveedores' },
      { nombre: 'contratos', descripcion: 'Contratos' },
      { nombre: 'plan', descripcion: 'Planes' },
      { nombre: 'alternativa', descripcion: 'Alternativas' },
      { nombre: 'ordenesdepublicidad', descripcion: 'Órdenes' }
    ];
    
    for (const tabla of tablas) {
      try {
        const { count, error } = await supabase
          .from(tabla.nombre)
          .select('*', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ ${tabla.descripcion}: Error - ${error.message}`);
        } else {
          console.log(`✅ ${tabla.descripcion}: ${count} registros`);
        }
      } catch (error) {
        console.log(`❌ ${tabla.descripcion}: Error - ${error.message}`);
      }
    }
    
    // 4. Verificar si hay problemas con los datos
    console.log('\n🔍 4. Análisis de calidad de datos...');
    
    if (medios.length > 0) {
      const problemas = [];
      
      medios.forEach((medio, index) => {
        if (!medio.nombre || medio.nombre.trim() === '') {
          problemas.push(`Medio ${medio.id}: Nombre vacío`);
        }
        if (!medio.tipo || medio.tipo.trim() === '') {
          problemas.push(`Medio ${medio.id}: Tipo vacío`);
        }
        if (!medio.created_at) {
          problemas.push(`Medio ${medio.id}: Sin fecha de creación`);
        }
      });
      
      if (problemas.length > 0) {
        console.log('⚠️  Problemas encontrados:');
        problemas.forEach(problema => console.log(`  - ${problema}`));
      } else {
        console.log('✅ No se encontraron problemas de calidad de datos');
      }
    }
    
    // 5. Recomendaciones
    console.log('\n💡 5. Recomendaciones...');
    
    if (medios.length === 0) {
      console.log('⚠️  No hay medios en la base de datos');
      console.log('   - Debes agregar medios desde la interfaz o directamente en la BD');
    } else if (medios.length === 1) {
      console.log('ℹ️  Solo hay un medio en la base de datos');
      console.log('   - Esto podría ser normal si estás empezando');
      console.log('   - Verifica que este medio se vea en la aplicación');
    } else {
      console.log(`✅ Hay ${medios.length} medios disponibles`);
    }
    
    console.log('\n🎯 Para solucionar el problema de visualización:');
    console.log('1. Verifica que la aplicación esté usando las mismas credenciales');
    console.log('2. Revisa el componente Medios.jsx');
    console.log('3. Verifica que no haya filtros aplicados');
    console.log('4. Revisa la consola del navegador por errores');
    
  } catch (error) {
    console.error('❌ Error general:', error.message);
  }
}

// Ejecutar verificación
verificarMedios();