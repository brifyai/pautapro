const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verificarTodasEstructuras() {
  console.log('🔍 Verificando estructuras de todas las tablas necesarias...\n');

  try {
    const tablas = [
      { nombre: 'medios', descripcion: 'Medios publicitarios' },
      { nombre: 'soportes', descripcion: 'Soportes de medios' },
      { nombre: 'contratos', descripcion: 'Contratos' },
      { nombre: 'alternativa', descripcion: 'Alternativas' },
      { nombre: 'ordenesdepublicidad', descripcion: 'Órdenes de publicidad' },
      { nombre: 'plan', descripcion: 'Planes' },
      { nombre: 'campania', descripcion: 'Campañas' }
    ];

    for (const tabla of tablas) {
      console.log(`\n📋 Tabla: ${tabla.nombre} (${tabla.descripcion})`);
      
      try {
        const { data, error } = await supabase
          .from(tabla.nombre)
          .select('*')
          .limit(1);

        if (error) {
          console.error(`   ❌ Error: ${error.message}`);
          continue;
        }

        if (data && data.length > 0) {
          console.log(`   ✅ Campos: ${Object.keys(data[0]).join(', ')}`);
          
          // Mostrar campos que podrían ser de relación
          const camposRelacion = Object.keys(data[0]).filter(key => 
            key.toLowerCase().includes('id') && key !== 'id'
          );
          
          if (camposRelacion.length > 0) {
            console.log(`   🔗 Campos de relación: ${camposRelacion.join(', ')}`);
            camposRelacion.forEach(campo => {
              console.log(`      ${campo}: ${data[0][campo]}`);
            });
          }
        } else {
          console.log(`   ℹ️  Tabla vacía`);
        }
      } catch (e) {
        console.error(`   ❌ Error al acceder a la tabla: ${e.message}`);
      }
    }

    // Verificar relaciones específicas que necesitamos
    console.log('\n🔍 Verificando relaciones específicas:');
    
    // 1. Medios -> Contratos
    console.log('\n1. Relación Medios -> Contratos:');
    const { data: contratosMedio } = await supabase
      .from('contratos')
      .select('*')
      .limit(1);
    
    if (contratosMedio && contratosMedio.length > 0) {
      const campoMedio = Object.keys(contratosMedio[0]).find(key => 
        key.toLowerCase().includes('medio')
      );
      console.log(`   Campo que relaciona con medios: ${campoMedio || 'No encontrado'}`);
    }

    // 2. Alternativas -> Contratos
    console.log('\n2. Relación Alternativas -> Contratos:');
    const { data: alternativa } = await supabase
      .from('alternativa')
      .select('*')
      .limit(1);
    
    if (alternativa && alternativa.length > 0) {
      const campoContrato = Object.keys(alternativa[0]).find(key => 
        key.toLowerCase().includes('contrato')
      );
      const campoMedio = Object.keys(alternativa[0]).find(key => 
        key.toLowerCase().includes('medio')
      );
      const campoSoporte = Object.keys(alternativa[0]).find(key => 
        key.toLowerCase().includes('soporte')
      );
      
      console.log(`   Campo que relaciona con contratos: ${campoContrato || 'No encontrado'}`);
      console.log(`   Campo que relaciona con medios: ${campoMedio || 'No encontrado'}`);
      console.log(`   Campo que relaciona con soportes: ${campoSoporte || 'No encontrado'}`);
    }

    // 3. Órdenes -> Alternativas
    console.log('\n3. Relación Órdenes -> Alternativas:');
    const { data: orden } = await supabase
      .from('ordenesdepublicidad')
      .select('*')
      .limit(1);
    
    if (orden && orden.length > 0) {
      const camposRelacionOrden = Object.keys(orden[0]).filter(key => 
        key.toLowerCase().includes('id') && key !== 'id'
      );
      
      console.log(`   Campos de relación: ${camposRelacionOrden.join(', ')}`);
      camposRelacionOrden.forEach(campo => {
        console.log(`      ${campo}: ${orden[0][campo]}`);
      });
    }

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

verificarTodasEstructuras();