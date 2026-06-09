import { useMemo, useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

// world-atlas@2 uses ISO 3166-1 numeric codes as string IDs (e.g. '724' for Spain).
// geo.properties.ISO_A2 does not exist in this dataset — map numeric → alpha-2 manually.
const NUMERIC_TO_ISO2: Record<string, string> = {
  '012': 'DZ', '724': 'ES', '380': 'IT', '156': 'CN', '400': 'JO', '792': 'TR',
  '276': 'DE', '620': 'PT', '682': 'SA', '356': 'IN', '056': 'BE', '764': 'TH',
  '528': 'NL', '348': 'HU', '826': 'GB', '840': 'US', '643': 'RU', '392': 'JP',
  '300': 'GR', '036': 'AU', '616': 'PL', '788': 'TN', '784': 'AE', '705': 'SI',
  '152': 'CL', '196': 'CY', '410': 'KR', '208': 'DK', '818': 'EG', '100': 'BG',
  '352': 'IS', '458': 'MY', '578': 'NO', '604': 'PE', '040': 'AT', '752': 'SE',
  '076': 'BR', '188': 'CR', '710': 'ZA', '504': 'MA', '250': 'FR', '320': 'GT',
  '170': 'CO', '218': 'EC', '484': 'MX', '554': 'NZ', '404': 'KE', '834': 'TZ',
  '704': 'VN', '688': 'RS', '422': 'LB', '191': 'HR', '384': 'CI', '120': 'CM',
  '591': 'PA', '032': 'AR', '756': 'CH', '203': 'CZ', '642': 'RO', '703': 'SK',
  '440': 'LT', '376': 'IL', '702': 'SG', '364': 'IR', '434': 'LY', '760': 'SY',
  '368': 'IQ', '729': 'SD', '686': 'SN', '858': 'UY', '360': 'ID', '586': 'PK',
  '158': 'TW', '804': 'UA', '324': 'GN', '246': 'FI',
};

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
                const numericId = String(geo.id ?? '');
                const iso2 = NUMERIC_TO_ISO2[numericId] ?? '';
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
