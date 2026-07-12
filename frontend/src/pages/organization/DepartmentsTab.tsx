import React, { useState } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/common/Input';

const mockDepartments = [
  { id: '1', name: 'Engineering', head: 'Sarah Connor', parent: '-', status: 'active' },
  { id: '2', name: 'Facilities', head: 'John Smith', parent: 'Operations', status: 'active' },
  { id: '3', name: 'Field Operations', head: 'Mike Johnson', parent: 'Operations', status: 'active' },
  { id: '4', name: 'Human Resources', head: 'Emily Davis', parent: '-', status: 'active' },
  { id: '5', name: 'Finance', head: 'Robert Wilson', parent: '-', status: 'inactive' },
];

export const DepartmentsTab = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text">Departments</h2>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Department
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department Name</TableHead>
            <TableHead>Department Head</TableHead>
            <TableHead>Parent Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockDepartments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium text-text">{dept.name}</TableCell>
              <TableCell>{dept.head}</TableCell>
              <TableCell>{dept.parent}</TableCell>
              <TableCell>
                <StatusBadge 
                  status={dept.status === 'active' ? 'Active' : 'Inactive'} 
                  type={dept.status === 'active' ? 'active' : 'inactive'} 
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button className="p-1.5 text-muted hover:text-primary hover:bg-primary/10 rounded transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button className="p-1.5 text-muted hover:text-error hover:bg-error/10 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Department"
      >
        <div className="space-y-4">
          <Input label="Department Name" placeholder="e.g. Marketing" />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Department Head</label>
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
              <option value="">Select an employee...</option>
              <option value="1">Sarah Connor</option>
              <option value="2">John Smith</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Parent Department (Optional)</label>
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
              <option value="">None</option>
              <option value="1">Operations</option>
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Status</label>
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button onClick={() => setIsModalOpen(false)}>Create Department</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
