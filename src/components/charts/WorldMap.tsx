import { useMemo, useState, useRef, useEffect } from 'react';
import { Mercator } from '@visx/geo';
// @ts-ignore — world-atlas ships as JSON, no types
import topology from 'world-atlas/countries-110m.json';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, Geometry } from 'geojson';

interface CountryDatum {
  iso: string;
  count: number;
  label: string;
}

interface Props {
  data: CountryDatum[];
  title?: string;
}

// ISO alpha-2 → ISO numeric (used as IDs in world-atlas)
const ISO2_TO_NUMERIC: Record<string, string> = {
  ES: '724', IT: '380', CN: '156', FR: '250', DE: '276', NL: '528',
  BE: '056', PT: '620', GB: '826', CH: '756', AT: '040', PL: '616',
  US: '840', CA: '124', IN: '356', JP: '392', KR: '410', AU: '036',
  BR: '076', AR: '032', MX: '484', CL: '152', ZA: '710', MA: '504',
  TN: '788', EG: '818', LY: '434', DZ: '012', JO: '400', SA: '682',
  AE: '784', IL: '376', SY: '760', LB: '422', TR: '792', IR: '364',
  RU: '643', UA: '804', RO: '642', HU: '348', GR: '300', CZ: '203',
  SK: '703', BG: '100', HR: '191', RS: '688', SG: '702', TW: '158',
  ID: '360', MY: '458', TH: '764', PK: '586', BD: '050', VN: '704',
};

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(640);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 100) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = Math.round(width * 0.5);

  const world = useMemo(
    () =>
      feature(
        topology as unknown as Topology,
        (topology as unknown as Topology).objects.countries as GeometryCollection
      ),
    []
  );

  // Build numeric-id → count/label map
  const numericMap = useMemo(() => {
    const m: Record<string, { count: number; label: string; iso: string }> = {};
    for (const d of data) {
      const num = ISO2_TO_NUMERIC[d.iso];
      if (num) m[num] = { count: d.count, label: d.label, iso: d.iso };
    }
    return m;
  }, [data]);

  const maxCount = Math.max(1, ...data.map((d) => d.count));

  return (
    <div className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <h3 className="text-sm font-mono text-muted mb-3">{title}</h3>
      )}
      <div ref={containerRef} className="relative w-full">
        <svg
          width={width}
          height={height}
          style={{ display: 'block', direction: 'ltr' }}
          onMouseLeave={() => setTooltip(null)}
        >
          <Mercator
            data={world.features}
            scale={(width / 640) * 100}
            translate={[width / 2, height / 2 + height * 0.08]}
          >
            {(mercator) =>
              mercator.features.map(({ feature: f, path }) => {
                const id = String((f as Feature<Geometry, Record<string, unknown>>).id ?? '');
                const info = numericMap[id];
                const isAlgeria = id === '012';
                const fill = isAlgeria
                  ? FILL_ALGERIA
                  : info
                  ? countToFill(info.count, maxCount)
                  : FILL_EMPTY;
                return (
                  <path
                    key={id}
                    d={path ?? ''}
                    fill={fill}
                    stroke="#ffffff"
                    strokeWidth={0.4}
                    style={{ cursor: info ? 'pointer' : 'default' }}
                    onMouseEnter={(e) => {
                      if (!info && !isAlgeria) return;
                      const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                      const text = isAlgeria
                        ? 'الجزائر — وجهة الاستيراد'
                        : `${info!.label} — ${info!.count}`;
                      setTooltip({
                        x: e.clientX - rect.left + 10,
                        y: e.clientY - rect.top - 28,
                        text,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  />
                );
              })
            }
          </Mercator>
        </svg>

        {tooltip && (
          <div
            className="pointer-events-none absolute z-10 bg-ink text-white text-xs font-mono px-2 py-1 rounded whitespace-nowrap"
            style={{ left: tooltip.x, top: tooltip.y }}
          >
            {tooltip.text}
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
