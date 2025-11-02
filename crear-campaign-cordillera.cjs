/**
 * Script para crear campaña de Cordillera Foods con Urban Branding Agency
 * Presupuesto: $300.000.000 neto
 * Período: Noviembre - Diciembre 2025
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearCampañaCordillera() {
  console.log('🚀 Iniciando creación de campaña para Cordillera Foods...\n');

  try {
    // 1. Verificar cliente Cordillera Foods
    console.log('📋 Paso 1: Buscando cliente Cordillera Foods...');
    const { data: cliente, error: errorCliente } = await supabase
      .from('clientes')
      .select('*')
      .ilike('nombrecliente', '%cordillera%')
      .single();

    if (errorCliente || !cliente) {
      console.error('❌ No se encontró el cliente Cordillera Foods');
      return;
    }

    console.log(`✅ Cliente encontrado: ${cliente.nombrecliente} (ID: ${cliente.id_cliente})`);

    // 2. Verificar agencia Urban Branding Agency
    console.log('\n🏢 Paso 2: Buscando agencia Urban Branding Agency...');
    const { data: agencia, error: errorAgencia } = await supabase
      .from('agencias')
      .select('*')
      .or('nombreidentificador.ilike.%urban%,nombredefantasia.ilike.%urban%')
      .single();

    if (errorAgencia || !agencia) {
      console.error('❌ No se encontró la agencia Urban Branding Agency');
      return;
    }

    const nombreAgenciaMostrar = agencia.nombredefantasia || agencia.nombreidentificador || 'Agencia sin nombre';
    console.log(`✅ Agencia encontrada: ${nombreAgenciaMostrar} (ID: ${agencia.id})`);

    // 3. Verificar año 2025
    console.log('\n📅 Paso 3: Verificando año 2025...');
    const { data: anio, error: errorAnio } = await supabase
      .from('anios')
      .select('*')
      .eq('years', 2025)
      .single();

    if (errorAnio || !anio) {
      console.error('❌ No se encontró el año 2025');
      return;
    }

    console.log(`✅ Año encontrado: ${anio.years} (ID: ${anio.id})`);

    // 4. Verificar meses noviembre y diciembre 2025
    console.log('\n📆 Paso 4: Verificando meses noviembre y diciembre...');
    const { data: meses, error: errorMeses } = await supabase
      .from('meses')
      .select('*')
      .in('nombre', ['Noviembre', 'Diciembre']);

    if (errorMeses || !meses || meses.length !== 2) {
      console.error('❌ No se encontraron los meses noviembre y diciembre');
      return;
    }

    console.log(`✅ Meses encontrados: ${meses.map(m => m.nombre).join(', ')}`);

    // 5. Verificar productos disponibles
    console.log('\n📦 Paso 5: Verificando productos disponibles...');
    const { data: productos, error: errorProductos } = await supabase
      .from('productos')
      .select('*')
      .limit(10);

    if (errorProductos) {
      console.error('❌ Error al consultar productos');
      return;
    }

    console.log(`✅ Productos disponibles: ${productos.length}`);
    productos.forEach(p => console.log(`  - ${p.nombredelproducto} (ID: ${p.id})`));

    // 6. Crear la campaña
    console.log('\n🎯 Paso 6: Creando campaña...');
    const nombreCampaña = 'Cordillera Foods - Urban Branding - Nov-Dic 2025';
    const presupuestoTotal = 300000000;
    
    const { data: campania, error: errorCampania } = await supabase
      .from('campania')
      .insert({
        nombrecampania: nombreCampaña,
        id_cliente: cliente.id_cliente,
        id_agencia: agencia.id,
        id_producto: productos[0]?.id || null,
        id_anio: anio.id,
        presupuesto: presupuestoTotal,
        estado: true,
        c_orden: false,
        fecha_inicio: new Date('2025-11-01').toISOString(),
        fecha_fin: new Date('2025-12-31').toISOString()
      })
      .select()
      .single();

    if (errorCampania) {
      console.error('❌ Error al crear campaña:', errorCampania);
      return;
    }

    console.log(`✅ Campaña creada: ${campania.nombrecampania} (ID: ${campania.id_campania})`);
    console.log(`   Presupuesto: $${campania.presupuesto.toLocaleString('es-CL')}`);
    console.log(`   Estado: ${campania.estado ? 'Activa' : 'Inactiva'}`);

    // 7. Obtener medios disponibles
    console.log('\n📺 Paso 7: Analizando medios disponibles...');
    const { data: medios, error: errorMedios } = await supabase
      .from('medios')
      .select('*');

    if (errorMedios) {
      console.error('❌ Error al consultar medios');
      return;
    }

    console.log(`✅ Medios disponibles: ${medios.length}`);

    // 8. Crear planes para noviembre y diciembre
    console.log('\n📋 Paso 8: Creando planes para noviembre y diciembre...');
    
    for (const mes of meses) {
      const presupuestoMes = presupuestoTotal / 2; // Dividir presupuesto en 2 meses
      
      const planData = {
        id_cliente: cliente.id_cliente,
        id_campania: campania.id_campania,
        anio: 2025,
        mes: mes.id,
        nombre_plan: `Plan ${mes.nombre} 2025 - ${cliente.nombrecliente}`,
        descripcion: `Plan de medios para ${mes.nombre} 2025`,
        presupuesto: presupuestoMes,
        estado: true,
        estado2: 'activo'
      };
      
      const { data: plan, error: errorPlan } = await supabase
        .from('plan')
        .insert(planData)
        .select()
        .single();
      
      if (errorPlan) {
        console.error(`❌ Error al crear plan para ${mes.nombre}:`, errorPlan);
        continue;
      } else {
        console.log(`✅ Plan creado: ${plan.nombre_plan} (ID: ${plan.id})`);
        
        // 9. Analizar medios y crear alternativas
        console.log(`\n📺 Paso 9: Analizando medios para ${mes.nombre}...`);
        
        for (const medio of medios) {
          // Obtener soportes para este medio
          const { data: soportes, error: errorSoportes } = await supabase
            .from('soportes')
            .select('*')
            .eq('id_medios', medio.id_medios || medio.id);
          
          if (errorSoportes || !soportes || soportes.length === 0) {
            console.log(`   ⚠️  ${medio.nombre_medio || medio.nombre || 'Medio sin nombre'}: No tiene soportes`);
            continue;
          }
          
          console.log(`   📋 ${medio.nombre_medio || medio.nombre}: ${soportes.length} soportes`);
          
          for (const soporte of soportes) {
            // Obtener contratos para este soporte
            const { data: contratos, error: errorContratos } = await supabase
              .from('contratos')
              .select('*')
              .eq('id_soporte', soporte.id_soporte || soporte.id);
            
            if (errorContratos || !contratos || contratos.length === 0) {
              console.log(`      ⚠️  ${soporte.nombreIdentificador || soporte.nombre || 'Soporte sin nombre'}: No tiene contratos`);
              continue;
            }
            
            console.log(`      📄 ${soporte.nombreIdentificador || soporte.nombre}: ${contratos.length} contratos`);
            
            for (const contrato of contratos) {
              // Crear alternativa para este medio/soporte/contrato
              const presupuestoAlternativa = presupuestoMes / medios.length / soportes.length / contratos.length;
              
              const alternativaData = {
                id_plan: plan.id,
                id_medios: medio.id_medios || medio.id,
                id_soporte: soporte.id_soporte || soporte.id,
                id_contrato: contrato.id,
                nombre_alternativa: `${medio.nombre_medio || medio.nombre} - ${soporte.nombreIdentificador || soporte.nombre}`,
                descripcion: `Alternativa para ${medio.nombre_medio || medio.nombre} - ${soporte.nombreIdentificador || soporte.nombre}`,
                presupuesto: presupuestoAlternativa,
                estado: true
              };
              
              const { data: alternativa, error: errorAlternativa } = await supabase
                .from('alternativa')
                .insert(alternativaData)
                .select()
                .single();
              
              if (errorAlternativa) {
                console.error(`❌ Error al crear alternativa:`, errorAlternativa);
              } else {
                console.log(`         ✅ Alternativa creada: ${alternativa.nombre_alternativa} (ID: ${alternativa.id})`);
                
                // 10. Crear orden de publicidad
                const ordenData = {
                  id_alternativa: alternativa.id,
                  id_cliente: cliente.id_cliente,
                  id_campania: campania.id_campania,
                  id_plan: plan.id,
                  id_medios: medio.id_medios || medio.id,
                  id_soporte: soporte.id_soporte || soporte.id,
                  id_contrato: contrato.id,
                  id_proveedor: contrato.IdProveedor,
                  nombre_orden: `Orden ${medio.nombre_medio || medio.nombre} - ${soporte.nombreIdentificador || soporte.nombre} - ${mes.nombre} 2025`,
                  descripcion: `Orden de publicidad para ${medio.nombre_medio || medio.nombre} - ${soporte.nombreIdentificador || soporte.nombre}`,
                  presupuesto: presupuestoAlternativa,
                  estado: 'pendiente'
                };
                
                const { data: orden, error: errorOrden } = await supabase
                  .from('ordenesdepublicidad')
                  .insert(ordenData)
                  .select()
                  .single();
                
                if (errorOrden) {
                  console.error(`❌ Error al crear orden:`, errorOrden);
                } else {
                  console.log(`            ✅ Orden creada: ${orden.nombre_orden} (ID: ${orden.id})`);
                }
              }
            }
          }
        }
      }
    }

    console.log('\n🎉 Campaña creada exitosamente!');
    console.log('\n📋 Resumen:');
    console.log(`   Cliente: ${cliente.nombrecliente}`);
    console.log(`   Agencia: ${nombreAgenciaMostrar}`);
    console.log(`   Campaña: ${campania.nombrecampania}`);
    console.log(`   Presupuesto: $${presupuestoTotal.toLocaleString('es-CL')}`);
    console.log(`   Período: Noviembre - Diciembre 2025`);
    console.log('\n📝 Próximos pasos:');
    console.log('   1. Ir a http://localhost:3002/planificacion');
    console.log('   2. Buscar la campaña creada');
    console.log('   3. Revisar los planes, alternativas y órdenes generadas');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

// Ejecutar el script
crearCampañaCordillera();