export interface Wishlist {
  id: string;
  name: string;
  description: string;
  icon: string;
  isDefault: boolean;
  items: WishlistItem[];
  itemCount: number;
  totalValue: number;
}

export interface WishlistItem {
  id: string;
  name: string;
  description: string;
  url: string;
  imageUrl: string;
  store: string;
  currentPrice: number;
  targetPrice: number;
  lowestPrice: number;
  category: string;
  brand: string;
  status: string;
  priority: number;
  monitorPrice: boolean;
  hasPriceAlert: boolean;
  savingsPercentage: number;
}

export interface Deal {
  id: string;
  storeName: string;
  productName: string;
  description: string;
  url: string;
  imageUrl: string;
  originalPrice: number;
  dealPrice: number;
  discountPercentage: number;
  savings: number;
  category: string;
  brand: string;
  couponCode: string;
  isActive: boolean;
  isVerified: boolean;
  netVotes: number;
}

export interface Coupon {
  id: string;
  storeName: string;
  code: string;
  description: string;
  type: string;
  value: number;
  minPurchase: number;
  maxDiscount: number;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  isUsable: boolean;
  isVerified: boolean;
  successRate: number;
}

export interface CreateWishlistRequest {
  name: string;
  description?: string;
  icon?: string;
}

export interface AddToWishlistRequest {
  wishlistId?: string;
  name: string;
  description?: string;
  url?: string;
  imageUrl?: string;
  store?: string;
  currentPrice?: number;
  targetPrice?: number;
  category?: string;
  brand?: string;
  monitorPrice?: boolean;
}
