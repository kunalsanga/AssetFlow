import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/common/Input';
import { getDepartments, createDepartment, updateDepartmentStatus, Department } from '../../services/organization.service';

interface Props {
  onAdd?: boolean;
  onAddClose?: () => void;
}
export const DepartmentsTab = ({ onAdd, onAddClose }: Props) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Department>>({ status: 'Active' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => { loadDepartments(); }, []);

  // Trigger modal from parent +Add button
  useEffect(() => {
    if (onAdd) {
      setFormData({ status: 'Active' });
      setIsModalOpen(true);
    }
  }, [onAdd]);

  const closeModal = () => {
    setIsModalOpen(false);
    onAddClose?.();
  };

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

  const handleCreate = async () => {
    if (!formData.name || !formData.code) {
      alert("Name and Code are required.");
      return;
    }
    
    try {
      setIsSubmitting(true);
      await createDepartment(formData);
      setIsModalOpen(false);
      setFormData({ status: 'Active' });
      await loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to create department");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusToggle = async (dept: Department) => {
    try {
      const newStatus = dept.status === 'Active' ? 'Inactive' : 'Active';
      await updateDepartmentStatus(dept.id, newStatus);
      await loadDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update status");
    }
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
    <div className="space-y-0">
      {/* Table — columns match wireframe: Department, Head, Parent Dept, Status */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Department</TableHead>
            <TableHead>Head</TableHead>
            <TableHead>Parent Dept</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {departments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted py-10 text-sm">
                No departments yet. Click <strong>+ Add</strong> to create one.
              </TableCell>
            </TableRow>
          ) : departments.map((dept) => (
            <TableRow key={dept.id}>
              <TableCell className="font-medium text-text">{dept.name}</TableCell>
              <TableCell className="text-muted text-sm">{dept.head_id ? `User #${dept.head_id}` : '—'}</TableCell>
              <TableCell className="text-muted text-sm">{getDepartmentName(dept.parent_id)}</TableCell>
              <TableCell>
                <StatusBadge 
                  status={dept.status === 'Active' ? 'Active' : 'Inactive'} 
                  type={dept.status === 'Active' ? 'active' : 'inactive'} 
                />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <button 
                    onClick={() => handleStatusToggle(dept)}
                    title={dept.status === 'Active' ? "Deactivate" : "Activate"}
                    className="p-1.5 text-muted hover:text-error hover:bg-error/10 rounded transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

              <Modal isOpen={isModalOpen} onClose={closeModal} title="Add Department">
        <div className="space-y-4">
          <Input 
            label="Department Name" 
            placeholder="e.g. Marketing" 
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <Input 
            label="Department Code" 
            placeholder="e.g. MKT" 
            value={formData.code || ''}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
          />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Parent Department (Optional)</label>
            <select 
              value={formData.parent_id || ''}
              onChange={(e) => setFormData({ ...formData, parent_id: e.target.value ? Number(e.target.value) : undefined })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            >
              <option value="">None</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Status</label>
            <select 
              value={formData.status || 'Active'}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-border mt-6">
            <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>Cancel</Button>
            <Button onClick={handleCreate} disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create Department'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
