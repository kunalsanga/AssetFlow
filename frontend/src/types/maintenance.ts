import { Asset, User } from './allocation';

export interface MaintenanceRequest {
  id: number;
  asset_id: number;
  requester_id: number;
  description?: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  status: 'PENDING' | 'APPROVED' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'REJECTED';
  scheduled_date?: string;
  technician_name?: string;
  asset?: Asset;
  requester?: User;
}
