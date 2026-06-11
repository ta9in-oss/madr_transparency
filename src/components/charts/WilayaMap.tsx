import { useState, useMemo } from 'react';
import { ALGERIA_WILAYA_PATHS } from '../../data/algeria-wilaya-paths';
import { WILAYA_BY_CODE, wilayaCodeFromName } from '../../data/wilaya-names';

interface Props {
  counts: Record<string, number>;
  title?: string;
  lang?: 'ar' | 'fr' | 'en';
}

const EMPTY_COLOR = '#e8f5e9';
const COLORS = ['#c8e6c9', '#81c784', '#4caf50', '#2e7d32', '#1b5e20'];

function countToColor(count: number, max: number): string {
  if (count === 0) return EMPTY_COLOR;
  const idx = Math.min(
    COLORS.length - 1,
    Math.floor((count / max) * COLORS.length)
  );
  return COLORS[idx];
}

export function WilayaMap({ counts, title, lang = 'ar' }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null);

  // Build code→count map: wilaya names in data → numeric code → DZxx
  const codeCount = useMemo(() => {
    const map: Record<number, number> = {};
    for (const [name, cnt] of Object.entries(counts)) {
      const code = wilayaCodeFromName(name);
      if (code) map[code] = (map[code] ?? 0) + cnt;
    }
    return map;
  }, [counts]);

  const maxCount = Math.max(1, ...Object.values(codeCount));

  const fillMap = useMemo(() => {
    const m: Record<string, string> = {};
    for (let i = 1; i <= 58; i++) {
      const key = `DZ${String(i).padStart(2, '0')}`;
      m[key] = countToColor(codeCount[i] ?? 0, maxCount);
    }
    return m;
  }, [codeCount, maxCount]);

  function handleMouseEnter(e: React.MouseEvent<SVGPathElement>, dzKey: string) {
    const code = parseInt(dzKey.slice(2), 10);
    const info = WILAYA_BY_CODE[code];
    if (!info) return;
    const name = info[lang];
    const cnt = codeCount[code] ?? 0;
    const svgRect = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect();
    setTooltip({
      x: e.clientX - svgRect.left + 10,
      y: e.clientY - svgRect.top - 28,
      text: `${name}: ${cnt}`,
    });
  }

  return (
    <div className="relative w-full">
      {title && (
        <h3 className="text-sm font-mono text-muted mb-3 text-center">{title}</h3>
      )}

      <div className="relative" style={{ direction: 'ltr' }}>
        <svg
          viewBox="0 0 959 1020"
          className="w-full h-auto"
          style={{ direction: 'ltr', maxHeight: '520px' }}
          onMouseLeave={() => setTooltip(null)}
        >
          {Object.entries(ALGERIA_WILAYA_PATHS).map(([key, d]) => (
            <path
              key={key}
              id={key}
              d={d}
              fill={fillMap[key] ?? EMPTY_COLOR}
              stroke="#ffffff"
              strokeWidth="1"
              style={{ cursor: 'pointer', transition: 'fill 0.15s' }}
              onMouseEnter={(e) => handleMouseEnter(e, key)}
              onMouseLeave={() => setTooltip(null)}
            />
          ))}
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

      {/* Legend */}
      <div className="flex items-center justify-center gap-2 mt-3 text-xs text-muted font-mono flex-wrap">
        <span className="flex items-center gap-1">
          <span style={{ background: EMPTY_COLOR, display: 'inline-block', width: 12, height: 12, borderRadius: 2 }} />
          0
        </span>
        {COLORS.map((c, i) => (
          <span key={c} className="flex items-center gap-1">
            <span style={{ background: c, display: 'inline-block', width: 12, height: 12, borderRadius: 2 }} />
            {i === COLORS.length - 1 ? `${Math.ceil((i / COLORS.length) * maxCount)}+` : `~${Math.ceil(((i + 1) / COLORS.length) * maxCount)}`}
          </span>
        ))}
      </div>
    </div>
  );
}
