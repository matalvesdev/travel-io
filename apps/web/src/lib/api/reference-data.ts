import { apiClient, type ApiResponse } from './client';

export interface MilesProgram {
  name: string; color: string; icon: string; partner: string;
}

export interface MilesRate {
  valuePerPoint: number; transferPartners: string[]; promoTip: string;
}

export interface CreditCardMiles {
  name: string; annualFee: string; earnRate: string; transferTo: string; highlight: string;
}

export interface AttractionSlot {
  name: string; desc: string;
}

export interface DestinationAttractions {
  morning: AttractionSlot[];
  lunch: AttractionSlot[];
  afternoon: AttractionSlot[];
  dinner: AttractionSlot[];
  transport: string[];
}

export interface CuratedPromo {
  program: string; title: string; route: string; discount: string;
  expiresAt: string; url: string; source: string;
}

export interface FuelData {
  consumption: number; price: number; tollPerKm: number;
}

export interface TravelReferenceData {
  milesPrograms: MilesProgram[];
  milesRates: Record<string, MilesRate>;
  creditCardsMiles: CreditCardMiles[];
  curatedPromos: CuratedPromo[];
  attractions: Record<string, DestinationAttractions>;
  distances: Record<string, number>;
  fuel: FuelData;
}

export const referenceDataApi = {
  get: () =>
    apiClient.get<ApiResponse<{ data: TravelReferenceData }>>('/api/travel/reference-data'),
};
