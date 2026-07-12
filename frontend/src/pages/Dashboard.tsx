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
  Clock,
  Info
} from 'lucide-react';
import { StatCard } from '../components/ui/StatCard';
import { ActivityItem } from '../components/ui/ActivityItem';
import { Button } from '../components/common/Button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/common/Card';
import { getDashboardData, DashboardData } from '../services/dashboard.service';
import { useAuth } from '../context/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await getDashboardData();
        setData(dashboardData);
      } catch (err: any) {
        console.error(err);
        setError('Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin text-primary">
          <Clock size={40} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center bg-error/10 text-error rounded-xl max-w-lg mx-auto mt-20">
        <AlertTriangle size={48} className="mx-auto mb-4 opacity-80" />
        <h2 className="text-xl font-bold mb-2">Dashboard Error</h2>
        <p>{error || 'Unable to fetch dashboard.'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Welcome, {user?.full_name || user?.email}</h1>
          <p className="text-muted mt-1 text-sm">
            Overview of your organization's assets and resources. Role: <span className="font-semibold text-primary/80">{data.user.role}</span>
          </p>
        </div>
      </div>

      {/* Dynamic Alerts */}
      {data.alerts.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.alerts.map(alert => (
            <div 
              key={alert.id} 
              className={`border-none rounded-2xl p-5 flex items-start gap-4 shadow-sm ${
                alert.severity === 'HIGH' ? 'bg-rose-50' : 
                alert.severity === 'MEDIUM' ? 'bg-amber-50' : 'bg-blue-50'
              }`}
            >
              <div className={`p-2.5 rounded-full shrink-0 ${
                alert.severity === 'HIGH' ? 'bg-rose-100 text-rose-600' : 
                alert.severity === 'MEDIUM' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
              }`}>
                {alert.severity === 'INFO' ? <Info size={22} /> : <AlertTriangle size={22} />}
              </div>
              <div className="flex-1 pt-0.5">
                <h3 className={`font-semibold ${
                  alert.severity === 'HIGH' ? 'text-rose-800' : 
                  alert.severity === 'MEDIUM' ? 'text-amber-800' : 'text-blue-800'
                }`}>
                  {alert.title}
                </h3>
                <p className={`text-sm mt-1 ${
                  alert.severity === 'HIGH' ? 'text-rose-600/90' : 
                  alert.severity === 'MEDIUM' ? 'text-amber-700/90' : 'text-blue-700/90'
                }`}>
                  {alert.message}
                </p>
              </div>
              <Button variant="outline" className={`shrink-0 shadow-sm rounded-xl bg-white ${
                alert.severity === 'HIGH' ? 'border-rose-200 text-rose-700 hover:bg-rose-50' : 
                alert.severity === 'MEDIUM' ? 'border-amber-200 text-amber-700 hover:bg-amber-50' : 'border-blue-200 text-blue-700 hover:bg-blue-50'
              }`}>
                View Details
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Assets Available" 
          value={data.summary.assetsAvailable.toLocaleString()} 
          icon={<Laptop size={20} />} 
          trend="In inventory"
          trendDirection="neutral"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          className="border-none bg-blue-50/50"
        />
        <StatCard 
          title="Assets Allocated" 
          value={data.summary.assetsAllocated.toLocaleString()} 
          icon={<ArrowRightLeft size={20} />} 
          trend="Currently in use"
          trendDirection="neutral"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          className="border-none bg-purple-50/50"
        />
        <StatCard 
          title="Maintenance Active" 
          value={data.summary.maintenanceToday.toLocaleString()} 
          icon={<Wrench size={20} />} 
          trend="Requests pending/active"
          trendDirection="neutral"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          className="border-none bg-amber-50/50"
        />
        <StatCard 
          title="Active Bookings" 
          value={data.summary.activeBookings.toLocaleString()} 
          icon={<CalendarClock size={20} />} 
          trend="Ongoing reservations"
          trendDirection="neutral"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          className="border-none bg-emerald-50/50"
        />
        <StatCard 
          title="Pending Transfers" 
          value={data.summary.pendingTransfers.toLocaleString()} 
          icon={<Send size={20} />} 
          trend="Awaiting approval"
          trendDirection="neutral"
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          className="border-none bg-indigo-50/50"
        />
        <StatCard 
          title="Overdue Returns" 
          value={data.summary.overdueReturns.toLocaleString()} 
          icon={<Undo2 size={20} />} 
          trend={data.summary.overdueReturns > 0 ? "Requires action" : "All good"}
          trendDirection={data.summary.overdueReturns > 0 ? "down" : "up"}
          iconBgColor="bg-rose-100"
          iconColor="text-rose-600"
          className="border-none bg-rose-50/50"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full border-none shadow-md">
            <CardHeader className="border-b border-border/40 pb-5">
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {data.recentActivities.length === 0 ? (
                <div className="text-muted text-sm py-4">No recent activities found.</div>
              ) : (
                data.recentActivities.map(activity => {
                  let Icon = Info;
                  let iconColor = "text-primary";
                  
                  if (activity.type === 'ALLOCATION') { Icon = ArrowRightLeft; iconColor = "text-purple-500"; }
                  else if (activity.type === 'BOOKING') { Icon = CalendarClock; iconColor = "text-emerald-500"; }
                  else if (activity.type === 'MAINTENANCE') { Icon = Wrench; iconColor = "text-amber-500"; }
                  else if (activity.type === 'TRANSFER') { Icon = Send; iconColor = "text-indigo-500"; }
                  else if (activity.type === 'AUDIT') { Icon = AlertTriangle; iconColor = "text-rose-500"; }
                  
                  return (
                    <ActivityItem 
                      key={activity.id}
                      icon={<Icon size={18} className={iconColor} />}
                      description={<span>{activity.title}</span>}
                      time={new Date(activity.createdAt).toLocaleString()}
                    />
                  );
                })
              )}
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
              {data.quickActions.registerAsset && (
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-primary/30 hover:shadow-md transition-all text-left group">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <PlusCircle size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-text">Register Asset</div>
                    <div className="text-xs text-muted mt-0.5">Add new equipment to inventory</div>
                  </div>
                </button>
              )}
              
              {data.quickActions.bookResource && (
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-secondary/30 hover:shadow-md transition-all text-left group">
                  <div className="w-12 h-12 rounded-full bg-secondary/10 text-secondary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <CalendarClock size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-text">Book Resource</div>
                    <div className="text-xs text-muted mt-0.5">Reserve rooms or shared items</div>
                  </div>
                </button>
              )}
              
              {data.quickActions.raiseMaintenance && (
                <button className="flex items-center gap-4 p-4 rounded-2xl bg-white border border-border/40 hover:border-orange-300 hover:shadow-md transition-all text-left group">
                  <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Wrench size={24} />
                  </div>
                  <div>
                    <div className="font-semibold text-text">Maintenance</div>
                    <div className="text-xs text-muted mt-0.5">Report an issue or repair</div>
                  </div>
                </button>
              )}
              
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

