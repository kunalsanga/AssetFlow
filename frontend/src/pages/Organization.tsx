import React, { useState } from 'react';
import { DepartmentsTab } from './organization/DepartmentsTab';
import { AssetCategoriesTab } from './organization/AssetCategoriesTab';
import { EmployeeDirectoryTab } from './organization/EmployeeDirectoryTab';
import { cn } from '../lib/utils';

export const Organization = () => {
  const [activeTab, setActiveTab] = useState<'departments' | 'categories' | 'employees'>('departments');

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-text">Organization Setup</h1>
        <p className="text-muted mt-1">Manage departments, asset categories, employees and organizational master data.</p>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex border-b border-border px-4">
          <button
            className={cn(
              "px-6 py-4 text-sm font-medium transition-colors border-b-2 relative top-[1px]",
              activeTab === 'departments' 
                ? "border-primary text-primary" 
                : "border-transparent text-muted hover:text-text hover:border-border"
            )}
            onClick={() => setActiveTab('departments')}
          >
            Departments
          </button>
          <button
            className={cn(
              "px-6 py-4 text-sm font-medium transition-colors border-b-2 relative top-[1px]",
              activeTab === 'categories' 
                ? "border-primary text-primary" 
                : "border-transparent text-muted hover:text-text hover:border-border"
            )}
            onClick={() => setActiveTab('categories')}
          >
            Asset Categories
          </button>
          <button
            className={cn(
              "px-6 py-4 text-sm font-medium transition-colors border-b-2 relative top-[1px]",
              activeTab === 'employees' 
                ? "border-primary text-primary" 
                : "border-transparent text-muted hover:text-text hover:border-border"
            )}
            onClick={() => setActiveTab('employees')}
          >
            Employee Directory
          </button>
        </div>
        
        <div className="p-6">
          {activeTab === 'departments' && <DepartmentsTab />}
          {activeTab === 'categories' && <AssetCategoriesTab />}
          {activeTab === 'employees' && <EmployeeDirectoryTab />}
        </div>
      </div>
    </div>
  );
};
