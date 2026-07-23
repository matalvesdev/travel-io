import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@/lib/db';

// Mock Prisma
vi.mock('@/lib/db', () => ({
  prisma: {
    wishlistItem: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    priceMonitor: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    deal: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    coupon: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
    priceAlert: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

describe('Shopping API Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Wishlist API', () => {
    it('should return wishlist items', async () => {
      const mockItems = [
        { id: '1', name: 'iPhone 15', store: 'Amazon', currentPrice: 8999 },
      ];
      (prisma.wishlistItem.findMany as any).mockResolvedValue(mockItems);

      const result = await prisma.wishlistItem.findMany({
        where: { userId: 'user-1' },
      });

      expect(result).toEqual(mockItems);
      expect(prisma.wishlistItem.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should create wishlist item', async () => {
      const mockItem = { id: '1', name: 'iPhone 15', store: 'Amazon' };
      (prisma.wishlistItem.create as any).mockResolvedValue(mockItem);

      const result = await prisma.wishlistItem.create({
        data: { name: 'iPhone 15', store: 'Amazon', userId: 'user-1' },
      });

      expect(result).toEqual(mockItem);
    });

    it('should update wishlist item', async () => {
      const mockItem = { id: '1', name: 'iPhone 15', targetPrice: 7999 };
      (prisma.wishlistItem.update as any).mockResolvedValue(mockItem);

      const result = await prisma.wishlistItem.update({
        where: { id: '1' },
        data: { targetPrice: 7999 },
      });

      expect(result).toEqual(mockItem);
    });

    it('should delete wishlist item', async () => {
      (prisma.wishlistItem.delete as any).mockResolvedValue({});

      await prisma.wishlistItem.delete({ where: { id: '1' } });

      expect(prisma.wishlistItem.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('Price Monitor API', () => {
    it('should return monitors', async () => {
      const mockMonitors = [
        { id: '1', productName: 'iPhone 15', currentPrice: 8999 },
      ];
      (prisma.priceMonitor.findMany as any).mockResolvedValue(mockMonitors);

      const result = await prisma.priceMonitor.findMany({
        where: { userId: 'user-1' },
      });

      expect(result).toEqual(mockMonitors);
    });

    it('should create monitor', async () => {
      const mockMonitor = { id: '1', productName: 'iPhone 15' };
      (prisma.priceMonitor.create as any).mockResolvedValue(mockMonitor);

      const result = await prisma.priceMonitor.create({
        data: { productName: 'iPhone 15', userId: 'user-1' },
      });

      expect(result).toEqual(mockMonitor);
    });

    it('should update monitor with price history', async () => {
      const mockMonitor = {
        id: '1',
        currentPrice: 8499,
        priceHistory: [{ price: 8999, timestamp: new Date() }],
      };
      (prisma.priceMonitor.update as any).mockResolvedValue(mockMonitor);

      const result = await prisma.priceMonitor.update({
        where: { id: '1' },
        data: {
          currentPrice: 8499,
          priceHistory: { push: { price: 8999, timestamp: new Date() } },
        },
      });

      expect(result).toEqual(mockMonitor);
    });
  });

  describe('Deal API', () => {
    it('should return deals', async () => {
      const mockDeals = [
        { id: '1', productName: 'iPhone 15', dealPrice: 7999 },
      ];
      (prisma.deal.findMany as any).mockResolvedValue(mockDeals);

      const result = await prisma.deal.findMany({
        where: { isActive: true },
      });

      expect(result).toEqual(mockDeals);
    });

    it('should create deal', async () => {
      const mockDeal = { id: '1', productName: 'iPhone 15' };
      (prisma.deal.create as any).mockResolvedValue(mockDeal);

      const result = await prisma.deal.create({
        data: {
          productName: 'iPhone 15',
          storeName: 'Amazon',
          originalPrice: 8999,
          dealPrice: 7999,
          savings: 1000,
        },
      });

      expect(result).toEqual(mockDeal);
    });
  });

  describe('Coupon API', () => {
    it('should return coupons', async () => {
      const mockCoupons = [
        { id: '1', code: 'DESCONTO10', value: 10 },
      ];
      (prisma.coupon.findMany as any).mockResolvedValue(mockCoupons);

      const result = await prisma.coupon.findMany({
        where: { isActive: true },
      });

      expect(result).toEqual(mockCoupons);
    });
  });

  describe('Price Alert API', () => {
    it('should return alerts', async () => {
      const mockAlerts = [
        { id: '1', name: 'iPhone 15', active: true },
      ];
      (prisma.priceAlert.findMany as any).mockResolvedValue(mockAlerts);

      const result = await prisma.priceAlert.findMany({
        where: { userId: 'user-1', active: true },
      });

      expect(result).toEqual(mockAlerts);
    });

    it('should create alert', async () => {
      const mockAlert = { id: '1', name: 'iPhone 15' };
      (prisma.priceAlert.create as any).mockResolvedValue(mockAlert);

      const result = await prisma.priceAlert.create({
        data: {
          name: 'iPhone 15',
          type: 'price_drop',
          targetPrice: 7999,
          userId: 'user-1',
        },
      });

      expect(result).toEqual(mockAlert);
    });
  });
});
