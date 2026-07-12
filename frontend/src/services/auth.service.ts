import api from './api';
import { AuthResponse, User } from '../types';
import { mockUsers } from '../mock/auth.mock';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const login = async (email: string, password: string): Promise<AuthResponse> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    if (mockUsers[email]) {
      localStorage.setItem('token', 'mock_token_' + email);
      return { access_token: 'mock_token_' + email, token_type: 'bearer' };
    }
    throw new Error("Invalid mock user");
  }

  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);

  const response = await api.post<AuthResponse>('/auth/login', params, {
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  });
  if (response.data.access_token) {
    localStorage.setItem('token', response.data.access_token);
  }
  return response.data;
};

export const logout = () => {
  localStorage.removeItem('token');
};

export const getCurrentUser = async (): Promise<User> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    const token = localStorage.getItem('token');
    if (token && token.startsWith('mock_token_')) {
      const email = token.replace('mock_token_', '');
      if (mockUsers[email]) {
        return mockUsers[email];
      }
    }
    throw new Error("Not authenticated");
  }

  const response = await api.get<User>('/users/me');
  return response.data;
};
