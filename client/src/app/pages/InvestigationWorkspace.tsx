import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { Loader2 } from "lucide-react";
import { InvestigationHeader } from "../components/workspace/InvestigationHeader";
import { TabNavigation, type TabId } from "../components/workspace/TabNavigation";
import { AgentCard } from "../components/workspace/AgentCard";
import { MsgBubble, type AgentMessage } from "../components/workspace/MsgBubble";
import { PanelSection, Detail, FindingItem } from "../components/workspace/PanelSection";
import {
  GraphTab,
  ReviewTab,
  ReportTab,
  AuditTab,
  OverviewTab,
} from "../components/workspace/tabs";
import {
  ALL_MESSAGES,
  AGENTS,
  INCIDENT,
  HYPOTHESES,
} from "../data/investigationData";

export default function InvestigationWorkspace() {
  const { id } = useParams();
  const [tab, setTab] = useState<TabId>("overview");
  const [visibleMsgs, setVisibleMsgs] = useState<AgentMessage[]>(
    ALL_MESSAGES.slice(0, 6),
  );
  const [streaming, setStreaming] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!streaming) return;
    if (visibleMsgs.length >= ALL_MESSAGES.length) {
      setStreaming(false);
      return;
    }
    const t = setTimeout(() => {
      setVisibleMsgs((prev) => [...prev, ALL_MESSAGES[prev.length]]);
      if (feedRef.current)
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }, 900);
    return () => clearTimeout(t);
  }, [visibleMsgs, streaming]);

  return (
    <div className="flex flex-col h-full">
      <InvestigationHeader
        id={id ?? INCIDENT.id}
        device={INCIDENT.device}
        manufacturer={INCIDENT.manufacturer}
        facility={INCIDENT.facility}
        onReview={() => setTab("review")}
      />

      <TabNavigation activeTab={tab} onTabChange={setTab} />

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {tab === "graph" && (
          <div className="h-full overflow-auto">
            <GraphTab />
          </div>
        )}
        {tab === "review" && (
          <div className="h-full overflow-auto">
            <ReviewTab />
          </div>
        )}
        {tab === "report" && (
          <div className="h-full overflow-auto">
            <ReportTab />
          </div>
        )}
        {tab === "audit" && (
          <div className="h-full overflow-auto">
            <AuditTab />
          </div>
        )}

        {tab === "agents" && (
          <div className="h-full flex flex-col p-4 md:p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-4 flex-shrink-0">
              {AGENTS.map((a) => (
                <AgentCard key={a.name} agent={a} />
              ))}
            </div>
            <div ref={feedRef} className="flex-1 overflow-auto space-y-2">
              {visibleMsgs.map((m) => (
                <MsgBubble key={m.id} msg={m} />
              ))}
              {streaming && (
                <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-muted-foreground">
                  <Loader2 size={12} className="animate-spin text-blue-500" />{" "}
                  Agents processing…
                </div>
              )}
            </div>
          </div>
        )}

        {tab === "overview" && (
          <OverviewTab
            visibleMsgs={visibleMsgs}
            streaming={streaming}
            feedRef={feedRef as React.RefObject<HTMLDivElement>}
            hypotheses={HYPOTHESES}
            incident={INCIDENT}
          />
        )}
      </div>
    </div>
  );
}
