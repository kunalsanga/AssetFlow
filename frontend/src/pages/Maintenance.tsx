import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/common/Button';

export const Maintenance = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-text">Maintenance</h1>
          <p className="text-muted mt-1">Track maintenance requests and repair workflows.</p>
        </div>
        <Button className="gap-2 bg-warning text-warning-foreground hover:bg-warning/90 border-none text-white">
          <Plus size={18} />
          New Request
        </Button>
      </div>

      <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
        {/* Kanban Columns */}
        {[
          { title: 'Pending', count: 5 },
          { title: 'Approved', count: 2 },
          { title: 'Technician Assigned', count: 3 },
          { title: 'In Progress', count: 4 },
          { title: 'Resolved', count: 12 }
        ].map((col) => (
          <div key={col.title} className="bg-surface border border-border rounded-xl flex-shrink-0 w-72 flex flex-col">
            <div className="p-3 border-b border-border flex justify-between items-center bg-background/50 rounded-t-xl">
              <h3 className="font-semibold text-text">{col.title}</h3>
              <span className="text-xs bg-background px-2 py-1 rounded-full text-muted border border-border">
                {col.count}
              </span>
            </div>
            <div className="p-2 flex-1 overflow-y-auto space-y-2">
              {/* Placeholder for Kanban Cards */}
              <div className="bg-background border border-border p-3 rounded-lg text-sm text-muted text-center italic">
                Maintenance tickets will appear here.
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
