import { Bot, CheckCircle2, Loader2 } from 'lucide-react';

interface Activity {
  id: number;
  agent: string;
  action: string;
  time: string;
  status: 'done' | 'active';
  color: string;
}

export function AgentActivityFeed({ activities }: { activities: Activity[] }) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-foreground">Agent Activity</h2>
          <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            Live
          </span>
        </div>
      </div>
      <div className="divide-y divide-border overflow-auto max-h-64 lg:max-h-80">
        {activities.map((a) => (
          <div key={a.id} className="flex items-start gap-3 px-4 py-3 hover:bg-muted/30 transition-colors">
            <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: a.color + '20' }}>
              <Bot size={11} style={{ color: a.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-medium text-foreground">{a.agent}</div>
              <div className="text-[11px] text-muted-foreground leading-snug mt-0.5">{a.action}</div>
            </div>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              {a.status === 'active' ? (
                <Loader2 size={12} className="text-blue-500 animate-spin" />
              ) : (
                <CheckCircle2 size={12} className="text-green-500" />
              )}
              <span className="text-[10px] text-muted-foreground whitespace-nowrap">{a.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
