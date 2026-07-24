import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockUsers = [
  {
    id: 'user-1',
    name: 'User One',
    email: 'user1@example.com',
    phone: '1234567890',
    avatarUrl: null,
    accountStatus: 'active',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'user-2',
    name: 'User Two',
    email: 'user2@example.com',
    phone: null,
    avatarUrl: 'https://example.com/avatar.jpg',
    accountStatus: 'active',
    createdAt: new Date('2024-01-02'),
    updatedAt: new Date('2024-01-02'),
  },
];

// Mock Prisma
const mockPrisma = {
  profile: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  auditLog: {
    create: vi.fn(),
  },
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn().mockImplementation(() => mockPrisma),
}));

// Mock authenticatedHandler
vi.mock('@/lib/api/supabase-helpers', () => ({
  authenticatedHandler: vi.fn((request: any, handler: any) =>
    handler({ request, userId: 'admin-user-id', supabase: {} })
  ),
}));

describe('GET /api/admin/users', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockPrisma.profile.findUnique.mockResolvedValue({
      id: 'admin-user-id',
      name: 'Admin',
      email: 'admin@example.com',
    });
    mockPrisma.profile.findMany.mockResolvedValue(mockUsers);
    mockPrisma.profile.count.mockResolvedValue(2);
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it('should return paginated user list', async () => {
    const { GET } = await import('@/app/api/admin/users/route');

    const request = new Request('http://localhost/api/admin/users?page=1&pageSize=20');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.users).toHaveLength(2);
    expect(data.data.pagination).toEqual({
      page: 1,
      pageSize: 20,
      total: 2,
      totalPages: 1,
    });
  });

  it('should filter users by search term', async () => {
    const { GET } = await import('@/app/api/admin/users/route');

    const request = new Request('http://localhost/api/admin/users?search=User One');

    await GET(request as any);

    expect(mockPrisma.profile.findMany).toHaveBeenCalledWith({
      where: {
        OR: [
          { name: { contains: 'User One', mode: 'insensitive' } },
          { email: { contains: 'User One', mode: 'insensitive' } },
        ],
      },
      skip: 0,
      take: 20,
      orderBy: { createdAt: 'desc' },
      select: expect.any(Object),
    });
  });

  it('should return empty array when no users match', async () => {
    mockPrisma.profile.findMany.mockResolvedValue([]);
    mockPrisma.profile.count.mockResolvedValue(0);

    const { GET } = await import('@/app/api/admin/users/route');

    const request = new Request('http://localhost/api/admin/users?search=nonexistent');

    const response = await GET(request as any);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.data.users).toHaveLength(0);
    expect(data.data.pagination.total).toBe(0);
  });

  it('should create audit log entry', async () => {
    const { GET } = await import('@/app/api/admin/users/route');

    const request = new Request('http://localhost/api/admin/users?page=2&pageSize=10&search=test');

    await GET(request as any);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'admin-user-id',
        action: 'admin_users_listed',
        details: {
          page: 2,
          pageSize: 10,
          search: 'test',
          totalResults: 2,
        },
      },
    });
  });
});
