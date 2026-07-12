import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border border-border/60 bg-surface shadow-sm", className)}>
      <table className="w-full text-left text-sm text-text">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <thead className={cn("bg-background/80 text-muted/80 text-xs uppercase font-semibold border-b border-border/60", className)}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tbody className={cn("divide-y divide-border/60", className)}>
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={cn("hover:bg-background/40 transition-colors", className)}>
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
