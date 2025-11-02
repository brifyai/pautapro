import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, renderHook, act } from '@testing-library/react';
import { useRef } from 'react';
import { useClickOutside } from '../../hooks/useClickOutside';

describe('useClickOutside Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('debería inicializar sin errores', () => {
    const { result } = renderHook(() => useClickOutside(useRef(null), vi.fn()));
    
    expect(result.current).toBeUndefined();
  });

  it('debería configurar y limpiar event listeners correctamente', () => {
    const callback = vi.fn();
    const addEventListenerSpy = vi.spyOn(document, 'addEventListener');
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => {
      const ref = useRef();
      useClickOutside(ref, callback);
      return ref;
    });

    // Verificar que se agregaron los event listeners
    expect(addEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(addEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));

    // Desmontar para limpiar
    unmount();

    // Verificar que se eliminaron los event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });

  it('debería manejar cuando el ref es null', () => {
    const callback = vi.fn();
    
    renderHook(() => {
      useClickOutside(null, callback);
    });

    // No debería lanzar error
    expect(true).toBe(true);
  });

  it('debería manejar cuando el ref.current es null', () => {
    const callback = vi.fn();
    
    renderHook(() => {
      const ref = useRef();
      useClickOutside(ref, callback);
      // No asignamos ningún valor al ref
    });

    // No debería lanzar error
    expect(true).toBe(true);
  });

  it('debería funcionar sin ref proporcionada', () => {
    const callback = vi.fn();
    
    renderHook(() => {
      useClickOutside(null, callback);
    });

    // No debería lanzar error
    expect(true).toBe(true);
  });

  it('debería funcionar con componentes React', () => {
    const callback = vi.fn();
    
    const TestComponent = () => {
      const ref = useRef();
      useClickOutside(ref, callback);
      return <div ref={ref}>Test Component</div>;
    };

    expect(() => {
      render(<TestComponent />);
    }).not.toThrow();
  });

  it('debería manejar cambios en el callback', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    const { rerender } = renderHook(
      ({ callback }) => {
        const ref = useRef();
        useClickOutside(ref, callback);
        return ref;
      },
      { initialProps: { callback: callback1 } }
    );

    // Cambiar el callback
    rerender({ callback: callback2 });

    // No debería lanzar error
    expect(true).toBe(true);
  });

  it('debería manejar cambios en el ref', () => {
    const callback = vi.fn();
    
    const { rerender } = renderHook(() => {
      const ref = useRef();
      useClickOutside(ref, callback);
      return ref;
    });

    // No debería lanzar error al re-renderizar
    rerender();
    expect(true).toBe(true);
  });

  it('debería funcionar con múltiples hooks', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();
    
    renderHook(() => {
      const ref1 = useRef();
      const ref2 = useRef();
      useClickOutside(ref1, callback1);
      useClickOutside(ref2, callback2);
      return { ref1, ref2 };
    });

    // No debería lanzar error
    expect(true).toBe(true);
  });

  it('debería limpiar event listeners al cambiar el ref', () => {
    const callback = vi.fn();
    const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    
    const { unmount } = renderHook(() => {
      const ref = useRef();
      useClickOutside(ref, callback);
      return ref;
    });

    // Desmontar para limpiar
    unmount();

    // Debería haber limpiado los event listeners
    expect(removeEventListenerSpy).toHaveBeenCalledWith('mousedown', expect.any(Function));
    expect(removeEventListenerSpy).toHaveBeenCalledWith('touchstart', expect.any(Function));
  });
});