import React, { useState, useEffect } from 'react';
import QRCode from 'react-qr-code';
import { X, Clock, CalendarDays, Wrench, ArrowRightLeft } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import { Asset, getAllocations } from '../../services/allocation.service';
import { getMaintenanceRequests } from '../../services/maintenance.service';

interface AssetDetailsModalProps {
  asset: Asset;
  onClose: () => void;
}

export const AssetDetailsModal: React.FC<AssetDetailsModalProps> = ({ asset, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'timeline' | 'qr'>('details');
  const [timelineEvents, setTimelineEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'timeline') {
      loadTimeline();
    }
  }, [activeTab]);

  const loadTimeline = async () => {
    setLoading(true);
    try {
      const [allocations, maintenance] = await Promise.all([
        getAllocations(),
        getMaintenanceRequests()
      ]);

      const assetAllocations = allocations.filter(a => a.asset_id === asset.id);
      const assetMaintenance = maintenance.filter(m => m.asset_id === asset.id);

      const events: any[] = [];
      
      // Add Creation Event
      events.push({
        id: 'created',
        date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // mock creation date
        type: 'creation',
        title: 'Asset Registered',
        description: `Asset ${asset.name} was added to the system.`,
        icon: <CalendarDays size={16} className="text-emerald-500" />
      });

      // Add Allocations
      assetAllocations.forEach(a => {
        events.push({
          id: `alloc-${a.id}`,
          date: new Date(a.allocated_at),
          type: 'allocation',
          title: `Allocated to ${a.allocated_to_type}`,
          description: `Assigned to ID: ${a.allocated_to_id}`,
          icon: <ArrowRightLeft size={16} className="text-blue-500" />
        });
        if (a.returned_at) {
          events.push({
            id: `return-${a.id}`,
            date: new Date(a.returned_at),
            type: 'return',
            title: 'Asset Returned',
            description: `Condition: ${a.return_condition}`,
            icon: <Clock size={16} className="text-slate-500" />
          });
        }
      });

      // Add Maintenance
      assetMaintenance.forEach(m => {
        events.push({
          id: `maint-${m.id}`,
          date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // mock request date
          type: 'maintenance_req',
          title: 'Maintenance Requested',
          description: m.description,
          icon: <Wrench size={16} className="text-amber-500" />
        });
        if (m.status === 'RESOLVED') {
          events.push({
            id: `maint-res-${m.id}`,
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // mock resolve date
            type: 'maintenance_res',
            title: 'Maintenance Resolved',
            description: `Repair completed.`,
            icon: <Wrench size={16} className="text-emerald-500" />
          });
        }
      });

      // Sort by date descending
      events.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTimelineEvents(events);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/40 backdrop-blur-sm sm:p-4">
      <div className="bg-surface w-full max-w-xl h-full sm:h-[90vh] sm:rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-border bg-slate-50/50">
          <div>
            <h2 className="text-xl font-bold text-text tracking-tight">{asset.name}</h2>
            <p className="text-sm text-muted mt-1 font-medium">{asset.serial_number}</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200/50 rounded-full transition-colors text-muted hover:text-text"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border px-6 pt-2 bg-slate-50/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'details' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            General Details
          </button>
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'timeline' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            Lifecycle Timeline
          </button>
          <button
            onClick={() => setActiveTab('qr')}
            className={`px-4 py-3 font-medium text-sm transition-colors border-b-2 -mb-[1px] ${
              activeTab === 'qr' ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-text'
            }`}
          >
            QR Code
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background">
          {activeTab === 'details' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Status</p>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                    {asset.status.replace('_', ' ')}
                  </span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Asset ID</p>
                  <p className="text-sm font-medium text-text">{asset.id}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Location</p>
                  <p className="text-sm font-medium text-text">{asset.location || 'Unassigned'}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-1">Description</p>
                  <p className="text-sm text-text leading-relaxed bg-surface border border-border p-3 rounded-lg">
                    {asset.description || 'No description provided.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'timeline' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center text-muted py-8 animate-pulse">Loading asset timeline...</div>
              ) : timelineEvents.length === 0 ? (
                <div className="text-center text-muted py-8">No timeline events found.</div>
              ) : (
                <div className="relative border-l-2 border-slate-200 ml-3 pl-6 space-y-8 py-2">
                  {timelineEvents.map((event, idx) => (
                    <div key={`${event.id}-${idx}`} className="relative">
                      <div className="absolute -left-[35px] top-1 bg-white border-2 border-slate-200 p-1 rounded-full">
                        {event.icon}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-muted uppercase tracking-wide">
                          {event.date.toLocaleDateString()}
                        </span>
                        <h4 className="text-sm font-semibold text-text mt-0.5">{event.title}</h4>
                        <p className="text-sm text-slate-500 mt-1">{event.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'qr' && (
            <div className="flex flex-col items-center justify-center space-y-6 py-8">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-border">
                <QRCode 
                  value={JSON.stringify({
                    id: asset.id,
                    serial: asset.serial_number,
                    name: asset.name
                  })}
                  size={200}
                />
              </div>
              <p className="text-sm text-muted text-center max-w-xs leading-relaxed">
                Scan this QR code to quickly pull up asset details in the mobile app or scanner.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
