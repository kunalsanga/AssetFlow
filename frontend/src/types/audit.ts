import { Asset, User } from './allocation';

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
