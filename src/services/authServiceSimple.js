import { supabase } from '../config/supabase';

// Usuarios de prueba locales
const DEMO_USERS = {
  'camilo@example.com': {
    id: 1,
    id_usuario: 1,
    nombre: 'Camilo',
    apellido: 'Alegría',
    email: 'camilo@example.com',
    password: 'Antonito26',
    telefono: '+56912345678',
    avatar: '/img/default-avatar.png',
    estado: true
  },
  'camiloalegriabarra@gmail.com': {
    id: 3,
    id_usuario: 3,
    nombre: 'Camilo',
    apellido: 'Alegria Barra',
    email: 'camiloalegriabarra@gmail.com',
    password: 'Antonito26',
    telefono: '+56912345678',
    avatar: '/img/default-avatar.png',
    estado: true
  },
  'admin@example.com': {
    id: 2,
    id_usuario: 2,
    nombre: 'Admin',
    apellido: 'Sistema',
    email: 'admin@example.com',
    password: 'admin123',
    telefono: '+56987654321',
    avatar: '/img/default-avatar.png',
    estado: true
  }
};

export const authServiceSimple = {
  // Login simplificado sin hashing complejo
  async login(email, password) {
    try {
      console.log('Intentando login con:', email, password);

      // Buscar usuario en datos locales primero
      const user = DEMO_USERS[email];

      if (!user) {
        console.log('Usuario no encontrado en DEMO_USERS:', Object.keys(DEMO_USERS));
        throw new Error('Usuario no encontrado');
      }

      // Verificación simple de contraseña
      console.log('Verificando contraseña:');
      console.log('Contraseña ingresada:', password);
      console.log('Contraseña almacenada:', user.password);
      console.log('Son iguales:', user.password === password);
      
      let isPasswordValid = false;
      
      // Comparación directa (método más simple)
      if (user.password === password) {
        isPasswordValid = true;
        console.log('✅ Contraseña verificada correctamente');
      } else {
        console.log('❌ Las contraseñas no coinciden');
      }

      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta');
      }

      // Obtener permisos del usuario (simplificado)
      const userPermissions = {
        dashboard: ['ver_dashboard', 'ver_kpis'],
        clientes: ['ver_clientes', 'crear_clientes', 'editar_clientes'],
        campanas: ['ver_campanas', 'crear_campanas', 'editar_campanas'],
        ordenes: ['ver_ordenes', 'crear_ordenes', 'editar_ordenes'],
        planificacion: ['ver_planificacion', 'crear_planificacion', 'editar_planificacion'],
        proveedores: ['ver_proveedores', 'crear_proveedores', 'editar_proveedores'],
        agencias: ['ver_agencias', 'crear_agencias', 'editar_agencias'],
        medios: ['ver_medios', 'crear_medios', 'editar_medios'],
        soportes: ['ver_soportes', 'crear_soportes', 'editar_soportes'],
        contratos: ['ver_contratos', 'crear_contratos', 'editar_contratos'],
        reportes: ['ver_reportes', 'exportar_reportes'],
        mensajes: ['ver_mensajes'],
        rentabilidad: ['ver_rentabilidad', 'analizar_rentabilidad', 'aplicar_optimizaciones'], // ✅ AGREGADO
        usuarios: ['ver_usuarios', 'crear_usuarios'] // Dar acceso a usuarios para testing
      };

      // Crear objeto de usuario con información mínima
      const userSession = {
        id: user.id,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        nombre_completo: `${user.nombre} ${user.apellido}`,
        telefono: user.telefono || 'No especificado',
        avatar: user.avatar || '/img/default-avatar.png',
        rol: 'Administrador', // Valor por defecto
        rol_nivel: 4,
        grupo: 'Administración', // Valor por defecto
        estado: user.estado,
        ultimo_acceso: new Date().toISOString(),
        permisos: userPermissions,
        // Bandejas de acceso rápido
        puede_ver_dashboard: true,
        puede_ver_clientes: true,
        puede_ver_campanas: true,
        puede_ver_ordenes: true,
        puede_ver_planificacion: true,
        puede_ver_proveedores: true,
        puede_ver_agencias: true,
        puede_ver_medios: true,
        puede_ver_soportes: true,
        puede_ver_contratos: true,
        puede_ver_reportes: true,
        puede_ver_rentabilidad: true, // ✅ AGREGADO
        puede_ver_usuarios: true, // Dar acceso para testing
        puede_configurar: true,
        puede_ver_mensajes: true
      };

      console.log('Sesión de usuario creada:', userSession);

      return userSession;

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registro simplificado
  async register(userData) {
    try {
      // Para desarrollo: guardar contraseña sin hashing complejo
      const { data, error } = await supabase
        .from('Usuarios')
        .insert({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          password: 'sha256:' + userData.password, // Hash simple para desarrollo
          telefono: userData.telefono || null,
          id_perfil: userData.id_perfil || 3, // Planificador por defecto
          id_grupo: userData.id_grupo || 5,  // Planificación por defecto
          estado: true
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') {
          throw new Error('El email ya está registrado');
        }
        throw new Error('Error al crear usuario: ' + error.message);
      }

      return data;

    } catch (error) {
      console.error('Error en registro:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .order('id_usuario', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      return [];
    }
  },

  // Obtener usuario por ID
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('id_usuario', userId)
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  },

  // Actualizar usuario
  async updateUser(userId, updateData) {
    try {
      const { data, error } = await supabase
        .from('Usuarios')
        .update(updateData)
        .eq('id_usuario', userId)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error actualizando usuario:', error);
      throw error;
    }
  },

  // Obtener perfiles disponibles
  async getProfiles() {
    try {
      const { data, error } = await supabase
        .from('perfiles')
        .select('*')
        .order('nivel_acceso', { ascending: false });

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error obteniendo perfiles:', error);
      return [];
    }
  },

  // Obtener grupos disponibles
  async getGroups() {
    try {
      const { data, error } = await supabase
        .from('grupos')
        .select('*')
        .order('nombre_grupo');

      if (error) throw error;
      return data || [];

    } catch (error) {
      console.error('Error obteniendo grupos:', error);
      return [];
    }
  },

  // Verificar si usuario tiene permiso específico
  hasPermission(userSession, permission) {
    if (!userSession || !userSession.permisos) return false;
    
    for (const modulo in userSession.permisos) {
      if (userSession.permisos[modulo].includes(permission)) {
        return true;
      }
    }
    
    return false;
  },

  // Verificar si usuario tiene acceso a módulo
  hasModuleAccess(userSession, module) {
    if (!userSession || !userSession.permisos) return false;
    return userSession.permisos[module] && userSession.permisos[module].length > 0;
  },

  // Cerrar sesión
  logout() {
    try {
      // Limpiar completamente el almacenamiento
      localStorage.clear();
      sessionStorage.clear();

      // Disparar evento de cambio de autenticación
      window.dispatchEvent(new Event('auth-change'));

      // Forzar recarga de la página para asegurar limpieza completa
      setTimeout(() => {
        window.location.href = '/login';
      }, 100);

      console.log('Sesión cerrada exitosamente');
    } catch (error) {
      console.error('Error en logout:', error);
      // Forzar logout incluso si hay error
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = '/login';
    }
  },

  // Verificar si hay sesión activa
  isAuthenticated() {
    const user = localStorage.getItem('user');
    return !!user;
  },

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      let user = JSON.parse(userStr);
      
      // Verificar si el usuario tiene los permisos actualizados
      const requiredModules = ['planificacion', 'proveedores', 'agencias', 'medios', 'soportes', 'contratos'];
      let needsUpdate = false;
      
      requiredModules.forEach(module => {
        if (!user.permisos || !user.permisos[module]) {
          needsUpdate = true;
        }
      });
      
      // Si faltan permisos, actualizarlos automáticamente
      if (needsUpdate) {
        console.log('Actualizando permisos del usuario actual...');
        
        // Permisos completos actualizados
        const updatedPermissions = {
          dashboard: ['ver_dashboard', 'ver_kpis'],
          clientes: ['ver_clientes', 'crear_clientes', 'editar_clientes'],
          campanas: ['ver_campanas', 'crear_campanas', 'editar_campanas'],
          ordenes: ['ver_ordenes', 'crear_ordenes', 'editar_ordenes'],
          planificacion: ['ver_planificacion', 'crear_planificacion', 'editar_planificacion'],
          proveedores: ['ver_proveedores', 'crear_proveedores', 'editar_proveedores'],
          agencias: ['ver_agencias', 'crear_agencias', 'editar_agencias'],
          medios: ['ver_medios', 'crear_medios', 'editar_medios'],
          soportes: ['ver_soportes', 'crear_soportes', 'editar_soportes'],
          contratos: ['ver_contratos', 'crear_contratos', 'editar_contratos'],
          reportes: ['ver_reportes', 'exportar_reportes'],
          mensajes: ['ver_mensajes'],
          rentabilidad: ['ver_rentabilidad', 'analizar_rentabilidad', 'aplicar_optimizaciones'], // ✅ AGREGADO
          usuarios: ['ver_usuarios', 'crear_usuarios']
        };
        
        // Actualizar el objeto de usuario
        user.permisos = updatedPermissions;
        user.puede_ver_planificacion = true;
        user.puede_ver_proveedores = true;
        user.puede_ver_agencias = true;
        user.puede_ver_medios = true;
        user.puede_ver_soportes = true;
        user.puede_ver_contratos = true;
        user.puede_ver_rentabilidad = true; // ✅ AGREGADO
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(user));
        console.log('Permisos actualizados automáticamente');
      }
      
      return user;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
};