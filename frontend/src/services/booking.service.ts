import api from './api';
import { mockBookings } from '../mock/booking.mock';
import { Booking } from '../types/booking';

export type { Booking } from '../types/booking';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getBookings = async (): Promise<Booking[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockBookings;
  }
  
  const response = await api.get('/bookings/');
  return response.data;
};

export const createBooking = async (booking: {
  asset_id: number;
  start_time: string;
  end_time: string;
}): Promise<Booking> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newBooking = { ...mockBookings[0], id: Math.floor(Math.random() * 1000), ...booking, status: 'UPCOMING' as const };
    return newBooking;
  }
  
  const response = await api.post('/bookings/', booking);
  return response.data;
};

export const cancelBooking = async (id: number): Promise<Booking> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockBookings[0], id, status: 'CANCELLED' };
  }
  
  const response = await api.post(`/bookings/${id}/cancel`);
  return response.data;
};

export const rescheduleBooking = async (
  id: number,
  rescheduleData: { start_time: string; end_time: string }
): Promise<Booking> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return { ...mockBookings[0], id, ...rescheduleData };
  }
  
  const response = await api.post(`/bookings/${id}/reschedule`, rescheduleData);
  return response.data;
};
