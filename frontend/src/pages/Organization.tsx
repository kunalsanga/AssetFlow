import React, { useState } from 'react';
import { DepartmentsTab } from './organization/DepartmentsTab';
import { AssetCategoriesTab } from './organization/AssetCategoriesTab';
import { EmployeeDirectoryTab } from './organization/EmployeeDirectoryTab';
import { cn } from '../lib/utils';

type Tab = 'departments' | 'categories' | 'employees';

export const Organization = () => {
  const [activeTab, setActiveTab] = useState<Tab>('departments');
  const [isAddOpen, setIsAddOpen] = useState(false);

  const tabs: { key: Tab; label: string }[] = [
    { key: 'departments', label: 'Departments' },
    { key: 'categories', label: 'Categories' },
    { key: 'employees', label: 'Employee' },
  ];

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-12">
      {/* Page Header */}
      <div>
        <h1 className="text-[22px] font-bold text-text tracking-tight">Organization Setup</h1>
        <p className="text-muted text-sm mt-0.5">Admin only · Manage departments, categories, and employees.</p>
      </div>

      {/* Main Card */}
      <div className="bg-surface border border-border/60 rounded-2xl overflow-hidden shadow-sm">

        {/* Tab Bar — matches wireframe: flat bordered buttons + Add on right */}
        <div className="flex items-center gap-2 px-5 pt-4 pb-0 border-b border-border/60">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-5 py-2 text-sm font-medium rounded-t-lg border border-b-0 transition-all',
                activeTab === tab.key
                  ? 'bg-surface border-border/60 text-text shadow-sm -mb-px relative z-10'
                  : 'bg-slate-50 border-transparent text-muted hover:text-text hover:border-border/40'
              )}
            >
              {tab.label}
            </button>
          ))}

          {/* + Add button pushed to the right */}
          <div className="ml-auto pb-2">
            <button
              onClick={() => setIsAddOpen(true)}
              className="px-4 py-1.5 text-sm font-semibold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-sm"
            >
              + Add
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'departments' && <DepartmentsTab onAdd={isAddOpen} onAddClose={() => setIsAddOpen(false)} />}
          {activeTab === 'categories' && <AssetCategoriesTab />}
          {activeTab === 'employees' && <EmployeeDirectoryTab />}
        </div>

        {/* Info footnote — matches wireframe */}
        {activeTab === 'departments' && (
          <div className="px-6 pb-5">
            <p className="text-xs text-muted italic border-t border-border/40 pt-4">
              Editing a department here also drives the picklist in Asset Registration &amp; Allocation screens.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
