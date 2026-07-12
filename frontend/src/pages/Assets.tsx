import React, { useState, useEffect } from 'react';
import { Search, Filter, Plus, AlertTriangle } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Card, CardContent } from '../components/common/Card';
import { getAssets, Asset } from '../services/asset.service';

export const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadAssets();
  }, []);

  const loadAssets = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAssets();
      setAssets(data);
    } catch (err) {
      setError("Failed to load assets data.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'ALLOCATED': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'UNDER_MAINTENANCE': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'LOST': return 'bg-rose-100 text-rose-700 border-rose-200';
      case 'RETIRED': return 'bg-slate-100 text-slate-700 border-slate-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    a.serial_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-[28px] font-bold text-text tracking-tight">Assets</h1>
          <p className="text-muted mt-1 text-sm">Register, search and track organizational assets.</p>
        </div>
        <Button className="gap-2">
          <Plus size={18} />
          Register Asset
        </Button>
      </div>

      <Card className="bg-surface border-border">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search assets by name or serial number..." 
                className="w-full bg-background border border-border rounded-md py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-primary/50"
              />
            </div>
            <Button variant="outline" className="gap-2">
              <Filter size={18} />
              Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-surface border-border min-h-[400px]">
        {loading ? (
          <CardContent className="p-0 flex items-center justify-center min-h-[400px]">
            <div className="text-muted text-lg animate-pulse">Loading assets...</div>
          </CardContent>
        ) : error ? (
          <CardContent className="p-0 flex items-center justify-center min-h-[400px]">
            <div className="text-rose-600 bg-rose-50 p-6 rounded-xl border border-rose-200 text-center">
              <AlertTriangle size={32} className="mx-auto mb-3" />
              <p className="font-semibold">{error}</p>
              <Button onClick={loadAssets} variant="outline" className="mt-4 bg-white text-rose-700 border-rose-200">Retry</Button>
            </div>
          </CardContent>
        ) : (
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-background/50 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold text-text">Asset ID / Serial</th>
                    <th className="px-6 py-4 font-semibold text-text">Name & Model</th>
                    <th className="px-6 py-4 font-semibold text-text">Status</th>
                    <th className="px-6 py-4 font-semibold text-text">Description</th>
                    <th className="px-6 py-4 font-semibold text-text text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredAssets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted">
                        No assets found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAssets.map(asset => (
                      <tr key={asset.id} className="hover:bg-background/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-text">{asset.serial_number}</div>
                          <div className="text-xs text-muted mt-1">ID: {asset.id}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-text">{asset.name}</div>
                          <div className="text-xs text-muted mt-1">{asset.model}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(asset.status)}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-muted truncate max-w-[200px]">
                          {asset.description || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="outline" size="sm">View Details</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};
