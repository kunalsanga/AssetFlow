import api from './api';
import { mockDashboardData } from '../mock/dashboard.mock';
import { DashboardData } from '../types/dashboard';

// Re-export types for backward compatibility with existing components
export type { DashboardData, Activity, DashboardStats, StatItem, OverdueAlert } from '../types/dashboard';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getDashboardStats = async (): Promise<DashboardData> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDashboardData;
  }
  
  const response = await api.get('/dashboard');
  return response.data;
};
