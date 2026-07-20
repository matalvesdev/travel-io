export interface MilesAccount {
  id: string;
  program: string;
  programName: string;
  holderName: string;
  balance: number;
  expiringIn30Days: number;
  expiringDate: string;
  tier: string;
  milesValue: number;
  monetaryValue: number;
}

export interface TransferRoute {
  id: string;
  fromProgram: string;
  fromProgramName: string;
  toProgram: string;
  toProgramName: string;
  conversionRate: number;
  bonusPercentage: number;
  minTransfer: number;
  maxTransfer: number;
  transferFee: number;
  processingTimeHours: number;
  hasPromo: boolean;
  promoEndDate: string;
  notes: string;
}

export interface Promotion {
  id: string;
  program: string;
  programName: string;
  title: string;
  description: string;
  bonusPercentage: number;
  bonusMiles: number;
  partner: string;
  category: string;
  startDate: string;
  endDate: string;
  daysRemaining: number;
  isActive: boolean;
  termsUrl: string;
  linkUrl: string;
}

export interface LinkMilesAccountRequest {
  program: string;
  holderName: string;
  accountNumber?: string;
  email?: string;
}
