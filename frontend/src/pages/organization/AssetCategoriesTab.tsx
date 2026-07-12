import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/common/Button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/Table';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/common/Input';
import { getAssetCategories, AssetCategory } from '../../services/organization.service';

export const AssetCategoriesTab = () => {
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssetCategories();
      setCategories(data);
    } catch (err) {
      setError("Failed to load asset categories.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted animate-pulse">Loading asset categories...</div>;
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center gap-2 text-rose-600 bg-rose-50 px-4 py-3 rounded-lg">
          <AlertTriangle size={20} />
          <span>{error}</span>
          <Button onClick={loadCategories} variant="outline" size="sm" className="ml-4">Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-text">Asset Categories</h2>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          Add Category
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Category Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Number of Assets</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[100px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((cat) => (
            <TableRow key={cat.id}>
              <TableCell className="font-medium text-text">{cat.name}</TableCell>
              <TableCell className="text-muted">{cat.description}</TableCell>
              <TableCell>{cat.count}</TableCell>
              <TableCell>
                <StatusBadge 
                  status={cat.status === 'active' ? 'Active' : 'Inactive'} 
                  type={cat.status === 'active' ? 'active' : 'inactive'} 
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
        title="Create New Asset Category"
      >
        <div className="space-y-4">
          <Input label="Category Name" placeholder="e.g. Software Licenses" />
          
          <div className="space-y-1">
            <label className="text-sm font-medium text-text">Description</label>
            <textarea 
              className="w-full bg-background border border-border rounded-md px-3 py-2 text-sm text-text focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[80px]"
              placeholder="Brief description of items in this category"
            />
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
            <Button onClick={() => setIsModalOpen(false)}>Create Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
