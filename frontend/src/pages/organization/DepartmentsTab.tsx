import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/common/Input';
import { getDepartments, Department } from '../../services/organization.service';

export const DepartmentsTab = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getDepartments();
      setDepartments(data);
    } catch (err) {
      setError("Failed to load departments.");
    } finally {
      setLoading(false);
    }
  };

  const getDepartmentName = (id: number | null) => {
    if (!id) return '-';
    const dept = departments.find(d => d.id === id);
    return dept ? dept.name : '-';
  };

  if (loading) {
    return <div className="p-8 text-center text-muted animate-pulse">Loading departments...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-lg">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button onClick={loadDepartments} variant="outline" size="sm" className="ml-4">Retry</Button>
        </div>
      </div>
    );
  }

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
            <TableHead>Department Code</TableHead>
            <TableHead>Parent Department</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium text-text">{dept.name}</TableCell>
              <TableCell>{dept.code}</TableCell>
              <TableCell>{getDepartmentName(dept.parent_id)}</TableCell>
              <TableCell>
                <StatusBadge 
                  status={dept.status === 'Active' ? 'Active' : 'Inactive'} 
                  type={dept.status === 'Active' ? 'active' : 'inactive'} 
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
          <Input label="Department Code" placeholder="e.g. MKT" />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Parent Department (Optional)</label>
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
              <option value="">None</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Status</label>
            <select className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50">
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
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
