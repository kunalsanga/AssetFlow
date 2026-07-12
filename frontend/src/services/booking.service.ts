import api from './api';
import { Asset, User } from './allocation.service';

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

export const getBookings = async (): Promise<Booking[]> => {
  const response = await api.get('/bookings/');
  return response.data;
};

export const createBooking = async (booking: {
  asset_id: number;
  start_time: string;
  end_time: string;
}): Promise<Booking> => {
  const response = await api.post('/bookings/', booking);
  return response.data;
};

export const cancelBooking = async (id: number): Promise<Booking> => {
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};

export const rescheduleBooking = async (
  id: number,
  rescheduleData: { start_time: string; end_time: string }
): Promise<Booking> => {
  const response = await api.post(`/bookings/${id}/reschedule`, rescheduleData);
  return response.data;
};
