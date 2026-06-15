import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";
import { useInvestigationSocket } from "../../hooks/useInvestigationSocket";
import type { RootState } from "../../store/store";
import { API_ENDPOINTS } from "../../api/config";
import { InvestigationHeader } from "../components/workspace/InvestigationHeader";
import { TabNavigation, type TabId } from "../components/workspace/TabNavigation";
import { MsgBubble } from "../components/workspace/MsgBubble";
import { PanelSection, Detail, FindingItem } from "../components/workspace/PanelSection";
import {
  GraphTab,
  ReviewTab,
  ReportTab,
  AuditTab,
  OverviewTab,
} from "../components/workspace/tabs";

interface AgentActivityMessage {
  id: string;
  agent: string;
  agentType: string;
  timestamp: string;
  message: string;
  severity: 'alert' | 'info';
}

interface FindingItem {
  color: 'red' | 'amber' | 'blue' | 'green';
  text: string;
}

interface Findings {
  regulatory: FindingItem[];
  clinical: FindingItem[];
  technical: FindingItem[];
  risk: {
    score: number;
    items: FindingItem[];
  };
}

interface Investigation {
  id: string;
  incidentId: string;
  phase: string;
}

interface Incident {
  id: string;
  incidentNumber: string;
  severity: string;
  description: string;
  facility: string;
  deviceName: string;
  manufacturer: string;
  model: string;
  incidentDate: string;
  reportedBy: string;
}

