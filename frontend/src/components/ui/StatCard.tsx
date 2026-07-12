import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  className?: string;
  iconBgColor?: string;
  iconColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  trendDirection = 'neutral',
  className,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary'
}) => {
  return (
    <div className={cn("bg-surface rounded-[24px] p-6 border border-border flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow", className)}>
      <div className="flex justify-between items-start text-muted">
        <h3 className="text-[15px] font-medium text-muted/80">{title}</h3>
        {icon && (
          <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", iconBgColor, iconColor)}>
            {icon}
          </div>
        )}
      </div>
      <div className="text-3xl font-bold text-text mt-1 tracking-tight">{value}</div>
      {trend && (
        <div className={cn(
          "text-sm font-medium mt-1 flex items-center gap-1",
          trendDirection === 'up' && "text-emerald-500",
          trendDirection === 'down' && "text-rose-500",
          trendDirection === 'neutral' && "text-muted"
        )}>
          {trend}
        </div>
      )}
    </div>
  );
};
