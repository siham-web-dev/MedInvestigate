import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { KpiCard } from '../components/dashboard/KpiCard';
import { RecentInvestigationsTable } from '../components/dashboard/RecentInvestigationsTable';
import { AgentActivityFeed } from '../components/dashboard/AgentActivityFeed';
import { QuickActionsPanel } from '../components/dashboard/QuickActionsPanel';
import {
  AlertTriangle, Activity, Clock, FileCheck,
} from 'lucide-react';
import type { RootState } from '../../store/store';
import { API_ENDPOINTS } from '../../api/config';

type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'investigating' | 'in-review' | 'approved' | 'draft' | 'submitted' | 'closed';

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

interface AgentActivity {
  id: number;
  agent: string;
  action: string;
  time: string;
  status: 'active' | 'done';
  color: string;
}

interface KPI {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: any;
  color: string;
  bg: string;
}

export default function Dashboard() {
  const { token } = useSelector((state: RootState) => state.auth);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [agentActivities, setAgentActivities] = useState<AgentActivity[]>([]);
  const [kpis, setKpis] = useState<KPI[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [token]);

  const fetchDashboardData = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('[DASHBOARD] Fetching dashboard data');
      setIsLoading(true);

      // Fetch investigations
      const invResponse = await fetch(`${API_ENDPOINTS.investigations}?limit=6`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (invResponse.ok) {
        const invData = await invResponse.json();
        const transformed = Array.isArray(invData) ? invData.map((inv: any) => ({
          id: inv.id,
          device: inv.incident?.deviceName || 'Unknown Device',
          manufacturer: inv.incident?.manufacturer || 'Unknown',
          severity: (inv.incident?.severity?.toLowerCase() || 'medium') as Severity,
          status: (inv.phase?.toLowerCase().replace(' ', '-') || 'draft') as Status,
          reviewer: inv.assignedTo || 'Unassigned',
          created: inv.createdAt ? new Date(inv.createdAt).toLocaleDateString() : 'N/A',
          updated: inv.updatedAt ? getRelativeTime(new Date(inv.updatedAt)) : 'N/A',
        })) : [];
        setInvestigations(transformed.slice(0, 6));
        console.log('[DASHBOARD] Investigations loaded:', transformed.length);
      }

      // Fetch agent activities
      const actResponse = await fetch(`${API_ENDPOINTS.agentActivities}?limit=7`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (actResponse.ok) {
        const actData = await actResponse.json();
        const transformed = Array.isArray(actData) ? actData.map((act: any, idx: number) => ({
          id: idx + 1,
          agent: act.agentName || 'Unknown Agent',
          action: act.message || 'Processing...',
          time: act.timestamp ? getRelativeTime(new Date(act.timestamp)) : 'Recently',
          status: (act.status === 'Alert' || act.status === 'active') ? 'active' : 'done',
          color: getAgentColor(act.agentType),
        })) : [];
        setAgentActivities(transformed.slice(0, 7));
        console.log('[DASHBOARD] Agent activities loaded:', transformed.length);
      }

      // Calculate KPIs from investigations
      const stats = calculateKpis(invData || []);
      setKpis(stats);
      console.log('[DASHBOARD] KPIs calculated');
    } catch (error) {
      console.error('[DASHBOARD] Error fetching data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getRelativeTime = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  const getAgentColor = (agentType: string): string => {
    const colors: Record<string, string> = {
      'Supervisor': '#6366F1',
      'Regulatory': '#0891B2',
      'Clinical': '#059669',
      'Technical': '#D97706',
      'Risk': '#DC2626',
      'Report': '#7C3AED',
    };
    return colors[agentType] || '#6366F1';
  };

  const calculateKpis = (invData: any[]): KPI[] => {
    const investigations = Array.isArray(invData) ? invData : [];
    const total = investigations.length;
    const active = investigations.filter((i: any) => i.phase === 'Analysis' || i.phase === 'Intake').length;
    const critical = investigations.filter((i: any) => i.incident?.severity?.toLowerCase() === 'critical').length;
    const pending = investigations.filter((i: any) => i.phase === 'Review').length;

    return [
      { label: 'Total Incidents', value: total.toString(), delta: '+0', up: false, icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
      { label: 'Active Investigations', value: active.toString(), delta: '0', up: false, icon: Activity, color: 'text-violet-600', bg: 'bg-violet-50' },
      { label: 'Critical Cases', value: critical.toString(), delta: '0', up: false, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
      { label: 'Pending Reviews', value: pending.toString(), delta: '0', up: false, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    ];
  };

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
        <DashboardHeader />
        <div className="text-center py-12 text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-[1400px] mx-auto">
      <DashboardHeader />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        {kpis.map((k) => (
          <KpiCard key={k.label} kpi={k} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <RecentInvestigationsTable investigations={investigations} />

        {/* Right column */}
        <div className="flex flex-col gap-4">
          <AgentActivityFeed activities={agentActivities} />
          <QuickActionsPanel />
        </div>
      </div>
    </div>
  );
}
