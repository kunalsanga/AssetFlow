import api from './api';
import { mockMaintenanceRequests } from '../mock/maintenance.mock';
import { MaintenanceRequest } from '../types/maintenance';

export type { MaintenanceRequest } from '../types/maintenance';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockMaintenanceRequests;
  }
  
  const response = await api.get('/maintenance/');
  return response.data;
};

export const createMaintenanceRequest = async (request: {
  asset_id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduled_date?: string;
}): Promise<MaintenanceRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockMaintenanceRequests[0], id: Math.floor(Math.random() * 1000), ...request, status: 'PENDING' };
  }
  
  const response = await api.post('/maintenance/', request);
  return response.data;
};

export const approveMaintenanceRequest = async (id: number): Promise<MaintenanceRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockMaintenanceRequests[0], id, status: 'APPROVED' };
  }
  
  const response = await api.post(`/maintenance/${id}/approve`);
  return response.data;
};

export const assignTechnician = async (
  id: number,
  assignData: { scheduled_date: string }
): Promise<MaintenanceRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockMaintenanceRequests[0], id, ...assignData, status: 'IN_PROGRESS' };
  }
  
  const response = await api.post(`/maintenance/${id}/assign`, assignData);
  return response.data;
};

export const resolveMaintenanceRequest = async (
  id: number,
  resolveData: { status: 'AVAILABLE' | 'RETIRED' | 'LOST' }
): Promise<MaintenanceRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockMaintenanceRequests[0], id, status: 'RESOLVED' };
  }
  
  const response = await api.post(`/maintenance/${id}/resolve`, resolveData);
  return response.data;
};

export const rejectMaintenanceRequest = async (id: number): Promise<MaintenanceRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockMaintenanceRequests[0], id, status: 'REJECTED' };
  }
  
  const response = await api.post(`/maintenance/${id}/reject`);
  return response.data;
};
