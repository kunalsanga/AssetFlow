import React from 'react';
import { cn } from '../../lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  inactive: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  pending: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  error: 'bg-red-500/10 text-red-500 border-red-500/20',
  info: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, type = 'info', className }) => {
  return (
    <span className={cn(
      "px-2.5 py-0.5 rounded-full text-xs font-medium border",
      statusStyles[type],
      className
    )}>
      {status}
    </span>
  );
};
