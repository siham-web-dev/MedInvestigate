import { useState } from 'react';
import { Search } from 'lucide-react';
import { InvestigationsHeader } from '../components/investigations/InvestigationsHeader';
import { FilterSelect } from '../components/investigations/FilterSelect';
import { InvestigationsTable, type Investigation } from '../components/investigations/InvestigationsTable';

const DATA: Investigation[] = [
  { id: 'MDR-2024-0891', device: 'CardioSync Pro 3000', manufacturer: 'CardioSync Medical Systems', severity: 'critical', status: 'in-review', reviewer: 'Dr. Sarah Chen', created: 'Jan 15, 2024', updated: 'Jan 18, 2024', facility: 'Mayo Clinic' },
  { id: 'MDR-2024-0887', device: 'InfuSmart IV Pump', manufacturer: 'PharmaTech Inc.', severity: 'high', status: 'investigating', reviewer: 'James Rodriguez', created: 'Jan 14, 2024', updated: 'Jan 17, 2024', facility: 'Cleveland Clinic' },
  { id: 'MDR-2024-0883', device: 'NeuroPace RNS System', manufacturer: 'NeuroPace Inc.', severity: 'high', status: 'submitted', reviewer: 'Dr. Priya Nair', created: 'Jan 13, 2024', updated: 'Jan 16, 2024', facility: 'Johns Hopkins Hospital' },
  { id: 'MDR-2024-0879', device: 'Medtronic MiniMed 780G', manufacturer: 'Medtronic', severity: 'medium', status: 'in-review', reviewer: 'Dr. Marcus Liu', created: 'Jan 12, 2024', updated: 'Jan 15, 2024', facility: 'Stanford Health Care' },
  { id: 'MDR-2024-0874', device: 'LifeVest WCD 4000', manufacturer: 'Zoll Medical Corp.', severity: 'medium', status: 'approved', reviewer: 'Rachel Torres', created: 'Jan 11, 2024', updated: 'Jan 14, 2024', facility: 'MGH Boston' },
  { id: 'MDR-2024-0869', device: 'Inspire Upper Airway Stimulation', manufacturer: 'Inspire Medical Systems', severity: 'low', status: 'draft', reviewer: 'Unassigned', created: 'Jan 10, 2024', updated: 'Jan 10, 2024', facility: 'UCSF Medical Center' },
  { id: 'MDR-2024-0866', device: 'Abbott Portico Valve', manufacturer: 'Abbott Vascular', severity: 'critical', status: 'investigating', reviewer: 'Dr. Thomas Park', created: 'Jan 9, 2024', updated: 'Jan 13, 2024', facility: 'NewYork-Presbyterian' },
  { id: 'MDR-2024-0861', device: 'Boston Scientific Watchman FLX', manufacturer: 'Boston Scientific', severity: 'high', status: 'in-review', reviewer: 'Dr. Sarah Chen', created: 'Jan 8, 2024', updated: 'Jan 12, 2024', facility: 'Mayo Clinic' },
  { id: 'MDR-2024-0855', device: 'Edwards SAPIEN 3 Valve', manufacturer: 'Edwards Lifesciences', severity: 'medium', status: 'approved', reviewer: 'Dr. Priya Nair', created: 'Jan 7, 2024', updated: 'Jan 11, 2024', facility: 'Cleveland Clinic' },
  { id: 'MDR-2024-0849', device: 'Stryker Triathlon Knee System', manufacturer: 'Stryker Orthopaedics', severity: 'low', status: 'closed', reviewer: 'James Rodriguez', created: 'Jan 6, 2024', updated: 'Jan 10, 2024', facility: 'Johns Hopkins Hospital' },
  { id: 'MDR-2024-0843', device: 'Intuitive da Vinci Xi', manufacturer: 'Intuitive Surgical', severity: 'high', status: 'submitted', reviewer: 'Dr. Marcus Liu', created: 'Jan 5, 2024', updated: 'Jan 9, 2024', facility: 'Stanford Health Care' },
  { id: 'MDR-2024-0837', device: 'Becton BD Alaris Pump', manufacturer: 'Becton Dickinson', severity: 'medium', status: 'closed', reviewer: 'Rachel Torres', created: 'Jan 4, 2024', updated: 'Jan 8, 2024', facility: 'UCSF Medical Center' },
];

export default function Investigations() {
  const [search, setSearch] = useState('');
  const [severity, setSeverity] = useState('all');
  const [status, setStatus] = useState('all');
  const [sortField, setSortField] = useState<keyof Investigation>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filtered = DATA
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

      {/* Filters */}
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
    </div>
  );
}
