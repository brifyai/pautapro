const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

class MigracionSegura {
  constructor() {
    this.backup = {};
    this.logs = [];
    this.nuevosNombres = {
      'campania': 'campanas',
      'alternativa': 'alternativas', 
      'plan': 'planes',
      'ordenesdepublicidad': 'ordenes'
    };
  }

  log(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${tipo}] ${mensaje}`;
    console.log(logEntry);
    this.logs.push(logEntry);
  }

  async backupCompleto() {
    this.log('🔄 CREANDO BACKUP COMPLETO...');
    
    try {
      const fs = require('fs');
      const tablas = ['ordenesdepublicidad', 'clientes', 'campania', 'alternativa', 'plan', 'medios', 'contratos', 'proveedores'];
      
      for (const tabla of tablas) {
        this.log(`Backup de ${tabla}...`);
        const { data, error } = await supabase.from(tabla).select('*');
        
        if (error) throw error;
        this.backup[tabla] = data;
        this.log(`✅ ${tabla}: ${data.length} registros`);
      }
      
      // Guardar backup
      fs.writeFileSync('BACKUP-COMPLETO.json', JSON.stringify(this.backup, null, 2));
      this.log('✅ Backup guardado en BACKUP-COMPLETO.json');
      
      return true;
    } catch (error) {
      this.log(`❌ Error en backup: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async crearTablasNuevas() {
    this.log('🔄 CREANDO NUEVAS TABLAS CON ESTRUCTURA LIMPIA...');
    
    try {
      // 1. Crear tabla clientes_nueva
      await this.crearTablaClientes();
      
      // 2. Crear tabla campanas_nueva
      await this.crearTablaCampanas();
      
      // 3. Crear tabla planes_nuevo
      await this.crearTablaPlanes();
      
      // 4. Crear tabla medios_nueva
      await this.crearTablaMedios();
      
      // 5. Crear tabla proveedores_nuevo
      await this.crearTablaProveedores();
      
      // 6. Crear tabla contratos_nuevo
      await this.crearTablaContratos();
      
      // 7. Crear tabla alternativas_nueva
      await this.crearTablaAlternativas();
      
      // 8. Crear tabla ordenes_nueva
      await this.crearTablaOrdenes();
      
      return true;
    } catch (error) {
      this.log(`❌ Error creando tablas: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async crearTablaClientes() {
    this.log('Creando tabla clientes_nueva...');
    
    // Migrar datos de clientes
    const clientes = this.backup['clientes'];
    
    if (!clientes || !Array.isArray(clientes)) {
      this.log('❌ No hay datos de clientes para migrar', 'ERROR');
      return;
    }
    
    for (const cliente of clientes) {
      const { error } = await supabase
        .from('clientes_nueva')
        .insert({
          id: cliente.id_cliente,
          nombre: cliente.nombrecliente,
          rut: cliente.rut,
          razon_social: cliente.razonsocial,
          direccion: cliente.direccion,
          telefono: cliente.telefono,
          email: cliente.email,
          estado: cliente.estado,
          created_at: cliente.created_at,
          updated_at: cliente.updated_at
        });
      
      if (error) {
        this.log(`Error insertando cliente ${cliente.id_cliente}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ clientes_nueva creada');
  }

  async crearTablaCampanas() {
    this.log('Creando tabla campanas_nueva...');
    
    const campanas = this.backup['campania'];
    
    if (!campanas || !Array.isArray(campanas)) {
      this.log('❌ No hay datos de campañas para migrar', 'ERROR');
      return;
    }
    
    for (const campana of campanas) {
      const { error } = await supabase
        .from('campanas_nueva')
        .insert({
          id: campana.id_campania,
          nombre: campana.nombrecampania,
          cliente_id: campana.id_cliente,
          presupuesto: campana.presupuesto,
          descripcion: campana.descripcion,
          estado: campana.estado,
          created_at: campana.created_at,
          updated_at: campana.updated_at
        });
      
      if (error) {
        this.log(`Error insertando campaña ${campana.id_campania}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ campanas_nueva creada');
  }

  async crearTablaPlanes() {
    this.log('Creando tabla planes_nuevo...');
    
    const planes = this.backup['plan'];
    
    if (!planes || !Array.isArray(planes)) {
      this.log('❌ No hay datos de planes para migrar', 'ERROR');
      return;
    }
    
    for (const plan of planes) {
      const { error } = await supabase
        .from('planes_nuevo')
        .insert({
          id: plan.id,
          nombre: plan.nombre_plan,
          cliente_id: plan.id_cliente,
          campana_id: plan.id_campania,
          anio: plan.anio,
          mes: plan.mes,
          presupuesto: plan.presupuesto,
          estado: plan.estado,
          created_at: plan.created_at,
          updated_at: plan.updated_at
        });
      
      if (error) {
        this.log(`Error insertando plan ${plan.id}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ planes_nuevo creado');
  }

  async crearTablaMedios() {
    this.log('Creando tabla medios_nueva...');
    
    const medios = this.backup['medios'];
    
    if (!medios || !Array.isArray(medios)) {
      this.log('❌ No hay datos de medios para migrar', 'ERROR');
      return;
    }
    
    for (const medio of medios) {
      const { error } = await supabase
        .from('medios_nueva')
        .insert({
          id: medio.id,
          nombre: medio.nombre_medio,
          codigo: medio.codigo,
          estado: medio.estado,
          tipo_medio: medio.tipo_medio,
          created_at: medio.created_at,
          updated_at: medio.updated_at
        });
      
      if (error) {
        this.log(`Error insertando medio ${medio.id}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ medios_nueva creada');
  }

  async crearTablaProveedores() {
    this.log('Creando tabla proveedores_nuevo...');
    
    const proveedores = this.backup['proveedores'];
    
    if (!proveedores || !Array.isArray(proveedores)) {
      this.log('❌ No hay datos de proveedores para migrar', 'ERROR');
      return;
    }
    
    for (const proveedor of proveedores) {
      const { error } = await supabase
        .from('proveedores_nuevo')
        .insert({
          id: proveedor.id_proveedor,
          nombre: proveedor.nombreproveedor,
          rut: proveedor.rut,
          razon_social: proveedor.razonsocial,
          direccion: proveedor.direccion,
          telefono: proveedor.telefono,
          email: proveedor.email,
          estado: proveedor.estado,
          created_at: proveedor.created_at,
          updated_at: proveedor.updated_at
        });
      
      if (error) {
        this.log(`Error insertando proveedor ${proveedor.id_proveedor}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ proveedores_nuevo creado');
  }

  async crearTablaContratos() {
    this.log('Creando tabla contratos_nuevo...');
    
    const contratos = this.backup['contratos'];
    
    if (!contratos || !Array.isArray(contratos)) {
      this.log('❌ No hay datos de contratos para migrar', 'ERROR');
      return;
    }
    
    for (const contrato of contratos) {
      const { error } = await supabase
        .from('contratos_nuevo')
        .insert({
          id: contrato.id,
          numero_contrato: contrato.numero_contrato,
          medio_id: contrato.idmedios,
          proveedor_id: contrato.id_proveedor,
          descripcion: contrato.descripcion,
          monto: contrato.monto,
          fecha_inicio: contrato.fecha_inicio,
          fecha_fin: contrato.fecha_fin,
          estado: contrato.estado,
          created_at: contrato.created_at,
          updated_at: contrato.updated_at
        });
      
      if (error) {
        this.log(`Error insertando contrato ${contrato.id}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ contratos_nuevo creado');
  }

  async crearTablaAlternativas() {
    this.log('Creando tabla alternativas_nueva...');
    
    const alternativas = this.backup['alternativa'];
    
    if (!alternativas || !Array.isArray(alternativas)) {
      this.log('❌ No hay datos de alternativas para migrar', 'ERROR');
      return;
    }
    
    for (const alternativa of alternativas) {
      const { error } = await supabase
        .from('alternativas_nueva')
        .insert({
          id: alternativa.id,
          descripcion: alternativa.descripcion,
          costo: alternativa.costo,
          duracion: alternativa.duracion,
          contrato_id: alternativa.id_contrato,
          plan_id: alternativa.id_plan,
          estado: alternativa.estado,
          created_at: alternativa.created_at,
          updated_at: alternativa.updated_at
        });
      
      if (error) {
        this.log(`Error insertando alternativa ${alternativa.id}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ alternativas_nueva creada');
  }

  async crearTablaOrdenes() {
    this.log('Creando tabla ordenes_nueva...');
    
    const ordenes = this.backup['ordenesdepublicidad'];
    
    if (!ordenes || !Array.isArray(ordenes)) {
      this.log('❌ No hay datos de órdenes para migrar', 'ERROR');
      return;
    }
    
    for (const orden of ordenes) {
      // Corregir alternativas_plan_orden
      let alternativasIds = null;
      if (orden.alternativas_plan_orden) {
        if (typeof orden.alternativas_plan_orden === 'string') {
          if (orden.alternativas_plan_orden.startsWith('[')) {
            try {
              const arrayIds = JSON.parse(orden.alternativas_plan_orden);
              alternativasIds = arrayIds.join(',');
            } catch (e) {
              alternativasIds = orden.alternativas_plan_orden;
            }
          } else {
            alternativasIds = orden.alternativas_plan_orden;
          }
        }
      }
      
      const { error } = await supabase
        .from('ordenes_nueva')
        .insert({
          id: orden.id_ordenes_de_comprar,
          numero_correlativo: orden.numero_correlativo,
          cliente_id: orden.id_cliente,
          campana_id: orden.id_campania,
          plan_id: orden.id_plan,
          alternativas_ids: alternativasIds,
          monto_total: orden.monto_total,
          estado: orden.estado,
          fecha_orden: orden.fecha_orden,
          created_at: orden.created_at,
          updated_at: orden.updated_at
        });
      
      if (error) {
        this.log(`Error insertando orden ${orden.id_ordenes_de_comprar}: ${error.message}`, 'ERROR');
      }
    }
    
    this.log('✅ ordenes_nueva creada');
  }

  async intercambiarTablas() {
    this.log('🔄 INTERCAMBIANDO TABLAS ANTIGUAS POR NUEVAS...');
    
    try {
      const fs = require('fs');
      
      // Guardar registro de lo que se va a hacer
      const intercambio = {
        timestamp: new Date().toISOString(),
        respaldo: this.backup,
        tablas_cambiadas: Object.keys(this.nuevosNombres)
      };
      
      fs.writeFileSync('INTERCAMBIO-TABLAS.json', JSON.stringify(intercambio, null, 2));
      
      this.log('⚠️  ATENCIÓN: Se deben renombrar manualmente las tablas en Supabase:');
      this.log('   1. clientes → clientes_backup');
      this.log('   2. clientes_nueva → clientes');
      this.log('   3. campania → campania_backup');
      this.log('   4. campanas_nueva → campanas');
      this.log('   5. alternativa → alternativa_backup');
      this.log('   6. alternativas_nueva → alternativas');
      this.log('   7. plan → plan_backup');
      this.log('   8. planes_nuevo → planes');
      this.log('   9. ordenesdepublicidad → ordenesdepublicidad_backup');
      this.log('   10. ordenes_nueva → ordenes');
      this.log('   11. medios → medios_backup');
      this.log('   12. medios_nueva → medios');
      this.log('   13. proveedores → proveedores_backup');
      this.log('   14. proveedores_nuevo → proveedores');
      this.log('   15. contratos → contratos_backup');
      this.log('   16. contratos_nuevo → contratos');
      
      return true;
    } catch (error) {
      this.log(`❌ Error en intercambio: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async generarReporte() {
    this.log('📊 GENERANDO REPORTE FINAL...');
    
    try {
      const fs = require('fs');
      
      let reporte = '\n=== REPORTE DE MIGRACIÓN SEGURA ===\n\n';
      reporte += `Timestamp: ${new Date().toISOString()}\n\n`;
      reporte += 'Tablas migradas:\n';
      
      const tablasNuevas = ['clientes_nueva', 'campanas_nueva', 'planes_nuevo', 'medios_nueva', 'proveedores_nuevo', 'contratos_nuevo', 'alternativas_nueva', 'ordenes_nueva'];
      
      for (const tabla of tablasNuevas) {
        const { data, error, count } = await supabase
          .from(tabla)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          reporte += `✅ ${tabla}: ${count} registros\n`;
        } else {
          reporte += `❌ ${tabla}: Error - ${error.message}\n`;
        }
      }
      
      reporte += '\n=== LOGS ===\n';
      reporte += this.logs.join('\n');
      
      fs.writeFileSync('REPORTE-MIGRACION-SEGURA.txt', reporte);
      this.log('✅ Reporte guardado en REPORTE-MIGRACION-SEGURA.txt');
      
      console.log(reporte);
      return reporte;
    } catch (error) {
      this.log(`❌ Error generando reporte: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async ejecutarMigracionSegura() {
    try {
      this.log('🚀 INICIANDO MIGRACIÓN SEGURA DE BASE DE DATOS');
      this.log('================================================');
      
      // Paso 1: Backup completo
      await this.backupCompleto();
      
      // Paso 2: Crear tablas nuevas con estructura limpia
      await this.crearTablasNuevas();
      
      // Paso 3: Generar instrucciones para intercambio manual
      await this.intercambiarTablas();
      
      // Paso 4: Reporte final
      await this.generarReporte();
      
      this.log('🎉 MIGRACIÓN SEGURA COMPLETADA');
      this.log('⚠️  REQUIERE INTERCAMBIO MANUAL DE TABLAS EN SUPABASE');
      
      return true;
    } catch (error) {
      this.log(`❌ ERROR EN MIGRACIÓN: ${error.message}`, 'ERROR');
      throw error;
    }
  }
}

// Ejecutar migración
async function main() {
  const migracion = new MigracionSegura();
  
  try {
    await migracion.ejecutarMigracionSegura();
    console.log('\n✅ Migración segura completada.');
    console.log('📋 Revisa los archivos generados:');
    console.log('  - BACKUP-COMPLETO.json (backup original)');
    console.log('  - INTERCAMBIO-TABLAS.json (registro de cambios)');
    console.log('  - REPORTE-MIGRACION-SEGURA.txt (reporte completo)');
    console.log('\n⚠️  Sigue las instrucciones en el reporte para completar el intercambio de tablas.');
  } catch (error) {
    console.error('\n❌ La migración falló. Revisa los logs para detalles.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigracionSegura;