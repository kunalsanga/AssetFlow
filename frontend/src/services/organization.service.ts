import api from './api';
import { Department, Employee, AssetCategory } from '../types/organization';

export type { Department, Employee, AssetCategory } from '../types/organization';

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: Pagination;
}

// ==========================================
// DEPARTMENTS
// ==========================================

export const getDepartments = async (page = 1, pageSize = 100, search?: string): Promise<Department[]> => {
  const response = await api.get('/departments', { params: { page, pageSize, search } });
  return response.data.data.items;
};

export const createDepartment = async (data: Partial<Department>): Promise<Department> => {
  const response = await api.post('/departments', data);
  return response.data.data;
};

export const updateDepartment = async (id: number, data: Partial<Department>): Promise<Department> => {
  const response = await api.put(`/departments/${id}`, data);
  return response.data.data;
};

export const updateDepartmentStatus = async (id: number, status: string): Promise<Department> => {
  const response = await api.patch(`/departments/${id}/status`, null, { params: { status } });
  return response.data.data;
};

// ==========================================
// ASSET CATEGORIES
// ==========================================

export const getAssetCategories = async (page = 1, pageSize = 100, search?: string): Promise<AssetCategory[]> => {
  const response = await api.get('/categories', { params: { page, pageSize, search } });
  return response.data.data.items;
};

export const createCategory = async (data: Partial<AssetCategory>): Promise<AssetCategory> => {
  const response = await api.post('/categories', data);
  return response.data.data;
};

export const updateCategory = async (id: number, data: Partial<AssetCategory>): Promise<AssetCategory> => {
  const response = await api.put(`/categories/${id}`, data);
  return response.data.data;
};

export const updateCategoryStatus = async (id: number, status: string): Promise<AssetCategory> => {
  const response = await api.patch(`/categories/${id}/status`, null, { params: { status } });
  return response.data.data;
};

// ==========================================
// EMPLOYEES
// ==========================================

export const getEmployees = async (page = 1, pageSize = 100, search?: string): Promise<Employee[]> => {
  const response = await api.get('/employees', { params: { page, pageSize, search } });
  return response.data.data.items;
};

export const updateEmployeeRole = async (id: number, role: string): Promise<Employee> => {
  const response = await api.patch(`/users/${id}/role`, null, { params: { role } });
  return response.data.data;
};

export const updateEmployeeDepartment = async (id: number, department_id: number | null): Promise<Employee> => {
  const response = await api.patch(`/users/${id}/department`, null, { params: { department_id } });
  return response.data.data;
}
