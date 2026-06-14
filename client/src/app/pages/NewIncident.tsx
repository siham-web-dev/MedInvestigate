import { useState } from "react";
import { useNavigate } from "react-router";
import { Save, Send } from "lucide-react";
import { FormSection, FormField } from "../components/incidents/FormSection";
import { FileUploadArea } from "../components/incidents/FileUploadArea";
import { AiClassificationPanel } from "../components/incidents/AiClassificationPanel";
import { PreviousReviewsPanel } from "../components/incidents/PreviousReviewsPanel";

const FACILITIES = [
  "Mayo Clinic – Rochester, MN",
  "Cleveland Clinic – Cleveland, OH",
  "Johns Hopkins Hospital – Baltimore, MD",
  "Massachusetts General Hospital – Boston, MA",
  "UCSF Medical Center – San Francisco, CA",
  "Stanford Health Care – Stanford, CA",
  "NewYork-Presbyterian Hospital – New York, NY",
];

const MANUFACTURERS = [
  "Medtronic",
  "Abbott",
  "Boston Scientific",
  "Becton Dickinson",
  "Stryker",
  "Zimmer Biomet",
  "Edwards Lifesciences",
  "Intuitive Surgical",
  "CardioSync Medical Systems",
  "PharmaTech Inc.",
  "NeuroPace Inc.",
];

interface DroppedFile {
  name: string;
  size: number;
  type: string;
}

export default function NewIncident() {
  const navigate = useNavigate();
  const [files, setFiles] = useState<DroppedFile[]>([]);
  const [dragging, setDragging] = useState(false);
  const [aiClassified, setAiClassified] = useState(false);
  const [classifying, setClassifying] = useState(false);
  const [form, setForm] = useState({
    deviceName: "",
    udi: "",
    manufacturer: "",
    modelNumber: "",
    facility: "",
    incidentDate: "",
    severity: "",
    failureDescription: "",
  });

  const set =
    (field: string) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
      >,
    ) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));

  const runAiClassify = () => {
    setClassifying(true);
    setTimeout(() => {
      setClassifying(false);
      setAiClassified(true);
      setForm((f) => ({ ...f, severity: "Critical" }));
    }, 2200);
  };

  const handleSubmit = () => {
    navigate("/investigations/MDR-2024-0892");
  };

  return (
    <div className="p-4 md:p-6 w-full">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">
          Report New Incident
        </h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
          Submit a medical device incident for AI-assisted investigation
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-5">
        {/* Main form */}
        <div className="space-y-5">
          {/* Device Information */}
          <FormSection title="Device Information">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Device Name" required>
                <input
                  className="input-base"
                  placeholder="e.g. CardioSync Pro 3000"
                  value={form.deviceName}
                  onChange={set("deviceName")}
                />
              </FormField>
              <FormField label="UDI (Unique Device Identifier)">
                <input
                  className="input-base font-mono"
                  placeholder="00000000000000"
                  value={form.udi}
                  onChange={set("udi")}
                />
              </FormField>
              <FormField label="Manufacturer" required>
                <select
                  className="input-base"
                  value={form.manufacturer}
                  onChange={set("manufacturer")}
                >
                  <option value="">Select manufacturer…</option>
                  {MANUFACTURERS.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Model Number">
                <input
                  className="input-base font-mono"
                  placeholder="e.g. CSP-3000-V"
                  value={form.modelNumber}
                  onChange={set("modelNumber")}
                />
              </FormField>
            </div>
          </FormSection>

          {/* Incident Details */}
          <FormSection title="Incident Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Facility / Site" required>
                <select
                  className="input-base"
                  value={form.facility}
                  onChange={set("facility")}
                >
                  <option value="">Select facility…</option>
                  {FACILITIES.map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="Incident Date" required>
                <input
                  type="date"
                  className="input-base"
                  value={form.incidentDate}
                  onChange={set("incidentDate")}
                />
              </FormField>
              <FormField
                label="Initial Severity Assessment"
                required
                className="sm:col-span-2"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["Critical", "High", "Medium", "Low"] as const).map((s) => {
                    const styles = {
                      Critical: {
                        selected: "border-red-400 bg-red-50 text-red-700",
                        dot: "bg-red-500",
                      },
                      High: {
                        selected:
                          "border-orange-400 bg-orange-50 text-orange-700",
                        dot: "bg-orange-500",
                      },
                      Medium: {
                        selected: "border-amber-400 bg-amber-50 text-amber-700",
                        dot: "bg-amber-500",
                      },
                      Low: {
                        selected: "border-green-400 bg-green-50 text-green-700",
                        dot: "bg-green-500",
                      },
                    };
                    const isSelected = form.severity === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setForm((f) => ({ ...f, severity: s }))}
                        className={`flex items-center gap-2 px-3 py-2.5 rounded-md border text-sm font-medium transition-all ${
                          isSelected
                            ? styles[s].selected
                            : "border-border bg-background text-muted-foreground hover:border-slate-300"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${isSelected ? styles[s].dot : "bg-slate-300"}`}
                        />
                        {s}
                      </button>
                    );
                  })}
                </div>
              </FormField>
            </div>
            <FormField
              label="Failure / Malfunction Description"
              required
              className="mt-4"
            >
              <textarea
                className="input-base resize-none"
                rows={5}
                placeholder="Describe the device failure, malfunction, or adverse event in detail. Include observed symptoms, error codes, patient status, and any immediate corrective actions taken…"
                value={form.failureDescription}
                onChange={set("failureDescription")}
              />
            </FormField>
          </FormSection>

          {/* File Upload */}
          <FormSection title="Supporting Documentation">
            <FileUploadArea
              files={files}
              setFiles={setFiles}
              dragging={dragging}
              setDragging={setDragging}
            />
          </FormSection>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => navigate("/investigations")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors">
              <Save size={14} />
              <span className="hidden sm:inline">Save Draft</span>
              <span className="sm:hidden">Draft</span>
            </button>
            <button
              onClick={handleSubmit}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-md hover:bg-blue-700 transition-colors"
            >
              <Send size={14} />
              <span className="hidden sm:inline">Submit Investigation</span>
              <span className="sm:hidden">Submit</span>
            </button>
          </div>
        </div>

        {/* Right: AI Panel */}
        <div>
          <AiClassificationPanel
            aiClassified={aiClassified}
            classifying={classifying}
            onRunClassify={runAiClassify}
          />
        </div>
      </div>
    </div>
  );
}
