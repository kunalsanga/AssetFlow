import React from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';

export const Allocation = () => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Allocation & Transfer</h1>
          <p className="text-muted mt-1">Manage asset allocation, transfers and returns.</p>
        </div>
        <Button className="gap-2 bg-secondary hover:bg-secondary/90">
          <ArrowRightLeft size={18} />
          New Transfer Request
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Asset Selector</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center">
                Asset selection form will be here.
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Current Allocation</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center">
                Current allocation info will display here.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card className="bg-surface border-border min-h-[500px]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Allocation History & Workflow</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center h-[400px] flex items-center justify-center">
                Transfer request workflow and history timeline will be implemented here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
