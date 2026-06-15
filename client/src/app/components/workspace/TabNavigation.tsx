import { Eye, Bot, Network, Scale, FileText, History } from 'lucide-react';

type TabId = 'overview' | 'agents' | 'graph' | 'review' | 'report' | 'audit';

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: Eye },
  { id: 'agents', label: 'Agent Activity', icon: Bot },
  { id: 'graph', label: 'Graph', icon: Network },
  { id: 'review', label: 'Review', icon: Scale },
  { id: 'report', label: 'Report', icon: FileText },
  { id: 'audit', label: 'Audit Log', icon: History },
];

export function TabNavigation({
  activeTab,
  onTabChange,
  investigationPhase,
}: {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  investigationPhase?: string;
}) {
  // Show report and review tabs only when investigation is complete or review phase
  const isComplete = investigationPhase === 'Review' || investigationPhase === 'Complete';

  const visibleTabs = TABS.filter((t) => {
    if (t.id === 'report' && !isComplete) return false;
    return true;
  });

  return (
    <div className="bg-card border-b border-border px-4 md:px-5 flex-shrink-0 overflow-x-auto">
      <nav className="flex gap-1">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => onTabChange(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              activeTab === t.id
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <t.icon size={13} />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}

export type { TabId };
