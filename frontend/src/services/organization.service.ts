import { mockDepartments, mockEmployees, mockCategories } from '../mock/organization';

export interface Department {
  id: number;
  name: string;
  code: string;
  head_id: number | null;
  parent_id: number | null;
  status: string;
}

export interface Employee {
  id: number;
  full_name: string;
  email: string;
  department_id: number | null;
  role: string;
  is_active: boolean;
}

export interface AssetCategory {
  id: number;
  name: string;
  description: string;
  count: number;
  status: string;
}

export const getDepartments = async (): Promise<Department[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(mockDepartments as Department[]);
};

export const getEmployees = async (): Promise<Employee[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(mockEmployees as Employee[]);
};

export const getAssetCategories = async (): Promise<AssetCategory[]> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve(mockCategories as AssetCategory[]);
};
