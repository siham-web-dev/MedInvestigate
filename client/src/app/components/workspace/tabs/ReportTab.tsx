import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { useSelector } from 'react-redux';
import { Download, Check, Loader2 } from 'lucide-react';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, PageBreak, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';
import type { RootState } from '../../../store/store';
import { API_ENDPOINTS } from '../../../../api/config';

interface RootCause {
  id: string;
  title: string;
  description?: string;
  confidenceScore: number;
  status: string;
}

interface RegulatoryFinding {
  id: string;
  title: string;
  regulationCode?: string;
  description?: string;
  severity?: string;
}

interface TechnicalFinding {
  id: string;
  title: string;
  description: string;
  affectedVersion?: string;
  patchAvailable?: string;
  patchDate?: string;
  cveId?: string;
}

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
  rootCauses: RootCause[];
  regulatoryFindings: RegulatoryFinding[];
  technicalFindings: TechnicalFinding[];
}

export function ReportTab() {
  const { id } = useParams();
  const { token } = useSelector((state: RootState) => state.auth);
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const reportContentRef = useRef<HTMLDivElement>(null);

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

  const exportToPDF = async () => {
    if (!reportContentRef.current) return;

    try {
      setExporting(true);
      const canvas = await html2canvas(reportContentRef.current, {
        scale: 2,
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`${report?.incidentNumber || 'Investigation'}_Report.pdf`);
    } catch (error) {
      console.error('[REPORT] Failed to export PDF:', error);
    } finally {
      setExporting(false);
    }
  };

  const exportToDOCX = async () => {
    if (!report) return;

    try {
      setExporting(true);
      const sections = [
        new Paragraph({
          text: `Investigation Report — ${report.incidentNumber}`,
          heading: HeadingLevel.HEADING_1,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: `Device: ${report.deviceName} by ${report.manufacturer}`,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Facility: ${report.facility}`,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `Severity: ${report.severity}`,
          spacing: { after: 400 },
        }),
        new Paragraph({
          text: 'Executive Summary',
          heading: HeadingLevel.HEADING_2,
          spacing: { after: 200 },
        }),
        new Paragraph({
          text: `A ${report.deviceName} by ${report.manufacturer} was reported at ${report.facility}. Severity: ${report.severity}. Incident: ${report.description} Multi-agent AI analysis has been completed to identify root causes and provide recommendations for corrective actions and regulatory compliance.`,
          spacing: { after: 400 },
        }),
      ];

      if (report.rootCauses.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Root Cause Analysis',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
        report.rootCauses.forEach((cause) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${cause.title} (${cause.confidenceScore}% confidence, ${cause.status})`, bold: true }),
              ],
              spacing: { after: 100 },
            })
          );
          if (cause.description) {
            sections.push(
              new Paragraph({
                text: cause.description,
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      if (report.regulatoryFindings.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Regulatory Findings',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
        report.regulatoryFindings.forEach((finding) => {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({ text: `${finding.title}${finding.regulationCode ? ` (${finding.regulationCode})` : ''}`, bold: true }),
              ],
              spacing: { after: 100 },
            })
          );
          if (finding.description) {
            sections.push(
              new Paragraph({
                text: finding.description,
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      if (report.technicalFindings.length > 0) {
        sections.push(
          new Paragraph({
            text: 'Technical Findings',
            heading: HeadingLevel.HEADING_2,
            spacing: { after: 200 },
          })
        );
        report.technicalFindings.forEach((finding) => {
          sections.push(
            new Paragraph({
              children: [new TextRun({ text: finding.title, bold: true })],
              spacing: { after: 100 },
            })
          );
          if (finding.description) {
            sections.push(
              new Paragraph({
                text: finding.description,
                spacing: { after: 100 },
              })
            );
          }
          if (finding.affectedVersion || finding.patchAvailable) {
            sections.push(
              new Paragraph({
                text: `${finding.affectedVersion ? `Affected: ${finding.affectedVersion}` : ''} ${finding.patchAvailable ? `Patch: ${finding.patchAvailable}` : ''}`,
                spacing: { after: 200 },
              })
            );
          }
        });
      }

      const doc = new Document({
        sections: [{ children: sections }],
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${report.incidentNumber}_Report.docx`);
    } catch (error) {
      console.error('[REPORT] Failed to export DOCX:', error);
    } finally {
      setExporting(false);
    }
  };

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
      <div className="flex-1 min-w-0 space-y-5 overflow-y-auto" ref={reportContentRef}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h3 className="text-sm font-semibold text-foreground">
            Investigation Report — {report.incidentNumber}
          </h3>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <button
              onClick={exportToPDF}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={13} /> {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
            <button
              onClick={exportToDOCX}
              disabled={exporting}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-background border border-border text-foreground text-xs font-medium rounded-md hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download size={13} /> {exporting ? 'Exporting...' : 'Export DOCX'}
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
            {report.rootCauses.length > 0 ? (
              report.rootCauses.map((cause) => (
                <div key={cause.id} className="pb-2 border-b border-border last:border-b-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1">
                    <strong>{cause.title}</strong>
                    <span className="text-[10px] px-2 py-0.5 bg-muted rounded-full">
                      {cause.confidenceScore}% confidence
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full">
                      {cause.status}
                    </span>
                  </div>
                  {cause.description && <p className="text-foreground">{cause.description}</p>}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground">No root cause analysis available yet</p>
            )}
          </div>
        </ReportSection>
        <ReportSection title="Regulatory Findings">
          {report.regulatoryFindings.length > 0 ? (
            <ul className="text-xs space-y-1.5 text-foreground">
              {report.regulatoryFindings.map((finding) => {
                const severityColor =
                  finding.severity === 'critical'
                    ? 'text-red-500'
                    : finding.severity === 'high'
                      ? 'text-amber-500'
                      : 'text-blue-500';
                return (
                  <li key={finding.id} className="flex gap-2">
                    <span className={`${severityColor} mt-0.5`}>•</span>
                    <div className="flex-1">
                      <strong>{finding.title}</strong>
                      {finding.regulationCode && (
                        <div className="text-[10px] text-muted-foreground">
                          Code: {finding.regulationCode}
                        </div>
                      )}
                      {finding.description && <p>{finding.description}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="text-muted-foreground">No regulatory findings identified yet</p>
          )}
        </ReportSection>
        <ReportSection title="Risk Assessment">
          {report.recommendations.length > 0 ? (
            <div className="space-y-3 text-xs">
              {report.recommendations.map((rec) => {
                const colorMap = {
                  blue: 'bg-blue-500',
                  red: 'bg-red-500',
                  green: 'bg-green-500',
                };
                return (
                  <div key={rec.id} className="pb-3 border-b border-border last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`inline-block w-2 h-2 rounded-full ${colorMap[rec.color]}`}></span>
                      <strong>{rec.label}</strong>
                    </div>
                    <p className="text-foreground">{rec.text}</p>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">Risk assessment in progress...</p>
          )}
        </ReportSection>
        <ReportSection title="Technical Findings & CAPA Recommendations">
          {report.technicalFindings.length > 0 ? (
            <div className="space-y-3 text-xs">
              {report.technicalFindings.map((finding) => (
                <div key={finding.id} className="pb-3 border-b border-border last:border-b-0">
                  <strong>{finding.title}</strong>
                  {finding.description && (
                    <p className="text-foreground mt-1">{finding.description}</p>
                  )}
                  <div className="mt-1 space-y-0.5 text-[11px] text-muted-foreground">
                    {finding.affectedVersion && <div>Affected Version: {finding.affectedVersion}</div>}
                    {finding.patchAvailable && <div>Patch Available: {finding.patchAvailable}</div>}
                    {finding.patchDate && <div>Patch Date: {finding.patchDate}</div>}
                    {finding.cveId && <div>CVE: {finding.cveId}</div>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No technical findings available yet</p>
          )}
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
                <div className="text-xs font-bold mt-1">{report.incidentNumber}</div>
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
