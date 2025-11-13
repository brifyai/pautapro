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

export const authService = {
  login: async (email, password) => {
    try {
      console.log('Intentando login con:', email);

      // Buscar usuario en datos locales primero
      const user = DEMO_USERS[email];

      if (!user) {
        console.log('Usuario no encontrado en DEMO_USERS');
        throw new Error('Usuario no encontrado');
      }

      // Verificación simple de contraseña
      if (user.password !== password) {
        console.log('Contraseña incorrecta');
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
        rentabilidad: ['ver_rentabilidad', 'analizar_rentabilidad', 'aplicar_optimizaciones'],
        usuarios: ['ver_usuarios', 'crear_usuarios']
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
        rol: 'Administrador',
        rol_nivel: 4,
        grupo: 'Administración',
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
        puede_ver_rentabilidad: true,
        puede_ver_usuarios: true,
        puede_configurar: true,
        puede_ver_mensajes: true
      };

      console.log('✅ Login exitoso:', userSession.email);
      return userSession;

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
      window.dispatchEvent(new Event('auth-change'));
      console.log('Sesión cerrada exitosamente');
      return true;
    } catch (error) {
      console.error('Error en logout:', error);
      localStorage.clear();
      sessionStorage.clear();
      return false;
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

  // Obtener usuario actual
  getCurrentUser() {
    try {
      const userStr = localStorage.getItem('user');
      if (!userStr) return null;
      
      let user = JSON.parse(userStr);
      
      // Verificar si el usuario tiene los permisos actualizados
      const requiredModules = ['planificacion', 'proveedores', 'agencias', 'medios', 'soportes', 'contratos', 'rentabilidad'];
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
          rentabilidad: ['ver_rentabilidad', 'analizar_rentabilidad', 'aplicar_optimizaciones'],
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
        user.puede_ver_rentabilidad = true;
        user.puede_ver_mensajes = true;
        
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
