import { useNavigate } from 'react-router';
import { ArrowUpDown, ExternalLink } from 'lucide-react';
import { SeverityBadge, StatusBadge } from '../shared/badges';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'investigating' | 'in-review' | 'approved' | 'draft' | 'submitted' | 'closed';

export interface Investigation {
  id: string;
  device: string;
  manufacturer: string;
  severity: Severity;
  status: Status;
  reviewer: string;
  created: string;
  updated: string;
  facility: string;
}

const avatarInitials = (name: string) =>
  name === 'Unassigned' ? '?' : name.split(' ').map((w) => w[0]).join('').slice(0, 2);

export function InvestigationsTable({
  investigations,
  sortField,
  sortDir,
  onToggleSort,
}: {
  investigations: Investigation[];
  sortField: keyof Investigation;
  sortDir: 'asc' | 'desc';
  onToggleSort: (field: keyof Investigation) => void;
}) {
  const navigate = useNavigate();

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="border-b border-border">
              {[
                { key: 'id', label: 'ID' },
                { key: 'device', label: 'Device' },
                { key: 'severity', label: 'Severity' },
                { key: 'status', label: 'Status' },
                { key: 'reviewer', label: 'Reviewer', hidden: 'lg' },
                { key: 'created', label: 'Created', hidden: 'md' },
                { key: 'updated', label: 'Updated' },
              ].map(({ key, label, hidden }) => (
                <th
                  key={key}
                  className={`text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-wide cursor-pointer hover:text-foreground select-none whitespace-nowrap ${
                    hidden === 'md' ? 'hidden md:table-cell' : hidden === 'lg' ? 'hidden lg:table-cell' : ''
                  }`}
                  onClick={() => onToggleSort(key as keyof Investigation)}
                >
                  <span className="flex items-center gap-1">
                    {label}
                    <ArrowUpDown size={10} className={sortField === key ? 'text-foreground' : 'opacity-30'} />
                  </span>
                </th>
              ))}
              <th className="px-3 md:px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {investigations.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-sm text-muted-foreground">
                  No investigations match your filters.
                </td>
              </tr>
            ) : (
              investigations.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors group"
                  onClick={() => navigate(`/investigations/${inv.id}`)}
                >
                  <td className="px-3 md:px-4 py-3">
                    <span className="font-mono text-xs text-blue-600 font-medium">{inv.id}</span>
                  </td>
                  <td className="px-3 md:px-4 py-3">
                    <div className="text-xs font-medium text-foreground">{inv.device}</div>
                    <div className="text-[10px] md:text-[11px] text-muted-foreground hidden md:block">{inv.manufacturer}</div>
                  </td>
                  <td className="px-3 md:px-4 py-3">
                    <SeverityBadge severity={inv.severity} />
                  </td>
                  <td className="px-3 md:px-4 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-3 md:px-4 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-semibold text-slate-600">{avatarInitials(inv.reviewer)}</span>
                      </div>
                      <span className="text-xs text-foreground hidden xl:inline">{inv.reviewer}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">{inv.created}</td>
                  <td className="px-3 md:px-4 py-3 text-xs text-muted-foreground">{inv.updated}</td>
                  <td className="px-3 md:px-4 py-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/investigations/${inv.id}`);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded transition-all"
                    >
                      <ExternalLink size={13} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <PaginationControls count={investigations.length} />
    </div>
  );
}

function PaginationControls({ count }: { count: number }) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 md:px-4 py-3 border-t border-border">
      <span className="text-xs text-muted-foreground">{count} results</span>
      <div className="flex items-center gap-1">
        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors disabled:opacity-30" disabled>
          ❮
        </button>
        <span className="text-xs text-foreground px-2 py-1 bg-primary text-primary-foreground rounded-md">1</span>
        <button className="text-xs text-muted-foreground px-2 py-1 hover:bg-muted rounded-md transition-colors">2</button>
        <button className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md transition-colors">
          ❯
        </button>
      </div>
    </div>
  );
}
