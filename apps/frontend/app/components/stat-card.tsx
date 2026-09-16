export function StatCard({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-xl border border-[--color-border] bg-[--color-surface] p-5 shadow-[--shadow-sm]">
      <p className="text-xs font-medium uppercase tracking-wider text-[--color-subtle]">{label}</p>
      <p className="mt-2 font-numeric text-2xl font-semibold tracking-tight text-[--color-foreground]">
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-[--color-muted]">{hint}</p>}
    </div>
  );
}
