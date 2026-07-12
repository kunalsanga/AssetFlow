import React, { useState } from 'react';
import { Search, Filter, ShieldAlert } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';

const mockEmployees = [
  { id: '1', name: 'Alice Walker', email: 'alice.w@company.com', dept: 'Engineering', role: 'admin', status: 'active' },
  { id: '2', name: 'Bob Chen', email: 'bob.c@company.com', dept: 'Engineering', role: 'employee', status: 'active' },
  { id: '3', name: 'Charlie Davis', email: 'charlie.d@company.com', dept: 'Facilities', role: 'asset_manager', status: 'active' },
  { id: '4', name: 'Diana Prince', email: 'diana.p@company.com', dept: 'Human Resources', role: 'department_head', status: 'active' },
  { id: '5', name: 'Evan Wright', email: 'evan.w@company.com', dept: 'Finance', role: 'employee', status: 'inactive' },
];

export const EmployeeDirectoryTab = () => {
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [selectedEmp, setSelectedEmp] = useState<any>(null);

  const openRoleModal = (emp: any) => {
    setSelectedEmp(emp);
    setIsRoleModalOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case 'admin': return <StatusBadge status="Admin" type="error" />;
      case 'asset_manager': return <StatusBadge status="Asset Manager" type="pending" />;
      case 'department_head': return <StatusBadge status="Dept Head" type="info" />;
      default: return <StatusBadge status="Employee" type="success" />;
    }
  };

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
          {mockEmployees.map((emp) => (
            <TableRow key={emp.id}>
              <TableCell>
                <div>
                  <div className="font-medium text-text">{emp.name}</div>
                  <div className="text-xs text-muted">{emp.email}</div>
                </div>
              </TableCell>
              <TableCell>{emp.dept}</TableCell>
              <TableCell>
                {getRoleBadge(emp.role)}
              </TableCell>
              <TableCell>
                <StatusBadge 
                  status={emp.status === 'active' ? 'Active' : 'Inactive'} 
                  type={emp.status === 'active' ? 'active' : 'inactive'} 
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
              <div className="font-medium text-text">{selectedEmp.name}</div>
              <div className="text-sm text-muted">{selectedEmp.email}</div>
            </div>
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-text">Assign Role</label>
              <select 
                className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
                defaultValue={selectedEmp.role}
              >
                <option value="employee">Employee (Default)</option>
                <option value="department_head">Department Head</option>
                <option value="asset_manager">Asset Manager</option>
                <option value="admin">Administrator</option>
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
