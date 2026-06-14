import { FileText, Send } from 'lucide-react';

interface Review {
  id: string;
  device: string;
  manufacturer: string;
  severity: string;
  date: string;
  agentConclusion: string;
  humanReview?: string;
}

const REVIEWS: Review[] = [
  {
    id: 'MDR-2024-0891',
    device: 'CardioSync Pro 2000',
    manufacturer: 'CardioSync Medical Systems',
    severity: 'High',
    date: 'June 12, 2026',
    agentConclusion: 'Battery depletion linked to therapy withholding.',
    humanReview: 'Confirmed. Patient required manual intervention.',
  },
  {
    id: 'MDR-2024-0890',
    device: 'InsulinPump X5',
    manufacturer: 'Abbott',
    severity: 'Medium',
    date: 'June 10, 2026',
    agentConclusion: 'Dosing algorithm variance within acceptable range.',
    humanReview: 'Agree. No immediate risk identified.',
  },
  {
    id: 'MDR-2024-0889',
    device: 'NeuroPace NCP',
    manufacturer: 'NeuroPace Inc.',
    severity: 'Critical',
    date: 'June 8, 2026',
    agentConclusion: 'Hardware failure affecting seizure detection.',
    humanReview: 'Escalated to engineering for deep analysis.',
  },
];

export function PreviousReviewsPanel() {
  const severityColors: Record<string, string> = {
    Critical: 'bg-red-50 text-red-700 border-red-200',
    High: 'bg-orange-50 text-orange-700 border-orange-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Low: 'bg-green-50 text-green-700 border-green-200',
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-slate-50 to-gray-50">
        <div className="flex items-center gap-2">
          <FileText size={14} className="text-slate-600" />
          <span className="text-sm font-semibold text-foreground">
            Previous Reviews
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          Agent conclusions & human feedback
        </p>
      </div>

      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {REVIEWS.map((review) => (
          <div
            key={review.id}
            className="bg-muted/40 border border-border rounded-md p-3 space-y-2"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">
                  {review.device}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {review.manufacturer}
                </div>
              </div>
              <span
                className={`inline-flex text-[10px] font-semibold px-2 py-0.5 rounded border whitespace-nowrap flex-shrink-0 ${severityColors[review.severity as keyof typeof severityColors]}`}
              >
                {review.severity}
              </span>
            </div>

            <div className="text-[10px] text-muted-foreground pt-1.5 border-t border-border/50">
              {review.date}
            </div>

            <div className="bg-background border border-blue-100 rounded p-2 space-y-1">
              <div className="text-[10px] font-medium text-blue-700">
                Agent Conclusion
              </div>
              <div className="text-[10px] text-foreground leading-tight">
                {review.agentConclusion}
              </div>
            </div>

            {review.humanReview && (
              <div className="bg-background border border-green-100 rounded p-2 space-y-1">
                <div className="text-[10px] font-medium text-green-700">
                  Human Review
                </div>
                <div className="text-[10px] text-foreground leading-tight">
                  {review.humanReview}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="px-4 py-4 border-t border-border bg-muted/30">
        <div className="space-y-2">
          <label className="block text-[11px] font-medium text-foreground">
            Add Human Review
          </label>
          <textarea
            placeholder="Enter your expert review or feedback…"
            className="input-base resize-none text-xs"
            rows={3}
          />
          <button className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors">
            <Send size={12} />
            Submit Review
          </button>
        </div>
      </div>
    </div>
  );
}
