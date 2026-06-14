import { useNavigate } from 'react-router';
import { ArrowRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { SeverityBadge, StatusBadge } from '../shared/badges';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'investigating' | 'in-review' | 'approved' | 'draft' | 'submitted';

interface Investigation {
  id: string;
  device: string;
  manufacturer: string;
  severity: Severity;
  status: Status;
  reviewer: string;
  created: string;
  updated: string;
}

export function RecentInvestigationsTable({ investigations }: { investigations: Investigation[] }) {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Recent Investigations</CardTitle>
        <Button
          variant="link"
          onClick={() => navigate('/investigations')}
          className="h-auto p-0 text-xs text-blue-600 hover:text-blue-700"
        >
          View all <ArrowRight size={12} />
        </Button>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border">
                {['Investigation ID', 'Device', 'Severity', 'Status', 'Reviewer', 'Updated'].map((h) => (
                  <th key={h} className="text-left text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-wide px-3 md:px-5 py-2.5 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {investigations.map((inv) => (
                <tr
                  key={inv.id}
                  className="border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors"
                  onClick={() => navigate(`/investigations/${inv.id}`)}
                >
                  <td className="px-3 md:px-5 py-3">
                    <span className="font-mono text-xs text-blue-600 font-medium">{inv.id}</span>
                  </td>
                  <td className="px-3 md:px-5 py-3">
                    <div className="text-xs font-medium text-foreground">{inv.device}</div>
                    <div className="text-[10px] md:text-[11px] text-muted-foreground hidden md:block">{inv.manufacturer}</div>
                  </td>
                  <td className="px-3 md:px-5 py-3">
                    <SeverityBadge severity={inv.severity} />
                  </td>
                  <td className="px-3 md:px-5 py-3">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-3 md:px-5 py-3 hidden lg:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-[8px] font-semibold text-slate-600">
                          {inv.reviewer === 'Unassigned' ? '?' : inv.reviewer.split(' ').map(w => w[0]).join('').slice(0, 2)}
                        </span>
                      </div>
                      <span className="text-xs text-foreground hidden xl:inline">{inv.reviewer}</span>
                    </div>
                  </td>
                  <td className="px-3 md:px-5 py-3 text-xs text-muted-foreground hidden md:table-cell">{inv.updated}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
