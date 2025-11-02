const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://rfjbsoxkgmuehrgteljq.supabase.co',
  'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C'
);

async function fixTemasClientContracts() {
  try {
    console.log('=== REPARANDO VÍNCULOS TEMAS-CLIENTES-MEDIOS ===\n');
    
    // 1. Obtener todas las campañas con sus clientes
    const { data: campanas, error: campanasError } = await supabase
      .from('campania')
      .select('id_campania, nombrecampania, id_cliente');
    
    if (campanasError) throw campanasError;
    console.log(`Campañas encontradas: ${campanas.length}`);
    
    // 2. Obtener todos los temas con sus relaciones
    const { data: temas, error: temasError } = await supabase
      .from('temas')
      .select(`
        id_tema,
        nombre_tema,
        id_medio,
        estado,
        campania_temas!inner(
          id_campania
        )
      `);
    
    if (temasError) throw temasError;
    console.log(`Temas encontrados: ${temas.length}`);
    
    // 3. Obtener todos los medios
    const { data: medios, error: mediosError } = await supabase
      .from('medios')
      .select('id, nombredelmedio');
    
    if (mediosError) throw mediosError;
    console.log(`Medios disponibles: ${medios.length}`);
    
    // 4. Obtener el siguiente ID para contratos
    const { data: maxContrato, error: maxContratoError } = await supabase
      .from('contratos')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);
    
    if (maxContratoError) throw maxContratoError;
    let siguienteIdContrato = maxContrato.length > 0 ? maxContrato[0].id + 1 : 1;
    
    console.log(`Siguiente ID de contrato: ${siguienteIdContrato}`);
    
    // 5. Para cada tema, verificar y crear contrato si es necesario
    let contratosCreados = 0;
    let temasActualizados = 0;
    
    for (const tema of temas) {
      const idCampania = tema.campania_temas[0]?.id_campania;
      const campana = campanas.find(c => c.id_campania === idCampania);
      
      if (!campana) {
        console.log(`⚠️  Tema "${tema.nombre_tema}" - SIN CAMPAÑA ASOCIADA`);
        continue;
      }
      
      const medio = medios.find(m => m.id === tema.id_medio);
      console.log(`\n📋 Procesando tema: "${tema.nombre_tema}"`);
      console.log(`   Campaña: "${campana.nombrecampania}"`);
      console.log(`   Cliente ID: ${campana.id_cliente}`);
      console.log(`   Medio: ${medio?.nombredelmedio} (ID: ${tema.id_medio})`);
      
      // Verificar si ya existe un contrato para este cliente con este medio
      const { data: contratosExistentes, error: contratosError } = await supabase
        .from('contratos')
        .select('*')
        .eq('id_cliente', campana.id_cliente)
        .eq('idmedios', tema.id_medio);
      
      if (contratosError) {
        console.log(`   ❌ Error verificando contratos: ${contratosError.message}`);
        continue;
      }
      
      if (contratosExistentes && contratosExistentes.length > 0) {
        console.log(`   ✅ Ya existe contrato para cliente ${campana.id_cliente} con medio ${tema.id_medio}`);
        continue;
      }
      
      // Crear nuevo contrato
      const numeroContrato = `CONT-2024-${String(siguienteIdContrato).padStart(3, '0')}`;
      const descripcion = `Contrato ${medio?.nombredelmedio} - Cliente ${campana.id_cliente}`;
      
      const nuevoContrato = {
        id: siguienteIdContrato,
        numero_contrato: numeroContrato,
        descripcion: descripcion,
        id_cliente: campana.id_cliente,
        idmedios: tema.id_medio,
        id_proveedor: 1, // Valor por defecto
        id_forma_pago: 1, // Valor por defecto
        id_tipo_orden: 1, // Valor por defecto
        monto: 100000, // Valor por defecto
        fecha_inicio: new Date().toISOString().split('T')[0],
        fecha_fin: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        estado: true,
        c_orden: false
      };
      
      console.log(`   📝 Creando contrato: ${descripcion}`);
      
      const { data: contratoCreado, error: contratoError } = await supabase
        .from('contratos')
        .insert([nuevoContrato])
        .select()
        .single();
      
      if (contratoError) {
        console.log(`   ❌ Error creando contrato: ${contratoError.message}`);
        continue;
      }
      
      console.log(`   ✅ Contrato creado exitosamente (ID: ${contratoCreado.id})`);
      contratosCreados++;
      siguienteIdContrato++;
    }
    
    console.log('\n=== RESUMEN ===');
    console.log(`✅ Contratos creados: ${contratosCreados}`);
    console.log(`📋 Temas procesados: ${temas.length}`);
    
    if (contratosCreados > 0) {
      console.log('\n🎉 Todos los temas ahora tienen contratos que los vinculan correctamente a sus clientes');
    } else {
      console.log('\n📝 No se crearon contratos nuevos (posiblemente ya existían)');
    }
    
  } catch (error) {
    console.error('Error en el proceso:', error);
  }
}

// Ejecutar el proceso
fixTemasClientContracts();