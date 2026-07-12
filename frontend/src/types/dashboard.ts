export interface OverdueAlert {
  active: boolean;
  count: number;
  message: string;
}

export interface StatItem {
  value: string;
  trend: string;
  trendDirection: 'up' | 'down' | 'neutral';
}

export interface DashboardStats {
  assetsAvailable: StatItem;
  assetsAllocated: StatItem;
  maintenanceToday: StatItem;
  activeBookings: StatItem;
  pendingTransfers: StatItem;
  upcomingReturns: StatItem;
}

export interface Activity {
  id: number;
  type: 'allocation' | 'booking' | 'maintenance' | 'transfer' | 'audit';
  assetCode?: string;
  resourceName?: string;
  user?: string;
  duration?: string;
  status?: string;
  time: string;
}

export interface DashboardData {
  overdueAlert: OverdueAlert;
  stats: DashboardStats;
  recentActivities: Activity[];
}
