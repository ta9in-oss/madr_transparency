interface Props {
  label: string;
  value: number;
  color?: string;
}

export function ChartTooltip({ label, value, color = '#2d6a4f' }: Props) {
  return (
    <div className="bg-ink text-paper text-xs font-mono px-3 py-1.5 rounded shadow-md pointer-events-none">
      <span style={{ color }}>{label}</span>
      <span className="mx-1.5 text-muted">·</span>
      <span className="tabular-nums">{value.toLocaleString()}</span>
    </div>
  );
}
