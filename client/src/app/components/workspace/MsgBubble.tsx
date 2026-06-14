import { Bot } from 'lucide-react';

export interface AgentMessage {
  id: number;
  agent: string;
  color: string;
  ts: string;
  msg: string;
  type: 'info' | 'dispatch' | 'tool' | 'result' | 'alert' | 'complete';
}

export function MsgBubble({ msg }: { msg: AgentMessage }) {
  const typeBg: Record<AgentMessage['type'], string> = {
    info: 'bg-slate-50 border-slate-200',
    dispatch: 'bg-blue-50 border-blue-200',
    tool: 'bg-amber-50 border-amber-200',
    result: 'bg-green-50 border-green-200',
    alert: 'bg-red-50 border-red-200',
    complete: 'bg-violet-50 border-violet-200',
  };
  const typeLabel: Record<AgentMessage['type'], string> = {
    info: 'Info',
    dispatch: 'Dispatch',
    tool: 'Tool Call',
    result: 'Result',
    alert: 'Alert',
    complete: 'Complete',
  };
  return (
    <div
      className={`flex items-start gap-2.5 p-3 rounded-md border text-[11px] ${typeBg[msg.type]}`}
    >
      <div
        className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: msg.color + '25' }}
      >
        <Bot size={10} style={{ color: msg.color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="font-semibold" style={{ color: msg.color }}>
            {msg.agent} Agent
          </span>
          <span className="text-muted-foreground font-mono text-[10px]">
            {msg.ts}
          </span>
          <span
            className={`ml-auto px-1.5 py-0.5 rounded text-[10px] font-medium border ${typeBg[msg.type]} opacity-80`}
          >
            {typeLabel[msg.type]}
          </span>
        </div>
        <p className="text-foreground leading-snug">{msg.msg}</p>
      </div>
    </div>
  );
}
