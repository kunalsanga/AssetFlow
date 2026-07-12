import React, { useState } from 'react';
import { DepartmentsTab } from './organization/DepartmentsTab';
import { AssetCategoriesTab } from './organization/AssetCategoriesTab';
import { EmployeeDirectoryTab } from './organization/EmployeeDirectoryTab';
import { cn } from '../lib/utils';

export const Organization = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-[28px] font-bold text-text tracking-tight">Organization Setup</h1>
        <p className="text-muted mt-1 text-sm">Manage departments, asset categories, employees and organizational master data.</p>
      </div>

      <div className="bg-surface border border-border/60 rounded-[24px] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-border/60 bg-slate-50/50">
          <div className="flex bg-slate-200/50 p-1 rounded-xl w-fit">
            <button
              className={cn(
                "px-5 py-2 text-sm font-medium transition-all rounded-lg",
                activeTab === 'departments' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted hover:text-text hover:bg-slate-200/50"
              )}
              onClick={() => setActiveTab('departments')}
            >
              Departments
            </button>
            <button
              className={cn(
                "px-5 py-2 text-sm font-medium transition-all rounded-lg",
                activeTab === 'categories' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted hover:text-text hover:bg-slate-200/50"
              )}
              onClick={() => setActiveTab('categories')}
            >
              Asset Categories
            </button>
            <button
              className={cn(
                "px-5 py-2 text-sm font-medium transition-all rounded-lg",
                activeTab === 'employees' 
                  ? "bg-white text-primary shadow-sm" 
                  : "text-muted hover:text-text hover:bg-slate-200/50"
              )}
              onClick={() => setActiveTab('employees')}
            >
              Employee Directory
            </button>
          </div>
        </div>
        
        <div className="p-6 md:p-8">
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories' && <AssetCategoriesTab />}
          {activeTab === 'employees' && <EmployeeDirectoryTab />}
        </div>
      </div>
    </div>
  );
};
