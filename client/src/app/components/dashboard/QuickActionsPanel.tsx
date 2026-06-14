import { useNavigate } from 'react-router';
import { Plus, Clock, AlertTriangle, ChevronRight } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface QuickAction {
  label: string;
  icon: React.ElementType;
  href: string;
  accent: boolean;
}

const ACTIONS: QuickAction[] = [
  { label: 'Submit New Incident Report', icon: Plus, href: '/incidents/new', accent: true },
  { label: 'Review Pending Cases (17)', icon: Clock, href: '/investigations', accent: false },
  { label: 'View Critical Alerts (8)', icon: AlertTriangle, href: '/investigations', accent: false },
];

export function QuickActionsPanel() {
  const navigate = useNavigate();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {ACTIONS.map((action) => (
            <Button
              key={action.label}
              onClick={() => navigate(action.href)}
              variant={action.accent ? 'default' : 'outline'}
              className="w-full justify-start"
            >
              <action.icon size={14} />
              {action.label}
              <ChevronRight size={12} className="ml-auto opacity-50" />
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
