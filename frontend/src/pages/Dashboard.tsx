import React, { useState, useEffect } from 'react';
import { 
  Laptop, 
  ArrowRightLeft, 
  Wrench, 
  CalendarClock, 
  Send, 
  Undo2,
  AlertTriangle,
  PlusCircle,
  Clock
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { ActivityItem } from '../components/ui/ActivityItem';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { getDashboardStats, DashboardData, Activity } from '../services/dashboard.service';

export const Dashboard = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const dashboardData = await getDashboardStats();
      setData(dashboardData);
    } catch (err) {
      setError("Failed to load dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  const renderActivityDescription = (activity: Activity) => {
    switch(activity.type) {
      case 'allocation':
        return <span>Laptop <span className="font-semibold text-text">{activity.assetCode}</span> allocated to {activity.user}</span>;
      case 'booking':
        return <span>{activity.resourceName} <span className="font-semibold text-text">booking confirmed</span> from {activity.duration}</span>;
      case 'maintenance':
        return <span>Asset <span className="font-semibold text-text">{activity.assetCode}</span> maintenance {activity.status}</span>;
      case 'transfer':
        return <span>Transfer request for <span className="font-semibold text-text">{activity.assetCode}</span> {activity.status}</span>;
      case 'audit':
        return <span>Audit discrepancy <span className="font-semibold text-text">{activity.status}</span> for {activity.assetCode}</span>;
      default:
        return <span>Activity recorded</span>;
    }
  };

  const renderActivityIcon = (type: string) => {
    switch(type) {
      case 'allocation': return <ArrowRightLeft size={18} />;
      case 'booking': return <CalendarClock size={18} />;
      case 'maintenance': return <Wrench size={18} />;
      case 'transfer': return <Send size={18} />;
      case 'audit': return <AlertTriangle size={18} className="text-amber-600" />;
      default: return <Clock size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-muted text-lg animate-pulse">Loading dashboard statistics...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-rose-600 bg-rose-50 p-6 rounded-xl border border-rose-200">
          <AlertTriangle size={32} className="mx-auto mb-3" />
          <p className="font-semibold text-center">{error || "Failed to load"}</p>
          <Button onClick={loadDashboard} variant="outline" className="mt-4 w-full bg-white text-rose-700 border-rose-200">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-[28px] font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-muted mt-1 text-sm">Overview of your organization's assets and resources.</p>
      </div>

      {/* Overdue Alert */}
      {data.overdueAlert.active && (
        <div className="bg-rose-50 border-none rounded-2xl p-5 flex items-start gap-4 shadow-sm animate-in fade-in slide-in-from-bottom-2">
          <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
            <AlertTriangle size={22} />
          </div>
          <div className="flex-1 pt-0.5">
            <h3 className="text-rose-800 font-semibold">Action Required: Overdue Returns</h3>
            <p className="text-sm text-rose-600/90 mt-1">
              {data.overdueAlert.message}
            </p>
          </div>
          <Button variant="outline" className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 shrink-0 shadow-sm rounded-xl">
            Review
          </Button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
        <StatCard 
          title="Assets Available" 
          value={data.stats.assetsAvailable.value} 
          icon={<Laptop size={20} />} 
          trend={data.stats.assetsAvailable.trend}
          trendDirection={data.stats.assetsAvailable.trendDirection}
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          className="border-none bg-blue-50/50"
        />
        <StatCard 
          title="Assets Allocated" 
          value={data.stats.assetsAllocated.value} 
          icon={<ArrowRightLeft size={20} />} 
          trend={data.stats.assetsAllocated.trend}
          trendDirection={data.stats.assetsAllocated.trendDirection}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          className="border-none bg-purple-50/50"
        />
        <StatCard 
          title="Maintenance Today" 
          value={data.stats.maintenanceToday.value} 
          icon={<Wrench size={20} />} 
          trend={data.stats.maintenanceToday.trend}
          trendDirection={data.stats.maintenanceToday.trendDirection}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          className="border-none bg-amber-50/50"
        />
        <StatCard 
          title="Active Bookings" 
          value={data.stats.activeBookings.value} 
          icon={<CalendarClock size={20} />} 
          trend={data.stats.activeBookings.trend}
          trendDirection={data.stats.activeBookings.trendDirection}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          className="border-none bg-emerald-50/50"
        />
        <StatCard 
          title="Pending Transfers" 
          value={data.stats.pendingTransfers.value} 
          icon={<Send size={20} />} 
          trend={data.stats.pendingTransfers.trend}
          trendDirection={data.stats.pendingTransfers.trendDirection}
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          className="border-none bg-indigo-50/50"
        />
        <StatCard 
          title="Upcoming Returns" 
          value={data.stats.upcomingReturns.value} 
          icon={<Undo2 size={20} />} 
          trend={data.stats.upcomingReturns.trend}
          trendDirection={data.stats.upcomingReturns.trendDirection}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          className="border-none bg-rose-50/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200 fill-mode-both">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md">
            <CardHeader className="border-b border-border/40 pb-5">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {data.recentActivities.map(activity => (
                <ActivityItem 
                  key={activity.id}
                  icon={renderActivityIcon(activity.type)}
                  description={renderActivityDescription(activity)}
                  time={activity.time}
                />
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full border-none shadow-md bg-gradient-to-br from-surface to-slate-50">
            <CardHeader className="border-b border-border/40 pb-5">
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 grid grid-cols-1 gap-4">
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlusCircle size={24} />
                </div>
                <div>
                  <div className="font-semibold text-text">Register Asset</div>
                  <div className="text-xs text-muted mt-0.5">Add new equipment to inventory</div>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-secondary/30 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CalendarClock size={24} />
                </div>
                <div>
                  <div className="font-semibold text-text">Book Resource</div>
                  <div className="text-xs text-muted mt-0.5">Reserve rooms or shared items</div>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-orange-300 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Wrench size={24} />
                </div>
                <div>
                  <div className="font-semibold text-text">Maintenance</div>
                  <div className="text-xs text-muted mt-0.5">Report an issue or repair</div>
                </div>
              </button>
              
              <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-blue-300 hover:shadow-md transition-all text-left group">
                <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Send size={24} />
                </div>
                <div>
                  <div className="font-semibold text-text">Request Transfer</div>
                  <div className="text-xs text-muted mt-0.5">Move assets between users</div>
                </div>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
