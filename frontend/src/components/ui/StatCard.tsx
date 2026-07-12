import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  className,
}) => {
  return (
    <div className={cn("bg-surface rounded-xl p-6 border border-border flex flex-col gap-2 shadow-sm", className)}>
      <div className="flex justify-between items-center text-muted">
        <h3 className="text-sm font-medium">{title}</h3>
        {icon && <div className="text-primary">{icon}</div>}
      </div>
      <div className="text-2xl font-semibold text-text">{value}</div>
      {trend && (
        <div className={cn(
          "text-xs font-medium mt-1",
          trendDirection === 'up' && "text-emerald-500",
          trendDirection === 'down' && "text-error",
          trendDirection === 'neutral' && "text-muted"
        )}>
          {trend}
        </div>
      )}
    </div>
  );
};
