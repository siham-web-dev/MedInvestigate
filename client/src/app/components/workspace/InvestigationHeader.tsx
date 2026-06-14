import { Download, Scale } from 'lucide-react';

export function InvestigationHeader({
  id,
  device,
  manufacturer,
  facility,
  onReview,
}: {
  id: string;
  device: string;
  manufacturer: string;
  facility: string;
  onReview: () => void;
}) {
  return (
    <div className="bg-card border-b border-border px-4 md:px-5 py-3 flex flex-col sm:flex-row items-start sm:items-center gap-3 flex-shrink-0">
      <div className="flex-1 min-w-0 w-full sm:w-auto">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="font-mono text-sm font-semibold text-foreground">{id}</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
            Critical
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
            In Review
          </span>
        </div>
        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
          {device} · {manufacturer} · {facility}
        </div>
      </div>
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
        <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-background border border-border text-foreground rounded-md hover:bg-muted transition-colors">
          <Download size={12} /> Export
        </button>
        <button
          onClick={onReview}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors"
        >
          <Scale size={12} /> Review
        </button>
      </div>
    </div>
  );
}
