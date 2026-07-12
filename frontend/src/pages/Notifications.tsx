import React, { useState, useEffect } from 'react';
import { Bell, AlertTriangle, CheckCircle, CalendarClock, Info } from 'lucide-react';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { cn } from '../lib/utils';
import { getNotifications, Notification } from '../services/notification.service';

export const Notifications = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'alert' | 'approval' | 'booking'>('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getNotifications();
      setNotifications(data);
    } catch (err) {
      setError("Failed to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'alert', label: 'Alerts' },
    { id: 'approval', label: 'Approvals' },
    { id: 'booking', label: 'Bookings' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'alert': return <AlertTriangle size={20} className="text-amber-500" />;
      case 'approval': return <CheckCircle size={20} className="text-blue-500" />;
      case 'booking': return <CalendarClock size={20} className="text-emerald-500" />;
      default: return <Info size={20} className="text-primary" />;
    }
  };

  const getBgStyle = (type: string, isRead: boolean) => {
    if (isRead) return "bg-background/50 hover:bg-background border-transparent";
    switch (type) {
      case 'alert': return "bg-amber-50/50 border-amber-200/50 hover:bg-amber-50";
      case 'approval': return "bg-blue-50/50 border-blue-200/50 hover:bg-blue-50";
      case 'booking': return "bg-emerald-50/50 border-emerald-200/50 hover:bg-emerald-50";
      default: return "bg-slate-50/50 border-slate-200/50 hover:bg-slate-50";
    }
  };

  const filtered = activeTab === 'all' 
    ? notifications 
    : notifications.filter(n => n.type === activeTab);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 text-primary rounded-xl">
          <Bell size={24} />
        </div>
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Activity Logs & Notifications</h1>
          <p className="text-muted mt-1 text-sm">Track system activity, alerts and workflow updates.</p>
        </div>
      </div>

      <Card className="bg-surface border-border">
        <div className="flex border-b border-border px-2 pt-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap",
                activeTab === tab.id 
                  ? "border-primary text-primary" 
                  : "border-transparent text-muted hover:text-text hover:border-border"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        
        {loading ? (
          <CardContent className="p-0 min-h-[500px] flex items-center justify-center">
            <div className="text-muted text-lg animate-pulse">Loading notifications...</div>
          </CardContent>
        ) : error ? (
          <CardContent className="p-0 min-h-[500px] flex items-center justify-center">
            <div className="text-rose-600 bg-rose-50 p-6 rounded-xl border border-rose-200 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3" />
              <p className="font-semibold">{error}</p>
              <Button onClick={loadNotifications} variant="outline" className="mt-4 bg-white text-rose-700 border-rose-200">Retry</Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0 min-h-[500px]">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[400px] text-muted">
                <Bell size={48} className="text-muted/30 mb-4" />
                <p>No notifications to show for {activeTab}.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filtered.map(notification => (
                  <div 
                    key={notification.id} 
                    className={cn(
                      "p-4 transition-colors border-l-4 flex gap-4 items-start",
                      getBgStyle(notification.type, notification.isRead)
                    )}
                  >
                    <div className="mt-1 flex-shrink-0">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <h4 className={cn("text-sm font-semibold", notification.isRead ? "text-text" : "text-text")}>
                          {notification.title}
                        </h4>
                        <span className="text-xs text-muted whitespace-nowrap ml-2">
                          {notification.time}
                        </span>
                      </div>
                      <p className={cn("text-sm mt-1", notification.isRead ? "text-muted" : "text-text")}>
                        {notification.message}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="flex-shrink-0 mt-2">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
};
