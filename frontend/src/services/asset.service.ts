import { mockAssets } from '../mock/assets';

export interface Asset {
  id: number;
  name: string;
  serial_number: string;
  model: string;
  status: string;
  description?: string;
}

export const getAssets = async (): Promise<Asset[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(mockAssets as Asset[]);
};
