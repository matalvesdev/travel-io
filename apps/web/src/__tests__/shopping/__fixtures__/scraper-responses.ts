export const mockAmazonResponse = {
  products: [
    {
      id: 'amz-123-0',
      title: 'Notebook Dell Inspiron 15',
      price: 3999.99,
      originalPrice: 3999.99,
      url: 'https://www.amazon.com.br/dp/B09V3KXJPB',
      store: 'Amazon',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71hIfcIPyxS._AC_SL1500_.jpg',
      rating: 4.5,
    },
    {
      id: 'amz-123-1',
      title: 'Notebook Lenovo IdeaPad 3',
      price: 2799.99,
      originalPrice: 2799.99,
      url: 'https://www.amazon.com.br/dp/B09V3KXJPB',
      store: 'Amazon',
      imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71hIfcIPyxS._AC_SL1500_.jpg',
      rating: 4.2,
    },
  ],
  total: 2,
  source: 'hybrid',
  store: 'amazon',
};

export const mockMLResponse = {
  products: [
    {
      id: 'ml-123-0',
      title: 'Samsung Galaxy S24 Ultra 256GB',
      price: 8999.00,
      originalPrice: 8999.00,
      url: 'https://www.mercadolivre.com.br/samsung-galaxy-s24',
      store: 'Mercado Livre',
      imageUrl: 'https://http2.mlstatic.com/D_NQ_712345-MLA712345.jpg',
    },
  ],
  total: 1,
  source: 'hybrid',
  store: 'mercadolivre',
};

export const mockEmptyResponse = {
  products: [],
  total: 0,
  source: 'hybrid',
  store: 'amazon',
};

export const mockWishlistItem = {
  id: 'test-id-1',
  userId: 'user-1',
  name: 'iPhone 15 Pro',
  store: 'Amazon',
  currentPrice: 8999.00,
  targetPrice: 7999.00,
  lowestPrice: 8499.00,
  url: 'https://www.amazon.com.br/dp/B09V3KXJPB',
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71hIfcIPyxS._AC_SL1500_.jpg',
  category: 'Eletrônicos',
  brand: 'Apple',
  monitorPrice: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

export const mockMonitor = {
  id: 'monitor-1',
  userId: 'user-1',
  productName: 'iPhone 15 Pro',
  url: 'https://www.amazon.com.br/dp/B09V3KXJPB',
  targetPrice: 7999.00,
  currentPrice: 8999.00,
  lowestPrice: 8499.00,
  imageUrl: 'https://images-na.ssl-images-amazon.com/images/I/71hIfcIPyxS._AC_SL1500_.jpg',
  category: 'Eletrônicos',
  brand: 'Apple',
  lastChecked: '2026-07-23T00:00:00.000Z',
  priceHistory: [
    { price: 9499.00, timestamp: '2026-07-20T00:00:00.000Z', source: 'Amazon' },
    { price: 8999.00, timestamp: '2026-07-22T00:00:00.000Z', source: 'Amazon' },
  ],
  isActive: true,
  createdAt: '2026-07-15T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

export const mockDeal = {
  id: 'deal-1',
  productName: 'Notebook Dell Inspiron 15',
  storeName: 'Amazon',
  originalPrice: 4999.99,
  dealPrice: 3999.99,
  savings: 1000.00,
  url: 'https://www.amazon.com.br/dp/B09V3KXJPB',
  category: 'Eletrônicos',
  isActive: true,
  createdAt: '2026-07-23T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};

export const mockCoupon = {
  id: 'coupon-1',
  storeName: 'Amazon',
  code: 'DESCONTO10',
  description: '10% de desconto em eletrônicos',
  value: 10,
  minPurchase: 100.00,
  startDate: '2026-07-01T00:00:00.000Z',
  endDate: '2026-08-01T00:00:00.000Z',
  isActive: true,
  daysRemaining: 9,
  createdAt: '2026-07-01T00:00:00.000Z',
  updatedAt: '2026-07-23T00:00:00.000Z',
};
