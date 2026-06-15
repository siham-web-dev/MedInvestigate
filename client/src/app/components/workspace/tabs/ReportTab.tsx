import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Download, Check, Loader2 } from 'lucide-react';
import type { RootState } from '../../../store/store';
import { API_ENDPOINTS } from '../../../../api/config';

interface ReportData {
  incidentNumber: string;
  deviceName: string;
  manufacturer: string;
  severity: string;
  facility: string;
  description: string;
  recommendations: Array<{
    id: string;
    label: string;
    color: 'blue' | 'red' | 'green';
    text: string;
    details: string;
    context: string[];
  }>;
}

export function ReportTab() {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      if (!id || !token) return;

      try {
        const response = await fetch(API_ENDPOINTS.investigationReport(id!), {
          headers: { 'Authorization': `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setReport(data);
        }
      } catch (error) {
        console.error('[REPORT] Failed to fetch report:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id, token]);

  if (loading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-full">
        <Loader2 className="animate-spin text-muted-foreground" size={24} />
      </div>
    );
  }

  if (!report) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center h-full">
        <p className="text-muted-foreground">Unable to load report</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 flex flex-col lg:flex-row gap-6 h-full">
      {/* Left Column - Report Content */}
      <div className="flex-1 min-w-0 space-y-5 overflow-y-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Investigation Report — {report.incidentNumber}
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors">
              <Download size={13} /> Export PDF
            </button>
            <button className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors">
              <Download size={13} /> Export DOCX
            </button>
          </div>
        </div>
        <ReportSection title="Executive Summary">
          <p className="text-xs text-foreground leading-relaxed">
            A {report.deviceName} by {report.manufacturer} was reported at {report.facility}.
            Severity: {report.severity}.
            Incident: {report.description}
            Multi-agent AI analysis has been completed to identify root causes and provide recommendations for corrective actions and regulatory compliance.
          </p>
        </ReportSection>
        <ReportSection title="Root Cause Analysis">
          <div className="space-y-2 text-xs">
            <p>
              <strong>Primary root cause:</strong> Race condition in the therapy
              delivery scheduler (firmware v3.4.1) causes premature charge abort
              when lead impedance exceeds 1,100 Ω. Error code E-04 indicates
              capacitor charging failure — device did not reach required 360J
              discharge threshold.
            </p>
            <p>
              <strong>Contributing factor:</strong> Patient lead impedance had
              increased to 1,247 Ω prior to incident — within acceptable range
              per device labeling but above the undocumented firmware threshold.
            </p>
            <p>
              <strong>Patch status:</strong> Firmware v3.4.2 available since
              December 2023. Not deployed to this unit.
            </p>
          </div>
        </ReportSection>
        <ReportSection title="Regulatory Findings">
          <ul className="text-xs space-y-1.5 text-foreground">
            <li className="flex gap-2">
              <span className="text-red-500 mt-0.5">•</span>30-day MDR required
              under 21 CFR 803.50(a)(1) — serious injury from device
              malfunction. Deadline: February 14, 2024.
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 mt-0.5">•</span>EU MDR Article 87
              vigilance report recommended for European market devices.
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 mt-0.5">•</span>3 prior similar
              MAUDE reports establish pattern — potential Class II recall
              consideration.
            </li>
          </ul>
        </ReportSection>
        <ReportSection title="Risk Assessment">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-red-50 border border-red-200 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-red-700">9.2</div>
              <div className="text-red-600 text-[11px] mt-1">
                Risk Score / 10
              </div>
            </div>
            <div className="bg-orange-50 border border-orange-200 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-orange-700">2,400</div>
              <div className="text-orange-600 text-[11px] mt-1">
                At-Risk Devices
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 text-center">
              <div className="text-2xl font-bold text-amber-700">34%</div>
              <div className="text-amber-600 text-[11px] mt-1">
                Harm Probability / yr
              </div>
            </div>
          </div>
        </ReportSection>
        <ReportSection title="CAPA Recommendations">
          <ol className="text-xs space-y-2 text-foreground list-decimal list-inside">
            <li>
              Deploy firmware v3.4.2 patch to all 2,400 affected units within 30
              days via remote update protocol.
            </li>
            <li>
              Issue urgent field safety notice to all implanting centers and
              device follow-up clinics.
            </li>
            <li>
              Implement enhanced lead impedance monitoring threshold alert at
              1,000 Ω in next firmware release.
            </li>
            <li>
              Conduct post-market surveillance review of all E-04 events across
              entire CSP-3000 installed base.
            </li>
            <li>File 30-day MDR with FDA by February 14, 2024.</li>
          </ol>
        </ReportSection>
      </div>

      {/* Right Column - Report Preview */}
      <div className="w-full lg:w-96 flex-shrink-0 hidden lg:block">
        <div className="sticky top-4 bg-card border border-border rounded-lg overflow-hidden shadow-lg">
          <div className="bg-gradient-to-r from-slate-100 to-slate-50 border-b border-border p-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-foreground">Document Preview</span>
            <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-medium">
              PDF/DOCX
            </span>
          </div>

          {/* Document Preview Mockup */}
          <div className="h-96 bg-slate-900 overflow-hidden flex items-center justify-center p-4">
            <div className="w-full h-full bg-white rounded shadow-xl overflow-hidden flex flex-col">
              {/* Document Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 text-center border-b-4 border-blue-800">
                <div className="text-[10px] font-semibold opacity-90">CONFIDENTIAL</div>
                <div className="text-xs font-bold mt-1">MDR-2024-0891</div>
              </div>

              {/* Document Content Mockup */}
              <div className="flex-1 p-3 space-y-2 overflow-hidden">
                <div className="h-2 bg-slate-200 rounded w-3/4"></div>
                <div className="h-1.5 bg-slate-100 rounded"></div>
                <div className="h-1.5 bg-slate-100 rounded w-5/6"></div>

                <div className="pt-2 space-y-1.5">
                  <div className="h-1.5 bg-slate-200 rounded"></div>
                  <div className="h-1.5 bg-slate-100 rounded"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-4/5"></div>
                </div>

                <div className="pt-2 space-y-1.5">
                  <div className="h-1.5 bg-slate-200 rounded w-2/3"></div>
                  <div className="h-1.5 bg-slate-100 rounded"></div>
                  <div className="h-1.5 bg-slate-100 rounded w-5/6"></div>
                </div>
              </div>

              {/* Document Footer */}
              <div className="border-t border-slate-200 px-3 py-2 text-center bg-slate-50">
                <div className="text-[8px] text-slate-500">Page 1 of 12</div>
              </div>
            </div>
          </div>

          {/* Preview Info */}
          <div className="bg-muted/30 border-t border-border p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Format:</span>
              <span className="font-medium text-foreground">PDF or DOCX</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Pages:</span>
              <span className="font-medium text-foreground">12 pages</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status:</span>
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-medium border border-green-200">
                <Check size={10} /> Ready
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      <div className="px-4 py-2.5 border-b border-border bg-muted/30">
        <h4 className="text-xs font-semibold text-foreground">{title}</h4>
      </div>
      <div className="px-4 py-3">{children}</div>
    </div>
  );
}
