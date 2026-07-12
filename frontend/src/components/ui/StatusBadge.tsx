import React from 'react';
import { cn } from '../../lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'bg-emerald-100 text-emerald-700',
  success: 'bg-emerald-100 text-emerald-700',
  inactive: 'bg-gray-100 text-gray-600',
  pending: 'bg-amber-100 text-amber-700',
  warning: 'bg-orange-100 text-orange-700',
  error: 'bg-rose-100 text-rose-700',
  info: 'bg-blue-100 text-blue-700',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'info', className }) => {
  return (
    <span className={cn(
      "px-3 py-1 rounded-full text-xs font-semibold tracking-wide",
      statusStyles[type],
      className
    )}>
      {status}
    </span>
  );
};
