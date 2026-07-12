import { Asset, User } from './allocation';

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
