import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { Button } from '../ui/button';

export function InvestigationsHeader({ count }: { count: number }) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-5">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">Investigations</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{count} investigations · Updated daily</p>
      </div>
      <Button
        onClick={() => navigate('/incidents/new')}
        className="w-full sm:w-auto"
      >
        <Plus size={14} />
        New Incident
      </Button>
    </div>
  );
}
