export function PanelSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

export function Detail({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[10px] text-muted-foreground">{label}</span>
      <span className="text-[11px] text-foreground font-medium">{value}</span>
    </div>
  );
}

export function FindingItem({ color, text }: { color: string; text: string }) {
  const dot: Record<string, string> = {
    red: 'bg-red-500',
    amber: 'bg-amber-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
  };
  return (
    <div className="flex items-start gap-2">
      <span
        className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${dot[color]}`}
      />
      <span className="text-[11px] text-foreground leading-snug">{text}</span>
    </div>
  );
}
