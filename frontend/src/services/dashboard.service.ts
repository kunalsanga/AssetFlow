import api from './api';

export interface DashboardSummary {
  assetsAvailable: number;
  assetsAllocated: number;
  maintenanceToday: number;
  activeBookings: number;
  pendingTransfers: number;
  upcomingReturns: number;
  overdueReturns: number;
}

export interface DashboardAlert {
  id: number;
  severity: 'HIGH' | 'MEDIUM' | 'INFO';
  title: string;
  message: string;
}

export interface RecentActivity {
  id: number;
  title: string;
  type: string;
  createdAt: string;
}

export interface QuickActions {
  registerAsset: boolean;
  bookResource: boolean;
  raiseMaintenance: boolean;
}

export interface DashboardUser {
  id: number;
  name: string;
  role: string;
  department?: string;
}

export interface DashboardData {
  summary: DashboardSummary;
  alerts: DashboardAlert[];
  recentActivities: RecentActivity[];
  quickActions: QuickActions;
  user: DashboardUser;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}

export const getDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardResponse>('/dashboard');
  return response.data.data;
};
