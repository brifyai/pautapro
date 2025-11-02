import { supabase } from '../config/supabase';

// Función simple de hashing para contraseña (en producción usar bcrypt o similar)
const hashPassword = async (password) => {
  // Para desarrollo: usar un hash simple
  // En producción: usar una librería como bcrypt
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'pautapro-salt');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

// Verificar contraseña
const verifyPassword = async (password, hashedPassword) => {
  const inputHash = await hashPassword(password);
  return inputHash === hashedPassword;
};

export const authServiceImproved = {
  // Login con verificación de contraseña
  async login(email, password) {
    try {
      // Buscar usuario con todos sus datos
      const { data: user, error } = await supabase
        .from('vista_usuarios_completa')
        .select('*')
        .eq('email', email)
        .eq('estado', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          throw new Error('Usuario no encontrado');
        }
        throw new Error('Error al buscar usuario: ' + error.message);
      }

      if (!user) {
        throw new Error('Usuario no encontrado o inactivo');
      }

      // Obtener la contraseña hasheada de la tabla usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('password')
        .eq('id_usuario', user.id_usuario)
        .single();

      if (userError || !userData) {
        throw new Error('Error al obtener datos del usuario');
      }

      // Verificar contraseña
      const isPasswordValid = await verifyPassword(password, userData.password);
      
      if (!isPasswordValid) {
        throw new Error('Contraseña incorrecta');
      }

      // Actualizar último acceso
      await supabase
        .from('usuarios')
        .update({ 
          ultimo_acceso: new Date().toISOString() 
        })
        .eq('id_usuario', user.id_usuario);

      // Obtener permisos del usuario
      const { data: permissions, error: permError } = await supabase
        .from('permisos_perfil')
        .select(`
          id_permiso,
          permisos (
            nombre_permiso,
            modulo,
            descripcion
          )
        `)
        .eq('id_perfil', user.id_perfil);

      if (permError) {
        console.warn('Error obteniendo permisos:', permError);
      }

      // Estructurar permisos por módulo
      const userPermissions = {};
      if (permissions) {
        permissions.forEach(perm => {
          const modulo = perm.permisos?.modulo || 'general';
          if (!userPermissions[modulo]) {
            userPermissions[modulo] = [];
          }
          userPermissions[modulo].push(perm.permisos?.nombre_permiso);
        });
      }

      // Crear objeto de usuario con toda la información
      const userSession = {
        id: user.id_usuario,
        email: user.email,
        nombre: user.nombre,
        apellido: user.apellido,
        nombre_completo: `${user.nombre} ${user.apellido}`,
        telefono: user.telefono,
        avatar: user.avatar,
        rol: user.nombre_perfil,
        rol_nivel: user.nivel_acceso,
        grupo: user.nombre_grupo,
        estado: user.estado,
        ultimo_acceso: new Date().toISOString(),
        permisos: userPermissions,
        // Bandejas de acceso rápido
        puede_ver_dashboard: userPermissions.dashboard?.includes('ver_dashboard') || false,
        puede_ver_clientes: userPermissions.clientes?.includes('ver_clientes') || false,
        puede_ver_campanas: userPermissions.campanas?.includes('ver_campanas') || false,
        puede_ver_ordenes: userPermissions.ordenes?.includes('ver_ordenes') || false,
        puede_ver_reportes: userPermissions.reportes?.includes('ver_reportes') || false,
        puede_ver_usuarios: userPermissions.usuarios?.includes('ver_usuarios') || false,
        puede_configurar: userPermissions.configuracion?.includes('ver_configuracion') || false
      };

      return userSession;

    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  },

  // Registro de nuevo usuario
  async register(userData) {
    try {
      // Hashear contraseña
      const hashedPassword = await hashPassword(userData.password);

      // Insertar usuario
      const { data, error } = await supabase
        .from('usuarios')
        .insert({
          nombre: userData.nombre,
          apellido: userData.apellido,
          email: userData.email,
          password: hashedPassword,
          telefono: userData.telefono || null,
          id_perfil: userData.id_perfil || 3, // Por defecto: planificador
          id_grupo: userData.id_grupo || 5,  // Por defecto: planificación
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

  // Cambiar contraseña
  async changePassword(userId, currentPassword, newPassword) {
    try {
      // Obtener contraseña actual
      const { data: userData, error } = await supabase
        .from('usuarios')
        .select('password')
        .eq('id_usuario', userId)
        .single();

      if (error || !userData) {
        throw new Error('Usuario no encontrado');
      }

      // Verificar contraseña actual
      const isCurrentPasswordValid = await verifyPassword(currentPassword, userData.password);
      if (!isCurrentPasswordValid) {
        throw new Error('Contraseña actual incorrecta');
      }

      // Hashear nueva contraseña
      const hashedNewPassword = await hashPassword(newPassword);

      // Actualizar contraseña
      const { data, error: updateError } = await supabase
        .from('usuarios')
        .update({ 
          password: hashedNewPassword,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', userId)
        .select()
        .single();

      if (updateError) {
        throw new Error('Error al actualizar contraseña: ' + updateError.message);
      }

      return data;

    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      throw error;
    }
  },

  // Obtener todos los usuarios (para administración)
  async getUsers() {
    try {
      const { data, error } = await supabase
        .from('vista_usuarios_completa')
        .select('*')
        .order('fecha_creacion', { ascending: false });

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
        .from('vista_usuarios_completa')
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
      // No permitir actualizar contraseña directamente
      const { password, ...safeUpdateData } = updateData;
      
      safeUpdateData.fecha_actualizacion = new Date().toISOString();

      const { data, error } = await supabase
        .from('usuarios')
        .update(safeUpdateData)
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

  // Eliminar usuario (desactivar)
  async deactivateUser(userId) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update({ 
          estado: false,
          fecha_actualizacion: new Date().toISOString()
        })
        .eq('id_usuario', userId)
        .select()
        .single();

      if (error) throw error;
      return data;

    } catch (error) {
      console.error('Error desactivando usuario:', error);
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
    
    // Buscar en todos los módulos
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
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    window.dispatchEvent(new Event('auth-change'));
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
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error('Error obteniendo usuario actual:', error);
      return null;
    }
  }
};