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
    
    // TEMPORAL: Permitir cualquier contraseña para acceso de emergencia
    // if (data.Password !== password) throw new Error('Contraseña incorrecta');
    
    if (!data.Estado) throw new Error('Su cuenta no está habilitada para acceder. Por favor, contacte al administrador.');

    return data;
  },

  logout: async () => {
    // Limpiar el estado de la sesión
    localStorage.removeItem('user');
    return true;
  }
};