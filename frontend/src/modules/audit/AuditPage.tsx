import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { useAuth } from '../../context/AuthContext';
import * as auditService from '../../services/audit.service';
import * as service from '../../services/allocation.service'; // For users list

export const AuditPage: React.FC = () => {
  const { user } = useAuth();
  const isManager = user?.role === 'admin' || user?.role === 'asset_manager';

  // Data States
  const [cycles, setCycles] = useState<auditService.AuditCycle[]>([]);
  const [selectedCycleId, setSelectedCycleId] = useState<number | null>(null);
  const [items, setItems] = useState<auditService.AuditItem[]>([]);
  const [employees, setEmployees] = useState<service.User[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Modals States
  const [isCreateCycleOpen, setIsCreateCycleOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<auditService.AuditItem | null>(null);
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);

  // Form States
  const [cycleName, setCycleName] = useState<string>('');
  const [cycleStartDate, setCycleStartDate] = useState<string>('');
  const [cycleAuditorId, setCycleAuditorId] = useState<string>('');
  const [verifyStatus, setVerifyStatus] = useState<'VERIFIED' | 'MISSING' | 'DAMAGED'>('VERIFIED');
  const [verifyNotes, setVerifyNotes] = useState<string>('');

  const [formError, setFormError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const cycleList = await auditService.getAuditCycles();
      setCycles(cycleList);
      
      // Compile unique list of users or seed static employee records
      const usersList: service.User[] = [
        { id: 1, email: 'admin@assetflow.com', full_name: 'Admin User', role: 'admin' },
        { id: 2, email: 'manager@assetflow.com', full_name: 'Asset Manager', role: 'asset_manager' },
        { id: 3, email: 'employee@assetflow.com', full_name: 'John Doe', role: 'employee' },
        { id: 4, email: 'employee2@assetflow.com', full_name: 'Jane Smith', role: 'employee' }
      ];
      setEmployees(usersList);

      // Auto-select first cycle if available
      if (cycleList.length > 0 && selectedCycleId === null) {
        setSelectedCycleId(cycleList[0].id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to load audit records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch Items when cycle changes
  const loadCycleItems = async (cycleId: number) => {
    try {
      setItemsLoading(true);
      const itemList = await auditService.getAuditItems(cycleId);
      setItems(itemList);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to load items in audit cycle.');
    } finally {
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedCycleId !== null) {
      loadCycleItems(selectedCycleId);
    } else {
      setItems([]);
    }
  }, [selectedCycleId]);

  const handleCreateCycle = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!cycleName || !cycleStartDate || !cycleAuditorId) {
      setFormError('Please fill in all fields.');
      return;
    }

    try {
      const newCycle = await auditService.createAuditCycle({
        name: cycleName,
        start_date: new Date(cycleStartDate).toISOString().split('T')[0],
        auditor_id: parseInt(cycleAuditorId)
      });
      setIsCreateCycleOpen(false);
      setCycleName('');
      setCycleStartDate('');
      setCycleAuditorId('');
      setSelectedCycleId(newCycle.id);
      loadData();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || 'Failed to initiate audit cycle.');
    }
  };

  const handleVerifyItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCycleId === null || !selectedItem) return;

    try {
      await auditService.verifyAuditItem(selectedCycleId, selectedItem.id, {
        status: verifyStatus,
        notes: verifyNotes
      });
      setIsVerifyOpen(false);
      setSelectedItem(null);
      setVerifyNotes('');
      loadCycleItems(selectedCycleId);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to record verification.');
    }
  };

  const handleCloseCycle = async () => {
    if (selectedCycleId === null) return;
    const cycle = cycles.find(c => c.id === selectedCycleId);
    if (!cycle) return;

    if (!window.confirm(`Are you sure you want to close and lock the audit cycle '${cycle.name}'? This will permanently log results and update discrepancies.`)) return;

    try {
      await auditService.closeAuditCycle(selectedCycleId);
      loadData();
      if (selectedCycleId !== null) {
        loadCycleItems(selectedCycleId);
      }
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to close cycle.');
    }
  };

  const selectedCycle = cycles.find(c => c.id === selectedCycleId);
  const isClosed = selectedCycle?.status === 'CLOSED';

  // Metrics calculation
  const verifiedCount = items.filter(i => i.status === 'VERIFIED').length;
  const missingCount = items.filter(i => i.status === 'MISSING').length;
  const damagedCount = items.filter(i => i.status === 'DAMAGED').length;
  const pendingCount = items.filter(i => i.status === 'PENDING').length;
  const discrepancyReportList = items.filter(i => i.status === 'MISSING' || i.status === 'DAMAGED');

  const getRecipientName = (id: number) => {
    const emp = employees.find(e => e.id === id);
    return emp ? emp.full_name : `User ID ${id}`;
  };

  if (loading) {
    return <div className="p-12 text-center text-muted">Loading audit dashboard...</div>;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      {error && (
        <div className="p-4 bg-error/10 border border-error/20 text-error rounded-md">
          {error}
        </div>
      )}
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-text">Asset Audit</h1>
          <p className="text-muted text-sm mt-1">
            Track structured audit cycles, assign auditors, verify items, and check discrepancy reports.
          </p>
        </div>
        {isManager && (
          <Button onClick={() => { setIsCreateCycleOpen(true); setFormError(null); }} className="w-full md:w-auto">
            New Audit Cycle
          </Button>
        )}
      </div>

      {/* Cycle Selector Dropdown */}
      <Card className="bg-surface border-border">
        <CardContent className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label className="text-sm font-semibold text-text whitespace-nowrap">Select Cycle:</label>
            <select
              value={selectedCycleId || ''}
              onChange={(e) => setSelectedCycleId(e.target.value ? parseInt(e.target.value) : null)}
              className="flex h-10 w-full md:w-64 rounded-md border border-border bg-background px-3 py-2 text-sm text-text focus-visible:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="">-- No Audit Cycles --</option>
              {cycles.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.status})
                </option>
              ))}
            </select>
          </div>
          {selectedCycle && (
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <div>
                <span className="text-muted">Auditor:</span>{' '}
                <span className="font-medium text-text">{getRecipientName(selectedCycle.auditor_id)}</span>
              </div>
              <div>
                <span className="text-muted">Start Date:</span>{' '}
                <span className="font-medium text-text">{new Date(selectedCycle.start_date).toLocaleDateString()}</span>
              </div>
              {selectedCycle.end_date && (
                <div>
                  <span className="text-muted">End Date:</span>{' '}
                  <span className="font-medium text-text">{new Date(selectedCycle.end_date).toLocaleDateString()}</span>
                </div>
              )}
              {isManager && !isClosed && (
                <Button size="sm" onClick={handleCloseCycle}>
                  Close & Lock Cycle
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedCycle && (
        <>
          {/* Metrics summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-surface border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{verifiedCount}</div>
                <div className="text-xs text-muted mt-1">Verified (Good Status)</div>
              </CardContent>
            </Card>
            <Card className="bg-surface border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-error">{missingCount}</div>
                <div className="text-xs text-muted mt-1">Missing / Lost</div>
              </CardContent>
            </Card>
            <Card className="bg-surface border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-secondary">{damagedCount}</div>
                <div className="text-xs text-muted mt-1">Damaged (Needs Repair)</div>
              </CardContent>
            </Card>
            <Card className="bg-surface border-border">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-muted">{pendingCount}</div>
                <div className="text-xs text-muted mt-1">Pending Check</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            
            {/* Audit Items Table */}
            <Card className="xl:col-span-2 bg-surface border-border overflow-hidden">
              <CardHeader>
                <CardTitle className="text-lg">Cycle Audit Records</CardTitle>
                <p className="text-muted text-xs">Verify asset presence and log condition notes</p>
              </CardHeader>
              <CardContent className="p-0">
                {itemsLoading ? (
                  <div className="p-12 text-center text-muted">Loading cycle records...</div>
                ) : items.length === 0 ? (
                  <div className="p-12 text-center text-muted">No items in this cycle.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead>
                        <tr className="border-b border-border bg-background/50 text-xs font-semibold uppercase text-muted">
                          <th className="p-4">Asset Name</th>
                          <th className="p-4">Serial Number</th>
                          <th className="p-4">Status</th>
                          <th className="p-4">Notes</th>
                          {!isClosed && <th className="p-4 text-right">Action</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border text-text">
                        {items.map(item => (
                          <tr key={item.id} className="hover:bg-background/20">
                            <td className="p-4 font-medium">{item.asset?.name || `Asset ID ${item.asset_id}`}</td>
                            <td className="p-4 text-muted">{item.asset?.serial_number}</td>
                            <td className="p-4">
                              <span className={`text-[11px] font-bold px-2 py-0.5 rounded border uppercase ${
                                item.status === 'VERIFIED' ? 'bg-primary/10 text-primary border-primary/20' :
                                item.status === 'MISSING' ? 'bg-error/10 text-error border-error/20 animate-pulse' :
                                item.status === 'DAMAGED' ? 'bg-secondary/10 text-secondary border-secondary/20' :
                                'bg-muted/10 text-muted border-muted/20'
                              }`}>
                                {item.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-muted line-clamp-1 max-w-[150px]" title={item.notes}>
                              {item.notes || '-'}
                            </td>
                            {!isClosed && (
                              <td className="p-4 text-right">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedItem(item);
                                    setVerifyStatus(item.status === 'PENDING' ? 'VERIFIED' : item.status as any);
                                    setVerifyNotes(item.notes || '');
                                    setIsVerifyOpen(true);
                                  }}
                                >
                                  Verify
                                </Button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Discrepancy Report */}
            <Card className="bg-surface border-border flex flex-col">
              <CardHeader>
                <CardTitle className="text-lg">Discrepancy Report</CardTitle>
                <p className="text-muted text-xs">Flagged deviations from physical count</p>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col gap-3">
                {discrepancyReportList.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-center text-xs text-muted border border-dashed border-border p-6 rounded-lg">
                    No discrepancies logged! All verified items are in clean condition.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
                    {discrepancyReportList.map(item => (
                      <div key={item.id} className="p-3 bg-background/50 border border-border rounded-lg flex flex-col gap-1.5">
                        <div className="flex justify-between items-start">
                          <h4 className="font-semibold text-sm text-text">{item.asset?.name}</h4>
                          <span className={`text-[9px] px-1.5 py-0.5 rounded border font-bold uppercase ${
                            item.status === 'MISSING' ? 'bg-error/15 text-error border-error/30' : 'bg-secondary/15 text-secondary border-secondary/30'
                          }`}>{item.status}</span>
                        </div>
                        <p className="text-xs text-muted">S/N: {item.asset?.serial_number}</p>
                        {item.notes && (
                          <div className="text-xs p-2 bg-surface border border-border/50 rounded text-muted mt-1 italic">
                            "{item.notes}"
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                {isClosed && (
                  <div className="p-3 bg-error/10 border border-error/20 text-error text-xs rounded-md mt-auto">
                    ⚠️ Cycle is Closed. Discrepancy statuses are locked. Missing assets have updated to LOST, and Damaged items have auto-generated maintenance.
                  </div>
                )}
              </CardContent>
            </Card>

          </div>
        </>
      )}

      {/* 1. New Audit Cycle Modal */}
      {isCreateCycleOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader>
              <CardTitle className="text-xl">Initiate Audit Cycle</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateCycle} className="flex flex-col gap-4">
                {formError && (
                  <div className="p-3 text-sm text-error bg-error/10 border border-error/25 rounded-md">
                    {formError}
                  </div>
                )}
                
                {/* Name */}
                <Input
                  label="Audit Cycle Name"
                  placeholder="e.g. Q3 2026 Annual Audit"
                  value={cycleName}
                  onChange={(e) => setCycleName(e.target.value)}
                  required
                />

                {/* Start Date */}
                <Input
                  label="Audit Start Date"
                  type="date"
                  value={cycleStartDate}
                  onChange={(e) => setCycleStartDate(e.target.value)}
                  required
                />

                {/* Select Auditor */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Assign Auditor</label>
                  <select
                    value={cycleAuditorId}
                    onChange={(e) => setCycleAuditorId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                    required
                  >
                    <option value="">-- Choose Auditor --</option>
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.full_name} ({e.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateCycleOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Start Cycle
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 2. Verify Asset Modal */}
      {isVerifyOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Card className="w-full max-w-md bg-surface border-border shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <CardHeader>
              <CardTitle className="text-xl">Verify Physical Asset</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleVerifyItem} className="flex flex-col gap-4">
                <p className="text-sm text-muted">
                  Verify presence and condition of <strong>{selectedItem.asset?.name}</strong> (S/N: {selectedItem.asset?.serial_number}).
                </p>

                {/* Verification Status */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Verification Result</label>
                  <select
                    value={verifyStatus}
                    onChange={(e) => setVerifyStatus(e.target.value as any)}
                    className="flex h-10 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  >
                    <option value="VERIFIED">VERIFIED - Present & undamaged</option>
                    <option value="DAMAGED">DAMAGED - Present but needs repair</option>
                    <option value="MISSING">MISSING - Cannot be found / lost</option>
                  </select>
                </div>

                {/* Notes */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text">Verification Notes</label>
                  <textarea
                    value={verifyNotes}
                    onChange={(e) => setVerifyNotes(e.target.value)}
                    rows={3}
                    placeholder="Enter details of wear and tear, missing tags, or last known location..."
                    className="flex w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-text focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4">
                  <Button type="button" variant="outline" onClick={() => { setIsVerifyOpen(false); setSelectedItem(null); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Record Verification
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
