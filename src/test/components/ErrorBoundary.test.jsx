import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import ErrorBoundary from '../../components/ErrorBoundary';

// Mock de Material-UI components
vi.mock('@mui/material', () => ({
  Box: ({ children, ...props }) => <div data-testid="mui-box" {...props}>{children}</div>,
  Typography: ({ children, ...props }) => <div data-testid="mui-typography" {...props}>{children}</div>,
  Button: ({ children, onClick, ...props }) => <button data-testid="mui-button" onClick={onClick} {...props}>{children}</button>,
  Container: ({ children, ...props }) => <div data-testid="mui-container" {...props}>{children}</div>,
  Paper: ({ children, ...props }) => <div data-testid="mui-paper" {...props}>{children}</div>,
  Alert: ({ children, ...props }) => <div data-testid="mui-alert" {...props}>{children}</div>,
  AlertTitle: ({ children, ...props }) => <div data-testid="mui-alert-title" {...props}>{children}</div>
}));

// Mock de Material-UI icons
vi.mock('@mui/icons-material', () => ({
  Refresh: () => <div data-testid="refresh-icon" />,
  BugReport: () => <div data-testid="bug-report-icon" />,
  Home: () => <div data-testid="home-icon" />
}));

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

// Mock de window.location
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:3000',
    reload: vi.fn()
  },
  writable: true
});

// Mock de navigator
Object.defineProperty(window, 'navigator', {
  value: {
    userAgent: 'test-user-agent'
  },
  writable: true
});

// Mock de console.error para evitar ruido en los tests
const originalConsoleError = console.error;

describe('ErrorBoundary Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    console.error = vi.fn();
    localStorageMock.getItem.mockReturnValue('[]');
    localStorageMock.setItem.mockClear();
    window.location.href = 'http://localhost:3000';
    window.location.reload.mockClear();
  });

  afterEach(() => {
    console.error = originalConsoleError;
    vi.restoreAllMocks();
  });

  it('debería renderizar children cuando no hay errores', () => {
    const TestComponent = () => <div>Test Content</div>;
    
    render(
      <ErrorBoundary>
        <TestComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('debería capturar errores y mostrar UI de error', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
  });

  it('debería mostrar UI de error por defecto', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/¡Ups! Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText('Error: Test error')).toBeInTheDocument();
    expect(screen.getByText('Reintentar')).toBeInTheDocument();
  });

  it('debería tener botón de reintentar funcional', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    // Verificar que el botón de reintentar está presente
    const retryButton = screen.getByText('Reintentar');
    expect(retryButton).toBeInTheDocument();
    expect(retryButton.tagName).toBe('BUTTON');
  });

  it('debería registrar el error en la consola', () => {
    const error = new Error('Test error');
    const ThrowErrorComponent = () => {
      throw error;
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    // Verificar que console.error fue llamado con el mensaje correcto
    expect(console.error).toHaveBeenCalledWith(
      'Error Boundary capturó un error:',
      expect.any(Error),
      expect.any(Object)
    );
  });

  it('debería manejar errores síncronos correctamente', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Sync error');
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/¡Ups! Algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText('Error: Sync error')).toBeInTheDocument();
  });

  it('debería funcionar con múltiples children', () => {
    const ThrowErrorComponent = () => {
      throw new Error('Test error');
    };
    
    render(
      <ErrorBoundary>
        <div>First child</div>
        <ThrowErrorComponent />
        <div>Third child</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it('debería manejar errores de tipo string', () => {
    const ThrowStringErrorComponent = () => {
      throw 'String error';
    };
    
    render(
      <ErrorBoundary>
        <ThrowStringErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
    expect(screen.getByText(/string error/i)).toBeInTheDocument();
  });

  it('debería manejar errores sin mensaje', () => {
    const ThrowNoMessageErrorComponent = () => {
      const error = new Error();
      throw error;
    };
    
    render(
      <ErrorBoundary>
        <ThrowNoMessageErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it('debería mostrar información de depuración en desarrollo', () => {
    const originalEnv = import.meta.env.DEV;
    import.meta.env.DEV = true;
    
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at TestComponent';
    
    const ThrowErrorComponent = () => {
      throw error;
    };
    
    render(
      <ErrorBoundary>
        <ThrowErrorComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/test error/i)).toBeInTheDocument();
    
    // Restaurar valor original
    import.meta.env.DEV = originalEnv;
  });
});