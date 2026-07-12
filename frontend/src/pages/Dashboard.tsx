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
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold text-text">Dashboard</h1>
        <p className="text-muted mt-1">Overview of your organization's assets and resources.</p>
      </div>

      {/* Overdue Alert */}
      <div className="bg-error/10 border border-error/20 rounded-xl p-4 flex items-start gap-4">
        <div className="p-2 bg-error/20 text-error rounded-full shrink-0">
          <AlertTriangle size={20} />
        </div>
        <div className="flex-1">
          <h3 className="text-error font-semibold">Action Required: Overdue Returns</h3>
          <p className="text-sm text-error/80 mt-1">
            3 assets are overdue for return and require follow-up. Please review the pending returns list.
          </p>
        </div>
        <Button variant="outline" className="border-error/30 text-error hover:bg-error/20 shrink-0">
          Review
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard 
          title="Assets Available" 
          value="1,248" 
          icon={<Laptop size={20} />} 
          trend="+12 this month"
          trendDirection="up"
        />
        <StatCard 
          title="Assets Allocated" 
          value="892" 
          icon={<ArrowRightLeft size={20} />} 
          trend="71% allocation rate"
        />
        <StatCard 
          title="Maintenance Today" 
          value="14" 
          icon={<Wrench size={20} />} 
          trend="-3 from yesterday"
          trendDirection="down"
        />
        <StatCard 
          title="Active Bookings" 
          value="45" 
          icon={<CalendarClock size={20} />} 
          trend="8 rooms available"
        />
        <StatCard 
          title="Pending Transfers" 
          value="12" 
          icon={<Send size={20} />} 
          trend="4 require approval"
          trendDirection="neutral"
        />
        <StatCard 
          title="Upcoming Returns" 
          value="28" 
          icon={<Undo2 size={20} />} 
          trend="Next 7 days"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <Card className="h-full bg-surface border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <ActivityItem 
                icon={<ArrowRightLeft size={16} />}
                description={<span>Laptop <span className="font-medium text-text">AF-0014</span> allocated to Priya Shah</span>}
                time="2 min ago"
              />
              <ActivityItem 
                icon={<CalendarClock size={16} />}
                description={<span>Room <span className="font-medium text-text">B2</span> booking confirmed from 2:00 PM to 3:00 PM</span>}
                time="15 min ago"
              />
              <ActivityItem 
                icon={<Wrench size={16} />}
                description={<span>Projector <span className="font-medium text-text">AF-0062</span> maintenance resolved</span>}
                time="1 hour ago"
              />
              <ActivityItem 
                icon={<Send size={16} />}
                description={<span>Transfer request for <span className="font-medium text-text">AF-0114</span> submitted</span>}
                time="3 hours ago"
              />
              <ActivityItem 
                icon={<AlertTriangle size={16} className="text-warning" />}
                description={<span>Audit discrepancy flagged for <span className="font-medium text-text">AF-0238</span></span>}
                time="5 hours ago"
              />
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="h-full bg-surface border-border">
            <CardHeader className="border-b border-border pb-4">
              <CardTitle className="text-xl">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-3">
              <Button className="w-full justify-start gap-3 bg-background hover:bg-background/80 text-text border border-border h-12">
                <PlusCircle size={18} className="text-primary" />
                Register Asset
              </Button>
              <Button className="w-full justify-start gap-3 bg-background hover:bg-background/80 text-text border border-border h-12">
                <CalendarClock size={18} className="text-secondary" />
                Book Resource
              </Button>
              <Button className="w-full justify-start gap-3 bg-background hover:bg-background/80 text-text border border-border h-12">
                <Wrench size={18} className="text-warning" />
                Raise Maintenance Request
              </Button>
              <Button className="w-full justify-start gap-3 bg-background hover:bg-background/80 text-text border border-border h-12">
                <Send size={18} className="text-blue-400" />
                Request Transfer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
