import api from './api';
import { Asset, User } from './allocation.service';

export interface AuditCycle {
  id: number;
  name: string;
  start_date: string;
  end_date?: string;
  status: 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CLOSED';
  auditor_id: number;
  auditor?: User;
}

export interface AuditItem {
  id: number;
  cycle_id: number;
  asset_id: number;
  status: 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED';
  notes?: string;
  verified_at?: string;
  asset?: Asset;
}

export const getAuditCycles = async (): Promise<AuditCycle[]> => {
  const response = await api.get('/audits/cycles');
  return response.data;
};

export const createAuditCycle = async (cycle: {
  name: string;
  start_date: string;
  auditor_id: number;
}): Promise<AuditCycle> => {
  const response = await api.post('/audits/cycles', cycle);
  return response.data;
};

export const getAuditItems = async (cycleId: number): Promise<AuditItem[]> => {
  const response = await api.get(`/audits/cycles/${cycleId}/items`);
  return response.data;
};

export const verifyAuditItem = async (
  cycleId: number,
  itemId: number,
  itemUpdate: { status: 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED'; notes?: string }
): Promise<AuditItem> => {
  const response = await api.post(`/audits/cycles/${cycleId}/items/${itemId}`, itemUpdate);
  return response.data;
};

export const closeAuditCycle = async (cycleId: number): Promise<AuditCycle> => {
  const response = await api.post(`/audits/cycles/${cycleId}/close`);
  return response.data;
};
