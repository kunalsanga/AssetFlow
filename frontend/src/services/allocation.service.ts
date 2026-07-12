import api from './api';

export interface Asset {
  id: number;
  name: string;
  serial_number: string;
  model: string;
  status: 'available' | 'allocated' | 'under_maintenance' | 'lost' | 'retired';
  description?: string;
}

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'asset_manager' | 'department_head' | 'employee';
}

export interface Allocation {
  id: number;
  asset_id: number;
  allocated_to_type: 'user' | 'department';
  allocated_to_id: number;
  allocated_by_id: number;
  allocated_at: string;
  due_date: string;
  returned_at?: string;
  return_condition?: string;
  status: 'active' | 'returned' | 'transferred' | 'overdue';
  asset?: Asset;
  allocated_by?: User;
}

export interface TransferRequest {
  id: number;
  allocation_id: number;
  requested_by_id: number;
  target_type: 'user' | 'department';
  target_id: number;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  resolved_at?: string;
  requested_by?: User;
  allocation?: Allocation;
}

export const getAssets = async (): Promise<Asset[]> => {
  const response = await api.get('/assets/');
  return response.data;
};

export const createAsset = async (asset: Omit<Asset, 'id' | 'status'>): Promise<Asset> => {
  const response = await api.post('/assets/', asset);
  return response.data;
};

export const getAllocations = async (): Promise<Allocation[]> => {
  const response = await api.get('/allocations/');
  return response.data;
};

export const createAllocation = async (allocation: {
  asset_id: number;
  allocated_to_type: 'user' | 'department';
  allocated_to_id: number;
  due_date: string;
}): Promise<Allocation> => {
  const response = await api.post('/allocations/', allocation);
  return response.data;
};

export const returnAllocation = async (
  id: number,
  returnData: { return_condition?: string }
): Promise<Allocation> => {
  const response = await api.post(`/allocations/${id}/return`, returnData);
  return response.data;
};

export const raiseTransferRequest = async (transfer: {
  allocation_id: number;
  target_type: 'user' | 'department';
  target_id: number;
}): Promise<TransferRequest> => {
  const response = await api.post('/allocations/transfer', transfer);
  return response.data;
};

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  const response = await api.get('/allocations/transfers');
  return response.data;
};

export const approveTransferRequest = async (id: number): Promise<Allocation> => {
  const response = await api.post(`/allocations/transfers/${id}/approve`);
  return response.data;
};

export const rejectTransferRequest = async (id: number): Promise<TransferRequest> => {
  const response = await api.post(`/allocations/transfers/${id}/reject`);
  return response.data;
};
