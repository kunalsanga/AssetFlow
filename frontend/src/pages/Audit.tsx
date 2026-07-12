import React from 'react';
import { Play } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';

export const Audit = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Asset Audit</h1>
          <p className="text-muted mt-1 text-sm">Run structured asset verification cycles.</p>
        </div>
        <Button className="gap-2" variant="outline">
          <Play size={18} />
          Start Audit Cycle
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 space-y-6">
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Active Cycle Info</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center min-h-[150px] flex items-center justify-center">
                Cycle details
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface border-border">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Auditor</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center min-h-[100px] flex items-center justify-center">
                Auditor assignment
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-surface border-border border-error/30 bg-error/5">
            <CardContent className="p-6">
              <h3 className="font-semibold text-error mb-4">Discrepancy Summary</h3>
              <div className="p-4 bg-background border border-error/20 rounded-md text-sm text-muted text-center min-h-[150px] flex items-center justify-center">
                Missing/Mismatch stats
              </div>
            </CardContent>
          </Card>
          
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white border-none">
            Close Audit Cycle
          </Button>
        </div>

        <div className="lg:col-span-3">
          <Card className="bg-surface border-border min-h-[600px]">
            <CardContent className="p-6">
              <h3 className="font-semibold text-text mb-4">Asset Verification List</h3>
              <div className="p-4 bg-background border border-border rounded-md text-sm text-muted text-center h-[500px] flex items-center justify-center">
                Table of assets to be verified will be implemented here.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

