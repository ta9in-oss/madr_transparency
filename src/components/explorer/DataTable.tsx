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
  return (
    <div className="overflow-x-auto rounded border border-line">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-surface">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-2.5 text-start font-medium text-ink border-b border-line"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-6 text-center text-muted"
              >
                {noResults}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => {
              const accentColor =
                categoryKey && row[categoryKey]
                  ? getCategoryColor(row[categoryKey])
                  : undefined;
              return (
                <tr
                  key={i}
                  className="hover:bg-forest-tint transition-colors border-b border-line last:border-0"
                  style={accentColor ? { borderInlineStartColor: accentColor } : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-2.5 text-start ${col.mono ? 'font-mono text-data' : 'text-ink'}`}
                    >
                      {row[col.key] ?? ''}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
