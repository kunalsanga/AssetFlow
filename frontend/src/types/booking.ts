import { Asset, User } from './allocation';

export interface Booking {
  id: number;
  asset_id: number;
  user_id: number;
  start_time: string;
  end_time: string;
  status: 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  asset?: Asset;
  user?: User;
}
