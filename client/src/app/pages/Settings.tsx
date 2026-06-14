import { useState } from 'react';
import {
  Building2, Users, ShieldCheck, Key, Plug, Plus, MoreHorizontal,
  Copy, Eye, EyeOff, Trash2, Check,
} from 'lucide-react';

type SettingsTab = 'org' | 'team' | 'roles' | 'api' | 'integrations';

const TABS: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
  { id: 'org', label: 'Organization', icon: Building2 },
  { id: 'team', label: 'Team Members', icon: Users },
  { id: 'roles', label: 'Roles & Permissions', icon: ShieldCheck },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'integrations', label: 'Integrations', icon: Plug },
];

const TEAM = [
  { name: 'Dr. Sarah Chen', email: 'sarah.chen@clinic.org', role: 'Investigator', status: 'active', initials: 'SC', joined: 'Sep 2023' },
  { name: 'James Rodriguez', email: 'j.rodriguez@clinic.org', role: 'Investigator', status: 'active', initials: 'JR', joined: 'Oct 2023' },
  { name: 'Dr. Priya Nair', email: 'p.nair@clinic.org', role: 'Reviewer', status: 'active', initials: 'PN', joined: 'Aug 2023' },
  { name: 'Dr. Marcus Liu', email: 'm.liu@clinic.org', role: 'Reviewer', status: 'active', initials: 'ML', joined: 'Nov 2023' },
  { name: 'Rachel Torres', email: 'r.torres@clinic.org', role: 'Investigator', status: 'active', initials: 'RT', joined: 'Dec 2023' },
  { name: 'Dr. Thomas Park', email: 't.park@clinic.org', role: 'Admin', status: 'active', initials: 'TP', joined: 'Jul 2023' },
  { name: 'Lisa Hammond', email: 'l.hammond@clinic.org', role: 'Investigator', status: 'pending', initials: 'LH', joined: 'Invited Jan 18' },
];

const PERMISSIONS = {
  Investigator: {
    'Create & submit incidents': true,
    'View own investigations': true,
    'View all investigations': false,
    'Run AI analysis': true,
    'Export reports': true,
    'Approve/Reject investigations': false,
    'Manage team members': false,
    'Manage API keys': false,
    'Configure organization': false,
  },
  Reviewer: {
    'Create & submit incidents': true,
    'View own investigations': true,
    'View all investigations': true,
    'Run AI analysis': true,
    'Export reports': true,
    'Approve/Reject investigations': true,
    'Manage team members': false,
    'Manage API keys': false,
    'Configure organization': false,
  },
  Admin: {
    'Create & submit incidents': true,
    'View own investigations': true,
    'View all investigations': true,
    'Run AI analysis': true,
    'Export reports': true,
    'Approve/Reject investigations': true,
    'Manage team members': true,
    'Manage API keys': true,
    'Configure organization': true,
  },
};

const API_KEYS = [
  { name: 'Production API Key', key: 'mdi_pk_prod_4a8b2c...f91d', created: 'Jan 1, 2024', lastUsed: '2h ago', active: true },
  { name: 'Development API Key', key: 'mdi_pk_dev_9e3c7f...a42e', created: 'Dec 15, 2023', lastUsed: '5d ago', active: true },
  { name: 'CI/CD Integration Key', key: 'mdi_pk_ci_1f7b4a...c83d', created: 'Nov 30, 2023', lastUsed: 'Never', active: false },
];

const INTEGRATIONS = [
  { name: 'FDA MAUDE Database', desc: 'Real-time adverse event query and reporting', status: 'connected', logo: '🏛️' },
  { name: 'Salesforce Health Cloud', desc: 'Sync investigation data with CRM', status: 'connected', logo: '☁️' },
  { name: 'Slack', desc: 'Investigation alerts and agent notifications', status: 'connected', logo: '💬' },
  { name: 'Microsoft Teams', desc: 'Team notifications and report sharing', status: 'disconnected', logo: '🔵' },
  { name: 'ServiceNow', desc: 'CAPA workflow integration', status: 'disconnected', logo: '⚙️' },
  { name: 'Jira', desc: 'Issue tracking for corrective actions', status: 'disconnected', logo: '📋' },
];

