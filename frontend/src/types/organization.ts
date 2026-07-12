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
