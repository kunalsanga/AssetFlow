import React, { useState, useEffect } from 'react';
import { Search, Filter, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { getEmployees, Employee, getDepartments, Department } from '../../services/organization.service';

export const EmployeeDirectoryTab = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [empData, deptData] = await Promise.all([
        getEmployees(),
        getDepartments()
      ]);
      setEmployees(empData);
      setDepartments(deptData);
    } catch (err) {
      setError("Failed to load employee data.");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (deptId: number | null) => {
    if (!deptId) return 'Unassigned';
    const dept = departments.find(d => d.id === deptId);
    return dept ? dept.name : 'Unknown';
  };

  const openRoleModal = (emp: Employee) => {
    setSelectedEmp(emp);
    setIsRoleModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'super_admin': return <StatusBadge status="Super Admin" type="error" />;
      case 'admin': return <StatusBadge status="Admin" type="error" />;
      case 'asset_manager': return <StatusBadge status="Asset Manager" type="pending" />;
      case 'department_head': return <StatusBadge status="Dept Head" type="info" />;
      case 'auditor': return <StatusBadge status="Auditor" type="inactive" />;
      case 'technician': return <StatusBadge status="Technician" type="pending" />;
      default: return <StatusBadge status="Employee" type="success" />;
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted animate-pulse">Loading employee directory...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-lg">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button onClick={loadData} variant="outline" size="sm" className="ml-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-lg font-semibold text-text">Employee Directory</h2>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input 
              type="text" 
              placeholder="Search employees..." 
              className="w-full bg-background border border-border rounded-md py-1.5 pl-9 pr-3 text-sm focus:outline-none focus:border-primary/50"
            />
          </div>
          <Button variant="outline" className="px-3">
            <Filter size={16} />
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {employees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>
                <div>
                  <div className="font-medium text-text">{emp.full_name}</div>
                  <div className="text-xs text-muted">{emp.email}</div>
                </div>
              </TableCell>
              <TableCell>{getDepartmentName(emp.department_id)}</TableCell>
              <TableCell>
                {getRoleBadge(emp.role)}
              </TableCell>
              <TableCell>
                <StatusBadge 
                  status={emp.is_active ? 'Active' : 'Inactive'} 
                  type={emp.is_active ? 'active' : 'inactive'} 
                />
              </TableCell>
              <TableCell className="text-right">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-8 text-xs gap-1"
                  onClick={() => openRoleModal(emp)}
                >
                  <ShieldAlert size={14} />
                  Manage Role
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        title="Manage Employee Role"
      >
        {selectedEmp && (
          <div className="space-y-4">
            <div className="p-3 bg-background rounded-md border border-border">
              <div className="font-medium text-text">{selectedEmp.full_name}</div>
              <div className="text-sm text-muted">{selectedEmp.email}</div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Assign Role</label>
              <select 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                defaultValue={selectedEmp.role}
              >
                <option value="employee">Employee (Default)</option>
                <option value="technician">Technician</option>
                <option value="auditor">Auditor</option>
                <option value="department_head">Department Head</option>
                <option value="asset_manager">Asset Manager</option>
                <option value="admin">Administrator</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>
            
            <div className="p-3 bg-warning/10 border border-warning/20 rounded-md mt-2">
              <p className="text-xs text-warning leading-relaxed">
                Changing a user's role affects their system permissions immediately. Ensure you understand the access level granted by each role.
              </p>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
              <Button variant="outline" onClick={() => setIsRoleModalOpen(false)}>Cancel</Button>
              <Button onClick={() => setIsRoleModalOpen(false)}>Update Role</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
