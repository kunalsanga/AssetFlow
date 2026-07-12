import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-[18px] border border-border bg-surface shadow-[0_2px_12px_rgba(21,101,168,0.08)]", className)}>
      <table className="w-full text-left text-sm text-text">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <thead className={cn("bg-[#DCECF7] text-[#17324D] text-xs uppercase font-bold border-b border-[#A9C9DE] tracking-wide", className)}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tbody className={cn("divide-y divide-border", className)}>
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={cn("hover:bg-[#DCECF7]/50 transition-colors duration-100", className)}>
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn("px-6 py-4 font-semibold text-muted tracking-wide", className)}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn("px-6 py-4 font-medium", className)}>
    {children}
  </td>
);
