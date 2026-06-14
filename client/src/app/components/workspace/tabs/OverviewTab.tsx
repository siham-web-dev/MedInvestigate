import { Loader2 } from 'lucide-react';
import { PanelSection, Detail, FindingItem } from '../PanelSection';
import { AgentMessage, MsgBubble } from '../MsgBubble';

interface Hypothesis {
  title: string;
  confidence: number;
  tag: string;
  tagColor: string;
}

interface Incident {
  id: string;
  device: string;
  manufacturer: string;
  facility: string;
  incidentDate: string;
  reportedBy: string;
  udi: string;
  model: string;
  description: string;
}

export function OverviewTab({
  visibleMsgs,
  streaming,
  feedRef,
  hypotheses,
  incident,
}: {
  visibleMsgs: AgentMessage[];
  streaming: boolean;
  feedRef: React.RefObject<HTMLDivElement>;
  hypotheses: Hypothesis[];
  incident: Incident;
}) {
  return (
    <div className="h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left panel */}
      <div className="w-full md:w-[264px] flex-shrink-0 border-b md:border-b-0 md:border-r border-border overflow-auto bg-card">
        <div className="p-4 space-y-4">
          {/* Incident Details */}
          <PanelSection title="Incident Details">
            <Detail label="Incident Date" value={incident.incidentDate} />
            <Detail label="Facility" value={incident.facility} />
            <Detail label="Reported By" value={incident.reportedBy} />
            <Detail
              label="Severity"
              value={
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                  Critical
                </span>
              }
            />
            <div>
              <div className="text-[10px] text-muted-foreground mb-1">
                Description
              </div>
              <p className="text-[11px] text-foreground leading-snug">
                {incident.description}
              </p>
            </div>
          </PanelSection>

          {/* Device Info */}
          <PanelSection title="Device Information">
            <Detail label="Device" value={incident.device} />
            <Detail label="Manufacturer" value={incident.manufacturer} />
            <Detail
              label="Model"
              value={
                <span className="font-mono text-[11px]">
                  {incident.model}
                </span>
              }
            />
            <Detail
              label="UDI"
              value={
                <span className="font-mono text-[11px]">
                  {incident.udi}
                </span>
              }
            />
          </PanelSection>
        </div>
      </div>

      {/* Center: Agent Feed */}
      <div className="flex-1 flex flex-col overflow-hidden border-b md:border-b-0 md:border-r border-border">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 px-4 py-3 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-foreground">
              Live Agent Activity
            </span>
            {streaming ? (
              <span className="flex items-center gap-1 text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5 font-medium">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />{' '}
                Live
              </span>
            ) : (
              <span className="text-[10px] bg-muted text-muted-foreground border border-border rounded-full px-2 py-0.5 font-medium">
                Complete — {visibleMsgs.length} events
              </span>
            )}
          </div>
        </div>
        <div ref={feedRef} className="flex-1 overflow-auto p-4 space-y-2">
          {visibleMsgs.map((m) => (
            <MsgBubble key={m.id} msg={m} />
          ))}
          {streaming && (
            <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md text-[11px] text-muted-foreground">
              <Loader2 size={12} className="animate-spin text-blue-500" />
              Agents analyzing…
            </div>
          )}
        </div>
      </div>

      {/* Right: Findings */}
      <div className="w-full md:w-[296px] flex-shrink-0 overflow-auto bg-card">
        <div className="p-4 space-y-4">
          {/* Root Cause */}
          <PanelSection title="Root Cause Hypotheses">
            {hypotheses.map((h, i) => (
              <div key={i} className="mb-3 last:mb-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <span className="text-[11px] text-foreground leading-snug flex-1">
                    {h.title}
                  </span>
                  <span
                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border flex-shrink-0 ${h.tagColor}`}
                  >
                    {h.tag}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full ${h.confidence >= 80 ? 'bg-green-500' : h.confidence >= 50 ? 'bg-blue-500' : 'bg-slate-300'}`}
                      style={{ width: `${h.confidence}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground font-mono w-8 text-right">
                    {h.confidence}%
                  </span>
                </div>
              </div>
            ))}
          </PanelSection>

          {/* Regulatory */}
          <PanelSection title="Regulatory Findings">
            <FindingItem
              color="red"
              text="30-day MDR required — 21 CFR 803.50(a)(1)"
            />
            <FindingItem
              color="amber"
              text="3 prior MAUDE reports — pattern established"
            />
            <FindingItem
              color="blue"
              text="EU MDR Article 87 vigilance report recommended"
            />
          </PanelSection>

          {/* Clinical */}
          <PanelSection title="Clinical Evidence">
            <FindingItem
              color="green"
              text="Serious non-fatal adverse event · MedDRA 10065722"
            />
            <FindingItem
              color="green"
              text="Patient recovered without permanent injury"
            />
            <FindingItem
              color="amber"
              text="Lead impedance elevated at 1,247 Ω pre-incident"
            />
          </PanelSection>

          {/* Technical */}
          <PanelSection title="Technical Findings">
            <FindingItem
              color="amber"
              text="CVE-CSP-2024-003 confirmed — firmware v3.4.1 race condition"
            />
            <FindingItem
              color="amber"
              text="E-04: Capacitor charged to 0% on 3 consecutive attempts"
            />
            <FindingItem
              color="blue"
              text="Patch v3.4.2 available since December 2023"
            />
          </PanelSection>

          {/* Risk */}
          <PanelSection title="Risk Assessment">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] text-muted-foreground">
                Overall Risk Score
              </span>
              <span className="text-lg font-bold text-red-600">
                9.2
                <span className="text-xs font-normal text-muted-foreground">
                  /10
                </span>
              </span>
            </div>
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden mb-3">
              <div
                className="h-2 rounded-full bg-gradient-to-r from-green-400 via-amber-400 to-red-500"
                style={{ width: "92%" }}
              />
            </div>
            <FindingItem
              color="red"
              text="2,400 at-risk devices in 340 facilities"
            />
            <FindingItem
              color="red"
              text="FSCA — immediate firmware patch required"
            />
          </PanelSection>
        </div>
      </div>
    </div>
  );
}
