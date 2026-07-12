import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { cn } from '../lib/utils';

export const Maintenance = () => {
  const columns = [
    { title: 'Pending',             count: 5,  color: 'bg-[#F8E0A0]/40', headerColor: 'bg-[#F8E0A0]',  textColor: 'text-[#9B6008]' },
    { title: 'Approved',            count: 2,  color: 'bg-[#DCECF7]/60', headerColor: 'bg-[#DCECF7]',  textColor: 'text-[#1565A8]' },
    { title: 'Technician Assigned', count: 3,  color: 'bg-[#B0E5F0]/40', headerColor: 'bg-[#B0E5F0]',  textColor: 'text-[#1A8FAD]' },
    { title: 'In Progress',         count: 4,  color: 'bg-[#BDDBF5]/50', headerColor: 'bg-[#BDDBF5]',  textColor: 'text-[#1565A8]' },
    { title: 'Resolved',            count: 12, color: 'bg-[#B5E9D7]/40', headerColor: 'bg-[#B5E9D7]',  textColor: 'text-[#148A65]' }
  ];

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12 h-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Maintenance</h1>
          <p className="text-muted mt-1 text-sm">Track maintenance requests and repair workflows.</p>
        </div>
        <Button className="gap-2 shadow-sm rounded-xl">
          <Plus size={18} />
          New Request
        </Button>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4 px-1">
        {/* Kanban Columns */}
        {columns.map((col) => (
          <div key={col.title} className={cn("rounded-[24px] flex-shrink-0 w-80 flex flex-col border border-border/40 shadow-sm overflow-hidden", col.color)}>
            <div className={cn("p-4 border-b border-border/40 flex justify-between items-center", col.headerColor)}>
              <h3 className={cn("font-semibold", col.textColor)}>{col.title}</h3>
              <span className="text-xs bg-white/80 px-2.5 py-1 rounded-full font-medium border border-border/30">
                {col.count}
              </span>
            </div>
            <div className="p-3 flex-1 overflow-y-auto space-y-3">
              {/* Placeholder for Kanban Cards */}
              <div className="bg-white border border-border/40 p-4 rounded-2xl text-sm shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing">
                <div className="font-semibold text-text mb-1">Fix projector lens</div>
                <div className="text-muted text-xs mb-3">Asset: AF-0062</div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-medium px-2 py-1 rounded-md bg-rose-50 text-rose-600">High</span>
                  <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">JD</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

