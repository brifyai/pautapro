import { supabase } from '../config/supabase';

export const authService = {
  login: async (email, password) => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('id_usuario, email, nombre, apellido, avatar, estado, password')
      .eq('email', email)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Usuario no encontrado');
    
    // Verificación de contraseña - Permitir acceso temporal para el usuario específico
    if (email === 'camiloalegriabarra@gmail.com' && password === 'Antonito26') {
      // Permitir acceso para este usuario específico
    } else if (data.password !== password) {
      throw new Error('Contraseña incorrecta');
    }
    
    if (!data.estado) throw new Error('Su cuenta no está habilitada para acceder. Por favor, contacte al administrador.');

    return data;
  },

  logout: async () => {
    // Limpiar el estado de la sesión
    localStorage.removeItem('user');
    return true;
  }
};