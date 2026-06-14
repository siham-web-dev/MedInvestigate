import { CheckCircle2, Circle, Loader2 } from 'lucide-react';

type AgentStatus = 'idle' | 'active' | 'done' | 'queued';

interface Agent {
  name: string;
  icon: React.ElementType;
  color: string;
  status: AgentStatus;
  summary: string;
}

export function AgentCard({ agent }: { agent: Agent }) {
  const Icon = agent.icon;
  return (
    <div className="bg-card border border-border rounded-lg p-3">
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className="w-5 h-5 rounded flex items-center justify-center"
          style={{ background: agent.color + '20' }}
        >
          <Icon size={11} style={{ color: agent.color }} />
        </div>
        <span className="text-xs font-semibold" style={{ color: agent.color }}>
          {agent.name}
        </span>
        <AgentDot status={agent.status} />
      </div>
      <p className="text-[10px] text-muted-foreground leading-snug">
        {agent.summary}
      </p>
    </div>
  );
}

function AgentDot({ status }: { status: AgentStatus }) {
  if (status === 'done')
    return <CheckCircle2 size={13} className="text-green-500" />;
  if (status === 'active')
    return <Loader2 size={13} className="text-blue-500 animate-spin" />;
  return <Circle size={13} className="text-slate-300" />;
}
