export interface Plan {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  currency: string;
  features: string;
  limits: string;
  isPopular: boolean;
  yearlySavings: number;
}

export interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  isEnabled: boolean;
  type: string;
  rolloutPercentage: number;
  expiresAt: string;
  isActive: boolean;
  isExpired: boolean;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  status: string;
  ipAddress: string;
  createdAt: string;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  components: Record<string, {
    name: string;
    status: string;
    message: string;
    responseTimeMs: number;
  }>;
  metrics: {
    totalUsers: number;
    activeUsers: number;
    totalTransactions: number;
    totalInvestments: number;
    activeGoals: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    activeConnections: number;
  };
}

export interface ToggleFeatureFlagRequest {
  key: string;
  enabled?: boolean;
}
