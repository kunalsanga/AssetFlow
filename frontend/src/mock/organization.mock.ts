import { Department, Employee, AssetCategory } from '../types/organization';

export const mockDepartments: Department[] = [
  { id: 1, name: 'Engineering', code: 'ENG', head_id: 1, parent_id: null, status: 'Active' },
  { id: 2, name: 'Facilities', code: 'FAC', head_id: 2, parent_id: 3, status: 'Active' },
  { id: 3, name: 'Operations', code: 'OPS', head_id: 3, parent_id: null, status: 'Active' },
  { id: 4, name: 'Human Resources', code: 'HR', head_id: 4, parent_id: null, status: 'Active' },
  { id: 5, name: 'Finance', code: 'FIN', head_id: 5, parent_id: null, status: 'Inactive' },
];

export const mockEmployees: Employee[] = [
  { id: 1, full_name: 'Sarah Connor', email: 'sarah.c@company.com', department_id: 1, role: 'admin', is_active: true },
  { id: 2, full_name: 'John Smith', email: 'john.s@company.com', department_id: 2, role: 'employee', is_active: true },
  { id: 3, full_name: 'Mike Johnson', email: 'mike.j@company.com', department_id: 3, role: 'asset_manager', is_active: true },
  { id: 4, full_name: 'Emily Davis', email: 'emily.d@company.com', department_id: 4, role: 'department_head', is_active: true },
  { id: 5, full_name: 'Robert Wilson', email: 'robert.w@company.com', department_id: 5, role: 'employee', is_active: false },
];

export const mockCategories: AssetCategory[] = [
  { id: 1, name: 'Electronics', description: 'Laptops, monitors, tablets, etc.', count: 450, status: 'active' },
  { id: 2, name: 'Furniture', description: 'Desks, chairs, filing cabinets', count: 820, status: 'active' },
  { id: 3, name: 'Vehicles', description: 'Company cars, vans, trucks', count: 12, status: 'active' },
  { id: 4, name: 'Equipment', description: 'Specialized testing and manufacturing tools', count: 85, status: 'active' },
];
