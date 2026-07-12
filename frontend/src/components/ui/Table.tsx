import React, { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface TableProps {
  children: ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className={cn("w-full overflow-x-auto rounded-lg border border-border bg-surface", className)}>
      <table className="w-full text-left text-sm text-text">
        {children}
      </table>
    </div>
  );
};

export const TableHeader: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <thead className={cn("bg-background/50 text-muted border-b border-border text-xs uppercase", className)}>
    {children}
  </thead>
);

export const TableBody: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tbody className={cn("divide-y divide-border", className)}>
    {children}
  </tbody>
);

export const TableRow: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <tr className={cn("hover:bg-background/30 transition-colors", className)}>
    {children}
  </tr>
);

export const TableHead: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <th className={cn("px-4 py-3 font-medium", className)}>
    {children}
  </th>
);

export const TableCell: React.FC<{ children: ReactNode; className?: string }> = ({ children, className }) => (
  <td className={cn("px-4 py-3", className)}>
    {children}
  </td>
);
