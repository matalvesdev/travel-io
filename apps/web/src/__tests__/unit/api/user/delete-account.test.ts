import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock data
const mockProfile = {
  id: 'test-user-id',
  accountStatus: 'active',
  deletedAt: null,
};

const mockDeletedProfile = {
  id: 'test-user-id',
  accountStatus: 'deleted',
  deletedAt: new Date(),
};

// Mock Prisma
const mockPrisma = {
  profile: {
    findUnique: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

// Mock authenticatedHandler
const mockSupabaseAdmin = {
  auth: {
    admin: {
      signOut: vi.fn(),
    },
  },
};

vi.mock('@/lib/api/supabase-helpers', () => ({
  authenticatedHandler: vi.fn((request: any, handler: any) =>
    handler({ request, userId: 'test-user-id', supabase: {} })
  ),
  getSupabaseAdmin: vi.fn(() => mockSupabaseAdmin),
}));

describe('DELETE /api/user/delete-account', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return 400 when password is missing', async () => {
    const { POST } = await import('@/app/api/user/delete-account/route');

    const request = new Request('http://localhost/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('obrigatória');
  });

  it('should return 404 when profile not found', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(null);

    const { POST } = await import('@/app/api/user/delete-account/route');

    const request = new Request('http://localhost/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data.success).toBe(false);
    expect(data.message).toContain('não encontrado');
  });

  it('should return 400 when account is already deleted', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(mockDeletedProfile);

    const { POST } = await import('@/app/api/user/delete-account/route');

    const request = new Request('http://localhost/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('já foi excluída');
  });

  it('should soft delete account and create audit log', async () => {
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockPrisma.profile.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});

    const { POST } = await import('@/app/api/user/delete-account/route');

    const request = new Request('http://localhost/api/user/delete-account', {
      method: 'POST',
      body: JSON.stringify({ password: 'test123', reason: 'Test reason' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('exclusão');
    expect(data.scheduledFor).toBeDefined();

    // Verify profile was updated
    expect(mockPrisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
      data: {
        accountStatus: 'deleted',
        deletedAt: expect.any(Date),
      },
    });

    // Verify audit log was created
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'test-user-id',
        action: 'account_deletion_requested',
        details: expect.objectContaining({
          reason: 'Test reason',
        }),
      },
    });
  });
});
