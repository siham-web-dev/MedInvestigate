import { Cpu, Scale, Stethoscope, Wrench, ShieldAlert, FileOutput } from 'lucide-react';
import { AgentCard } from '../AgentCard';
import { AGENTS } from '../../../data/investigationData';

export function GraphTab() {
  const nodes = [
    { id: 'start', label: 'START', x: 30, y: 185, type: 'circle' as const, r: 22, status: 'done' as const },
    { id: 'supervisor', label: 'Supervisor', sublabel: 'Coordinator', x: 120, y: 166, w: 140, h: 44, status: 'done' as const, color: '#6366F1' },
    { id: 'regulatory', label: 'Regulatory', sublabel: 'FDA · MDR · EU MDR', x: 340, y: 30, w: 140, h: 44, status: 'done' as const, color: '#0891B2' },
    { id: 'clinical', label: 'Clinical', sublabel: 'AE · MedDRA · Safety', x: 340, y: 108, w: 140, h: 44, status: 'done' as const, color: '#059669' },
    { id: 'technical', label: 'Technical', sublabel: 'Telemetry · Root Cause', x: 340, y: 186, w: 140, h: 44, status: 'done' as const, color: '#D97706' },
    { id: 'risk', label: 'Risk', sublabel: 'CAPA · Field Safety', x: 340, y: 264, w: 140, h: 44, status: 'done' as const, color: '#DC2626' },
    { id: 'report', label: 'Report', sublabel: 'Synthesis · Export', x: 560, y: 166, w: 140, h: 44, status: 'done' as const, color: '#7C3AED' },
    { id: 'end', label: 'END', x: 770, y: 185, type: 'circle' as const, r: 22, status: 'done' as const },
  ];

  const edges = [
    { x1: 52, y1: 188, x2: 120, y2: 188 },
    { x1: 260, y1: 188, x2: 340, y2: 52, curve: true },
    { x1: 260, y1: 188, x2: 340, y2: 130, curve: true },
    { x1: 260, y1: 188, x2: 340, y2: 208, curve: false },
    { x1: 260, y1: 188, x2: 340, y2: 286, curve: true },
    { x1: 480, y1: 52, x2: 560, y2: 188, curve: true },
    { x1: 480, y1: 130, x2: 560, y2: 188, curve: true },
    { x1: 480, y1: 208, x2: 560, y2: 188, curve: true },
    { x1: 480, y1: 286, x2: 560, y2: 188, curve: true },
    { x1: 700, y1: 188, x2: 748, y2: 188 },
  ];

  return (
    <div className="p-4 md:p-6">
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground">
            LangGraph Workflow
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Multi-agent coordination graph for MDR-2024-0891 · All nodes
            completed
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
            Queued
          </span>
        </div>
      </div>
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <svg
          viewBox="0 0 840 330"
          className="w-full"
          style={{ maxHeight: 380 }}
        >
          <defs>
            <marker
              id="arrow"
              markerWidth="6"
              markerHeight="6"
              refX="5"
              refY="3"
              orient="auto"
            >
              <path d="M0,0 L0,6 L6,3 z" fill="#CBD5E1" />
            </marker>
          </defs>

          {/* Edges */}
          {edges.map((e, i) => {
            if (!e.curve) {
              return (
                <line
                  key={i}
                  x1={e.x1}
                  y1={e.y1}
                  x2={e.x2}
                  y2={e.y2}
                  stroke="#CBD5E1"
                  strokeWidth="1.5"
                  markerEnd="url(#arrow)"
                />
              );
            }
            const mx = (e.x1 + e.x2) / 2;
            return (
              <path
                key={i}
                d={`M${e.x1},${e.y1} C${mx},${e.y1} ${mx},${e.y2} ${e.x2},${e.y2}`}
                fill="none"
                stroke="#CBD5E1"
                strokeWidth="1.5"
                markerEnd="url(#arrow)"
              />
            );
          })}

          {/* Start/End circles */}
          {nodes
            .filter((n) => n.type === 'circle')
            .map((n) => (
              <g key={n.id}>
                <circle cx={n.x} cy={n.y} r={n.r} fill="#0F172A" />
                <text
                  x={n.x}
                  y={n.y + 4}
                  textAnchor="middle"
                  fontSize="9"
                  fontWeight="600"
                  fill="white"
                  fontFamily="JetBrains Mono, monospace"
                >
                  {n.label}
                </text>
                <circle
                  cx={n.x + (n.r! - 4)}
                  cy={n.y - (n.r! - 4)}
                  r={5}
                  fill="#22C55E"
                />
              </g>
            ))}

          {/* Agent nodes */}
          {nodes
            .filter((n) => !n.type)
            .map((n) => (
              <g key={n.id}>
                <rect
                  x={n.x}
                  y={n.y}
                  width={n.w}
                  height={n.h}
                  rx="6"
                  fill="white"
                  stroke={n.color}
                  strokeWidth="1.5"
                />
                <rect
                  x={n.x}
                  y={n.y}
                  width={4}
                  height={n.h}
                  rx="2"
                  fill={n.color}
                />
                <text
                  x={n.x + 16}
                  y={n.y + 17}
                  fontSize="11"
                  fontWeight="600"
                  fill={n.color}
                  fontFamily="Inter, sans-serif"
                >
                  {n.label}
                </text>
                <text
                  x={n.x + 16}
                  y={n.y + 31}
                  fontSize="9"
                  fill="#94A3B8"
                  fontFamily="Inter, sans-serif"
                >
                  {n.sublabel}
                </text>
                <circle
                  cx={n.x + n.w! - 10}
                  cy={n.y + 12}
                  r={5}
                  fill="#22C55E"
                />
              </g>
            ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {AGENTS.map((a) => (
          <AgentCard key={a.name} agent={a} />
        ))}
      </div>
    </div>
  );
}
