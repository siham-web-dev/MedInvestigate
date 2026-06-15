import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Check, X, ThumbsUp, ThumbsDown, RefreshCw, Send, Loader2 } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../ui/sheet';
import type { RootState } from '../../../store/store';
import { API_ENDPOINTS } from '../../../../api/config';

interface Recommendation {
  id: string;
  icon: React.ElementType;
  label: string;
  color: 'blue' | 'red' | 'green';
  text: string;
  details: string;
  context: string[];
}

const RECOMMENDATIONS: Recommendation[] = [
  {
    id: 'regulatory',
    icon: () => null,
    label: 'Regulatory',
    color: 'blue',
    text: 'Approve and file 30-day MDR with FDA within regulatory deadline (Feb 14, 2024)',
    details:
      'This recommendation ensures compliance with FDA regulations 21 CFR 803.50(a)(1) for serious device malfunctions. The 30-day MDR (Medical Device Report) filing deadline is mandatory and must include detailed incident analysis and corrective actions.',
    context: [
      '• 3 prior MAUDE reports establish a pattern of similar E-04 failures',
      '• This is a serious non-fatal adverse event requiring immediate reporting',
      '• EU MDR Article 87 vigilance report also recommended for European markets',
    ],
  },
  {
    id: 'risk',
    icon: () => null,
    label: 'Risk',
    color: 'red',
    text: 'Issue Field Safety Corrective Action for 2,400 devices — immediate firmware patch deployment',
    details:
      'Approximately 2,400 CardioSync Pro 3000 devices with firmware v3.4.1 are currently active in the field across 340 facilities. An immediate Field Safety Corrective Action (FSCA) is critical to prevent similar incidents.',
    context: [
      '• Risk score: 9.2/10 (CRITICAL)',
      '• Affected population: 2,400 devices in 340 facilities across 28 states',
      '• Firmware patch v3.4.2 is available and addresses the race condition',
      '• Estimated harm probability: 0.34 per device-year under high lead impedance',
    ],
  },
  {
    id: 'clinical',
    icon: () => null,
    label: 'Clinical',
    color: 'green',
    text: 'Notify treating physicians and update patient risk profiles for ICD patients on v3.4.1',
    details:
      'Clinical teams at all implanting centers and device follow-up clinics must be immediately notified of the device issue and potential patient safety implications. Updated risk profiles should be generated for all patients with affected devices.',
    context: [
      '• Serious non-fatal adverse event (MedDRA code 10065722)',
      '• Patient in this case recovered without permanent injury',
      '• Lead impedance monitoring should be enhanced for all affected patients',
      '• Post-market surveillance review recommended for all E-04 events',
    ],
  },
];

interface Recommendation {
  id: string;
  icon: React.ElementType;
  label: string;
  color: 'blue' | 'red' | 'green';
  text: string;
  details: string;
  context: string[];
}

