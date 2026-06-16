import { useState, useEffect } from 'react';
import { useParams } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { Check, X, ThumbsUp, RefreshCw, Send, Loader2 } from 'lucide-react';
import { setProcessing } from '../../../../store/investigationSlice';
import type { AppDispatch, RootState } from '../../../../store/store';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '../../ui/sheet';
import { API_ENDPOINTS } from '../../../../api/config';
import { useInvestigationSocket } from '../../../../hooks/useInvestigationSocket';

interface Recommendation {
  id: string;
  label: string;
  color: 'blue' | 'red' | 'green' | 'purple';
  text: string;
  details: string;
  context: string[];
  agentType?: string;
}

interface ReviewComment {
  id?: string;
  reviewer: string;
  comment: string;
  timestamp: string;
  reviewStatus?: string;
}

export function ReviewTab() {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const { token } = useSelector((state: RootState) => state.auth);
  const saving = useSelector((state: RootState) => state.investigation.isProcessing);
  const [comment, setComment] = useState('');
  const [selectedAgent, setSelectedAgent] = useState('');
  const [selectedReco, setSelectedReco] = useState<string | null>(null);
  const [acceptedRecos, setAcceptedRecos] = useState<Set<string>>(new Set());
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loadingRecos, setLoadingRecos] = useState(true);
  const [reviewComments, setReviewComments] = useState<ReviewComment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);

  const fetchRecommendations = async () => {
    if (!id || !token) return;

    try {
      const response = await fetch(API_ENDPOINTS.investigationReport(id!), {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Map backend recommendations to UI format
        const mappedRecos = (data.recommendations || []).map((reco: any) => ({
          id: reco.id || reco.label?.toLowerCase(),
          label: reco.label,
          color: reco.color || 'blue',
          text: reco.text,
          details: reco.details || '',
          context: reco.context || [],
          agentType: reco.agentType,
        }));
        setRecommendations(mappedRecos);
      }
    } catch (error) {
      console.error('[REVIEW] Failed to fetch recommendations:', error);
    } finally {
      setLoadingRecos(false);
    }
  };

  // Handle agent activity updates to refresh recommendations when agents complete
  const handleActivityUpdate = (activity: any) => {
    if (
      activity.status === 'completed' ||
      activity.status === 'finished' ||
      activity.message?.toLowerCase().includes('completed')
    ) {
      fetchRecommendations();
    }
  };

  useInvestigationSocket(id || '', handleActivityUpdate);

  useEffect(() => {
    fetchRecommendations();
  }, [id, token]);

  useEffect(() => {
    const fetchReviewComments = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.investigationReport(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // Map review comments from investigation data
          const comments: ReviewComment[] = (data.reviewComments || []).map((comment: any) => {
            const timestamp = new Date(comment.createdAt || comment.timestamp).toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            return {
              id: comment.id,
              reviewer: comment.reviewer || 'Reviewer',
              comment: comment.comment || comment.text,
              timestamp,
              reviewStatus: comment.reviewStatus,
            };
          });
          setReviewComments(comments);
        }
      } catch (error) {
        console.error('[REVIEW] Failed to fetch review comments:', error);
      } finally {
        setLoadingComments(false);
      }
    };

    fetchReviewComments();
  }, [id, token]);

  const approveAndGenerateReport = async () => {
    if (!id || !token) return;

    dispatch(setProcessing(true));
    try {
      const response = await fetch(API_ENDPOINTS.investigationReview(id!), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: comment,
          reviewStatus: 'approved',
          recommendations: Array.from(acceptedRecos),
          generateReport: true,
        }),
      });

      if (response.ok) {
        // Add comment to review history
        const newComment: ReviewComment = {
          reviewer: 'Current Reviewer',
          comment: comment || 'Approved investigation and generated report',
          timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          reviewStatus: 'approved',
        };
        setReviewComments((prev) => [newComment, ...prev]);
        setComment('');
      }
    } catch (error) {
      console.error('[REVIEW] Failed to approve investigation:', error);
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const requestMoreAnalysis = async () => {
    if (!id || !token) return;

    dispatch(setProcessing(true));
    try {
      // Step 1: Save the review with rerunWorkflow flag
      const reviewResponse = await fetch(API_ENDPOINTS.investigationReview(id!), {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reviewNotes: comment,
          reviewStatus: 'more-analysis',
          recommendations: Array.from(acceptedRecos),
          rerunWorkflow: true,
        }),
      });

      if (reviewResponse.ok) {
        // Add comment to review history
        const newComment: ReviewComment = {
          reviewer: 'Current Reviewer',
          comment: comment || 'Requested more analysis - workflow will re-run with reviewer feedback',
          timestamp: new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          reviewStatus: 'more-analysis',
        };
        setReviewComments((prev) => [newComment, ...prev]);
        setComment('');

        // Step 2: Trigger the workflow re-run with reviewer feedback
        const rerunResponse = await fetch(API_ENDPOINTS.investigationRerunWorkflow(id!), {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (rerunResponse.ok) {
          console.log('[REVIEW] Workflow re-run triggered - agents will re-analyze with reviewer feedback');
          // WebSocket will automatically reactivate as the phase changes back to Analysis
          // Live agent activity updates will appear as agents process the reviewer feedback
        }
      }
    } catch (error) {
      console.error('[REVIEW] Failed to request more analysis:', error);
    } finally {
      dispatch(setProcessing(false));
    }
  };

  const addCommentOnly = async () => {
    if (!comment.trim()) return;

    // Add comment to review history without changing status
    const newComment: ReviewComment = {
      reviewer: 'Current Reviewer',
      comment: comment,
      timestamp: new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setReviewComments((prev) => [newComment, ...prev]);
    setComment('');
  };

  const currentReco = selectedReco
    ? recommendations.find((r) => r.id === selectedReco)
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
            onClick={approveAndGenerateReport}
            disabled={saving}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <ThumbsUp size={16} />}
            Approve & Generate Report
          </button>
          <button
            onClick={requestMoreAnalysis}
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
                onClick={addCommentOnly}
                disabled={!comment.trim()}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={14} />
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
            {loadingComments ? (
              <p className="text-xs text-muted-foreground px-3 py-2">
                Loading review comments...
              </p>
            ) : reviewComments.length > 0 ? (
              reviewComments.map((review, i) => (
                <div
                  key={review.id || i}
                  className="flex items-start gap-3 pb-3 last:pb-0 last:border-0 border-b border-border/50"
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-semibold bg-blue-100 text-blue-700">
                    {review.reviewer
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)
                      .toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium text-foreground">
                        {review.reviewer}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {review.timestamp}
                      </span>
                    </div>
                    <p className="text-xs text-foreground mt-1 leading-snug">
                      {review.comment}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground px-3 py-2">
                No review comments yet
              </p>
            )}
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
  color: 'blue' | 'red' | 'green' | 'purple';
  text: string;
  accepted?: boolean;
}) {
  const bgColors: Record<string, string> = {
    blue: 'bg-blue-50 border-blue-100',
    red: 'bg-red-50 border-red-100',
    green: 'bg-green-50 border-green-100',
    purple: 'bg-purple-50 border-purple-100',
  };
  const labelColors: Record<string, string> = {
    blue: 'text-blue-700',
    red: 'text-red-700',
    green: 'text-green-700',
    purple: 'text-purple-700',
  };
  const dotColors: Record<string, string> = {
    blue: 'bg-blue-600',
    red: 'bg-red-600',
    green: 'bg-green-600',
    purple: 'bg-purple-600',
  };

  return (
    <div
      className={`flex items-start gap-3 p-3 border rounded-md cursor-pointer transition-colors ${
        accepted ? 'bg-green-50 border-green-200' : bgColors[color]
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">
        <div className={`w-4 h-4 rounded ${dotColors[color]}`} />
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
