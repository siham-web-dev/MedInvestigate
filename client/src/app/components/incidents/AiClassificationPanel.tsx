import { Sparkles, CheckCircle2, AlertTriangle, Info } from 'lucide-react';

const AI_RESULT = {
  severity: 'Critical',
  confidence: 94,
  reasoning: [
    'Class III implantable cardiac device failure detected',
    'Therapy withholding during active arrhythmia episode — imminent patient harm risk',
    'E-04 error code linked to known capacitor charging defect (CVE-CSP-2024-003)',
    '3 prior MAUDE reports for identical failure mode',
  ],
  regulation: '21 CFR Part 803 — 30-day mandatory MDR filing required',
};

export function AiClassificationPanel({
  aiClassified,
  classifying,
  onRunClassify,
}: {
  aiClassified: boolean;
  classifying: boolean;
  onRunClassify: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-card border border-border rounded-lg overflow-hidden sticky top-4">
        <div className="px-4 py-3 border-b border-border bg-gradient-to-r from-blue-50 to-violet-50">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-blue-600" />
            <span className="text-sm font-semibold text-foreground">
              AI Severity Classification
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Analyzes device type, failure mode, and regulatory history
          </p>
        </div>

        <div className="p-4">
          {!aiClassified && !classifying && (
            <div className="text-center py-4">
              <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <Sparkles size={18} className="text-blue-600" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">
                Fill in device details and failure description, then run AI
                analysis to get an automated severity classification.
              </p>
              <button
                onClick={onRunClassify}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <Sparkles size={14} />
                Run AI Classification
              </button>
            </div>
          )}

          {classifying && (
            <div className="text-center py-6">
              <div className="flex items-center justify-center gap-2 mb-3">
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <div
                  className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Analyzing device class, failure mode, regulatory history…
              </p>
            </div>
          )}

          {aiClassified && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="text-[11px] text-muted-foreground mb-1">
                    Recommended Severity
                  </div>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-red-100 text-red-700 border border-red-200 text-sm font-semibold">
                    {AI_RESULT.severity}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-muted-foreground mb-1">
                    Confidence
                  </div>
                  <div className="text-lg font-semibold text-foreground">
                    {AI_RESULT.confidence}%
                  </div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5 mb-4">
                <div
                  className="h-1.5 bg-blue-600 rounded-full"
                  style={{ width: `${AI_RESULT.confidence}%` }}
                />
              </div>
              <div className="space-y-2 mb-4">
                {AI_RESULT.reasoning.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle2
                      size={13}
                      className="text-green-600 mt-0.5 flex-shrink-0"
                    />
                    <span className="text-[11px] text-foreground leading-snug">
                      {r}
                    </span>
                  </div>
                ))}
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle
                    size={13}
                    className="text-amber-600 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <div className="text-[11px] font-medium text-amber-800">
                      Regulatory Alert
                    </div>
                    <div className="text-[11px] text-amber-700 mt-0.5">
                      {AI_RESULT.regulation}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-[11px] font-medium text-blue-800">
              FDA Reporting Thresholds
            </div>
            <div className="text-[11px] text-blue-700 mt-1 space-y-1">
              <div>• Death or serious injury → 30-day MDR</div>
              <div>• Device malfunction → 30-day MDR</div>
              <div>• Imminent hazard → 5-day MDR</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
