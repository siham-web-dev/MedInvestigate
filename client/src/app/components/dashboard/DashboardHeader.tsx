import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router';
import { Button } from '../ui/button';

export function DashboardHeader() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-lg sm:text-xl font-semibold text-foreground">Overview</h1>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">Monday, January 15, 2024 · Mayo Clinic Network</p>
      </div>
      <Button
        onClick={() => navigate('/incidents/new')}
        className="w-full sm:w-auto"
      >
        <Plus size={15} />
        New Incident
      </Button>
    </div>
  );
}