export function ReviewTab() {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [comment, setComment] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedReco, setSelectedReco] = useState<string | null>(null);
  const [acceptedRecos, setAcceptedRecos] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecos, setLoadingRecos] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.investigationReport(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Map backend recommendations to UI format
          const mappedRecos = data.recommendations.map((reco: any) => ({
            ...reco,
            icon: () => null,
          }));
          setRecommendations(mappedRecos);
        }
      } catch (error) {
        console.error('[REVIEW] Failed to fetch recommendations:', error);
      } finally {
        setLoadingRecos(false);
      }
    };

    fetchRecommendations();
  }, [id, token]);

  const saveReview = async (status: 'approved' | 'rejected' | 'more-analysis') => {
    if (!id || !token) return;

    setSaving(true);
    try {
      await fetch(API_ENDPOINTS.investigationReview(id!), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: comment,
          reviewStatus: status,
          recommendations: Array.from(acceptedRecos),
        }),
      });
    } catch (error) {
      console.error('[REVIEW] Failed to save review:', error);
    } finally {
      setSaving(false);
    }
  };

  const history = [
    {
      user: 'Dr. Marcus Liu',
      action: 'Requested additional technical analysis',
      time: 'Jan 16, 14:22',
      type: 'request',
    },
    {
      user: 'Technical Agent',
      action: 'Supplemental analysis: Lead impedance correlation confirmed',
      time: 'Jan 16, 15:05',
      type: 'agent',
    },
    {
      user: 'Dr. Sarah Chen',
      action: 'Assigned as primary reviewer',
      time: 'Jan 17, 09:00',
      type: 'assign',
    },
  ];

  const currentReco = selectedReco
    ? RECOMMENDATIONS.find((r) => r.id === selectedReco)
    : null;

  return (
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column */}
      <div className="flex-1 min-w-0 space-y-5">
        <h3 className="text-sm font-semibold text-foreground">
          Review Decision
        </h3>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold text-foreground">
              AI Agent Recommendations
            </h4>
          </div>
          <div className="p-4 space-y-3">
            {recommendations.length > 0 ? (
              recommendations.map((reco) => (
                <button
                  key={reco.id}
                  onClick={() => setSelectedReco(reco.id)}
                  className="w-full text-left hover:opacity-80 transition-opacity"
                >
                  <RecoItem
                    label={reco.label}
                    color={reco.color}
                    text={reco.text}
                    accepted={acceptedRecos.has(reco.id)}
                  />
                </button>
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-2">
                {loadingRecos ? 'Loading recommendations...' : 'No recommendations available yet'}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
          <button
            onClick={() => saveReview('approved')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
            Approve Investigation
          </button>
          <button
            onClick={() => saveReview('rejected')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ThumbsDown size={16} />}
            Reject
          </button>
          <button
            onClick={() => saveReview('more-analysis')}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-background border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
            Request More Analysis
          </button>
        </div>

        <Sheet open={!!selectedReco} onOpenChange={(open) => !open && setSelectedReco(null)}>
          <SheetContent side="right" className="w-full sm:max-w-md flex flex-col">
            {currentReco && (
              <>
                <SheetHeader>
                  <div className="flex items-center gap-2">
                    <SheetTitle>{currentReco.label} Recommendation</SheetTitle>
                  </div>
                  <SheetDescription className="pt-2">
                    {currentReco.text}
                  </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-auto px-4 space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Details
                    </h4>
                    <p className="text-xs text-foreground leading-relaxed">
                      {currentReco.details}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                      Context
                    </h4>
                    <div className="space-y-1">
                      {currentReco.context.map((item, i) => (
                        <p key={i} className="text-xs text-foreground leading-relaxed">
                          {item}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>

                <SheetFooter className="gap-2 flex-row">
                  <button
                    onClick={() => {
                      setAcceptedRecos((prev) => {
                        const next = new Set(prev);
                        next.delete(currentReco.id);
                        return next;
                      });
                      setSelectedReco(null);
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-background border border-border text-foreground text-sm font-medium rounded-md hover:bg-muted transition-colors"
                  >
                    <X size={14} /> Reject
                  </button>
                  <button
                    onClick={() => {
                      setAcceptedRecos((prev) => {
                        const next = new Set(prev);
                        next.add(currentReco.id);
                        return next;
                      });
                      setSelectedReco(null);
                    }}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      acceptedRecos.has(currentReco.id)
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-green-600 text-white hover:bg-green-700'
                    }`}
                  >
                    <Check size={14} /> Accept
                  </button>
                </SheetFooter>
              </>
            )}
          </SheetContent>
        </Sheet>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold text-foreground">
              Reviewer Comment
            </h4>
          </div>
          <div className="p-4 space-y-4">
            <textarea
              rows={4}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30 resize-none placeholder-muted-foreground"
              placeholder="Add your review notes…"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <div>
              <label className="text-xs font-medium text-foreground mb-1.5 block">
                Select Agent (Optional)
              </label>
              <select
                value={selectedAgent}
                onChange={(e) => setSelectedAgent(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-ring/30"
              >
                <option value="">
                  Choose an agent to request analysis from…
                </option>
                <option value="regulatory">Regulatory Agent</option>
                <option value="clinical">Clinical Agent</option>
                <option value="technical">Technical Agent</option>
                <option value="risk">Risk Agent</option>
                <option value="supervisor">Supervisor Agent</option>
              </select>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => saveReview('approved')}
                disabled={saving || !comment.trim()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                Add Comment
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Review History */}
      <div className="w-full lg:w-80 flex-shrink-0 overflow-y-auto">
        <div className="bg-card border border-border rounded-lg overflow-hidden h-fit sticky top-4">
          <div className="px-4 py-3 border-b border-border bg-muted/30">
            <h4 className="text-xs font-semibold text-foreground">
              Review History
            </h4>
          </div>
          <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
            {history.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-3 pb-3 last:pb-0 last:border-0 border-b border-border/50"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold ${
                    h.type === 'agent'
                      ? 'bg-violet-100 text-violet-700'
                      : h.type === 'request'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {h.type === 'agent'
                    ? 'AI'
                    : h.user
                        .split(' ')
                        .map((w) => w[0])
                        .join('')
                        .slice(0, 2)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-medium text-foreground">
                      {h.user}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {h.time}
                    </span>
                  </div>
                  <p className="text-xs text-foreground mt-1 leading-snug">
                    {h.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function RecoItem({
  label,
  color,
  text,
  accepted,
}: {
  label: string;
  color: 'blue' | 'red' | 'green';
  text: string;
  accepted?: boolean;
}) {
  const bgColors = {
    blue: 'bg-blue-50 border-blue-100',
    red: 'bg-red-50 border-red-100',
    green: 'bg-green-50 border-green-100',
  };
  const labelColors = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
  };
  return (
    <div
      className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
        accepted ? 'bg-green-50 border-green-200' : bgColors[color]
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <div
          className={`w-4 h-4 rounded ${
            color === 'blue' ? 'bg-blue-600' : color === 'red' ? 'bg-red-600' : 'bg-green-600'
          }`}
        />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${accepted ? 'text-green-700' : labelColors[color]}`}>
            {label}:
          </span>
          {accepted && (
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium border border-green-200">
              <Check size={10} /> Accepted
            </span>
          )}
        </div>
        <span className="text-[11px] text-foreground ml-0">{text}</span>
      </div>
    </div>
  );
}
