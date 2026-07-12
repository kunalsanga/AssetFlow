import { Asset } from './asset';
export type { Asset };

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
