import { useState, useEffect } from 'react';
import { Search, AlertCircle } from 'lucide-react';
import { useSelector } from 'react-redux';
import { InvestigationsHeader } from '../components/investigations/InvestigationsHeader';
import { FilterSelect } from '../components/investigations/FilterSelect';
import { InvestigationsTable, type Investigation } from '../components/investigations/InvestigationsTable';
import type { RootState } from '../../store/store';
import { API_ENDPOINTS } from '../../api/config';

const transformBackendData = (backendData: any[]): Investigation[] => {
  return backendData.map((inv: any) => ({
    id: inv.id,
    device: inv.incident?.deviceName || 'Unknown Device',
    manufacturer: inv.incident?.manufacturer || 'Unknown Manufacturer',
    severity: inv.incident?.severity?.toLowerCase() || 'medium',
    status: inv.phase?.toLowerCase().replace(' ', '-') || 'draft',
    reviewer: inv.assignedTo || 'Unassigned',
    created: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A',
    updated: inv.updatedAt ? new Date(inv.updatedAt).toLocaleDateString() : 'N/A',
    facility: inv.incident?.facility || 'Unknown Facility',
  }));
};


export default function Investigations() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Investigation>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchInvestigations();
  }, [token]);

  const fetchInvestigations = async () => {
    try {
      if (!token) {
        setError('Not authenticated. Please log in first.');
        setIsLoading(false);
        return;
      }

      console.log('[INVESTIGATIONS] Fetching investigations from backend');
      setIsLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.investigations, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch investigations: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('[INVESTIGATIONS] Received data:', data);

      const transformedData = Array.isArray(data) ? transformBackendData(data) : [];
      setInvestigations(transformedData);
      console.log('[INVESTIGATIONS] Transformed data:', transformedData);
    } catch (err) {
      console.error('[INVESTIGATIONS] Error fetching investigations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load investigations');
    } finally {
      setIsLoading(false);
    }
  };

  const filtered = investigations
    .filter((i) =>
      (severity === 'all' || i.severity === severity) &&
      (status === 'all' || i.status === status) &&
      (search === '' || [i.id, i.device, i.manufacturer, i.reviewer].some((f) => f.toLowerCase().includes(search.toLowerCase())))
    )
    .sort((a, b) => {
      const av = a[sortField] as string;
      const bv = b[sortField] as string;
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

  const toggleSort = (field: keyof Investigation) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('desc'); }
  };

  return (
    <div className="p-4 md:p-6">
      <InvestigationsHeader count={filtered.length} />

      {/* Error message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
          <AlertCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-red-700">
            <p className="font-medium">Failed to load investigations from backend</p>
            <p className="text-xs mt-1">{error}</p>
            <button
              onClick={fetchInvestigations}
              className="text-xs text-red-600 hover:text-red-800 underline mt-1"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-center py-8 text-muted-foreground">
          Loading investigations...
        </div>
      )}

      {/* Filters */}
      {!isLoading && (
        <>
          <div className="flex flex-col gap-3 mb-4">
            <div className="relative w-full">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                className="w-full pl-8 pr-3 py-2 text-sm bg-card border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 focus:border-primary"
                placeholder="Search by ID, device, reviewer…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <FilterSelect label="Severity" value={severity} onChange={setSeverity}>
                <option value="all">All Severities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </FilterSelect>

              <FilterSelect label="Status" value={status} onChange={setStatus}>
                <option value="all">All Statuses</option>
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="investigating">Investigating</option>
                <option value="in-review">In Review</option>
                <option value="approved">Approved</option>
                <option value="closed">Closed</option>
              </FilterSelect>

              {(severity !== 'all' || status !== 'all' || search) && (
                <button
                  onClick={() => { setSeverity('all'); setStatus('all'); setSearch(''); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-md hover:bg-muted"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          <InvestigationsTable
            investigations={filtered}
            sortField={sortField}
            sortDir={sortDir}
            onToggleSort={toggleSort}
          />
        </>
      )}
    </div>
  );
}
