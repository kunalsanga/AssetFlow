import React, { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { reportService, ReportDashboardSummary } from '../services/report.service';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from 'recharts';

export const Reports = () => {
  const [data, setData] = useState<ReportDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const result = await reportService.getSummary();
        setData(result);
      } catch (error) {
        console.error('Failed to fetch reports:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

  if (!data) {
    return <div className="flex items-center justify-center h-full">Failed to load reports data.</div>;
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-text">Reports & Analytics</h1>
          <p className="text-muted mt-1">Analyze asset utilization and operational trends.</p>
        </div>
        <Button className="gap-2" variant="outline">
          <Download size={18} />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Utilization by Department</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {data.utilization_by_department.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.utilization_by_department}>
                  <XAxis dataKey="department_name" stroke="#9ca3af" fontSize={12} />
                  <YAxis stroke="#9ca3af" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#f9fafb' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Bar dataKey="utilization_rate" fill="#10b981" radius={[4, 4, 0, 0]} name="Utilization %" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted italic">No utilization data available</div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Maintenance Frequency</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
             {data.maintenance_frequency.length > 0 ? (
               <ResponsiveContainer width="100%" height="100%">
                 <LineChart data={data.maintenance_frequency}>
                   <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                   <XAxis dataKey="month" stroke="#9ca3af" fontSize={12} />
                   <YAxis stroke="#9ca3af" fontSize={12} />
                   <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', color: '#f9fafb' }}
                   />
                   <Line type="monotone" dataKey="request_count" stroke="#f43f5e" strokeWidth={2} name="Requests" />
                 </LineChart>
               </ResponsiveContainer>
             ) : (
               <div className="flex h-full items-center justify-center text-muted italic">No maintenance data available</div>
             )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Most Used Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {data.most_used_assets.length > 0 ? (
              <ul className="space-y-3">
                {data.most_used_assets.map((asset, idx) => (
                  <li key={idx} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-text">{asset.name}</span> <span className="text-muted text-sm">{asset.asset_tag}</span>
                    </div>
                    <span className="text-sm font-semibold text-primary">{asset.usage_count} {asset.usage_type}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted italic">No data</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Idle Assets</CardTitle>
          </CardHeader>
          <CardContent>
            {data.idle_assets.length > 0 ? (
              <ul className="space-y-3">
                {data.idle_assets.map((asset, idx) => (
                  <li key={idx} className="flex justify-between items-center pb-2 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-text">{asset.name}</span> <span className="text-muted text-sm">{asset.asset_tag}</span>
                    </div>
                    <span className="text-sm text-yellow-500">Unused {asset.idle_days} days</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted italic">No idle assets found</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
          </CardHeader>
          <CardContent>
            {data.maintenance_due.length > 0 ? (
              <ul className="space-y-3">
                {data.maintenance_due.map((asset, idx) => (
                  <li key={idx} className="flex flex-col pb-2 border-b border-border last:border-0">
                    <div>
                      <span className="font-medium text-text">{asset.name}</span> <span className="text-muted text-sm">{asset.asset_tag}</span>
                    </div>
                    <span className="text-sm text-red-400">{asset.status_message}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-muted italic">All assets healthy</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
