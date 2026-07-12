import api from './api';
import { mockDepartments, mockEmployees, mockCategories } from '../mock/organization.mock';
import { Department, Employee, AssetCategory } from '../types/organization';

export type { Department, Employee, AssetCategory } from '../types/organization';

const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === 'true';

export const getDepartments = async (): Promise<Department[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockDepartments;
  }
  
  const response = await api.get('/departments');
  return response.data;
};

export const getEmployees = async (): Promise<Employee[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockEmployees;
  }
  
  const response = await api.get('/employees');
  return response.data;
};

export const getAssetCategories = async (): Promise<AssetCategory[]> => {
  if (USE_MOCK_DATA) {
    await new Promise(resolve => setTimeout(resolve, 500));
    return mockCategories;
  }
  
  const response = await api.get('/asset-categories');
  return response.data;
};
