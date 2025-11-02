/**
 * Pruebas unitarias para las utilidades de SweetAlert2
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Swal from 'sweetalert2';
import SweetAlertUtils from '../../utils/sweetAlertUtils';

// Mock de SweetAlert2
vi.mock('sweetalert2', () => ({
  default: {
    fire: vi.fn(),
    showLoading: vi.fn(),
    close: vi.fn(),
    update: vi.fn(),
  }
}));

describe('SweetAlertUtils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock por defecto para Swal.fire
    Swal.fire.mockResolvedValue({
      isConfirmed: true,
      isDenied: false,
      isDismissed: false,
      value: 'test-value'
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('showSuccess', () => {
    it('debe mostrar alerta de éxito con configuración por defecto', async () => {
      await SweetAlertUtils.showSuccess('Éxito', 'Operación completada');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Éxito',
        text: 'Operación completada',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78'
      });
    });

    it('debe manejar título sin texto', async () => {
      await SweetAlertUtils.showSuccess('Éxito');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Éxito',
        text: '',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78'
      });
    });

    it('debe permitir opciones personalizadas', async () => {
      const customOptions = {
        timer: 3000,
        showConfirmButton: false
      };

      await SweetAlertUtils.showSuccess('Éxito', 'Texto', customOptions);

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: 'Éxito',
        text: 'Texto',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78',
        timer: 3000,
        showConfirmButton: false
      });
    });
  });

  describe('showError', () => {
    it('debe mostrar alerta de error con configuración por defecto', async () => {
      await SweetAlertUtils.showError('Error', 'Ocurrió un error');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'Ocurrió un error',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f56565'
      });
    });

    it('debe permitir opciones personalizadas', async () => {
      await SweetAlertUtils.showError('Error', 'Texto', { footer: 'Footer personalizado' });

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'Texto',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f56565',
        footer: 'Footer personalizado'
      });
    });
  });

  describe('showWarning', () => {
    it('debe mostrar alerta de advertencia', async () => {
      await SweetAlertUtils.showWarning('Advertencia', 'Este es un mensaje de advertencia');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Advertencia',
        text: 'Este es un mensaje de advertencia',
        confirmButtonText: 'OK',
        confirmButtonColor: '#ecc94b'
      });
    });
  });

  describe('showInfo', () => {
    it('debe mostrar alerta informativa', async () => {
      await SweetAlertUtils.showInfo('Información', 'Este es un mensaje informativo');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'info',
        title: 'Información',
        text: 'Este es un mensaje informativo',
        confirmButtonText: 'OK',
        confirmButtonColor: '#4299e1'
      });
    });
  });

  describe('showConfirmation', () => {
    it('debe mostrar diálogo de confirmación', async () => {
      await SweetAlertUtils.showConfirmation('¿Confirmar?', '¿Estás seguro?');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'question',
        title: '¿Confirmar?',
        text: '¿Estás seguro?',
        showCancelButton: true,
        confirmButtonText: 'Confirmar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#e2e8f0'
      });
    });

    it('debe permitir textos personalizados', async () => {
      await SweetAlertUtils.showConfirmation(
        '¿Eliminar?',
        '¿Eliminar elemento?',
        'Sí, eliminar',
        'No cancelar'
      );

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'question',
        title: '¿Eliminar?',
        text: '¿Eliminar elemento?',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'No cancelar',
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#e2e8f0'
      });
    });

    it('debe devolver el resultado de la confirmación', async () => {
      const result = await SweetAlertUtils.showConfirmation('¿Confirmar?');

      expect(result.isConfirmed).toBe(true);
      expect(result.isDenied).toBe(false);
      expect(result.isDismissed).toBe(false);
    });
  });

  describe('showCustom', () => {
    it('debe mostrar alerta personalizada', async () => {
      const customOptions = {
        title: 'Personalizado',
        html: '<b>HTML personalizado</b>',
        icon: 'info'
      };

      await SweetAlertUtils.showCustom(customOptions);

      expect(Swal.fire).toHaveBeenCalledWith({
        showConfirmButton: true,
        showCancelButton: false,
        confirmButtonText: 'OK',
        confirmButtonColor: '#667eea',
        title: 'Personalizado',
        html: '<b>HTML personalizado</b>',
        icon: 'info'
      });
    });
  });

  describe('showLoading', () => {
    it('debe mostrar indicador de carga', () => {
      SweetAlertUtils.showLoading('Cargando...', 'Procesando datos');

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Cargando...',
        text: 'Procesando datos',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: expect.any(Function)
      });
    });

    it('debe usar valores por defecto si no se proporcionan', () => {
      SweetAlertUtils.showLoading();

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Cargando...',
        text: '',
        allowOutsideClick: false,
        allowEscapeKey: false,
        showConfirmButton: false,
        didOpen: expect.any(Function)
      });
    });
  });

  describe('close', () => {
    it('debe cerrar la alerta actual', () => {
      SweetAlertUtils.close();

      expect(Swal.close).toHaveBeenCalled();
    });
  });

  describe('showToast', () => {
    it('debe mostrar notificación toast', async () => {
      await SweetAlertUtils.showToast('Operación exitosa', 'success');

      expect(Swal.fire).toHaveBeenCalledWith({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'success',
        title: 'Operación exitosa'
      });
    });

    it('debe usar icono success por defecto', async () => {
      await SweetAlertUtils.showToast('Mensaje');

      expect(Swal.fire).toHaveBeenCalledWith({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: 'success',
        title: 'Mensaje'
      });
    });
  });

  describe('showInput', () => {
    it('debe mostrar diálogo de entrada de texto', async () => {
      await SweetAlertUtils.showInput('Ingrese texto', 'Descripción', 'Placeholder');

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Ingrese texto',
        text: 'Descripción',
        input: 'text',
        inputPlaceholder: 'Placeholder',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#e2e8f0'
      });
    });
  });

  describe('showPasswordInput', () => {
    it('debe mostrar diálogo de entrada de contraseña', async () => {
      await SweetAlertUtils.showPasswordInput('Contraseña', 'Ingrese su contraseña');

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Contraseña',
        text: 'Ingrese su contraseña',
        input: 'password',
        inputPlaceholder: '',
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#48bb78',
        cancelButtonColor: '#e2e8f0'
      });
    });
  });

  describe('showTimer', () => {
    it('debe mostrar alerta con temporizador', async () => {
      await SweetAlertUtils.showTimer('Procesando', 'Espere...', 5000);

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Procesando',
        text: 'Espere...',
        timer: 5000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    });

    it('debe usar temporizador por defecto', async () => {
      await SweetAlertUtils.showTimer('Título', 'Texto');

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Título',
        text: 'Texto',
        timer: 3000,
        timerProgressBar: true,
        showConfirmButton: false
      });
    });
  });

  describe('showHtml', () => {
    it('debe mostrar alerta con HTML personalizado', async () => {
      const html = '<div><h1>Título</h1><p>Párrafo</p></div>';
      await SweetAlertUtils.showHtml('Título', html);

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Título',
        html: html,
        confirmButtonText: 'OK',
        confirmButtonColor: '#667eea'
      });
    });
  });

  describe('showDeleteConfirmation', () => {
    it('debe mostrar confirmación de eliminación', async () => {
      await SweetAlertUtils.showDeleteConfirmation('este archivo');

      expect(Swal.fire).toHaveBeenCalledWith({
        title: '¿Estás seguro?',
        text: '¿Estás seguro de que deseas eliminar este archivo? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#e2e8f0',
        reverseButtons: true
      });
    });

    it('debe usar texto por defecto si no se proporciona itemName', async () => {
      await SweetAlertUtils.showDeleteConfirmation();

      expect(Swal.fire).toHaveBeenCalledWith({
        title: '¿Estás seguro?',
        text: '¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#e2e8f0',
        reverseButtons: true
      });
    });
  });

  describe('showSaveSuccess', () => {
    it('debe mostrar mensaje de guardado exitoso', async () => {
      await SweetAlertUtils.showSaveSuccess('el documento');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: '¡Guardado exitoso!',
        text: 'el documento se han guardado correctamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78'
      });
    });
  });

  describe('showUpdateSuccess', () => {
    it('debe mostrar mensaje de actualización exitosa', async () => {
      await SweetAlertUtils.showUpdateSuccess('los datos');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: '¡Actualización exitosa!',
        text: 'los datos se han actualizado correctamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78'
      });
    });
  });

  describe('showDeleteSuccess', () => {
    it('debe mostrar mensaje de eliminación exitosa', async () => {
      await SweetAlertUtils.showDeleteSuccess('el registro');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: '¡Eliminación exitosa!',
        text: 'el registro se ha eliminado correctamente.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#48bb78'
      });
    });
  });

  describe('showConnectionError', () => {
    it('debe mostrar mensaje de error de conexión', async () => {
      await SweetAlertUtils.showConnectionError();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error de conexión',
        text: 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet e intenta nuevamente.',
        confirmButtonText: 'Reintentar',
        confirmButtonColor: '#4299e1'
      });
    });
  });

  describe('showGenericError', () => {
    it('debe mostrar mensaje de error genérico', async () => {
      await SweetAlertUtils.showGenericError();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'Ha ocurrido un error inesperado. Por favor, intenta nuevamente.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f56565'
      });
    });

    it('debe mostrar mensaje de error personalizado', async () => {
      const error = new Error('Error específico');
      await SweetAlertUtils.showGenericError(error);

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Error',
        text: 'Error específico',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f56565'
      });
    });
  });

  describe('showValidationError', () => {
    it('debe mostrar mensaje de validación con campos', async () => {
      const fields = ['Nombre', 'Email', 'Teléfono'];
      await SweetAlertUtils.showValidationError(fields);

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Campos requeridos',
        html: 'Por favor, completa los siguientes campos obligatorios:<br><br>• Nombre<br>• Email<br>• Teléfono',
        confirmButtonText: 'Completar',
        confirmButtonColor: '#ecc94b'
      });
    });
  });

  describe('showSessionExpired', () => {
    it('debe mostrar mensaje de sesión expirada', async () => {
      await SweetAlertUtils.showSessionExpired();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'warning',
        title: 'Sesión expirada',
        text: 'Tu sesión ha expirado. Por favor, inicia sesión nuevamente.',
        confirmButtonText: 'Iniciar sesión',
        confirmButtonColor: '#667eea',
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    });
  });

  describe('showPermissionDenied', () => {
    it('debe mostrar mensaje de permiso denegado', async () => {
      await SweetAlertUtils.showPermissionDenied();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'error',
        title: 'Permiso denegado',
        text: 'No tienes los permisos necesarios para realizar esta acción.',
        confirmButtonText: 'Entendido',
        confirmButtonColor: '#f56565'
      });
    });
  });

  describe('showWelcome', () => {
    it('debe mostrar mensaje de bienvenida con nombre', async () => {
      await SweetAlertUtils.showWelcome('Juan');

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: '¡Bienvenido, Juan!',
        text: 'Has iniciado sesión correctamente.',
        confirmButtonText: 'Comenzar',
        confirmButtonColor: '#48bb78',
        timer: 3000,
        timerProgressBar: true
      });
    });

    it('debe mostrar mensaje de bienvenida genérico', async () => {
      await SweetAlertUtils.showWelcome();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'success',
        title: '¡Bienvenido!',
        text: 'Has iniciado sesión correctamente.',
        confirmButtonText: 'Comenzar',
        confirmButtonColor: '#48bb78',
        timer: 3000,
        timerProgressBar: true
      });
    });
  });

  describe('showLogout', () => {
    it('debe mostrar confirmación de logout', async () => {
      await SweetAlertUtils.showLogout();

      expect(Swal.fire).toHaveBeenCalledWith({
        icon: 'info',
        title: 'Cerrar sesión',
        text: '¿Estás seguro de que deseas cerrar tu sesión?',
        showCancelButton: true,
        confirmButtonText: 'Sí, cerrar sesión',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: '#f56565',
        cancelButtonColor: '#e2e8f0'
      });
    });
  });

  describe('showAIConfirmation', () => {
    it('debe mostrar confirmación con confianza de IA alta', async () => {
      await SweetAlertUtils.showAIConfirmation(
        'Recomendación de IA',
        'La IA sugiere ajustar los parámetros',
        85
      );

      expect(Swal.fire).toHaveBeenCalledWith({
        title: 'Recomendación de IA',
        html: `
                <div class="ai-confirmation">
                    <p>La IA sugiere ajustar los parámetros</p>
                    <div class="ai-confidence">
                        <span>Confianza de la IA:</span>
                        <span style="color: #48bb78; font-weight: bold;">Alta (85%)</span>
                    </div>
                </div>
            `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Aceptar recomendación',
        cancelButtonText: 'Revisar manualmente',
        confirmButtonColor: '#667eea',
        cancelButtonColor: '#e2e8f0'
      });
    });

    it('debe mostrar confianza media para valores entre 60-79', async () => {
      await SweetAlertUtils.showAIConfirmation('Título', 'Texto', 70);

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Media (70%)')
        })
      );
    });

    it('debe mostrar confianza baja para valores menores a 60', async () => {
      await SweetAlertUtils.showAIConfirmation('Título', 'Texto', 50);

      expect(Swal.fire).toHaveBeenCalledWith(
        expect.objectContaining({
          html: expect.stringContaining('Baja (50%)')
        })
      );
    });
  });
});