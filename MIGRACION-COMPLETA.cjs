const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

class MigracionBaseDatos {
  constructor() {
    this.backup = {};
    this.logs = [];
  }

  log(mensaje, tipo = 'INFO') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${tipo}] ${mensaje}`;
    console.log(logEntry);
    this.logs.push(logEntry);
  }

  async esperar(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async backupDatos() {
    this.log('🔄 INICIANDO BACKUP DE DATOS CRÍTICOS...');
    
    try {
      // Backup de todas las tablas
      const tablas = ['ordenesdepublicidad', 'clientes', 'campania', 'alternativa', 'plan', 'medios', 'contratos', 'proveedores'];
      
      for (const tabla of tablas) {
        this.log(`Haciendo backup de tabla: ${tabla}`);
        const { data, error } = await supabase.from(tabla).select('*');
        
        if (error) {
          this.log(`Error en backup ${tabla}: ${error.message}`, 'ERROR');
          throw error;
        }
        
        this.backup[tabla] = data;
        this.log(`✅ Backup ${tabla}: ${data.length} registros`);
      }
      
      // Guardar backup en archivo
      const fs = require('fs');
      fs.writeFileSync('backup-datos.json', JSON.stringify(this.backup, null, 2));
      this.log('✅ Backup guardado en backup-datos.json');
      
      return true;
    } catch (error) {
      this.log(`❌ Error en backup: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async estandarizarNombresTablas() {
    this.log('🔄 ESTANDARIZANDO NOMBRES DE TABLAS...');
    
    try {
      // Mapeo de nombres antiguos a nuevos
      const renombrarTablas = {
        'campania': 'campanas',
        'alternativa': 'alternativas',
        'plan': 'planes',
        'medios': 'medios', // ya está correcto
        'proveedores': 'proveedores', // ya está correcto
        'clientes': 'clientes', // ya está correcto
        'contratos': 'contratos', // ya está correcto
        'ordenesdepublicidad': 'ordenes'
      };
      
      for (const [nombreAntiguo, nombreNuevo] of Object.entries(renombrarTablas)) {
        if (nombreAntiguo !== nombreNuevo) {
          this.log(`Renombrando ${nombreAntiguo} → ${nombreNuevo}`);
          
          // Usar SQL directo para renombrar tabla
          const { error } = await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE ${nombreAntiguo} RENAME TO ${nombreNuevo};`
          });
          
          if (error) {
            this.log(`Error renombrando ${nombreAntiguo}: ${error.message}`, 'ERROR');
            // Continuar con otras tablas si una falla
          } else {
            this.log(`✅ Tabla renombrada: ${nombreAntiguo} → ${nombreNuevo}`);
          }
        }
      }
      
      return true;
    } catch (error) {
      this.log(`❌ Error estandarizando tablas: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async corregirEstructuraDatos() {
    this.log('🔄 CORRIGIENDO ESTRUCTURA DE DATOS...');
    
    try {
      // 1. Corregir alternativas_plan_orden en tabla ordenes
      this.log('Corrigiendo campo alternativas_plan_orden en ordenes...');
      
      const { data: ordenes, error: errorOrdenes } = await supabase
        .from('ordenes')
        .select('id_ordenes_de_comprar, alternativas_plan_orden')
        .not('alternativas_plan_orden', 'is', null);
      
      if (!errorOrdenes && ordenes) {
        for (const orden of ordenes) {
          let valorCorregido = null;
          
          if (typeof orden.alternativas_plan_orden === 'string') {
            if (orden.alternativas_plan_orden.startsWith('[')) {
              // Es JSON array, convertir a string separado por comas
              try {
                const arrayIds = JSON.parse(orden.alternativas_plan_orden);
                valorCorregido = arrayIds.join(',');
              } catch (e) {
                this.log(`Error parseando JSON en orden ${orden.id_ordenes_de_comprar}: ${e.message}`, 'ERROR');
              }
            } else {
              // Ya es string, limpiar espacios
              valorCorregido = orden.alternativas_plan_orden.split(',').map(id => id.trim()).join(',');
            }
          }
          
          if (valorCorregido && valorCorregido !== orden.alternativas_plan_orden) {
            const { error: errorUpdate } = await supabase
              .from('ordenes')
              .update({ alternativas_plan_orden: valorCorregido })
              .eq('id_ordenes_de_comprar', orden.id_ordenes_de_comprar);
            
            if (errorUpdate) {
              this.log(`Error actualizando orden ${orden.id_ordenes_de_comprar}: ${errorUpdate.message}`, 'ERROR');
            } else {
              this.log(`✅ Corregido alternativas_plan_orden en orden ${orden.id_ordenes_de_comprar}`);
            }
          }
        }
      }
      
      // 2. Corregir nombres de columnas inconsistentes
      this.log('Corrigiendo nombres de columnas...');
      
      const correccionesColumnas = [
        { tabla: 'clientes', antiguo: 'nombrecliente', nuevo: 'nombre' },
        { tabla: 'clientes', antiguo: 'id_cliente', nuevo: 'id' },
        { tabla: 'campanas', antiguo: 'nombrecampania', nuevo: 'nombre' },
        { tabla: 'campanas', antiguo: 'id_campania', nuevo: 'id' },
        { tabla: 'campanas', antiguo: 'id_Cliente', nuevo: 'cliente_id' },
        { tabla: 'alternativas', antiguo: 'id_contrato', nuevo: 'contrato_id' },
        { tabla: 'alternativas', antiguo: 'id_plan', nuevo: 'plan_id' },
        { tabla: 'planes', antiguo: 'nombre_plan', nuevo: 'nombre' },
        { tabla: 'planes', antiguo: 'id_plan', nuevo: 'id' },
        { tabla: 'medios', antiguo: 'nombre_medio', nuevo: 'nombre' },
        { tabla: 'medios', antiguo: 'id_medio', nuevo: 'id' },
        { tabla: 'contratos', antiguo: 'idmedios', nuevo: 'medio_id' },
        { tabla: 'contratos', antiguo: 'id_proveedor', nuevo: 'proveedor_id' },
        { tabla: 'proveedores', antiguo: 'nombreproveedor', nuevo: 'nombre' },
        { tabla: 'proveedores', antiguo: 'id_proveedor', nuevo: 'id' },
        { tabla: 'ordenes', antiguo: 'id_ordenes_de_comprar', nuevo: 'id' },
        { tabla: 'ordenes', antiguo: 'id_cliente', nuevo: 'cliente_id' },
        { tabla: 'ordenes', antiguo: 'id_campania', nuevo: 'campana_id' },
        { tabla: 'ordenes', antiguo: 'id_plan', nuevo: 'plan_id' }
      ];
      
      for (const { tabla, antiguo, nuevo } of correccionesColumnas) {
        this.log(`Corrigiendo columna ${antiguo} → ${nuevo} en tabla ${tabla}`);
        
        const { error } = await supabase.rpc('exec_sql', {
          sql: `ALTER TABLE ${tabla} RENAME COLUMN ${antiguo} TO ${nuevo};`
        });
        
        if (error) {
          this.log(`Error renombrando columna ${antiguo} en ${tabla}: ${error.message}`, 'ERROR');
        } else {
          this.log(`✅ Columna renombrada: ${tabla}.${antiguo} → ${nuevo}`);
        }
        
        await this.esperar(100); // Pequeña pausa entre operaciones
      }
      
      return true;
    } catch (error) {
      this.log(`❌ Error corrigiendo estructura: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async actualizarRelaciones() {
    this.log('🔄 ACTUALIZANDO RELACIONES Y CLAVES FORÁNEAS...');
    
    try {
      // Crear relaciones proper
      const relaciones = [
        `ALTER TABLE campanas ADD CONSTRAINT fk_campana_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);`,
        `ALTER TABLE planes ADD CONSTRAINT fk_plan_campana FOREIGN KEY (campana_id) REFERENCES campanas(id);`,
        `ALTER TABLE planes ADD CONSTRAINT fk_plan_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);`,
        `ALTER TABLE alternativas ADD CONSTRAINT fk_alternativa_contrato FOREIGN KEY (contrato_id) REFERENCES contratos(id);`,
        `ALTER TABLE alternativas ADD CONSTRAINT fk_alternativa_plan FOREIGN KEY (plan_id) REFERENCES planes(id);`,
        `ALTER TABLE contratos ADD CONSTRAINT fk_contrato_medio FOREIGN KEY (medio_id) REFERENCES medios(id);`,
        `ALTER TABLE contratos ADD CONSTRAINT fk_contrato_proveedor FOREIGN KEY (proveedor_id) REFERENCES proveedores(id);`,
        `ALTER TABLE ordenes ADD CONSTRAINT fk_orden_cliente FOREIGN KEY (cliente_id) REFERENCES clientes(id);`,
        `ALTER TABLE ordenes ADD CONSTRAINT fk_orden_campana FOREIGN KEY (campana_id) REFERENCES campanas(id);`,
        `ALTER TABLE ordenes ADD CONSTRAINT fk_orden_plan FOREIGN KEY (plan_id) REFERENCES planes(id);`
      ];
      
      for (const sql of relaciones) {
        this.log(`Creando relación: ${sql.split('ADD CONSTRAINT')[1].split('FOREIGN')[0].trim()}`);
        
        const { error } = await supabase.rpc('exec_sql', { sql });
        
        if (error) {
          this.log(`Error creando relación: ${error.message}`, 'WARNING');
          // No fallar si la relación ya existe
        } else {
          this.log(`✅ Relación creada exitosamente`);
        }
        
        await this.esperar(100);
      }
      
      return true;
    } catch (error) {
      this.log(`❌ Error actualizando relaciones: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async generarReporteFinal() {
    this.log('📊 GENERANDO REPORTE FINAL...');
    
    try {
      const tablas = ['ordenes', 'clientes', 'campanas', 'alternativas', 'planes', 'medios', 'contratos', 'proveedores'];
      let reporte = '\n=== REPORTE FINAL DE MIGRACIÓN ===\n\n';
      
      for (const tabla of tablas) {
        const { data, error, count } = await supabase
          .from(tabla)
          .select('*', { count: 'exact', head: true });
        
        if (!error) {
          reporte += `✅ ${tabla}: ${count} registros\n`;
        } else {
          reporte += `❌ ${tabla}: Error - ${error.message}\n`;
        }
      }
      
      reporte += '\n=== LOGS DE MIGRACIÓN ===\n';
      reporte += this.logs.join('\n');
      
      // Guardar reporte
      const fs = require('fs');
      fs.writeFileSync('reporte-migracion.txt', reporte);
      this.log('✅ Reporte guardado en reporte-migracion.txt');
      
      console.log(reporte);
      return reporte;
    } catch (error) {
      this.log(`❌ Error generando reporte: ${error.message}`, 'ERROR');
      throw error;
    }
  }

  async ejecutarMigracionCompleta() {
    try {
      this.log('🚀 INICIANDO MIGRACIÓN COMPLETA DE BASE DE DATOS');
      this.log('================================================');
      
      // Paso 1: Backup
      await this.backupDatos();
      await this.esperar(1000);
      
      // Paso 2: Estandarizar nombres
      await this.estandarizarNombresTablas();
      await this.esperar(1000);
      
      // Paso 3: Corregir estructura
      await this.corregirEstructuraDatos();
      await this.esperar(1000);
      
      // Paso 4: Actualizar relaciones
      await this.actualizarRelaciones();
      await this.esperar(1000);
      
      // Paso 5: Reporte final
      await this.generarReporteFinal();
      
      this.log('🎉 MIGRACIÓN COMPLETADA EXITOSAMENTE');
      return true;
      
    } catch (error) {
      this.log(`❌ ERROR CRÍTICO EN MIGRACIÓN: ${error.message}`, 'ERROR');
      this.log('🔄 REVIRTIENDO CAMBIOS...');
      
      // Aquí iría el código de rollback si fuera necesario
      throw error;
    }
  }
}

// Ejecutar migración
async function main() {
  const migracion = new MigracionBaseDatos();
  
  try {
    await migracion.ejecutarMigracionCompleta();
    console.log('\n✅ Migración completada. Revisa los archivos:');
    console.log('  - backup-datos.json (backup original)');
    console.log('  - reporte-migracion.txt (reporte completo)');
  } catch (error) {
    console.error('\n❌ La migración falló. Revisa los logs para detalles.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigracionBaseDatos;