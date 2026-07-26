export type WishlistItemType = 'flight' | 'hotel' | 'destination';

export interface TravelWishlistItem {
  id: string;
  userId: string;
  type: WishlistItemType;
  name: string;
  notes: string | null;
  targetPrice: number | null;
  currentPrice: number | null;
  currency: string;

  // Flight-specific
  origin: string | null;
  destination: string | null;
  airline: string | null;
  flightNumber: string | null;
  departureDate: string | null;

  // Hotel-specific
  hotelName: string | null;
  hotelAddress: string | null;
  checkIn: string | null;
  checkOut: string | null;
  nights: number | null;
  roomType: string | null;

  // Destination-specific
  country: string | null;
  imageUrl: string | null;

  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWishlistItemInput {
  type: WishlistItemType;
  name: string;
  notes?: string;
  targetPrice?: number;
  currency?: string;
  origin?: string;
  destination?: string;
  airline?: string;
  flightNumber?: string;
  departureDate?: string;
  hotelName?: string;
  hotelAddress?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  roomType?: string;
  country?: string;
  imageUrl?: string;
}

export interface UpdateWishlistItemInput {
  id: string;
  name?: string;
  notes?: string;
  targetPrice?: number;
  currency?: string;
  origin?: string;
  destination?: string;
  airline?: string;
  flightNumber?: string;
  departureDate?: string;
  hotelName?: string;
  hotelAddress?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  roomType?: string;
  country?: string;
  imageUrl?: string;
  sortOrder?: number;
}
