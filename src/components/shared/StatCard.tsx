interface Props {
  value: number | string;
  label: string;
  accent?: boolean;
}

export function StatCard({ value, label, accent = false }: Props) {
  return (
    <div className="flex flex-col gap-1 p-5 bg-surface border border-line rounded-lg">
      <span
        className={`font-display font-bold text-display-md tabular-nums ${
          accent ? 'text-forest' : 'text-ink'
        }`}
      >
        {typeof value === 'number' ? value.toLocaleString('fr-DZ') : value}
      </span>
      <span className="text-sm text-muted font-body">{label}</span>
    </div>
  );
}
