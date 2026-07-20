export interface Milestone {
  id: string;
  name: string;
  targetPercentage: number;
  targetAmount: number;
  isCompleted: boolean;
  completedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  description: string;
  type: string;
  typeName: string;
  icon: string;
  color: string;
  targetAmount: number;
  currentAmount: number;
  remainingAmount: number;
  progressPercentage: number;
  monthlyContribution: number;
  startDate: string;
  targetDate: string;
  daysRemaining: number;
  monthsRemaining: number;
  priority: string;
  status: string;
  isOnTrack: boolean;
  isExpired: boolean;
  isCompleted: boolean;
  requiredMonthlyContribution: number;
  estimatedCompletionDate: string;
  milestones: Milestone[];
  progressHistoryCount: number;
}

export interface GoalTemplate {
  name: string;
  description: string;
  type: string;
  typeName: string;
  icon: string;
  color: string;
  suggestedAmount: number;
  suggestedMonths: number;
  suggestedMonthlyContribution: number;
}

export interface CreateGoalRequest {
  name: string;
  description?: string;
  type: string;
  targetAmount: number;
  targetDate: string;
  monthlyContribution?: number;
  priority?: string;
  expectedReturnRate?: number;
}

export interface AddGoalProgressRequest {
  goalId: string;
  amount: number;
  description?: string;
  type?: string;
}
