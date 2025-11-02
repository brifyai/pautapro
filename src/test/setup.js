/**
 * Configuración global para pruebas unitarias
 */
import { vi } from 'vitest';
import { setupSupabaseMock } from './mocks/supabaseMock.js';
import '@testing-library/jest-dom';

// Configurar timeout global para pruebas
// La configuración de Testing Library se manejará en vite.config.js

// Configurar mock de Supabase
setupSupabaseMock();

// Mock de SweetAlert2
const mockSweetAlert = {
  fire: vi.fn().mockResolvedValue({ isConfirmed: true }),
  showLoading: vi.fn(),
  close: vi.fn(),
  showSuccess: vi.fn(),
  showError: vi.fn(),
  showConfirmation: vi.fn().mockResolvedValue({ isConfirmed: true }),
  showAIConfirmation: vi.fn().mockResolvedValue({ isConfirmed: true }),
  showCustom: vi.fn().mockResolvedValue({ isConfirmed: true }),
  showWarning: vi.fn()
};

vi.mock('sweetalert2', () => ({
  default: mockSweetAlert,
  Swal: mockSweetAlert
}));

// Mock de React Router
vi.mock('react-router-dom', () => ({
  ...vi.importActual('react-router-dom'),
  useNavigate: () => vi.fn(),
  useLocation: () => ({ pathname: '/', search: '', hash: '', state: null }),
  useParams: () => ({}),
  BrowserRouter: ({ children }) => children,
  MemoryRouter: ({ children }) => children
}));

// Limpiar mocks después de cada prueba
afterEach(() => {
  vi.clearAllMocks();
});