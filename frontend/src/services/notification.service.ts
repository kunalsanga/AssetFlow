import api from './api';
import { mockNotifications } from '../mock/notifications.mock';
import { Notification } from '../types/notification';

export type { Notification } from '../types/notification';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getNotifications = async (): Promise<Notification[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockNotifications;
  }
  
  const response = await api.get('/notifications');
  return response.data;
};
