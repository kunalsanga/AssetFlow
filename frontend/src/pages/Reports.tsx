import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';

export const Reports = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Reports & Analytics</h1>
          <p className="text-muted mt-1 text-sm">Analyze asset utilization and operational trends.</p>
        </div>
        <Button className="gap-2" variant="outline">
          <Download size={18} />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-surface border-border lg:col-span-2 min-h-[300px]">
          <CardHeader>
            <CardTitle>Asset Utilization</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] text-muted italic">
            Utilization chart placeholder
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-border min-h-[300px]">
          <CardHeader>
            <CardTitle>Maintenance Frequency</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] text-muted italic">
            Maintenance pie chart placeholder
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-border min-h-[300px]">
          <CardHeader>
            <CardTitle>Department Allocation Summary</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] text-muted italic">
            Bar chart placeholder
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-border min-h-[300px]">
          <CardHeader>
            <CardTitle>Resource Booking Heatmap</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] text-muted italic">
            Heatmap placeholder
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-border min-h-[300px]">
          <CardHeader>
            <CardTitle>Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[200px] text-muted italic">
            Lists of most used, idle, and due for maintenance assets
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

