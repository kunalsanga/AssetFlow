import { api } from './api';

export interface DepartmentUtilization {
  department_name: string;
  total_assets: number;
  allocated_assets: number;
  utilization_rate: number;
}

export interface MaintenanceFrequency {
  month: string;
  request_count: number;
}

export interface AssetUsageStat {
  asset_tag: string;
  name: string;
  usage_count: number;
  usage_type: string;
}

export interface IdleAssetStat {
  asset_tag: string;
  name: string;
  idle_days: number;
}

export interface MaintenanceDueStat {
  asset_tag: string;
  name: string;
  status_message: string;
}

export interface ReportDashboardSummary {
  utilization_by_department: DepartmentUtilization[];
  maintenance_frequency: MaintenanceFrequency[];
  most_used_assets: AssetUsageStat[];
  idle_assets: IdleAssetStat[];
  maintenance_due: MaintenanceDueStat[];
}

export const reportService = {
  getSummary: async (): Promise<ReportDashboardSummary> => {
    const response = await api.get('/reports/summary');
    return response.data;
  },
};