const ROLE_COLORS: Record<string, string> = {
  Admin: 'bg-violet-50 text-violet-700 border-violet-200',
  Reviewer: 'bg-teal-50 text-teal-700 border-teal-200',
  Investigator: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function Settings() {
  const [tab, setTab] = useState<SettingsTab>('org');
  const [showKey, setShowKey] = useState<number | null>(null);

  return (
    <div className="p-4 md:p-6 max-w-[960px] mx-auto">
      <div className="mb-6">
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">Settings</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Manage your organization, team, and integrations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-5">
        {/* Sidebar tabs */}
        <nav className="w-full lg:w-[180px] lg:flex-shrink-0 flex lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible lg:space-y-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-shrink-0 lg:w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition-colors text-left whitespace-nowrap lg:whitespace-normal ${
                tab === t.id
                  ? 'bg-muted text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              <t.icon size={15} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {tab === 'org' && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Organization Settings</h3>
              </div>
              <div className="p-4 md:p-5 space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Organization Name">
                    <input className="input-base" defaultValue="Mayo Clinic — MDR Division" />
                  </FormField>
                  <FormField label="Organization ID">
                    <input className="input-base font-mono text-muted-foreground text-xs" defaultValue="org_mc_mdr_001" readOnly />
                  </FormField>
                  <FormField label="Primary Contact Email">
                    <input className="input-base" defaultValue="mdr-admin@mayoclinic.org" />
                  </FormField>
                  <FormField label="FDA Establishment ID">
                    <input className="input-base font-mono text-xs" defaultValue="3007890214" />
                  </FormField>
                  <FormField label="Default Regulatory Region" className="sm:col-span-2">
                    <select className="input-base">
                      <option>United States (FDA 21 CFR Part 803)</option>
                      <option>European Union (EU MDR 2017/745)</option>
                      <option>United Kingdom (UKCA)</option>
                    </select>
                  </FormField>
                </div>
                <div className="flex justify-end">
                  <button className="w-full sm:w-auto px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'team' && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Team Members <span className="text-muted-foreground font-normal">({TEAM.length})</span></h3>
                <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                  <Plus size={13} /> Invite Member
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-border">
                      {['Member', 'Role', 'Status', 'Joined', ''].map((h) => (
                        <th key={h} className="text-left px-3 md:px-5 py-2.5 text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {TEAM.map((m) => (
                      <tr key={m.email} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                        <td className="px-3 md:px-5 py-3">
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-[11px] font-semibold text-blue-700">{m.initials}</span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs font-medium text-foreground truncate">{m.name}</div>
                              <div className="text-[10px] md:text-[11px] text-muted-foreground truncate">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 md:px-5 py-3 hidden md:table-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${ROLE_COLORS[m.role]}`}>{m.role}</span>
                        </td>
                        <td className="px-3 md:px-5 py-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border ${
                            m.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}>{m.status === 'active' ? 'Active' : 'Pending'}</span>
                        </td>
                        <td className="px-3 md:px-5 py-3 text-xs text-muted-foreground hidden lg:table-cell">{m.joined}</td>
                        <td className="px-3 md:px-5 py-3">
                          <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors">
                            <MoreHorizontal size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'roles' && (
            <div className="bg-card border border-border rounded-lg overflow-hidden">
              <div className="px-4 md:px-5 py-4 border-b border-border">
                <h3 className="text-sm font-semibold text-foreground">Roles & Permissions</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Permission matrix for all roles in your organization</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-max">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left px-3 md:px-5 py-3 text-[10px] md:text-[11px] font-medium text-muted-foreground uppercase tracking-wide">Permission</th>
                      {Object.keys(PERMISSIONS).map((role) => (
                        <th key={role} className="px-2 md:px-5 py-3 text-center">
                          <span className={`inline-flex items-center px-2 md:px-2.5 py-1 rounded text-xs font-medium border ${ROLE_COLORS[role]}`}>{role}</span>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(Object.values(PERMISSIONS)[0]).map((perm) => (
                      <tr key={perm} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 md:px-5 py-3 text-xs text-foreground">{perm}</td>
                        {Object.values(PERMISSIONS).map((perms, i) => (
                          <td key={i} className="px-2 md:px-5 py-3 text-center">
                            {perms[perm as keyof typeof perms] ? (
                              <Check size={15} className="text-green-600 mx-auto" />
                            ) : (
                              <span className="block w-4 h-px bg-slate-300 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {tab === 'api' && (
            <div className="space-y-4">
              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 md:px-5 py-4 border-b border-border">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">API Keys</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Use API keys to access the MedInvestigate API programmatically</p>
                  </div>
                  <button className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-md hover:bg-blue-700 transition-colors">
                    <Plus size={13} /> Generate Key
                  </button>
                </div>
                <div className="divide-y divide-border">
                  {API_KEYS.map((k, i) => (
                    <div key={i} className="px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-start gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <span className="text-xs font-medium text-foreground">{k.name}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                            k.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}>{k.active ? 'Active' : 'Inactive'}</span>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 text-[10px] md:text-[11px] text-muted-foreground flex-wrap">
                          <span className="font-mono break-all">{showKey === i ? k.key.replace('...', 'xxxxxxxxxxxxxxxx') : k.key}</span>
                          <div className="flex items-center gap-3">
                            <button onClick={() => setShowKey(showKey === i ? null : i)} className="text-muted-foreground hover:text-foreground transition-colors">
                              {showKey === i ? <EyeOff size={12} /> : <Eye size={12} />}
                            </button>
                            <button className="text-muted-foreground hover:text-foreground transition-colors"><Copy size={12} /></button>
                          </div>
                          <span className="hidden sm:inline">Created {k.created}</span>
                          <span className="hidden sm:inline">Last used: {k.lastUsed}</span>
                        </div>
                      </div>
                      <button className="p-1.5 text-muted-foreground hover:text-red-600 rounded-md hover:bg-red-50 transition-colors flex-shrink-0">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'integrations' && (
            <div className="space-y-3">
              {INTEGRATIONS.map((intg) => (
                <div key={intg.name} className="bg-card border border-border rounded-lg px-4 md:px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="text-2xl w-10 h-10 flex items-center justify-center flex-shrink-0">{intg.logo}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">{intg.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{intg.desc}</div>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 flex-shrink-0">
                    <span className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${
                      intg.status === 'connected' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}>
                      {intg.status === 'connected' && <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />}
                      {intg.status === 'connected' ? 'Connected' : 'Disconnected'}
                    </span>
                    <button className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors w-full sm:w-auto ${
                      intg.status === 'connected'
                        ? 'bg-background border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                        : 'bg-primary border-primary text-primary-foreground hover:bg-blue-700'
                    }`}>
                      {intg.status === 'connected' ? 'Configure' : 'Connect'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FormField({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="block text-xs font-medium text-foreground mb-1.5">{label}</label>
      {children}
    </div>
  );
}
