import { mockNotifications } from '../mock/notifications';

export interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
}

export const getNotifications = async (): Promise<Notification[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(mockNotifications as Notification[]);
};
