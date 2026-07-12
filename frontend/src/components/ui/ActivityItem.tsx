import React, { ReactNode } from 'react';

interface ActivityItemProps {
  icon: ReactNode;
  description: ReactNode;
  time: string;
}

export const ActivityItem: React.FC<ActivityItemProps> = ({ icon, description, time }) => {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2.5 rounded-full bg-primary/10 text-primary shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0 flex flex-col pt-1">
        <p className="text-sm text-text leading-tight">{description}</p>
        <span className="text-xs text-muted mt-1">{time}</span>
      </div>
    </div>
  );
};
