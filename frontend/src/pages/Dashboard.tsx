import React from 'react';
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

export const Dashboard = () => {
  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div>
        <h1 className="text-[28px] font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-muted mt-1 text-sm">Overview of your organization's assets and resources.</p>
      </div>

      {/* Overdue Alert */}
      <div className="bg-rose-50 border-none rounded-2xl p-5 flex items-start gap-4 shadow-sm">
        <div className="p-2.5 bg-rose-100 text-rose-600 rounded-full shrink-0">
          <AlertTriangle size={22} />
        </div>
        <div className="flex-1 pt-0.5">
          <h3 className="text-rose-800 font-semibold">Action Required: Overdue Returns</h3>
          <p className="text-sm text-rose-600/90 mt-1">
            3 assets are overdue for return and require follow-up. Please review the pending returns list.
          </p>
        </div>
        <Button variant="outline" className="border-rose-200 text-rose-700 bg-white hover:bg-rose-50 shrink-0 shadow-sm rounded-xl">
          Review
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Assets Available" 
          value="1,248" 
          icon={<Laptop size={20} />} 
          trend="+12 this month"
          trendDirection="up"
          iconBgColor="bg-blue-100"
          iconColor="text-blue-600"
          className="border-none bg-blue-50/50"
        />
        <StatCard 
          title="Assets Allocated" 
          value="892" 
          icon={<ArrowRightLeft size={20} />} 
          trend="71% allocation rate"
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          className="border-none bg-purple-50/50"
        />
        <StatCard 
          title="Maintenance Today" 
          value="14" 
          icon={<Wrench size={20} />} 
          trend="-3 from yesterday"
          trendDirection="down"
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          className="border-none bg-amber-50/50"
        />
        <StatCard 
          title="Active Bookings" 
          value="45" 
          icon={<CalendarClock size={20} />} 
          trend="8 rooms available"
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          className="border-none bg-emerald-50/50"
        />
        <StatCard 
          title="Pending Transfers" 
          value="12" 
          icon={<Send size={20} />} 
          trend="4 require approval"
          trendDirection="neutral"
          iconBgColor="bg-indigo-100"
          iconColor="text-indigo-600"
          className="border-none bg-indigo-50/50"
        />
        <StatCard 
          title="Upcoming Returns" 
          value="28" 
          icon={<Undo2 size={20} />} 
          trend="Next 7 days"
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
              <ActivityItem 
                icon={<ArrowRightLeft size={18} />}
                description={<span>Laptop <span className="font-semibold text-text">AF-0014</span> allocated to Priya Shah</span>}
                time="2 min ago"
              />
              <ActivityItem 
                icon={<CalendarClock size={18} />}
                description={<span>Room <span className="font-semibold text-text">B2</span> booking confirmed from 2:00 PM to 3:00 PM</span>}
                time="15 min ago"
              />
              <ActivityItem 
                icon={<Wrench size={18} />}
                description={<span>Projector <span className="font-semibold text-text">AF-0062</span> maintenance resolved</span>}
                time="1 hour ago"
              />
              <ActivityItem 
                icon={<Send size={18} />}
                description={<span>Transfer request for <span className="font-semibold text-text">AF-0114</span> submitted</span>}
                time="3 hours ago"
              />
              <ActivityItem 
                icon={<AlertTriangle size={18} className="text-amber-600" />}
                description={<span>Audit discrepancy flagged for <span className="font-semibold text-text">AF-0238</span></span>}
                time="5 hours ago"
              />
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
