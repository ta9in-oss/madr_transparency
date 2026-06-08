import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

interface CountryDatum {
  iso: string;
  count: number;
  label: string;
}

interface Props {
  data: CountryDatum[];
  title?: string;
}

const FILL_EMPTY = '#e5e7eb';
// Algeria is the destination — distinct from the import-origin green scale
const FILL_ALGERIA = '#e8590c';
const FILL_COLORS = ['#bbf7d0', '#4ade80', '#16a34a', '#14532d'];

function countToFill(count: number, max: number): string {
  if (count === 0) return FILL_EMPTY;
  const idx = Math.min(
    FILL_COLORS.length - 1,
    Math.floor((count / max) * FILL_COLORS.length)
  );
  return FILL_COLORS[idx];
}

export function WorldMap({ data, title }: Props) {
  const [tooltip, setTooltip] = useState<{ label: string; count: number; isAlgeria?: boolean } | null>(null);

  const countByIso = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of data) map[d.iso] = d.count;
    return map;
  }, [data]);

  const labelByIso = useMemo(() => {
    const map: Record<string, string> = {};
    for (const d of data) map[d.iso] = d.label;
    return map;
  }, [data]);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);

  return (
    <div className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <h3 className="text-sm font-mono text-muted mb-3">{title}</h3>
      )}
      <div className="relative">
        <ComposableMap
          projectionConfig={{ scale: 130, center: [10, 20] }}
          width={800}
          height={400}
          style={{ width: '100%', height: 'auto' }}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => {
                // react-simple-maps exposes ISO_A2 on naturalEarth features;
                // world-atlas 110m uses numeric IDs but react-simple-maps
                // also exposes the numeric id via geo.id
                const iso2 = (geo.properties?.ISO_A2 ?? '') as string;
                const numericId = String(geo.id ?? '');
                const isAlgeria = numericId === '012';
                const count = countByIso[iso2] ?? 0;
                const label = labelByIso[iso2] ?? iso2;
                const fill = isAlgeria
                  ? FILL_ALGERIA
                  : countToFill(count, maxCount);
                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    style={{
                      default: { outline: 'none' },
                      hover: { outline: 'none', opacity: 0.8 },
                      pressed: { outline: 'none' },
                    }}
                    onMouseEnter={() => {
                      if (isAlgeria) {
                        setTooltip({ label: 'الجزائر', count: 0, isAlgeria: true });
                      } else if (count > 0) {
                        setTooltip({ label, count });
                      }
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Geographies>
        </ComposableMap>
        {tooltip && (
          <div
            className="absolute top-2 left-2 bg-ink text-white text-xs font-mono px-2 py-1 rounded whitespace-nowrap pointer-events-none"
            style={{ zIndex: 10 }}
          >
            {tooltip.isAlgeria
              ? 'الجزائر — وجهة الاستيراد'
              : `${tooltip.label} — ${tooltip.count.toLocaleString()}`}
          </div>
        )}
      </div>

      {/* Top countries legend */}
      <div className="mt-4 flex flex-wrap gap-2 justify-center">
        <span className="flex items-center gap-1 text-xs font-mono text-muted">
          <span style={{ background: FILL_ALGERIA, display: 'inline-block', width: 10, height: 10, borderRadius: 2 }} />
          الجزائر (وجهة)
        </span>
        {data.slice(0, 8).map((d) => (
          <span
            key={d.iso}
            className="flex items-center gap-1 text-xs font-mono text-muted"
          >
            <span
              style={{
                background: countToFill(d.count, maxCount),
                display: 'inline-block',
                width: 10,
                height: 10,
                borderRadius: 2,
              }}
            />
            {d.label} ({d.count})
          </span>
        ))}
      </div>
    </div>
  );
}
