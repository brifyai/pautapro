/**
 * Mock mejorado de Supabase para pruebas unitarias
 */
import { vi } from 'vitest';

// Crear un mock simple que funcione con el encadenamiento
const createMockChain = () => {
  const mockChain = {
    select: vi.fn(() => mockChain),
    eq: vi.fn(() => mockChain),
    order: vi.fn(() => mockChain),
    single: vi.fn(() => Promise.resolve({ data: null, error: null })),
    in: vi.fn(() => mockChain),
    gte: vi.fn(() => mockChain),
    lte: vi.fn(() => mockChain),
    limit: vi.fn(() => mockChain),
    insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    update: vi.fn(() => mockChain),
    delete: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    from: vi.fn(() => mockChain),
    rpc: vi.fn(() => Promise.resolve({ data: [], error: null }))
  };
  
  // Configurar valores de retorno por defecto
  mockChain.order.mockResolvedValue({ data: [], error: null });
  mockChain.limit.mockResolvedValue({ data: [], error: null });
  mockChain.lte.mockResolvedValue({ data: [], error: null });
  mockChain.gte.mockResolvedValue({ data: [], error: null });
  
  return mockChain;
};

// Mock completo de Supabase
export const mockSupabase = {
  from: vi.fn(() => createMockChain()),
  rpc: vi.fn(() => Promise.resolve({ data: [], error: null })),
  auth: {
    getUser: vi.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    signOut: vi.fn(() => Promise.resolve({ error: null }))
  }
};

// Función para configurar el mock de Supabase
export const setupSupabaseMock = () => {
  vi.mock('../../config/supabase', () => ({
    supabase: mockSupabase,
    default: mockSupabase
  }));
};

// Función para resetear los mocks
export const resetSupabaseMock = () => {
  vi.clearAllMocks();
  mockSupabase.from.mockClear();
  mockSupabase.rpc.mockClear();
  mockSupabase.auth.getUser.mockClear();
  mockSupabase.auth.signOut.mockClear();
};

export default mockSupabase;