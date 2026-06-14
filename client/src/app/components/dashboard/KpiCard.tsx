import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiData {
  label: string;
  value: string;
  delta: string;
  up: boolean;
  icon: React.ElementType;
  color: string;
  bg: string;
}

export function KpiCard({ kpi }: { kpi: KpiData }) {
  const Icon = kpi.icon;
  return (
    <div className="bg-card border border-border rounded-lg p-3 md:p-4">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-8 h-8 ${kpi.bg} rounded-md flex items-center justify-center`}>
          <Icon size={16} className={kpi.color} />
        </div>
        <div className={`flex items-center gap-1 text-xs font-medium ${kpi.up ? 'text-red-600' : 'text-green-600'}`}>
          {kpi.up ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
          {kpi.delta}
        </div>
      </div>
      <div className="text-xl md:text-2xl font-semibold text-foreground">{kpi.value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{kpi.label}</div>
    </div>
  );
}
