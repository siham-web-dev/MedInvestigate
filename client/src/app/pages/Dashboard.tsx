import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RecentInvestigationsTable } from '../components/dashboard/RecentInvestigationsTable';
import { AgentActivityFeed } from '../components/dashboard/AgentActivityFeed';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';
import {
  AlertTriangle, Activity, Clock, FileCheck,
} from 'lucide-react';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'investigating' | 'in-review' | 'approved' | 'draft' | 'submitted';

const INVESTIGATIONS = [
  { id: 'MDR-2024-0891', device: 'CardioSync Pro 3000', manufacturer: 'CardioSync Medical', severity: 'critical' as Severity, status: 'in-review' as Status, reviewer: 'Dr. Sarah Chen', created: 'Jan 15, 2024', updated: '2h ago' },
  { id: 'MDR-2024-0887', device: 'InfuSmart IV Pump', manufacturer: 'PharmaTech Inc.', severity: 'high' as Severity, status: 'investigating' as Status, reviewer: 'James Rodriguez', created: 'Jan 14, 2024', updated: '5h ago' },
  { id: 'MDR-2024-0883', device: 'NeuroPace RNS System', manufacturer: 'NeuroPace Inc.', severity: 'high' as Severity, status: 'submitted' as Status, reviewer: 'Dr. Priya Nair', created: 'Jan 13, 2024', updated: '1d ago' },
  { id: 'MDR-2024-0879', device: 'Medtronic MiniMed 780G', manufacturer: 'Medtronic', severity: 'medium' as Severity, status: 'in-review' as Status, reviewer: 'Dr. Marcus Liu', created: 'Jan 12, 2024', updated: '1d ago' },
  { id: 'MDR-2024-0874', device: 'LifeVest WCD 4000', manufacturer: 'Zoll Medical', severity: 'medium' as Severity, status: 'approved' as Status, reviewer: 'Rachel Torres', created: 'Jan 11, 2024', updated: '2d ago' },
  { id: 'MDR-2024-0869', device: 'Inspire Upper Airway Stim', manufacturer: 'Inspire Medical', severity: 'low' as Severity, status: 'draft' as Status, reviewer: 'Unassigned', created: 'Jan 10, 2024', updated: '3d ago' },
];

const AGENT_ACTIVITY = [
  { id: 1, agent: 'Regulatory Agent', action: 'Completed FDA MAUDE analysis for MDR-2024-0891', time: '2m ago', status: 'done' as const, color: '#0891B2' },
  { id: 2, agent: 'Risk Agent', action: 'Risk score updated to 9.2/10 — Critical escalation triggered', time: '7m ago', status: 'done' as const, color: '#DC2626' },
  { id: 3, agent: 'Technical Agent', action: 'Device telemetry analysis in progress for MDR-2024-0887', time: '12m ago', status: 'active' as const, color: '#D97706' },
  { id: 4, agent: 'Clinical Agent', action: 'Adverse event classified under MedDRA terminology', time: '18m ago', status: 'done' as const, color: '#059669' },
  { id: 5, agent: 'Supervisor Agent', action: 'Dispatched 4 agents for parallel analysis of MDR-2024-0883', time: '31m ago', status: 'done' as const, color: '#6366F1' },
  { id: 6, agent: 'Report Agent', action: 'Executive summary generated for MDR-2024-0874', time: '1h ago', status: 'done' as const, color: '#7C3AED' },
  { id: 7, agent: 'Regulatory Agent', action: 'EU MDR Article 87 compliance check initiated', time: '2h ago', status: 'done' as const, color: '#0891B2' },
];

const KPI = [
  { label: 'Total Incidents', value: '1,247', delta: '+23', up: true, icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
  { label: 'Active Investigations', value: '34', delta: '-3', up: false, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
  { label: 'Critical Cases', value: '8', delta: '+2', up: true, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  { label: 'Pending Reviews', value: '17', delta: '+5', up: true, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
];

export default function Dashboard() {
  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <DashboardHeader />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {KPI.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <RecentInvestigationsTable investigations={INVESTIGATIONS} />

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <AgentActivityFeed activities={AGENT_ACTIVITY} />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
