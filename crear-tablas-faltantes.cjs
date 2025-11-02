const { createClient } = require('@supabase/supabase-js');

// Configuración de Supabase
const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function crearTablasFaltantes() {
  console.log('🔧 Creando tablas faltantes en la base de datos...\n');

  try {
    // 1. Crear tabla 'ordenes' (si no existe)
    console.log('📋 Creando tabla "ordenes"...');
    
    const { error: errorOrdenes } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS ordenes (
          id SERIAL PRIMARY KEY,
          id_cliente INTEGER REFERENCES clientes(id_cliente),
          id_proveedor INTEGER REFERENCES proveedores(id_proveedor),
          numero_orden VARCHAR(50) UNIQUE NOT NULL,
          fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_entrega_estimada DATE,
          fecha_entrega_real DATE,
          estado VARCHAR(50) DEFAULT 'solicitada',
          total_amount DECIMAL(15,2) DEFAULT 0,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_ordenes_estado ON ordenes(estado);
        CREATE INDEX IF NOT EXISTS idx_ordenes_cliente ON ordenes(id_cliente);
        CREATE INDEX IF NOT EXISTS idx_ordenes_fecha ON ordenes(fecha_pedido);
      `
    });

    if (errorOrdenes) {
      console.error('❌ Error creando tabla ordenes:', errorOrdenes);
    } else {
      console.log('✅ Tabla "ordenes" creada exitosamente');
    }

    // 2. Verificar si la tabla 'alternativa' existe, si no, crearla
    console.log('\n📋 Verificando tabla "alternativa"...');
    
    const { data: checkAlternativa, error: checkError } = await supabase
      .from('alternativa')
      .select('id')
      .limit(1);

    if (checkError && checkError.code === 'PGRST116') {
      // La tabla no existe, crearla
      console.log('⚠️ La tabla "alternativa" no existe, creándola...');
      
      const { error: errorAlternativa } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE alternativa (
            id SERIAL PRIMARY KEY,
            nlinea INTEGER,
            numerorden INTEGER,
            anio INTEGER REFERENCES anios(id),
            mes INTEGER REFERENCES meses(Id),
            id_campania INTEGER REFERENCES campania(id_campania),
            num_contrato INTEGER REFERENCES contratos(id),
            id_soporte INTEGER REFERENCES soportes(id_soporte),
            id_programa INTEGER REFERENCES programas(id),
            tipo_item VARCHAR(100),
            id_clasificacion INTEGER REFERENCES clasificacion(id),
            detalle TEXT,
            id_tema INTEGER REFERENCES temas(id_tema),
            segundos INTEGER,
            total_general DECIMAL(15,2),
            total_neto DECIMAL(15,2),
            descuento_pl DECIMAL(5,2),
            recargo_plan DECIMAL(5,2),
            valor_unitario DECIMAL(15,2),
            medio INTEGER REFERENCES medios(id),
            total_bruto DECIMAL(15,2),
            calendar JSONB,
            horario_inicio TIME,
            horario_fin TIME,
            ordencreada BOOLEAN DEFAULT false,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
          
          CREATE INDEX IF NOT EXISTS idx_alternativa_campania ON alternativa(id_campania);
          CREATE INDEX IF NOT EXISTS idx_alternativa_contrato ON alternativa(num_contrato);
          CREATE INDEX IF NOT EXISTS idx_alternativa_numerorden ON alternativa(numerorden);
          CREATE INDEX IF NOT EXISTS idx_alternativa_estado ON alternativa(ordencreada);
        `
      });

      if (errorAlternativa) {
        console.error('❌ Error creando tabla alternativa:', errorAlternativa);
      } else {
        console.log('✅ Tabla "alternativa" creada exitosamente');
      }
    } else if (!checkError) {
      console.log('✅ Tabla "alternativa" ya existe');
    } else {
      console.error('❌ Error verificando tabla alternativa:', checkError);
    }

    // 3. Crear tabla 'plan_alternativas' (si no existe)
    console.log('\n📋 Creando tabla "plan_alternativas"...');
    
    const { error: errorPlanAlternativas } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS plan_alternativas (
          id SERIAL PRIMARY KEY,
          id_plan INTEGER REFERENCES plan(id) ON DELETE CASCADE,
          id_alternativa INTEGER REFERENCES alternativa(id) ON DELETE CASCADE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(id_plan, id_alternativa)
        );
        
        CREATE INDEX IF NOT EXISTS idx_plan_alternativas_plan ON plan_alternativas(id_plan);
        CREATE INDEX IF NOT EXISTS idx_plan_alternativas_alternativa ON plan_alternativas(id_alternativa);
      `
    });

    if (errorPlanAlternativas) {
      console.error('❌ Error creando tabla plan_alternativas:', errorPlanAlternativas);
    } else {
      console.log('✅ Tabla "plan_alternativas" creada exitosamente');
    }

    // 4. Crear tabla 'campaign_audit_log' (si no existe)
    console.log('\n📋 Creando tabla "campaign_audit_log"...');
    
    const { error: errorAuditLog } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS campaign_audit_log (
          id SERIAL PRIMARY KEY,
          campaign_id INTEGER REFERENCES campania(id_campania),
          action VARCHAR(100) NOT NULL,
          details JSONB,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_campaign ON campaign_audit_log(campaign_id);
        CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_action ON campaign_audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_campaign_audit_log_created ON campaign_audit_log(created_at);
      `
    });

    if (errorAuditLog) {
      console.error('❌ Error creando tabla campaign_audit_log:', errorAuditLog);
    } else {
      console.log('✅ Tabla "campaign_audit_log" creada exitosamente');
    }

    // 5. Crear tabla 'order_audit_log' (si no existe)
    console.log('\n📋 Creando tabla "order_audit_log"...');
    
    const { error: errorOrderAuditLog } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS order_audit_log (
          id SERIAL PRIMARY KEY,
          order_id INTEGER REFERENCES ordenes(id),
          action VARCHAR(100) NOT NULL,
          details JSONB,
          user_id INTEGER,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_order_audit_log_order ON order_audit_log(order_id);
        CREATE INDEX IF NOT EXISTS idx_order_audit_log_action ON order_audit_log(action);
        CREATE INDEX IF NOT EXISTS idx_order_audit_log_created ON order_audit_log(created_at);
      `
    });

    if (errorOrderAuditLog) {
      console.error('❌ Error creando tabla order_audit_log:', errorOrderAuditLog);
    } else {
      console.log('✅ Tabla "order_audit_log" creada exitosamente');
    }

    // 6. Insertar datos de prueba si las tablas están vacías
    console.log('\n📋 Verificando si se necesitan datos de prueba...');
    
    // Verificar si hay datos en ordenes
    const { data: ordenesData, error: ordenesError } = await supabase
      .from('ordenes')
      .select('id')
      .limit(1);

    if (!ordenesError && (!ordenesData || ordenesData.length === 0)) {
      console.log('📝 Insertando datos de prueba en ordenes...');
      
      const { error: insertOrdenesError } = await supabase
        .from('ordenes')
        .insert([
          {
            id_cliente: 1,
            numero_orden: 'ORD-001',
            estado: 'solicitada',
            total_amount: 100000,
            descripcion: 'Orden de prueba 1'
          },
          {
            id_cliente: 2,
            numero_orden: 'ORD-002',
            estado: 'aprobada',
            total_amount: 150000,
            descripcion: 'Orden de prueba 2'
          }
        ]);

      if (insertOrdenesError) {
        console.error('❌ Error insertando datos de prueba en ordenes:', insertOrdenesError);
      } else {
        console.log('✅ Datos de prueba insertados en ordenes');
      }
    }

    // Verificar si hay datos en alternativa
    const { data: alternativaData, error: alternativaError } = await supabase
      .from('alternativa')
      .select('id')
      .limit(1);

    if (!alternativaError && (!alternativaData || alternativaData.length === 0)) {
      console.log('📝 Insertando datos de prueba en alternativa...');
      
      const { error: insertAlternativaError } = await supabase
        .from('alternativa')
        .insert([
          {
            nlinea: 1,
            numerorden: 1,
            anio: 2024,
            mes: 1,
            id_campania: 1,
            num_contrato: 1,
            tipo_item: 'PAUTA LIBRE',
            valor_unitario: 10000,
            total_bruto: 10000,
            total_neto: 8500,
            ordencreada: true
          },
          {
            nlinea: 2,
            numerorden: 2,
            anio: 2024,
            mes: 1,
            id_campania: 1,
            num_contrato: 1,
            tipo_item: 'AUSPICIO',
            valor_unitario: 15000,
            total_bruto: 15000,
            total_neto: 12750,
            ordencreada: false
          }
        ]);

      if (insertAlternativaError) {
        console.error('❌ Error insertando datos de prueba en alternativa:', insertAlternativaError);
      } else {
        console.log('✅ Datos de prueba insertados en alternativa');
      }
    }

    console.log('\n🎉 Proceso de creación de tablas completado');
    console.log('\n📊 Resumen:');
    console.log('✅ Tablas creadas/verificadas: ordenes, alternativa, plan_alternativas');
    console.log('✅ Tablas de auditoría creadas: campaign_audit_log, order_audit_log');
    console.log('✅ Datos de prueba insertados si era necesario');

  } catch (error) {
    console.error('❌ Error general en el proceso:', error);
  }
}

// Ejecutar el script
crearTablasFaltantes();