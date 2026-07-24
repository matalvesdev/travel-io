import { describe, it, expect, vi, beforeEach } from 'vitest';
import { deleteAccount, changeEmail, exportData } from '@/hooks/api/use-user';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock window.URL
const mockCreateObjectURL = vi.fn(() => 'blob:http://localhost/test');
const mockRevokeObjectURL = vi.fn();
Object.defineProperty(window, 'URL', {
  value: {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  },
});

// Mock document methods
const mockAppendChild = vi.fn();
const mockRemoveChild = vi.fn();
Object.defineProperty(document, 'body', {
  value: {
    appendChild: mockAppendChild,
    removeChild: mockRemoveChild,
  },
});

// Mock HTMLAnchorElement.click
HTMLAnchorElement.prototype.click = vi.fn();

describe('use-user API functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('deleteAccount', () => {
    it('should call delete account API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Conta marcada para exclusão',
        }),
      });

      const result = await deleteAccount({ password: 'test123' });

      expect(mockFetch).toHaveBeenCalledWith('/api/user/delete-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: 'test123' }),
      });
      expect(result.success).toBe(true);
    });

    it('should throw error on failure', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          success: false,
          message: 'Senha incorreta',
        }),
      });

      await expect(deleteAccount({ password: 'wrong' })).rejects.toThrow('Senha incorreta');
    });
  });

  describe('changeEmail', () => {
    it('should call change email API', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          message: 'Email de confirmação enviado',
        }),
      });

      const result = await changeEmail({
        newEmail: 'new@example.com',
        currentPassword: 'test123',
      });

      expect(mockFetch).toHaveBeenCalledWith('/api/user/change-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          newEmail: 'new@example.com',
          currentPassword: 'test123',
        }),
      });
      expect(result.success).toBe(true);
    });
  });

  describe('exportData', () => {
    it('should call export data API and trigger download', async () => {
      const mockBlob = new Blob(['test data'], { type: 'application/json' });
      mockFetch.mockResolvedValueOnce({
        ok: true,
        blob: async () => mockBlob,
        headers: {
          get: (name: string) => {
            if (name === 'Content-Disposition') {
              return 'attachment; filename="travel-io-export-2024-01-01.json"';
            }
            return null;
          },
        },
      });

      const result = await exportData();

      expect(mockFetch).toHaveBeenCalledWith('/api/user/export-data', {
        method: 'POST',
      });
      expect(mockCreateObjectURL).toHaveBeenCalled();
      expect(result.success).toBe(true);
      expect(result.filename).toBe('travel-io-export-2024-01-01.json');
    });
  });
});
