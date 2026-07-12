import React from 'react';
import { Search, Filter, Plus } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';

export const Assets = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Assets</h1>
          <p className="text-muted mt-1 text-sm">Register, search and track organizational assets.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Register Asset
        </Button>
      </div>

      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                placeholder="Search assets by ID, name, or serial number..." 
                className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={18} />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border min-h-[400px]">
        <CardContent className="p-0 flex items-center justify-center min-h-[400px]">
          <div className="text-center text-muted">
            <p>Asset directory table will be implemented here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

