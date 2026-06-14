type Severity = 'critical' | 'high' | 'medium' | 'low';
type Status = 'investigating' | 'in-review' | 'approved' | 'draft' | 'submitted' | 'closed';

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'bg-red-50 text-red-700 border border-red-200',
  high: 'bg-orange-50 text-orange-700 border border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  low: 'bg-green-50 text-green-700 border border-green-200',
};

const STATUS_STYLES: Record<Status, string> = {
  investigating: 'bg-violet-50 text-violet-700 border border-violet-200',
  'in-review': 'bg-teal-50 text-teal-700 border border-teal-200',
  approved: 'bg-green-50 text-green-700 border border-green-200',
  draft: 'bg-slate-100 text-slate-600 border border-slate-200',
  submitted: 'bg-blue-50 text-blue-700 border border-blue-200',
  closed: 'bg-slate-100 text-slate-500 border border-slate-200',
};

export function SeverityBadge({ severity }: { severity: Severity }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${SEVERITY_STYLES[severity]}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

export function StatusBadge({ status }: { status: Status }) {
  const label = status === 'in-review' ? 'In Review' : status.charAt(0).toUpperCase() + status.slice(1);
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${STATUS_STYLES[status]}`}>
      {label}
    </span>
  );
}

export function Badge({ label, style }: { label: string; style: string }) {
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${style}`}>{label}</span>;
}

export { SEVERITY_STYLES, STATUS_STYLES };
