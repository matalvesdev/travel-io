export interface Investment {
  id: string;
  type: string;
  ticker: string;
  name: string;
  quantity: number;
  avgCost: number;
  currentPrice: number;
  currentValue: number;
  totalReturn: number;
  returnPercentage: number;
  exchange: string;
  sector: string;
  currency: string;
  isActive: boolean;
  costBasis: number;
}

export interface Allocation {
  totalValue: number;
  items: AllocationItem[];
  byType: Record<string, number>;
  bySector: Record<string, number>;
}

export interface AllocationItem {
  category: string;
  value: number;
  percentage: number;
  count: number;
}

export interface Dividend {
  id: string;
  ticker: string;
  type: string;
  amount: number;
  quantity: number;
  valuePerUnit: number;
  paymentDate: string;
  exDate: string;
  status: string;
}

export interface CreateInvestmentRequest {
  type: string;
  ticker: string;
  name: string;
  quantity: number;
  price: number;
  exchange?: string;
  sector?: string;
  currency?: string;
}
