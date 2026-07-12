import React from 'react';
import { cn } from '../../lib/utils';

type StatusType = 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning' | 'info';

interface StatusBadgeProps {
  status: string;
  type?: StatusType;
  className?: string;
}

const statusStyles: Record<StatusType, string> = {
  active:   'bg-[#DCECF7] text-[#1565A8]',
  success:  'bg-[#B5E9D7] text-[#148A65]',
  inactive: 'bg-[#DDE8F0] text-[#557086]',
  pending:  'bg-[#F8E0A0] text-[#9B6008]',
  warning:  'bg-[#FAD89A] text-[#C07A0A]',
  error:    'bg-[#F5BFCA] text-[#9B2039]',
  info:     'bg-[#B0E5F0] text-[#1A8FAD]',
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
