import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Cpu, Scale, Stethoscope, Wrench, ShieldAlert, FileOutput, Loader2 } from 'lucide-react';
import { AgentCard } from '../AgentCard';
import type { RootState } from '../../../../store/store';
import { API_ENDPOINTS } from '../../../../api/config';

type AgentStatus = "idle" | "active" | "done" | "queued";

interface AgentActivity {
  id?: string;
  agentType: string;
  agentName?: string;
  timestamp: string;
  status?: string;
  message?: string;
  severity?: string;
}

const AGENT_COLORS: Record<string, string> = {
  Supervisor: "#6366F1",
  Regulatory: "#0891B2",
  Clinical: "#059669",
  Technical: "#D97706",
  Risk: "#DC2626",
  Report: "#7C3AED",
};

const AGENT_ICONS: Record<string, any> = {
  Supervisor: Cpu,
  Regulatory: Scale,
  Clinical: Stethoscope,
  Technical: Wrench,
  Risk: ShieldAlert,
  Report: FileOutput,
};

interface GraphTabProps {
  activities?: AgentActivity[];
  streaming?: boolean;
}

export function GraphTab({ activities = [], streaming = false }: GraphTabProps) {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [localActivities, setLocalActivities] = useState<AgentActivity[]>(activities);
  const [loading, setLoading] = useState(true);

  // Update local activities when passed activities change
  useEffect(() => {
    if (activities && activities.length > 0) {
      setLocalActivities(activities);
      setLoading(false);
    }
  }, [activities]);

  // Fetch initial logs only on mount if no activities provided
  useEffect(() => {
    if (activities && activities.length > 0) {
      return;
    }

    const fetchLogs = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.investigationAgentLogs(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setLocalActivities(data || []);
        }
      } catch (error) {
        console.error('[GRAPH] Failed to fetch logs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();
  }, [id, token]);

  const getAgentStatus = (agentType: string): AgentStatus => {
    const lastActivity = localActivities.filter((a) => a.agentType === agentType).pop();
    if (!lastActivity) return 'idle';
    // If streaming is true and this agent was recently active, mark as active
    if (streaming && lastActivity) {
      const activityTime = new Date(lastActivity.timestamp).getTime();
      const now = Date.now();
      const recentThreshold = 5000; // 5 seconds
      if (now - activityTime < recentThreshold) {
        return 'active';
      }
    }
    return 'done';
  };

  const AGENTS = [
    {
      name: "Supervisor",
      icon: AGENT_ICONS.Supervisor,
      color: AGENT_COLORS.Supervisor,
      status: getAgentStatus("Supervisor") as AgentStatus,
      summary: "Coordinated multi-agent investigation",
    },
    {
      name: "Regulatory",
      icon: AGENT_ICONS.Regulatory,
      color: AGENT_COLORS.Regulatory,
      status: getAgentStatus("Regulatory") as AgentStatus,
      summary: "FDA compliance & MDR analysis",
    },
    {
      name: "Clinical",
      icon: AGENT_ICONS.Clinical,
      color: AGENT_COLORS.Clinical,
      status: getAgentStatus("Clinical") as AgentStatus,
      summary: "Patient safety assessment",
    },
    {
      name: "Technical",
      icon: AGENT_ICONS.Technical,
      color: AGENT_COLORS.Technical,
      status: getAgentStatus("Technical") as AgentStatus,
      summary: "Device failure analysis",
    },
    {
      name: "Risk",
      icon: AGENT_ICONS.Risk,
      color: AGENT_COLORS.Risk,
      status: getAgentStatus("Risk") as AgentStatus,
      summary: "Risk evaluation & CAPA",
    },
    {
      name: "Report",
      icon: AGENT_ICONS.Report,
      color: AGENT_COLORS.Report,
      status: getAgentStatus("Report") as AgentStatus,
      summary: "Report synthesis & export",
    },
  ];
  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  const getStatusIndicatorColor = (status: AgentStatus): string => {
    switch (status) {
      case 'active':
        return '#3B82F6'; // Blue for active
      case 'done':
        return '#22C55E'; // Green for done
      case 'queued':
        return '#CBD5E1'; // Gray for queued
      default:
        return '#94A3B8'; // Slate for idle
    }
  };

  const supervisorStatus = getAgentStatus('Supervisor');
  const regulatoryStatus = getAgentStatus('Regulatory');
  const clinicalStatus = getAgentStatus('Clinical');
  const technicalStatus = getAgentStatus('Technical');
  const riskStatus = getAgentStatus('Risk');
  const reportStatus = getAgentStatus('Report');

  // END node is only done when all agents are done
  const allAgentsDone = [supervisorStatus, regulatoryStatus, clinicalStatus, technicalStatus, riskStatus, reportStatus].every(status => status === 'done');
  const endNodeStatus: AgentStatus = allAgentsDone ? 'done' : streaming ? 'active' : 'idle';

  const nodes = [
    { id: 'start', label: 'START', x: 30, y: 185, type: 'circle' as const, r: 22, status: 'done' as const },
    { id: 'supervisor', label: 'Supervisor', sublabel: 'Coordinator', x: 120, y: 166, w: 140, h: 44, status: supervisorStatus, color: '#6366F1' },
    { id: 'regulatory', label: 'Regulatory', sublabel: 'FDA · MDR · EU MDR', x: 340, y: 30, w: 140, h: 44, status: regulatoryStatus, color: '#0891B2' },
    { id: 'clinical', label: 'Clinical', sublabel: 'AE · MedDRA · Safety', x: 340, y: 108, w: 140, h: 44, status: clinicalStatus, color: '#059669' },
    { id: 'technical', label: 'Technical', sublabel: 'Telemetry · Root Cause', x: 340, y: 186, w: 140, h: 44, status: technicalStatus, color: '#D97706' },
    { id: 'risk', label: 'Risk', sublabel: 'CAPA · Field Safety', x: 340, y: 264, w: 140, h: 44, status: riskStatus, color: '#DC2626' },
    { id: 'report', label: 'Report', sublabel: 'Synthesis · Export', x: 560, y: 166, w: 140, h: 44, status: reportStatus, color: '#7C3AED' },
    { id: 'end', label: 'END', x: 770, y: 185, type: 'circle' as const, r: 22, status: endNodeStatus },
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
            Multi-agent coordination graph · {streaming ? "Agents processing" : "All nodes completed"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Completed
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
            Active
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            Idle
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
            <style>
              {`
                @keyframes pulse-active {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.6; }
                }
                .active-indicator {
                  animation: pulse-active 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
              `}
            </style>
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
            .map((n) => {
              const indicatorColor = getStatusIndicatorColor(n.status as AgentStatus);
              return (
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
                    fill={indicatorColor}
                  />
                </g>
              );
            })}

          {/* Agent nodes */}
          {nodes
            .filter((n) => !n.type)
            .map((n) => {
              const indicatorColor = getStatusIndicatorColor(n.status as AgentStatus);
              const isActive = n.status === 'active';
              return (
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
                  {isActive && (
                    <circle
                      cx={n.x + n.w! - 10}
                      cy={n.y + 12}
                      r={7}
                      fill={indicatorColor}
                      className="active-indicator"
                      opacity="0.3"
                    />
                  )}
                  <circle
                    cx={n.x + n.w! - 10}
                    cy={n.y + 12}
                    r={5}
                    fill={indicatorColor}
                  />
                </g>
              );
            })}
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
