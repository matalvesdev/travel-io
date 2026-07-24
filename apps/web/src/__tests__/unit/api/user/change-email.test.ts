import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Prisma
const mockPrisma = {
  profile: {
    findFirst: vi.fn(),
    update: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

// Mock supabase
const mockSupabase = {
  auth: {
    updateUser: vi.fn(),
  },
};

// Mock authenticatedHandler
vi.mock('@/lib/api/supabase-helpers', () => ({
  authenticatedHandler: vi.fn((request: any, handler: any) =>
    handler({ request, userId: 'test-user-id', supabase: mockSupabase })
  ),
}));

describe('POST /api/user/change-email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.auth.updateUser.mockResolvedValue({ error: null });
    mockPrisma.profile.update.mockResolvedValue({});
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it('should return 400 when newEmail is missing', async () => {
    const { POST } = await import('@/app/api/user/change-email/route');

    const request = new Request('http://localhost/api/user/change-email', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('obrigatório');
  });

  it('should return 400 when email is invalid', async () => {
    const { POST } = await import('@/app/api/user/change-email/route');

    const request = new Request('http://localhost/api/user/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail: 'invalid-email' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.message).toContain('inválido');
  });

  it('should return 409 when email is already in use', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue({
      id: 'other-user-id',
      email: 'taken@example.com',
    });

    const { POST } = await import('@/app/api/user/change-email/route');

    const request = new Request('http://localhost/api/user/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail: 'taken@example.com' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(409);
    expect(data.success).toBe(false);
    expect(data.message).toContain('já está em uso');
  });

  it('should update email successfully', async () => {
    mockPrisma.profile.findFirst.mockResolvedValue(null);

    const { POST } = await import('@/app/api/user/change-email/route');

    const request = new Request('http://localhost/api/user/change-email', {
      method: 'POST',
      body: JSON.stringify({ newEmail: 'new@example.com' }),
    });

    const response = await POST(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.message).toContain('confirmação');

    // Verify Supabase auth was called
    expect(mockSupabase.auth.updateUser).toHaveBeenCalledWith({
      email: 'new@example.com',
    });

    // Verify profile was updated
    expect(mockPrisma.profile.update).toHaveBeenCalledWith({
      where: { id: 'test-user-id' },
      data: {
        email: 'new@example.com',
        emailVerified: false,
      },
    });

    // Verify audit log was created
    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'test-user-id',
        action: 'email_change_requested',
        details: expect.objectContaining({
          newEmail: 'new@example.com',
        }),
      },
    });
  });
});
