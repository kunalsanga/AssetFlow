import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import * as service from '../../services/allocation.service';

export const AllocationPage: React.FC = () => {
  const { user } = useAuth();
  
  // Data States
  const [allocations, setAllocations] = useState<service.Allocation[]>([]);
  const [assets, setAssets] = useState<service.Asset[]>([]);
  const [transfers, setTransfers] = useState<service.TransferRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Tabs State
  const [activeTab, setActiveTab] = useState<'active' | 'transfers' | 'history'>('active');

  // Modals States
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  // Form Selection States
  const [selectedAllocation, setSelectedAllocation] = useState<service.Allocation | null>(null);
  
  // Form Values
  const [allocateAssetId, setAllocateAssetId] = useState<string>('');
  const [allocateToType, setAllocateToType] = useState<'user' | 'department'>('user');
  const [allocateToId, setAllocateToId] = useState<string>('');
  const [allocateDueDate, setAllocateDueDate] = useState<string>('');
  const [returnCondition, setReturnCondition] = useState<string>('Good');
  const [transferTargetType, setTransferTargetType] = useState<'user' | 'department'>('user');
  const [transferTargetId, setTransferTargetId] = useState<string>('');
  
  // Form Validation/Submit errors
  const [formError, setFormError] = useState<string | null>(null);

  // Load Data
  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [allocList, assetList, transferList] = await Promise.all([
        service.getAllocations(),
        service.getAssets(),
        service.getTransferRequests()
      ]);
      setAllocations(allocList);
      setAssets(assetList);
      setTransfers(transferList);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load allocation data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!allocateAssetId || !allocateToId || !allocateDueDate) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      await service.createAllocation({
        asset_id: parseInt(allocateAssetId),
        allocated_to_type: allocateToType,
        allocated_to_id: parseInt(allocateToId),
        due_date: new Date(allocateDueDate).toISOString()
      });
      setIsAllocateOpen(false);
      // Reset
      setAllocateAssetId('');
      setAllocateToId('');
      setAllocateDueDate('');
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to allocate asset. Ensure it is not already allocated.');
    }
  };

  const handleReturn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation) return;

    try {
      await service.returnAllocation(selectedAllocation.id, {
        return_condition: returnCondition
      });
      setIsReturnOpen(false);
      setSelectedAllocation(null);
      setReturnCondition('Good');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to return asset.');
    }
  };

  const handleTransferRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAllocation || !transferTargetId) return;

    try {
      await service.raiseTransferRequest({
        allocation_id: selectedAllocation.id,
        target_type: transferTargetType,
        target_id: parseInt(transferTargetId)
      });
      setIsTransferOpen(false);
      setSelectedAllocation(null);
      setTransferTargetId('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to raise transfer request.');
    }
  };

  const handleApproveTransfer = async (requestId: number) => {
    try {
      await service.approveTransferRequest(requestId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve transfer request.');
    }
  };

  const handleRejectTransfer = async (requestId: number) => {
    try {
      await service.rejectTransferRequest(requestId);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject transfer request.');
    }
  };

  // Derived Stats
  const activeAllocations = allocations.filter(a => a.status === 'active' || a.status === 'overdue');
  const overdueAllocations = allocations.filter(a => a.status === 'overdue');
  const pendingTransfers = transfers.filter(t => t.status === 'pending');
  const isManager = user?.role === 'admin' || user?.role === 'asset_manager';

  // Static Mock Recipient Names for Display
  const getRecipientName = (type: 'user' | 'department', id: number) => {
    if (type === 'user') {
      if (id === 1) return 'Admin User';
      if (id === 2) return 'Asset Manager';
      if (id === 3) return 'John Doe (Employee)';
      if (id === 4) return 'Jane Smith (Employee)';
      return `User ID ${id}`;
    } else {
      if (id === 10) return 'Engineering Dept';
      if (id === 11) return 'Marketing Dept';
      return `Department ID ${id}`;
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Asset Allocation & Transfer</h1>
          <p className="text-muted text-sm mt-1">
            Track asset ownership, process transfers, and coordinate returns.
          </p>
        </div>
        {isManager && (
          <Button onClick={() => { setIsAllocateOpen(true); setFormError(null); }} className="w-full md:w-auto">
            Allocate Asset
          </Button>
        )}
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted">Active Allocations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-text">{activeAllocations.length}</div>
            <p className="text-xs text-muted mt-1">Currently assigned to employees/departments</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-error">Overdue Returns</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-error">{overdueAllocations.length}</div>
            <p className="text-xs text-muted mt-1">Allocations past their scheduled return date</p>
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-secondary">Pending Transfer Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-secondary">{pendingTransfers.length}</div>
            <p className="text-xs text-muted mt-1">Awaiting manager review and approval</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Tab Controls */}
      <div className="flex border-b border-border">
        <button
          onClick={() => setActiveTab('active')}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'active'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          Active Allocations
        </button>
        <button
          onClick={() => setActiveTab('transfers')}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'transfers'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          Pending Transfers ({pendingTransfers.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2.5 font-medium text-sm transition-colors border-b-2 -mb-[2px] ${
            activeTab === 'history'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted hover:text-text'
          }`}
        >
          Allocation History
        </button>
      </div>

      {/* Tabs Content */}
      <Card className="bg-surface border-border overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted">Loading allocations...</div>
          ) : error ? (
            <div className="p-12 text-center text-error">{error}</div>
          ) : (
            <>
              {/* Active Tab */}
              {activeTab === 'active' && (
                <div className="overflow-x-auto">
                  {activeAllocations.length === 0 ? (
                    <div className="p-12 text-center text-muted">No active allocations found.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted">
                          <th className="p-4">Asset Name</th>
                          <th className="p-4">Serial Number</th>
                          <th className="p-4">Allocated To</th>
                          <th className="p-4">Date Allocated</th>
                          <th className="p-4">Due Date</th>
                          <th className="p-4">Status</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm text-text">
                        {activeAllocations.map(alloc => (
                          <tr key={alloc.id} className="hover:bg-background/20 transition-colors">
                            <td className="p-4 font-medium">{alloc.asset?.name || `Asset ID ${alloc.asset_id}`}</td>
                            <td className="p-4 text-muted">{alloc.asset?.serial_number}</td>
                            <td className="p-4">
                              <span className="capitalize text-xs bg-background border border-border px-2 py-0.5 rounded-full mr-2">
                                {alloc.allocated_to_type}
                              </span>
                              {getRecipientName(alloc.allocated_to_type, alloc.allocated_to_id)}
                            </td>
                            <td className="p-4">{new Date(alloc.allocated_at).toLocaleDateString()}</td>
                            <td className="p-4">{new Date(alloc.due_date).toLocaleDateString()}</td>
                            <td className="p-4">
                              {alloc.status === 'overdue' ? (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-error/15 text-error border border-error/30 animate-pulse">
                                  Overdue
                                </span>
                              ) : (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-primary/15 text-primary border border-primary/30">
                                  Active
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setSelectedAllocation(alloc);
                                  setIsTransferOpen(true);
                                }}
                              >
                                Transfer
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => {
                                  setSelectedAllocation(alloc);
                                  setIsReturnOpen(true);
                                }}
                              >
                                Return
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* Transfers Tab */}
              {activeTab === 'transfers' && (
                <div className="overflow-x-auto">
                  {pendingTransfers.length === 0 ? (
                    <div className="p-12 text-center text-muted">No pending transfer requests.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted">
                          <th className="p-4">Asset</th>
                          <th className="p-4">Current Holder</th>
                          <th className="p-4">Requested Transfer To</th>
                          <th className="p-4">Requested By</th>
                          <th className="p-4">Date Requested</th>
                          {isManager && <th className="p-4 text-right">Actions</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm text-text">
                        {pendingTransfers.map(req => (
                          <tr key={req.id} className="hover:bg-background/20 transition-colors">
                            <td className="p-4 font-medium">
                              {req.allocation?.asset?.name || `Asset ID ${req.allocation?.asset_id}`}
                            </td>
                            <td className="p-4">
                              {req.allocation ? getRecipientName(req.allocation.allocated_to_type, req.allocation.allocated_to_id) : 'Unknown'}
                            </td>
                            <td className="p-4">
                              <span className="capitalize text-xs bg-background border border-border px-2 py-0.5 rounded-full mr-2">
                                {req.target_type}
                              </span>
                              {getRecipientName(req.target_type, req.target_id)}
                            </td>
                            <td className="p-4 text-muted">{req.requested_by?.full_name || 'System User'}</td>
                            <td className="p-4">{new Date(req.created_at).toLocaleDateString()}</td>
                            {isManager && (
                              <td className="p-4 text-right space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleRejectTransfer(req.id)}
                                  className="text-error border-error/50 hover:bg-error/10 hover:text-error"
                                >
                                  Reject
                                </Button>
                                <Button
                                  size="sm"
                                  onClick={() => handleApproveTransfer(req.id)}
                                >
                                  Approve
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}

              {/* History Tab */}
              {activeTab === 'history' && (
                <div className="overflow-x-auto">
                  {allocations.length === 0 ? (
                    <div className="p-12 text-center text-muted">No allocation history available.</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-border bg-background/50 text-xs font-semibold uppercase tracking-wider text-muted">
                          <th className="p-4">Asset Name</th>
                          <th className="p-4">Allocated To</th>
                          <th className="p-4">Date Allocated</th>
                          <th className="p-4">Returned Date</th>
                          <th className="p-4">Condition on Return</th>
                          <th className="p-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-sm text-text">
                        {allocations.map(alloc => (
                          <tr key={alloc.id} className="hover:bg-background/20 transition-colors">
                            <td className="p-4 font-medium">{alloc.asset?.name || `Asset ID ${alloc.asset_id}`}</td>
                            <td className="p-4 text-muted">
                              {getRecipientName(alloc.allocated_to_type, alloc.allocated_to_id)}
                            </td>
                            <td className="p-4">{new Date(alloc.allocated_at).toLocaleDateString()}</td>
                            <td className="p-4">
                              {alloc.returned_at ? new Date(alloc.returned_at).toLocaleDateString() : 'N/A'}
                            </td>
                            <td className="p-4 text-muted">{alloc.return_condition || 'N/A'}</td>
                            <td className="p-4">
                              <span className={`text-xs font-medium px-2 py-1 rounded border capitalize ${
                                alloc.status === 'returned'
                                  ? 'bg-muted/15 text-muted border-muted/30'
                                  : alloc.status === 'transferred'
                                  ? 'bg-secondary/15 text-secondary border-secondary/30'
                                  : alloc.status === 'overdue'
                                  ? 'bg-error/15 text-error border-error/30'
                                  : 'bg-primary/15 text-primary border-primary/30'
                              }`}>
                                {alloc.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* 1. Allocate Asset Modal */}
      {isAllocateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader>
              <CardTitle className="text-xl">Allocate New Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAllocate} className="flex flex-col gap-4">
                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Asset Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Select Asset</label>
                  <select
                    value={allocateAssetId}
                    onChange={(e) => {
                      setAllocateAssetId(e.target.value);
                      setFormError(null);
                    }}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets
                      .filter(a => a.status === 'available' || a.status === 'allocated')
                      .map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.serial_number}) - {a.status}
                        </option>
                      ))}
                  </select>
                </div>

                {(() => {
                  const selectedAsset = assets.find(a => a.id.toString() === allocateAssetId);
                  const activeAlloc = activeAllocations.find(a => a.asset_id.toString() === allocateAssetId);

                  if (selectedAsset?.status === 'allocated' && activeAlloc) {
                    return (
                      <div className="p-4 bg-error/10 border border-error/25 rounded-md mt-2 flex flex-col gap-2">
                        <div className="text-error font-medium flex items-center gap-2 text-sm">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                          Double-Allocation Blocked
                        </div>
                        <p className="text-sm text-error/90">
                          This asset is currently allocated to <strong>{getRecipientName(activeAlloc.allocated_to_type, activeAlloc.allocated_to_id)}</strong>. 
                          Direct allocation is blocked — submit a transfer request below.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* Target Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Allocate To</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={allocateToType === 'user'}
                        onChange={() => { setAllocateToType('user'); setAllocateToId(''); }}
                        className="accent-primary"
                      />
                      Employee
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="targetType"
                        checked={allocateToType === 'department'}
                        onChange={() => { setAllocateToType('department'); setAllocateToId(''); }}
                        className="accent-primary"
                      />
                      Department
                    </label>
                  </div>
                </div>

                {/* Target ID Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Select Recipient</label>
                  {allocateToType === 'user' ? (
                    <select
                      value={allocateToId}
                      onChange={(e) => setAllocateToId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      required
                    >
                      <option value="">-- Choose Employee --</option>
                      <option value="3">John Doe (Employee)</option>
                      <option value="4">Jane Smith (Employee)</option>
                      <option value="1">Admin User (Admin)</option>
                      <option value="2">Asset Manager (Manager)</option>
                    </select>
                  ) : (
                    <select
                      value={allocateToId}
                      onChange={(e) => setAllocateToId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      <option value="10">Engineering Dept</option>
                      <option value="11">Marketing Dept</option>
                    </select>
                  )}
                </div>

                {/* Due Date */}
                <Input
                  label="Due Date for Return"
                  type="date"
                  value={allocateDueDate}
                  onChange={(e) => setAllocateDueDate(e.target.value)}
                  required
                />

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsAllocateOpen(false)}>
                    Cancel
                  </Button>
                  
                  {(() => {
                    const selectedAsset = assets.find(a => a.id.toString() === allocateAssetId);
                    const activeAlloc = activeAllocations.find(a => a.asset_id.toString() === allocateAssetId);
                    
                    if (selectedAsset?.status === 'allocated' && activeAlloc) {
                      return (
                        <Button 
                          type="button" 
                          onClick={() => {
                            setIsAllocateOpen(false);
                            setSelectedAllocation(activeAlloc);
                            setIsTransferOpen(true);
                          }}
                        >
                          Submit Transfer Request
                        </Button>
                      );
                    }
                    
                    return (
                      <Button type="submit">
                        Confirm Allocation
                      </Button>
                    );
                  })()}
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Return Asset Modal */}
      {isReturnOpen && selectedAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Return Allocated Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleReturn} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Confirm the return of <strong>{selectedAllocation.asset?.name}</strong>. The asset's state will revert to <strong>Available</strong>.
                </p>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Return Condition Notes</label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="Good">Good / Undamaged</option>
                    <option value="Minor Wear">Minor Wear and Tear</option>
                    <option value="Damaged">Damaged (Needs Maintenance)</option>
                    <option value="Lost">Lost / Missing</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsReturnOpen(false); setSelectedAllocation(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Confirm Return
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Request Transfer Modal */}
      {isTransferOpen && selectedAllocation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Request Asset Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleTransferRequest} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Request to transfer <strong>{selectedAllocation.asset?.name}</strong> to a new employee or department.
                </p>

                {/* Target Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Transfer Target Type</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="transferTargetType"
                        checked={transferTargetType === 'user'}
                        onChange={() => { setTransferTargetType('user'); setTransferTargetId(''); }}
                        className="accent-primary"
                      />
                      Employee
                    </label>
                    <label className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="transferTargetType"
                        checked={transferTargetType === 'department'}
                        onChange={() => { setTransferTargetType('department'); setTransferTargetId(''); }}
                        className="accent-primary"
                      />
                      Department
                    </label>
                  </div>
                </div>

                {/* Target Select */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Select New Recipient</label>
                  {transferTargetType === 'user' ? (
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      required
                    >
                      <option value="">-- Choose Employee --</option>
                      <option value="3">John Doe (Employee)</option>
                      <option value="4">Jane Smith (Employee)</option>
                      <option value="1">Admin User (Admin)</option>
                      <option value="2">Asset Manager (Manager)</option>
                    </select>
                  ) : (
                    <select
                      value={transferTargetId}
                      onChange={(e) => setTransferTargetId(e.target.value)}
                      className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                      required
                    >
                      <option value="">-- Choose Department --</option>
                      <option value="10">Engineering Dept</option>
                      <option value="11">Marketing Dept</option>
                    </select>
                  )}
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsTransferOpen(false); setSelectedAllocation(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Transfer Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
