import api from './api';
import { mockAssets } from '../mock/assets.mock';
import { Asset } from '../types/asset';

export type { Asset } from '../types/asset';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getAssets = async (): Promise<Asset[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockAssets;
  }
  
  const response = await api.get('/assets');
  return response.data;
};
