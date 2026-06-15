import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Loader2 } from 'lucide-react';
import type { RootState } from '../../../store/store';
import { API_ENDPOINTS } from '../../../../api/config';

interface AuditLogEntry {
  id: string;
  createdAt: string;
  action: string;
  details?: string;
}

interface AgentActivityMessage {
  id: string;
  agent: string;
  agentType: string;
  timestamp: string;
  message: string;
  severity: 'alert' | 'info';
}

interface AuditTabProps {
  agentLogs?: AgentActivityMessage[];
}

export function AuditTab({ agentLogs = [] }: AuditTabProps) {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.investigationAudit(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLogs(data || []);
        }
      } catch (error) {
        console.error('[AUDIT] Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id, token]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  const getActionType = (action: string) => {
    if (action.includes('created') || action.includes('submitted')) return 'System';
    if (action.includes('updated') || action.includes('review')) return 'User';
    return 'System';
  };

  // Combine database logs with agent activity logs
  const combinedLogs = [
    ...logs.map(log => ({
      ...log,
      type: 'database' as const,
      createdAt: log.createdAt,
    })),
    ...agentLogs.map(msg => ({
      id: msg.id,
      createdAt: msg.timestamp,
      action: msg.message,
      details: msg.agentType,
      type: 'agent' as const,
    })),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const displayLogs = combinedLogs.length > 0 ? combinedLogs : [];

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Audit Log</h3>
      {displayLogs.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-6 text-center text-muted-foreground">
          <p className="text-sm">No audit logs available yet</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr className="border-b border-border">
                  {['Timestamp', 'Action', 'Details'].map((h) => (
                    <th
                      key={h}
                      className="text-left px-3 md:px-4 py-2.5 text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayLogs.map((entry, i) => (
                    <tr
                      key={entry.id || i}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                        'type' in entry && entry.type === 'agent' ? 'bg-blue-50/30' : ''
                      }`}
                    >
                      <td className="px-3 md:px-4 py-2.5 font-mono text-[10px] md:text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(entry.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 md:px-4 py-2.5 text-xs font-medium text-foreground">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                            'type' in entry && entry.type === 'agent'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : getActionType(entry.action) === 'User'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : 'bg-slate-100 text-slate-600 border-slate-200'
                          }`}
                        >
                          {'type' in entry && entry.type === 'agent'
                            ? `Agent: ${entry.details}`
                            : getActionType(entry.action)}
                        </span>
                      </td>
                      <td className="px-3 md:px-4 py-2.5 text-xs text-foreground max-w-xs truncate">
                        {entry.action}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
