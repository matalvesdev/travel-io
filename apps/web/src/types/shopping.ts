// Shopping module types - single source of truth
// Maps to Prisma schema models

// === Wishlist ===
export interface WishlistItem {
  id: string;
  userId: string;
  name: string;
  store?: string;
  currentPrice?: number;
  targetPrice?: number;
  lowestPrice?: number;
  url?: string;
  imageUrl?: string;
  category?: string;
  brand?: string;
  monitorPrice: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWishlistItemRequest {
  name: string;
  store?: string;
  current_price?: number;
  target_price?: number;
  url?: string;
  image_url?: string;
  category?: string;
  brand?: string;
  monitor_price?: boolean;
}

export interface UpdateWishlistItemRequest {
  id: string;
  name?: string;
  store?: string;
  current_price?: number;
  target_price?: number;
  lowest_price?: number;
  url?: string;
  image_url?: string;
  category?: string;
  brand?: string;
  monitor_price?: boolean;
}

export interface WishlistResponse {
  items: WishlistItem[];
}

// === Price Monitor ===
export interface PriceMonitor {
  id: string;
  userId: string;
  productName: string;
  url?: string;
  targetPrice?: number;
  currentPrice?: number;
  lowestPrice?: number;
  imageUrl?: string;
  category?: string;
  brand?: string;
  lastChecked?: string;
  priceHistory?: PriceHistoryEntry[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PriceHistoryEntry {
  price: number;
  timestamp: string;
  source: string;
}

export interface CreateMonitorRequest {
  product_name: string;
  url?: string;
  target_price?: number;
  current_price?: number;
  image_url?: string;
  category?: string;
  brand?: string;
}

export interface UpdateMonitorRequest {
  id: string;
  current_price?: number;
  lowest_price?: number;
  last_checked?: string;
  price_history?: PriceHistoryEntry[];
  is_active?: boolean;
}

export interface MonitorsResponse {
  monitors: PriceMonitor[];
}

// === Deal ===
export interface Deal {
  id: string;
  productName: string;
  storeName: string;
  originalPrice: number;
  dealPrice: number;
  savings: number;
  url?: string;
  category?: string;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DealsResponse {
  deals: Deal[];
}

// === Coupon ===
export interface Coupon {
  id: string;
  storeName: string;
  code: string;
  description?: string;
  value?: number;
  minPurchase?: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  daysRemaining?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CouponsResponse {
  coupons: Coupon[];
}

// === Price Alert ===
export interface PriceAlert {
  id: string;
  userId: string;
  name?: string;
  type: string;
  origin?: string;
  destination?: string;
  checkin?: string;
  checkout?: string;
  store?: string;
  currentPrice?: number;
  targetPrice?: number;
  history?: any;
  active: boolean;
  tripId?: string;
  createdAt: string;
}

export interface AlertsResponse {
  alerts: PriceAlert[];
}

// === Scraper ===
export interface ScrapedProduct {
  id: string;
  title: string;
  price: number;
  originalPrice?: number;
  url: string;
  store: string;
  imageUrl?: string;
  rating?: number;
  seller?: string;
  condition?: string;
}

export interface SearchProductsRequest {
  q: string;
  store?: string;
}

export interface SearchProductsResponse {
  products: ScrapedProduct[];
  total: number;
  source: string;
  store: string;
}

// === Reliability ===
export interface StoreReputation {
  name: string;
  score: number;
  color: string;
}

export interface ReliabilityScore {
  score: number;
  color: string;
  background: string;
  label: string;
}

// === Shopping Summary ===
export interface ShoppingSummary {
  wishlistItems: number;
  priceAlerts: number;
  potentialSavings: number;
  bestDeals: Deal[];
}
