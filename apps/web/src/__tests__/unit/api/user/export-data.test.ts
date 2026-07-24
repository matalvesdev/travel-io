import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock data
const mockProfile = {
  id: 'test-user-id',
  name: 'Test User',
  email: 'test@example.com',
  phone: '1234567890',
  birthDate: new Date('1990-01-01'),
  createdAt: new Date('2024-01-01'),
};

const mockTransactions = [
  { id: '1', userId: 'test-user-id', type: 'income', amount: 1000 },
  { id: '2', userId: 'test-user-id', type: 'expense', amount: 500 },
];

const mockInvestments = [
  { id: '1', userId: 'test-user-id', ticker: 'AAPL', quantity: 10 },
];

const mockTrips = [
  { id: '1', userId: 'test-user-id', destination: 'Paris' },
];

const mockGoals = [
  { id: '1', userId: 'test-user-id', name: 'Emergency Fund' },
];

const mockMilesAccounts = [
  { id: '1', userId: 'test-user-id', program: 'Smiles', balance: 50000 },
];

const mockMilesTransactions = [
  { id: '1', userId: 'test-user-id', amount: 10000 },
];

const mockWishlistItems = [
  { id: '1', userId: 'test-user-id', name: 'iPhone 15' },
];

const mockPriceMonitors = [
  { id: '1', userId: 'test-user-id', productName: 'MacBook Pro' },
];

const mockDeals = [];
const mockCoupons = [];
const mockPriceAlerts = [];
const mockNotifications = [];
const mockNotificationPreferences = null;
const mockAiConversations = [];
const mockAiMessages = [];
const mockPaymentMethods = [];

// Mock Prisma
const mockPrisma = {
  profile: {
    findUnique: vi.fn(),
  },
  transaction: {
    findMany: vi.fn(),
  },
  investment: {
    findMany: vi.fn(),
  },
  trip: {
    findMany: vi.fn(),
  },
  goal: {
    findMany: vi.fn(),
  },
  milesAccount: {
    findMany: vi.fn(),
  },
  milesTransaction: {
    findMany: vi.fn(),
  },
  wishlistItem: {
    findMany: vi.fn(),
  },
  priceMonitor: {
    findMany: vi.fn(),
  },
  deal: {
    findMany: vi.fn(),
  },
  coupon: {
    findMany: vi.fn(),
  },
  priceAlert: {
    findMany: vi.fn(),
  },
  notification: {
    findMany: vi.fn(),
  },
  notificationPreference: {
    findUnique: vi.fn(),
  },
  aiConversation: {
    findMany: vi.fn(),
  },
  aiMessage: {
    findMany: vi.fn(),
  },
  paymentMethod: {
    findMany: vi.fn(),
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
    handler({ request, userId: 'test-user-id', supabase: {} })
  ),
}));

describe('POST /api/user/export-data', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    mockPrisma.profile.findUnique.mockResolvedValue(mockProfile);
    mockPrisma.transaction.findMany.mockResolvedValue(mockTransactions);
    mockPrisma.investment.findMany.mockResolvedValue(mockInvestments);
    mockPrisma.trip.findMany.mockResolvedValue(mockTrips);
    mockPrisma.goal.findMany.mockResolvedValue(mockGoals);
    mockPrisma.milesAccount.findMany.mockResolvedValue(mockMilesAccounts);
    mockPrisma.milesTransaction.findMany.mockResolvedValue(mockMilesTransactions);
    mockPrisma.wishlistItem.findMany.mockResolvedValue(mockWishlistItems);
    mockPrisma.priceMonitor.findMany.mockResolvedValue(mockPriceMonitors);
    mockPrisma.deal.findMany.mockResolvedValue(mockDeals);
    mockPrisma.coupon.findMany.mockResolvedValue(mockCoupons);
    mockPrisma.priceAlert.findMany.mockResolvedValue(mockPriceAlerts);
    mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
    mockPrisma.notificationPreference.findUnique.mockResolvedValue(mockNotificationPreferences);
    mockPrisma.aiConversation.findMany.mockResolvedValue(mockAiConversations);
    mockPrisma.aiMessage.findMany.mockResolvedValue(mockAiMessages);
    mockPrisma.paymentMethod.findMany.mockResolvedValue(mockPaymentMethods);
    mockPrisma.auditLog.create.mockResolvedValue({});
  });

  it('should export all user data as JSON', async () => {
    const { POST } = await import('@/app/api/user/export-data/route');

    const request = new Request('http://localhost/api/user/export-data', {
      method: 'POST',
    });

    const response = await POST(request as any);
    const text = await response.text();
    const data = JSON.parse(text);

    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/json');
    expect(response.headers.get('Content-Disposition')).toContain('attachment');
    expect(response.headers.get('Content-Disposition')).toContain('travel-io-export-');

    // Verify data structure
    expect(data.exportDate).toBeDefined();
    expect(data.userId).toBe('test-user-id');
    expect(data.data.profile).toBeDefined();
    expect(data.data.profile.name).toBe('Test User');
    expect(data.data.transactions).toHaveLength(2);
    expect(data.data.investments).toHaveLength(1);
    expect(data.data.trips).toHaveLength(1);
    expect(data.data.goals).toHaveLength(1);
    expect(data.data.miles.accounts).toHaveLength(1);
    expect(data.data.shopping.wishlist).toHaveLength(1);
  });

  it('should create audit log entry', async () => {
    const { POST } = await import('@/app/api/user/export-data/route');

    const request = new Request('http://localhost/api/user/export-data', {
      method: 'POST',
    });

    await POST(request as any);

    expect(mockPrisma.auditLog.create).toHaveBeenCalledWith({
      data: {
        userId: 'test-user-id',
        action: 'data_export_requested',
        details: expect.objectContaining({
          sections: expect.arrayContaining([
            'profile',
            'transactions',
            'investments',
          ]),
        }),
      },
    });
  });

  it('should handle empty data gracefully', async () => {
    // Mock empty data
    mockPrisma.transaction.findMany.mockResolvedValue([]);
    mockPrisma.investment.findMany.mockResolvedValue([]);
    mockPrisma.trip.findMany.mockResolvedValue([]);
    mockPrisma.goal.findMany.mockResolvedValue([]);
    mockPrisma.milesAccount.findMany.mockResolvedValue([]);
    mockPrisma.milesTransaction.findMany.mockResolvedValue([]);
    mockPrisma.wishlistItem.findMany.mockResolvedValue([]);
    mockPrisma.priceMonitor.findMany.mockResolvedValue([]);
    mockPrisma.deal.findMany.mockResolvedValue([]);
    mockPrisma.coupon.findMany.mockResolvedValue([]);
    mockPrisma.priceAlert.findMany.mockResolvedValue([]);
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.aiConversation.findMany.mockResolvedValue([]);
    mockPrisma.aiMessage.findMany.mockResolvedValue([]);
    mockPrisma.paymentMethod.findMany.mockResolvedValue([]);

    const { POST } = await import('@/app/api/user/export-data/route');

    const request = new Request('http://localhost/api/user/export-data', {
      method: 'POST',
    });

    const response = await POST(request as any);
    const text = await response.text();
    const data = JSON.parse(text);

    expect(response.status).toBe(200);
    expect(data.data.transactions).toHaveLength(0);
    expect(data.data.investments).toHaveLength(0);
  });
});
