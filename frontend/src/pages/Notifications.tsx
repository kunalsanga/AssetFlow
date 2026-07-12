import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { cn } from '../lib/utils';

export const Notifications = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'alerts' | 'approvals' | 'bookings'>('all');

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'alerts', label: 'Alerts' },
    { id: 'approvals', label: 'Approvals' },
    { id: 'bookings', label: 'Bookings' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Activity Logs & Notifications</h1>
          <p className="text-muted mt-1 text-sm">Track system activity, alerts and workflow updates.</p>
        </div>
      </div>

      <Card className="bg-surface border-border">
        <div className="flex border-b border-border px-2 pt-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted hover:text-text hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <CardContent className="p-0 min-h-[500px]">
          <div className="flex flex-col items-center justify-center h-[400px] text-muted">
            <Bell size={48} className="text-muted/30 mb-4" />
            <p>No notifications to show for {activeTab}.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

