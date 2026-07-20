'use client';

import * as React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  icon: React.ElementType;
  iconColor?: string;
}

export function MetricCard({ title, value, change, icon: Icon, iconColor = 'text-primary' }: MetricCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {change !== undefined && (
              <div className="mt-1 flex items-center text-sm">
                {change > 0 ? (
                  <TrendingUp className="mr-1 h-4 w-4 text-success" />
                ) : change < 0 ? (
                  <TrendingDown className="mr-1 h-4 w-4 text-destructive" />
                ) : (
                  <Minus className="mr-1 h-4 w-4 text-muted-foreground" />
                )}
                <span className={cn(
                  change > 0 ? 'text-success' : change < 0 ? 'text-destructive' : 'text-muted-foreground'
                )}>
                  {Math.abs(change)}%
                </span>
                <span className="ml-1 text-muted-foreground">vs mês anterior</span>
              </div>
            )}
          </div>
          <div className={cn('rounded-lg bg-muted p-3', iconColor)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
