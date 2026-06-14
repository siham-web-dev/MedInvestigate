export function AuditTab() {
  const log = [
    {
      ts: 'Jan 18, 10:47',
      actor: 'Dr. Sarah Chen',
      type: 'User',
      action: 'Submitted investigation for review',
      icon: '👤',
    },
    {
      ts: 'Jan 18, 10:23',
      actor: 'Report Agent',
      type: 'Agent',
      action: 'Generated final investigation report (PDF/DOCX)',
      icon: '🤖',
    },
    {
      ts: 'Jan 18, 10:23',
      actor: 'Supervisor Agent',
      type: 'Agent',
      action: 'Investigation analysis complete — root cause confirmed',
      icon: '🤖',
    },
    {
      ts: 'Jan 18, 10:21',
      actor: 'Risk Agent',
      type: 'Agent',
      action: 'Tool: field_distribution_query() — 2,400 devices returned',
      icon: '🔧',
    },
    {
      ts: 'Jan 18, 10:19',
      actor: 'Technical Agent',
      type: 'Agent',
      action: 'Tool: cve_lookup(firmware="3.4.1") — CVE-CSP-2024-003 matched',
      icon: '🔧',
    },
    {
      ts: 'Jan 18, 10:17',
      actor: 'Regulatory Agent',
      type: 'Agent',
      action: 'Tool: maude_query(device="CardioSync Pro 3000") — 3 results',
      icon: '🔧',
    },
    {
      ts: 'Jan 18, 10:15',
      actor: 'Supervisor Agent',
      type: 'Agent',
      action:
        'Dispatched 4 parallel agents: Regulatory, Clinical, Technical, Risk',
      icon: '🤖',
    },
    {
      ts: 'Jan 17, 09:00',
      actor: 'Dr. Sarah Chen',
      type: 'User',
      action: 'Assigned as primary reviewer',
      icon: '👤',
    },
    {
      ts: 'Jan 16, 14:22',
      actor: 'Dr. Marcus Liu',
      type: 'User',
      action: 'Requested additional technical analysis',
      icon: '👤',
    },
    {
      ts: 'Jan 15, 10:23',
      actor: 'System',
      type: 'System',
      action: 'LangGraph workflow initialized — 6 agents instantiated',
      icon: '⚙️',
    },
    {
      ts: 'Jan 15, 09:41',
      actor: 'James Rodriguez',
      type: 'User',
      action: 'Incident submitted — investigation MDR-2024-0891 created',
      icon: '👤',
    },
  ];

  return (
    <div className="p-4 md:p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4">Audit Log</h3>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-max">
            <thead>
              <tr className="border-b border-border">
                {['Timestamp', 'Actor', 'Type', 'Action'].map((h) => (
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
              {log.map((entry, i) => (
                <tr
                  key={i}
                  className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                >
                  <td className="px-3 md:px-4 py-2.5 font-mono text-[10px] md:text-[11px] text-muted-foreground whitespace-nowrap">
                    {entry.ts}
                  </td>
                  <td className="px-3 md:px-4 py-2.5 text-xs font-medium text-foreground whitespace-nowrap">
                    {entry.actor}
                  </td>
                  <td className="px-3 md:px-4 py-2.5">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${
                        entry.type === 'User'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : entry.type === 'Agent'
                            ? 'bg-violet-50 text-violet-700 border-violet-200'
                            : entry.type === 'System'
                              ? 'bg-slate-100 text-slate-600 border-slate-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-3 md:px-4 py-2.5 text-xs text-foreground">
                    {entry.action}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
