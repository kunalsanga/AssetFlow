import api from './api';
import { Asset, User } from './allocation.service';

export interface MaintenanceRequest {
  id: number;
  asset_id: number;
  requester_id: number;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  scheduled_date?: string;
  asset?: Asset;
  requester?: User;
}

export const getMaintenanceRequests = async (): Promise<MaintenanceRequest[]> => {
  const response = await api.get('/maintenance/');
  return response.data;
};

export const createMaintenanceRequest = async (request: {
  asset_id: number;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  scheduled_date?: string;
}): Promise<MaintenanceRequest> => {
  const response = await api.post('/maintenance/', request);
  return response.data;
};

export const approveMaintenanceRequest = async (id: number): Promise<MaintenanceRequest> => {
  const response = await api.post(`/maintenance/${id}/approve`);
  return response.data;
};

export const assignTechnician = async (
  id: number,
  assignData: { scheduled_date: string }
): Promise<MaintenanceRequest> => {
  const response = await api.post(`/maintenance/${id}/assign`, assignData);
  return response.data;
};

export const resolveMaintenanceRequest = async (
  id: number,
  resolveData: { status: 'AVAILABLE' | 'RETIRED' | 'LOST' }
): Promise<MaintenanceRequest> => {
  const response = await api.post(`/maintenance/${id}/resolve`, resolveData);
  return response.data;
};

export const rejectMaintenanceRequest = async (id: number): Promise<MaintenanceRequest> => {
  const response = await api.post(`/maintenance/${id}/reject`);
  return response.data;
};
