const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://rfjbsoxkgmuehrgteljq.supabase.co';
const supabaseKey = 'sb_publishable_Z1GylJpX_JTd056Yr5-Icw_Wa83_W4C';

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnosticarYRepararBaseDeDatos() {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DE LA BASE DE DATOS ===\n');

    // 1. Verificar tablas que existen
    console.log('1. VERIFICANDO TABLAS EXISTENTES...');
    const tablasEsperadas = [
      'clientes', 'mensajes', 'campania', 'ordenes', 'ordenesdepublicidad',
      'contactocliente', 'comisiones', 'productos', 'grupos', 'region', 'comunas',
      'tipocliente', 'tablaformato', 'agencias', 'medios', 'soportes', 'contratos',
      'usuarios', 'alternativas', 'otrosdatos'
    ];

    const tablasExistentes = [];
    const tablasFaltantes = [];

    for (const tabla of tablasEsperadas) {
      try {
        const { data, error } = await supabase
          .from(tabla)
          .select('*')
          .limit(1);
        
        if (error) {
          if (error.code === 'PGRST116') {
            tablasFaltantes.push(tabla);
          } else {
            console.log(`⚠️  Tabla ${tabla} existe pero tiene errores:`, error.message);
            tablasExistentes.push(tabla);
          }
        } else {
          console.log(`✅ Tabla ${tabla} existe y es accesible`);
          tablasExistentes.push(tabla);
        }
      } catch (err) {
        tablasFaltantes.push(tabla);
      }
    }

    console.log('\nResumen de tablas:');
    console.log(`✅ Existentes: ${tablasExistentes.length}`);
    console.log(`❌ Faltantes: ${tablasFaltantes.length}`);
    if (tablasFaltantes.length > 0) {
      console.log('Tablas faltantes:', tablasFaltantes);
    }

    // 2. Verificar estructura de tablas críticas
    console.log('\n2. VERIFICANDO ESTRUCTURA DE TABLAS CRÍTICAS...');
    
    // Verificar tabla clientes
    if (tablasExistentes.includes('clientes')) {
      try {
        const { data: clientesData, error: clientesError } = await supabase
          .from('clientes')
          .select('*')
          .limit(1);
        
        if (!clientesError && clientesData.length > 0) {
          const columnasClientes = Object.keys(clientesData[0]);
          console.log('✅ Columnas en tabla clientes:', columnasClientes);
          
          // Verificar columnas críticas
          const columnasCriticas = ['id_cliente', 'nombrecliente', 'rut', 'id_region', 'id_comuna'];
          const columnasFaltantes = columnasCriticas.filter(col => !columnasClientes.includes(col));
          
          if (columnasFaltantes.length > 0) {
            console.log('❌ Columnas faltantes en clientes:', columnasFaltantes);
          }
        }
      } catch (err) {
        console.log('❌ Error al verificar estructura de clientes:', err.message);
      }
    }

    // Verificar tabla mensajes
    if (tablasExistentes.includes('mensajes')) {
      try {
        const { data: mensajesData, error: mensajesError } = await supabase
          .from('mensajes')
          .select('*')
          .limit(1);
        
        if (!mensajesError && mensajesData.length > 0) {
          const columnasMensajes = Object.keys(mensajesData[0]);
          console.log('✅ Columnas en tabla mensajes:', columnasMensajes);
          
          if (!columnasMensajes.includes('tipo')) {
            console.log('❌ Columna "tipo" falta en tabla mensajes');
          }
        } else if (mensajesError) {
          console.log('❌ Error en tabla mensajes:', mensajesError.message);
        }
      } catch (err) {
        console.log('❌ Error al verificar estructura de mensajes:', err.message);
      }
    }

    // 3. Crear tablas faltantes críticas
    console.log('\n3. CREANDO TABLAS FALTANTES CRÍTICAS...');
    
    if (tablasFaltantes.includes('mensajes')) {
      console.log('Creando tabla mensajes...');
      const { error: createMensajesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS mensajes (
            id SERIAL PRIMARY KEY,
            tipo VARCHAR(50) NOT NULL DEFAULT 'info',
            titulo VARCHAR(255) NOT NULL,
            contenido TEXT,
            prioridad VARCHAR(20) DEFAULT 'normal',
            leida BOOLEAN DEFAULT FALSE,
            id_usuario INTEGER REFERENCES usuarios(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      });
      
      if (createMensajesError) {
        console.log('❌ Error creando tabla mensajes:', createMensajesError.message);
      } else {
        console.log('✅ Tabla mensajes creada exitosamente');
      }
    }

    if (tablasFaltantes.includes('ordenes')) {
      console.log('Creando tabla ordenes...');
      const { error: createOrdenesError } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS ordenes (
            id SERIAL PRIMARY KEY,
            id_cliente INTEGER REFERENCES clientes(id_cliente),
            id_campana INTEGER REFERENCES campania(id),
            estado VARCHAR(50) DEFAULT 'pendiente',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            fecha_estimada_entrega DATE,
            fecha_entrega_real DATE,
            monto_total DECIMAL(15,2),
            descripcion TEXT,
            rentabilidad_incluida BOOLEAN DEFAULT FALSE
          );
        `
      });
      
      if (createOrdenesError) {
        console.log('❌ Error creando tabla ordenes:', createOrdenesError.message);
      } else {
        console.log('✅ Tabla ordenes creada exitosamente');
      }
    }

    // 4. Insertar datos de prueba si es necesario
    console.log('\n4. VERIFICANDO DATOS DE PRUEBA...');
    
    // Insertar mensajes de prueba
    if (tablasExistentes.includes('mensajes')) {
      const { data: mensajesCount, error: countError } = await supabase
        .from('mensajes')
        .select('*', { count: 'exact', head: true });
      
      if (!countError && mensajesCount === 0) {
        console.log('Insertando mensajes de prueba...');
        const { error: insertMensajesError } = await supabase
          .from('mensajes')
          .insert([
            {
              tipo: 'info',
              titulo: 'Bienvenido al sistema',
              contenido: 'Este es un mensaje de bienvenida',
              prioridad: 'normal',
              leida: false
            },
            {
              tipo: 'success',
              titulo: 'Sistema funcionando',
              contenido: 'Todos los servicios están operativos',
              prioridad: 'low',
              leida: false
            }
          ]);
        
        if (insertMensajesError) {
          console.log('❌ Error insertando mensajes de prueba:', insertMensajesError.message);
        } else {
          console.log('✅ Mensajes de prueba insertados');
        }
      }
    }

    // 5. Verificar y reparar permisos RLS
    console.log('\n5. VERIFICANDO PERMISOS RLS...');
    
    for (const tabla of ['clientes', 'mensajes', 'ordenes']) {
      if (tablasExistentes.includes(tabla)) {
        try {
          // Habilitar RLS
          await supabase.rpc('exec_sql', {
            sql: `ALTER TABLE ${tabla} ENABLE ROW LEVEL SECURITY;`
          });
          
          // Crear política para lecturas públicas
          await supabase.rpc('exec_sql', {
            sql: `
              CREATE POLICY IF NOT EXISTS "Permitir lectura pública de ${tabla}" 
              ON ${tabla} FOR SELECT USING (true);
            `
          });
          
          console.log(`✅ Permisos RLS configurados para tabla ${tabla}`);
        } catch (err) {
          console.log(`⚠️  No se pudieron configurar permisos para ${tabla}:`, err.message);
        }
      }
    }

    // 6. Verificar conexión final
    console.log('\n6. VERIFICACIÓN FINAL...');
    
    try {
      const { data: testData, error: testError } = await supabase
        .from('clientes')
        .select('id_cliente, nombrecliente')
        .limit(1);
      
      if (testError) {
        console.log('❌ Error en verificación final:', testError.message);
      } else {
        console.log('✅ Conexión a base de datos funcionando correctamente');
        console.log('✅ Tabla clientes accesible');
      }
    } catch (err) {
      console.log('❌ Error en verificación final:', err.message);
    }

    console.log('\n=== DIAGNÓSTICO COMPLETADO ===');
    console.log('Resumen final:');
    console.log(`- Tablas verificadas: ${tablasEsperadas.length}`);
    console.log(`- Tablas existentes: ${tablasExistentes.length}`);
    console.log(`- Tablas faltantes: ${tablasFaltantes.length}`);
    console.log('- Estructura verificada y reparada donde fue posible');
    console.log('- Permisos RLS configurados');
    
  } catch (error) {
    console.error('Error general en diagnóstico:', error);
  }
}

// Ejecutar el diagnóstico
diagnosticarYRepararBaseDeDatos();