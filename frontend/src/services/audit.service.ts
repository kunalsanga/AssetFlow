import api from './api';
import { mockAuditCycles, mockAuditItems } from '../mock/audit.mock';
import { AuditCycle, AuditItem } from '../types/audit';

export type { AuditCycle, AuditItem } from '../types/audit';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getAuditCycles = async (): Promise<AuditCycle[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAuditCycles;
  }
  
  const response = await api.get('/audits/cycles');
  return response.data;
};

export const createAuditCycle = async (cycle: {
  name: string;
  start_date: string;
  auditor_id: number;
}): Promise<AuditCycle> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAuditCycles[0], id: Math.floor(Math.random() * 1000), ...cycle, status: 'PLANNED' };
  }
  
  const response = await api.post('/audits/cycles', cycle);
  return response.data;
};

export const getAuditItems = async (cycleId: number): Promise<AuditItem[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAuditItems;
  }
  
  const response = await api.get(`/audits/cycles/${cycleId}/items`);
  return response.data;
};

export const verifyAuditItem = async (
  cycleId: number,
  itemId: number,
  itemUpdate: { status: 'PENDING' | 'VERIFIED' | 'MISSING' | 'DAMAGED'; notes?: string }
): Promise<AuditItem> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAuditItems.find(i => i.id === itemId) || mockAuditItems[0], ...itemUpdate, verified_at: new Date().toISOString() };
  }
  
  const response = await api.post(`/audits/cycles/${cycleId}/items/${itemId}`, itemUpdate);
  return response.data;
};

export const closeAuditCycle = async (cycleId: number): Promise<AuditCycle> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockAuditCycles[0], status: 'CLOSED', end_date: new Date().toISOString() };
  }
  
  const response = await api.post(`/audits/cycles/${cycleId}/close`);
  return response.data;
};
