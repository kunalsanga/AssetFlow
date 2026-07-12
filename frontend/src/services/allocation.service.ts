import api from './api';
import { mockAllocations, mockTransferRequests } from '../mock/allocation.mock';
import { mockAssets } from '../mock/assets.mock';
import { Asset } from '../types/asset';
import { Allocation, TransferRequest, User } from '../types/allocation';

export type { Asset, User, Allocation, TransferRequest } from '../types/allocation';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getAssets = async (): Promise<Asset[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAssets;
  }
  const response = await api.get('/assets/');
  return response.data;
};

export const createAsset = async (asset: Omit<Asset, 'id' | 'status'>): Promise<Asset> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAssets[0], id: Math.floor(Math.random() * 1000), ...asset, status: 'AVAILABLE' };
  }
  const response = await api.post('/assets/', asset);
  return response.data;
};

export const getAllocations = async (): Promise<Allocation[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAllocations;
  }
  const response = await api.get('/allocations/');
  return response.data;
};

export const createAllocation = async (allocation: {
  asset_id: number;
  allocated_to_type: 'user' | 'department';
  allocated_to_id: number;
  due_date: string;
}): Promise<Allocation> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAllocations[0], id: Math.floor(Math.random() * 1000), ...allocation, status: 'active' };
  }
  const response = await api.post('/allocations/', allocation);
  return response.data;
};

export const returnAllocation = async (
  id: number,
  returnData: { return_condition?: string }
): Promise<Allocation> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAllocations[0], id, status: 'returned', returned_at: new Date().toISOString(), ...returnData };
  }
  const response = await api.post(`/allocations/${id}/return`, returnData);
  return response.data;
};

export const raiseTransferRequest = async (transfer: {
  allocation_id: number;
  target_type: 'user' | 'department';
  target_id: number;
}): Promise<TransferRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockTransferRequests[0], id: Math.floor(Math.random() * 1000), ...transfer, status: 'pending' };
  }
  const response = await api.post('/allocations/transfer', transfer);
  return response.data;
};

export const getTransferRequests = async (): Promise<TransferRequest[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockTransferRequests;
  }
  const response = await api.get('/allocations/transfers');
  return response.data;
};

export const approveTransferRequest = async (id: number): Promise<Allocation> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAllocations[0], status: 'transferred' };
  }
  const response = await api.post(`/allocations/transfers/${id}/approve`);
  return response.data;
};

export const rejectTransferRequest = async (id: number): Promise<TransferRequest> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockTransferRequests[0], id, status: 'rejected' };
  }
  const response = await api.post(`/allocations/transfers/${id}/reject`);
  return response.data;
};
