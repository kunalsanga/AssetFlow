import { User } from '../types';

export const mockUsers: Record<string, User> = {
  'admin@assetflow.com': {
    id: 1,
    email: 'admin@assetflow.com',
    full_name: 'Admin User',
    role: 'admin',
    is_active: true
  },
  'employee@assetflow.com': {
    id: 2,
    email: 'employee@assetflow.com',
    full_name: 'John Employee',
    role: 'employee',
    is_active: true
  },
  'manager@assetflow.com': {
    id: 3,
    email: 'manager@assetflow.com',
    full_name: 'Sarah Manager',
    role: 'asset_manager',
    is_active: true
  },
  'auditor@assetflow.com': {
    id: 4,
    email: 'auditor@assetflow.com',
    full_name: 'Alice Auditor',
    role: 'auditor',
    is_active: true
  },
  'technician@assetflow.com': {
    id: 5,
    email: 'technician@assetflow.com',
    full_name: 'Bob Technician',
    role: 'technician',
    is_active: true
  }
};
