import { getCategoryColor } from '../../lib/categoryColors';

interface Column {
  key: string;
  label: string;
  mono?: boolean;
}

interface Props {
  rows: Record<string, string>[];
  columns: Column[];
  categoryKey?: string;
  noResults?: string;
}

export function DataTable({ rows, columns, categoryKey, noResults = '—' }: Props) {
  if (rows.length === 0) {
    return (
      <div className="rounded border border-line px-4 py-6 text-center text-muted text-sm">
        {noResults}
      </div>
    );
  }

  return (
    <>
      {/* ── Desktop table ─────────────────────────────── */}
      <div className="hidden sm:block overflow-x-auto rounded border border-line">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-surface">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="px-4 py-2.5 text-start font-medium text-ink border-b border-line whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => {
              const accentColor =
                categoryKey && row[categoryKey]
                  ? getCategoryColor(row[categoryKey])
                  : undefined;
              return (
                <tr
                  key={i}
                  className="hover:bg-forest-tint transition-colors border-b border-line last:border-0"
                  style={
                    accentColor
                      ? { borderInlineStartColor: accentColor, borderInlineStartWidth: 3 }
                      : undefined
                  }
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 text-start max-w-[220px] truncate ${
                        col.mono ? 'font-mono text-data text-xs' : 'text-ink'
                      }`}
                      title={row[col.key] ?? ''}
                    >
                      {row[col.key] ?? ''}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ── Mobile card list ──────────────────────────── */}
      <div className="flex flex-col gap-2 sm:hidden">
        {rows.map((row, i) => {
          const accentColor =
            categoryKey && row[categoryKey]
              ? getCategoryColor(row[categoryKey])
              : undefined;
          return (
            <div
              key={i}
              className="rounded border border-line bg-surface px-4 py-3"
              style={
                accentColor
                  ? { borderInlineStartColor: accentColor, borderInlineStartWidth: 3 }
                  : undefined
              }
            >
              {columns.map((col, j) => (
                <div key={col.key} className={`flex gap-2 ${j > 0 ? 'mt-1.5' : ''}`}>
                  <span className="text-xs text-muted font-medium shrink-0 min-w-[5rem]">
                    {col.label}
                  </span>
                  <span
                    className={`text-xs break-words min-w-0 ${
                      col.mono ? 'font-mono text-data' : 'text-ink'
                    }`}
                  >
                    {row[col.key] ?? '—'}
                  </span>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
