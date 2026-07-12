import api from './api';
import { mockReportSummary } from '../mock/report.mock';
import { ReportDashboardSummary } from '../types/report';

export type { 
  ReportDashboardSummary, 
  DepartmentUtilization, 
  MaintenanceFrequency, 
  AssetUsageStat, 
  IdleAssetStat, 
  MaintenanceDueStat 
} from '../types/report';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const reportService = {
  getSummary: async (): Promise<ReportDashboardSummary> => {
    if (USE_MOCK_DATA) {
      await new Promise(resolve => setTimeout(resolve, 500));
      return mockReportSummary;
    }
    
    const response = await api.get('/reports/summary');
    return response.data;
  },
};
