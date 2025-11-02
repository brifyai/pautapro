import Swal from 'sweetalert2';

/**
 * Utilidades centralizadas para SweetAlert2
 */
export const SweetAlertUtils = {
  /**
   * Muestra una alerta de carga
   * @param {string} message - Mensaje a mostrar
   */
  showLoading(message = 'Cargando...') {
    return Swal.fire({
      title: message,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  },

  /**
   * Cierra la alerta actual
   */
  close() {
    Swal.close();
  },

  /**
   * Muestra una alerta de éxito
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showSuccess(title, text = '', options = {}) {
    return Swal.fire({
      icon: 'success',
      title,
      text,
      timer: 2000,
      showConfirmButton: false,
      ...options
    });
  },

  /**
   * Muestra una alerta de error
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showError(title, text = '', options = {}) {
    return Swal.fire({
      icon: 'error',
      title,
      text,
      ...options
    });
  },

  /**
   * Muestra una alerta de advertencia
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showWarning(title, text = '', options = {}) {
    return Swal.fire({
      icon: 'warning',
      title,
      text,
      ...options
    });
  },

  /**
   * Muestra una alerta de información
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showInfo(title, text = '', options = {}) {
    return Swal.fire({
      icon: 'info',
      title,
      text,
      ...options
    });
  },

  /**
   * Muestra una alerta de confirmación
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {string} icon - Icono de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showConfirmation(title, text = '', icon = 'question', options = {}) {
    return Swal.fire({
      title,
      text,
      icon,
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar',
      ...options
    });
  },

  /**
   * Muestra una alerta con input de texto
   * @param {string} title - Título de la alerta
   * @param {string} text - Texto de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showInput(title, text = '', options = {}) {
    return Swal.fire({
      title,
      text,
      input: 'text',
      showCancelButton: true,
      confirmButtonText: 'Aceptar',
      cancelButtonText: 'Cancelar',
      ...options
    });
  },

  /**
   * Muestra una alerta con toast
   * @param {string} title - Título de la alerta
   * @param {string} icon - Icono de la alerta
   * @param {Object} options - Opciones adicionales
   */
  showToast(title, icon = 'success', options = {}) {
    return Swal.fire({
      title,
      icon,
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
      ...options
    });
  },

  /**
   * Muestra una alerta de progreso
   * @param {string} title - Título de la alerta
   * @param {number} progress - Progreso actual (0-100)
   * @param {Object} options - Opciones adicionales
   */
  showProgress(title, progress = 0, options = {}) {
    return Swal.fire({
      title,
      html: `
        <div style="width: 100%; margin: 10px 0;">
          <div style="background: #e9ecef; border-radius: 4px; height: 8px;">
            <div style="background: #3085d6; height: 100%; border-radius: 4px; width: ${progress}%; transition: width 0.3s;"></div>
          </div>
          <small style="color: #666;">${Math.round(progress)}% completado</small>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      ...options
    });
  }
};

export default SweetAlertUtils;