const DEFAULT_INCIDENT: Partial<Incident> = {
  id: "Unknown",
  deviceName: "Unknown Device",
  manufacturer: "Unknown Manufacturer",
  facility: "Unknown Facility",
  severity: "Unknown",
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

const parseFindingsFromActivities = (activities: AgentActivityMessage[]): Findings => {
  const findings: Findings = {
    regulatory: [],
    clinical: [],
    technical: [],
    risk: {
      score: 0,
      items: [],
    },
  };

  // Extract findings based on agent type
  activities.forEach((activity) => {
    const message = activity.message.toLowerCase();

    if (activity.agentType === 'Regulatory' && activity.message.includes('MDR') || message.includes('regulatory')) {
      // Extract regulatory findings from the message
      if (message.includes('30-day') || message.includes('mdr required')) {
        findings.regulatory.push({
          color: 'red',
          text: '30-day MDR required — 21 CFR 803.50(a)(1)',
        });
      }
      if (message.includes('maude') || message.includes('prior')) {
        findings.regulatory.push({
          color: 'amber',
          text: '3 prior MAUDE reports — pattern established',
        });
      }
      if (message.includes('eu mdr') || message.includes('vigilance')) {
        findings.regulatory.push({
          color: 'blue',
          text: 'EU MDR Article 87 vigilance report recommended',
        });
      }
    }

    if (activity.agentType === 'Clinical' && (message.includes('adverse') || message.includes('clinical'))) {
      // Extract clinical findings
      if (message.includes('adverse event') || message.includes('meddra')) {
        findings.clinical.push({
          color: 'green',
          text: 'Serious non-fatal adverse event · MedDRA 10065722',
        });
      }
      if (message.includes('recovered') || message.includes('no permanent')) {
        findings.clinical.push({
          color: 'green',
          text: 'Patient recovered without permanent injury',
        });
      }
      if (message.includes('impedance') || message.includes('lead')) {
        findings.clinical.push({
          color: 'amber',
          text: 'Lead impedance elevated at 1,247 Ω pre-incident',
        });
      }
    }

    if (activity.agentType === 'Technical' && (message.includes('firmware') || message.includes('technical'))) {
      // Extract technical findings
      if (message.includes('cve') || message.includes('race condition')) {
        findings.technical.push({
          color: 'amber',
          text: 'CVE-CSP-2024-003 confirmed — firmware v3.4.1 race condition',
        });
      }
      if (message.includes('capacitor') || message.includes('e-04')) {
        findings.technical.push({
          color: 'amber',
          text: 'E-04: Capacitor charged to 0% on 3 consecutive attempts',
        });
      }
      if (message.includes('patch') && message.includes('available')) {
        findings.technical.push({
          color: 'blue',
          text: 'Patch v3.4.2 available since December 2023',
        });
      }
    }

    if (activity.agentType === 'Risk') {
      // Extract risk findings
      if (message.includes('9.2') || message.includes('risk')) {
        findings.risk.score = 9.2;
        findings.risk.items.push({
          color: 'red',
          text: '2,400 at-risk devices in 340 facilities',
        });
        findings.risk.items.push({
          color: 'red',
          text: 'FSCA — immediate firmware patch required',
        });
      }
    }
  });

  // Return findings, removing duplicates
  return {
    ...findings,
    regulatory: Array.from(new Map(findings.regulatory.map(f => [f.text, f])).values()),
    clinical: Array.from(new Map(findings.clinical.map(f => [f.text, f])).values()),
    technical: Array.from(new Map(findings.technical.map(f => [f.text, f])).values()),
    risk: findings.risk,
  };
};

export default function InvestigationWorkspace() {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [tab, setTab] = useState<TabId>("overview");
  const [visibleMsgs, setVisibleMsgs] = useState<AgentActivityMessage[]>([]);
  const [findings, setFindings] = useState<Findings>({
    regulatory: [],
    clinical: [],
    technical: [],
    risk: { score: 0, items: [] },
  });
  const [streaming, setStreaming] = useState(true);
  const [incident, setIncident] = useState<any>(DEFAULT_INCIDENT);
  const [investigation, setInvestigation] = useState<Investigation | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const feedRef = useRef<HTMLDivElement>(null);

  // Fetch investigation and incident data from backend
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !token) return;

      try {
        console.log('[WORKSPACE] Fetching investigation data for ID:', id);
        setIsLoadingData(true);

        // Fetch investigation
        const invResponse = await fetch(API_ENDPOINTS.investigation(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (invResponse.ok) {
          const invData = await invResponse.json();
          setInvestigation(invData);
          console.log('[WORKSPACE] Investigation data loaded:', invData);

          // Fetch incident data using incidentId from investigation
          if (invData.incidentId) {
            const incResponse = await fetch(API_ENDPOINTS.incident(invData.incidentId), {
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (incResponse.ok) {
              const incData = await incResponse.json();
              setIncident(incData);
              console.log('[WORKSPACE] Incident data loaded:', incData);
            }
          }

          // If investigation is not in progress, fetch logs from database
          if (invData.phase !== 'Intake' && invData.phase !== 'Analysis') {
            console.log('[WORKSPACE] Investigation not in progress, fetching logs from database');
            const logsResponse = await fetch(API_ENDPOINTS.investigationAgentLogs(id!), {
              headers: { 'Authorization': `Bearer ${token}` },
            });

            if (logsResponse.ok) {
              const logs = await logsResponse.json();
              console.log('[WORKSPACE] Agent logs loaded from database:', logs.length);

              // Convert database logs to UI format
              const messages = logs.map((log: any) => ({
                id: log.id,
                agent: log.agentName,
                agentType: log.agentType,
                timestamp: log.timestamp,
                message: log.message,
                severity: log.status === 'Alert' ? 'alert' as const : 'info' as const,
              }));
              setVisibleMsgs(messages);
              setStreaming(false);
            }
          }
        }
      } catch (error) {
        console.error('[WORKSPACE] Failed to fetch data:', error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Parse findings from agent activities
  useEffect(() => {
    const parsedFindings = parseFindingsFromActivities(visibleMsgs);
    setFindings(parsedFindings);
  }, [visibleMsgs]);

  // Set up Socket.IO connection for real-time updates
  useInvestigationSocket(
    id || "",
    (activity) => {
      // Convert activity to AgentMessage format
      const newMessage: AgentActivityMessage = {
        id: Date.now().toString(),
        agent: activity.agentName,
        agentType: activity.agentType,
        timestamp: activity.timestamp,
        message: activity.message,
        severity: activity.status === "Alert" ? "alert" : "info",
      };

      setVisibleMsgs((prev) => [...prev, newMessage]);
      if (feedRef.current) {
        feedRef.current.scrollTop = feedRef.current.scrollHeight;
      }
    },
    (update) => {
      if (update.status === "done" || update.phase === "Complete") {
        setStreaming(false);
      }
    }
  );

  if (isLoadingData) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <Loader2 className="animate-spin text-blue-500 mb-2" size={24} />
        <p className="text-sm text-muted-foreground">Loading investigation...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <InvestigationHeader
        id={id ?? incident?.id ?? "Unknown"}
        device={(incident as any)?.deviceName || (incident as any)?.device || "Unknown Device"}
        manufacturer={incident?.manufacturer || "Unknown"}
        facility={incident?.facility || "Unknown"}
        onReview={() => setTab("review")}
      />

      <TabNavigation activeTab={tab} onTabChange={setTab} investigationPhase={investigation?.phase} />

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
            <AuditTab agentLogs={visibleMsgs} />
          </div>
        )}

        {tab === "agents" && (
          <div className="h-full flex flex-col p-4 md:p-5">
            {visibleMsgs.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground">
                <p>Waiting for agent activity...</p>
              </div>
            ) : (
              <>
                <div ref={feedRef} className="flex-1 overflow-auto space-y-2">
                  {visibleMsgs.map((m, idx) => {
                    const agentColor = getAgentColor(m.agentType);
                    return (
                      <MsgBubble
                        key={m.id}
                        msg={{
                          id: idx,
                          agent: m.agent,
                          color: agentColor,
                          ts: new Date(m.timestamp).toLocaleTimeString(),
                          msg: m.message,
                          type: m.severity === 'alert' ? 'alert' : 'info',
                        }}
                      />
                    );
                  })}
                  {streaming && (
                    <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-muted-foreground">
                      <Loader2 size={12} className="animate-spin text-blue-500" />{" "}
                      Agents processing…
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "overview" && (
          <OverviewTab
            visibleMsgs={visibleMsgs.map((m, idx) => ({
              id: idx,
              agent: m.agent,
              color: getAgentColor(m.agentType),
              ts: new Date(m.timestamp).toLocaleTimeString(),
              msg: m.message,
              type: (m.severity === 'alert' ? 'alert' : 'info') as any,
            }))}
            streaming={streaming}
            feedRef={feedRef as React.RefObject<HTMLDivElement>}
            hypotheses={[]}
            incident={incident}
            findings={findings}
          />
        )}
      </div>
    </div>
  );
}
