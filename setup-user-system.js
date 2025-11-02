// Script para configurar el sistema de usuarios de PautaPro
// Ejecutar con: node setup-user-system.js

const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');

// Configuración de Supabase (usar variables de entorno o .env)
const supabaseUrl = process.env.SUPABASE_URL || 'https://tu-proyecto.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || 'tu-service-key';

const supabase = createClient(supabaseUrl, supabaseKey);

// Función para hashear contraseña
const hashPassword = async (password) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'pautapro-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

async function setupUserSystem() {
  console.log('🚀 Iniciando configuración del sistema de usuarios PautaPro...');

  try {
    // 1. Crear tablas si no existen
    console.log('📋 Creando estructura de tablas...');
    
    // Ejecutar script SQL de creación
    const { error: schemaError } = await supabase.rpc('exec_sql', {
      sql: `
        -- Crear tabla de perfiles si no existe
        CREATE TABLE IF NOT EXISTS perfiles (
          id_perfil SERIAL PRIMARY KEY,
          nombre_perfil VARCHAR(50) UNIQUE NOT NULL,
          descripcion TEXT,
          nivel_acceso INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Crear tabla de grupos si no existe
        CREATE TABLE IF NOT EXISTS grupos (
          id_grupo SERIAL PRIMARY KEY,
          nombre_grupo VARCHAR(50) UNIQUE NOT NULL,
          descripcion TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        -- Crear tabla de usuarios si no existe
        CREATE TABLE IF NOT EXISTS usuarios (
          id_usuario SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          apellido VARCHAR(100) NOT NULL,
          email VARCHAR(255) UNIQUE NOT NULL,
          password VARCHAR(255) NOT NULL,
          telefono VARCHAR(20),
          avatar VARCHAR(255),
          estado BOOLEAN DEFAULT true,
          id_perfil INTEGER REFERENCES perfiles(id_perfil),
          id_grupo INTEGER REFERENCES grupos(id_grupo),
          ultimo_acceso TIMESTAMP,
          fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT email_valido CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$')
        );
      `
    });

    if (schemaError) {
      console.log('⚠️  Las tablas probablemente ya existen. Continuando...');
    }

    // 2. Insertar perfiles si no existen
    console.log('👥 Configurando perfiles de usuario...');
    
    const perfiles = [
      { nombre_perfil: 'director', descripcion: 'Director con acceso completo', nivel_acceso: 5 },
      { nombre_perfil: 'gerente', descripcion: 'Gerente con acceso a gestión', nivel_acceso: 4 },
      { nombre_perfil: 'financiero', descripcion: 'Acceso a presupuestos y finanzas', nivel_acceso: 3 },
      { nombre_perfil: 'supervisor', descripcion: 'Supervisor de campañas', nivel_acceso: 3 },
      { nombre_perfil: 'planificador', descripcion: 'Planificador de campañas', nivel_acceso: 2 },
      { nombre_perfil: 'asistente', descripcion: 'Asistente administrativo', nivel_acceso: 1 }
    ];

    for (const perfil of perfiles) {
      const { error } = await supabase
        .from('perfiles')
        .upsert(perfil, { onConflict: 'nombre_perfil' });
      
      if (error) {
        console.error(`❌ Error insertando perfil ${perfil.nombre_perfil}:`, error.message);
      }
    }

    // 3. Insertar grupos si no existen
    console.log('🏢 Configurando grupos departamentales...');
    
    const grupos = [
      { nombre_grupo: 'Dirección', descripcion: 'Nivel directivo' },
      { nombre_grupo: 'Gerencia', descripcion: 'Nivel gerencial' },
      { nombre_grupo: 'Finanzas', descripcion: 'Departamento financiero' },
      { nombre_grupo: 'Operaciones', descripcion: 'Operaciones y supervisión' },
      { nombre_grupo: 'Planificación', descripcion: 'Planificación de campañas' },
      { nombre_grupo: 'Administración', descripcion: 'Soporte administrativo' }
    ];

    for (const grupo of grupos) {
      const { error } = await supabase
        .from('grupos')
        .upsert(grupo, { onConflict: 'nombre_grupo' });
      
      if (error) {
        console.error(`❌ Error insertando grupo ${grupo.nombre_grupo}:`, error.message);
      }
    }

    // 4. Crear usuario Camilo Alegria
    console.log('👤 Creando usuario Camilo Alegria...');
    
    // Obtener IDs de perfil y grupo
    const { data: perfilGerente } = await supabase
      .from('perfiles')
      .select('id_perfil')
      .eq('nombre_perfil', 'gerente')
      .single();

    const { data: grupoGerencia } = await supabase
      .from('grupos')
      .select('id_grupo')
      .eq('nombre_grupo', 'Gerencia')
      .single();

    if (!perfilGerente || !grupoGerencia) {
      throw new Error('No se encontraron perfil o grupo de gerente');
    }

    // Hashear contraseña
    const hashedPassword = await hashPassword('Antonito26');

    // Insertar usuario Camilo
    const { data: usuarioCamilo, error: usuarioError } = await supabase
      .from('usuarios')
      .upsert({
        nombre: 'Camilo',
        apellido: 'Alegria',
        email: 'camiloalegriabarra@gmail.com',
        password: hashedPassword,
        telefono: '+56 9 1234 5678',
        estado: true,
        id_perfil: perfilGerente.id_perfil,
        id_grupo: grupoGerencia.id_grupo
      }, { 
        onConflict: 'email',
        ignoreDuplicates: false 
      })
      .select()
      .single();

    if (usuarioError) {
      console.error('❌ Error creando usuario Camilo:', usuarioError.message);
    } else {
      console.log('✅ Usuario Camilo Alegria creado exitosamente');
      console.log(`   Email: camiloalegriabarra@gmail.com`);
      console.log(`   Contraseña: Antonito26`);
      console.log(`   Rol: Gerente`);
      console.log(`   ID: ${usuarioCamilo.id_usuario}`);
    }

    // 5. Crear vista de usuarios completa
    console.log('🔍 Creando vista de usuarios...');
    
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW vista_usuarios_completa AS
        SELECT 
          u.id_usuario,
          u.nombre,
          u.apellido,
          u.email,
          u.telefono,
          u.avatar,
          u.estado,
          u.ultimo_acceso,
          u.fecha_creacion,
          p.nombre_perfil,
          p.descripcion AS descripcion_perfil,
          p.nivel_acceso,
          g.nombre_grupo,
          g.descripcion AS descripcion_grupo
        FROM usuarios u
        LEFT JOIN perfiles p ON u.id_perfil = p.id_perfil
        LEFT JOIN grupos g ON u.id_grupo = g.id_grupo;
      `
    });

    if (viewError) {
      console.warn('⚠️  Error creando vista (puede que ya exista):', viewError.message);
    }

    // 6. Verificar configuración
    console.log('🔎 Verificando configuración...');
    
    const { data: usuarios, error: verifyError } = await supabase
      .from('vista_usuarios_completa')
      .select('*')
      .eq('email', 'camiloalegriabarra@gmail.com');

    if (verifyError) {
      console.error('❌ Error verificando usuario:', verifyError.message);
    } else {
      console.log('✅ Verificación exitosa:');
      usuarios.forEach(usuario => {
        console.log(`   👤 ${usuario.nombre} ${usuario.apellido}`);
        console.log(`      📧 ${usuario.email}`);
        console.log(`      🏢 ${usuario.nombre_perfil} - ${usuario.nombre_grupo}`);
        console.log(`      ✅ Estado: ${usuario.estado ? 'Activo' : 'Inactivo'}`);
      });
    }

    console.log('\n🎉 Sistema de usuarios configurado exitosamente!');
    console.log('\n📝 Instrucciones de acceso:');
    console.log('   URL: http://localhost:3002');
    console.log('   Email: camiloalegriabarra@gmail.com');
    console.log('   Contraseña: Antonito26');
    console.log('   Rol: Gerente');

  } catch (error) {
    console.error('❌ Error en configuración:', error.message);
    process.exit(1);
  }
}

// Ejecutar configuración
setupUserSystem().then(() => {
  console.log('\n✨ Configuración completada. El sistema está listo para usar.');
  process.exit(0);
}).catch(error => {
  console.error('💥 Error fatal:', error);
  process.exit(1);
});