import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import * as maintenanceService from '../../services/maintenance.service';
import * as allocationService from '../../services/allocation.service';

export const MaintenancePage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'asset_manager';

  // Data States
  const [requests, setRequests] = useState<maintenanceService.MaintenanceRequest[]>([]);
  const [assets, setAssets] = useState<allocationService.Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals States
  const [isRaiseModalOpen, setIsRaiseModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<maintenanceService.MaintenanceRequest | null>(null);

  // Form States
  const [raiseAssetId, setRaiseAssetId] = useState<string>('');
  const [raiseDescription, setRaiseDescription] = useState<string>('');
  const [raisePriority, setRaisePriority] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [assignDate, setAssignDate] = useState<string>('');
  const [resolveCondition, setResolveCondition] = useState<'AVAILABLE' | 'RETIRED' | 'LOST'>('AVAILABLE');

  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [requestList, assetList] = await Promise.all([
        maintenanceService.getMaintenanceRequests(),
        allocationService.getAssets()
      ]);
      setRequests(requestList);
      setAssets(assetList);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load maintenance records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRaiseRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!raiseAssetId || !raiseDescription) {
      setFormError('Please select an asset and describe the issue.');
      return;
    }

    try {
      await maintenanceService.createMaintenanceRequest({
        asset_id: parseInt(raiseAssetId),
        description: raiseDescription,
        priority: raisePriority
      });
      setIsRaiseModalOpen(false);
      setRaiseAssetId('');
      setRaiseDescription('');
      setRaisePriority('MEDIUM');
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to raise maintenance request.');
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await maintenanceService.approveMaintenanceRequest(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to approve request.');
    }
  };

  const handleReject = async (id: number) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await maintenanceService.rejectMaintenanceRequest(id);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to reject request.');
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !assignDate) return;
    
    try {
      await maintenanceService.assignTechnician(selectedRequest.id, {
        scheduled_date: new Date(assignDate).toISOString().split('T')[0]
      });
      setIsAssignModalOpen(false);
      setSelectedRequest(null);
      setAssignDate('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to schedule repair.');
    }
  };

  const handleResolve = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;

    try {
      await maintenanceService.resolveMaintenanceRequest(selectedRequest.id, {
        status: resolveCondition
      });
      setIsResolveModalOpen(false);
      setSelectedRequest(null);
      setResolveCondition('AVAILABLE');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to resolve maintenance.');
    }
  };

  // Group Requests for columns
  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const approvedRequests = requests.filter(r => r.status === 'APPROVED');
  const inProgressRequests = requests.filter(r => r.status === 'IN_PROGRESS');
  const resolvedRequests = requests.filter(r => r.status === 'RESOLVED' || r.status === 'REJECTED');

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH': return 'text-error bg-error/10 border-error/20';
      case 'MEDIUM': return 'text-secondary bg-secondary/10 border-secondary/20';
      default: return 'text-muted bg-muted/10 border-muted/20';
    }
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Maintenance Management</h1>
          <p className="text-muted text-sm mt-1">
            Raise requests, assign technicians, check schedules, and record repair outcomes.
          </p>
        </div>
        <Button onClick={() => { setIsRaiseModalOpen(true); setFormError(null); }} className="w-full md:w-auto">
          Raise Maintenance Request
        </Button>
      </div>

      {/* Kanban/Column View */}
      {loading ? (
        <div className="p-12 text-center text-muted">Loading maintenance board...</div>
      ) : error ? (
        <div className="p-12 text-center text-error">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Column 1: Pending Approval */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg">
              <span className="font-semibold text-text">Pending Approval</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-background border border-border rounded-full">{pendingRequests.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[400px] bg-surface/20 border border-dashed border-border/60 p-2 rounded-lg">
              {pendingRequests.length === 0 ? (
                <div className="text-center text-muted text-xs p-6">No pending requests</div>
              ) : (
                pendingRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-3 hover:border-muted transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm text-text">{req.asset?.name || `Asset ID ${req.asset_id}`}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getPriorityColor(req.priority)}`}>{req.priority}</span>
                      </div>
                      <p className="text-xs text-muted mt-2 line-clamp-3">{req.description}</p>
                    </div>
                    {isManager && (
                      <div className="flex gap-2 mt-1">
                        <Button size="sm" variant="outline" className="flex-1 text-error border-error/30 hover:bg-error/10 hover:text-error text-xs" onClick={() => handleReject(req.id)}>Reject</Button>
                        <Button size="sm" className="flex-1 text-xs" onClick={() => handleApprove(req.id)}>Approve</Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 2: Approved / Scheduled */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg">
              <span className="font-semibold text-text">Approved / Scheduled</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-background border border-border rounded-full">{approvedRequests.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[400px] bg-surface/20 border border-dashed border-border/60 p-2 rounded-lg">
              {approvedRequests.length === 0 ? (
                <div className="text-center text-muted text-xs p-6">No scheduled requests</div>
              ) : (
                approvedRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-3 hover:border-muted transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm text-text">{req.asset?.name || `Asset ID ${req.asset_id}`}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getPriorityColor(req.priority)}`}>{req.priority}</span>
                      </div>
                      <p className="text-xs text-muted mt-2 line-clamp-3">{req.description}</p>
                    </div>
                    {isManager && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsAssignModalOpen(true);
                        }}
                      >
                        Start Progress
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 3: In Progress */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg">
              <span className="font-semibold text-primary">In Progress</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-background border border-border rounded-full text-primary">{inProgressRequests.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[400px] bg-surface/20 border border-dashed border-border/60 p-2 rounded-lg">
              {inProgressRequests.length === 0 ? (
                <div className="text-center text-muted text-xs p-6">No tasks in progress</div>
              ) : (
                inProgressRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-3 hover:border-primary/40 transition-colors">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="font-semibold text-sm text-text">{req.asset?.name || `Asset ID ${req.asset_id}`}</h4>
                        <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold ${getPriorityColor(req.priority)}`}>{req.priority}</span>
                      </div>
                      <p className="text-xs text-muted mt-2 line-clamp-3">{req.description}</p>
                      {req.scheduled_date && (
                        <p className="text-[11px] text-primary mt-2">Scheduled: {new Date(req.scheduled_date).toLocaleDateString()}</p>
                      )}
                    </div>
                    {isManager && (
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedRequest(req);
                          setIsResolveModalOpen(true);
                        }}
                      >
                        Resolve Issue
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Column 4: Resolved / History */}
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center bg-surface border border-border p-3 rounded-lg">
              <span className="font-semibold text-muted">History / Resolved</span>
              <span className="text-xs font-bold px-2 py-0.5 bg-background border border-border rounded-full text-muted">{resolvedRequests.length}</span>
            </div>
            <div className="flex flex-col gap-3 min-h-[400px] bg-surface/20 border border-dashed border-border/60 p-2 rounded-lg">
              {resolvedRequests.length === 0 ? (
                <div className="text-center text-muted text-xs p-6">No historical records</div>
              ) : (
                resolvedRequests.map(req => (
                  <div key={req.id} className="p-4 rounded-lg bg-surface border border-border/50 flex flex-col gap-2 opacity-80">
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-semibold text-sm text-muted">{req.asset?.name || `Asset ID ${req.asset_id}`}</h4>
                      <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                        req.status === 'RESOLVED' ? 'bg-primary/10 text-primary border-primary/20' : 'bg-error/10 text-error border-error/20'
                      }`}>{req.status}</span>
                    </div>
                    <p className="text-xs text-muted line-clamp-2">{req.description}</p>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      )}

      {/* 1. Raise Maintenance Request Modal */}
      {isRaiseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader>
              <CardTitle className="text-xl">Raise Maintenance Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRaiseRequest} className="flex flex-col gap-4">
                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Select Asset */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Select Damaged Asset</label>
                  <select
                    value={raiseAssetId}
                    onChange={(e) => setRaiseAssetId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  >
                    <option value="">-- Choose Asset --</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>
                        {a.name} ({a.serial_number}) - {a.status}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Priority Selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Priority Severity</label>
                  <select
                    value={raisePriority}
                    onChange={(e) => setRaisePriority(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="LOW">LOW - Minor wear / aesthetic</option>
                    <option value="MEDIUM">MEDIUM - Standard maintenance</option>
                    <option value="HIGH">HIGH - Critical defect / broken</option>
                  </select>
                </div>

                {/* Issue Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Describe the Fault / Issue</label>
                  <textarea
                    value={raiseDescription}
                    onChange={(e) => setRaiseDescription(e.target.value)}
                    rows={4}
                    placeholder="Enter details of damage or issues noticed..."
                    className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsRaiseModalOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Submit Request
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Assign Technician Scheduled Date Modal */}
      {isAssignModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Schedule Repair Session</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAssign} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Assign technician schedule and start repair work on <strong>{selectedRequest.asset?.name || `Asset ID ${selectedRequest.asset_id}`}</strong>.
                </p>

                {/* Scheduled Date */}
                <Input
                  label="Repair Scheduled Date"
                  type="date"
                  value={assignDate}
                  onChange={(e) => setAssignDate(e.target.value)}
                  required
                />

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsAssignModalOpen(false); setSelectedRequest(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Assign and Start Repair
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 3. Resolve Request Modal */}
      {isResolveModalOpen && selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl">
            <CardHeader>
              <CardTitle className="text-xl">Resolve Maintenance Request</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleResolve} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Record resolution outcomes for <strong>{selectedRequest.asset?.name || `Asset ID ${selectedRequest.asset_id}`}</strong>.
                </p>

                {/* Return Asset Status selection */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Asset Status outcome</label>
                  <select
                    value={resolveCondition}
                    onChange={(e) => setResolveCondition(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="AVAILABLE">AVAILABLE - Fixed and ready for use</option>
                    <option value="RETIRED">RETIRED - Decommissioned / Unfixable</option>
                    <option value="LOST">LOST - Cannot be found</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsResolveModalOpen(false); setSelectedRequest(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Complete Resolution
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
