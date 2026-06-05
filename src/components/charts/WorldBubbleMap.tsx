import { useMemo, useState, useEffect, useRef } from 'react';
import { COUNTRY_INFO } from '../../lib/countries';

interface Props {
  data: { iso: string; count: number; label: string }[];
  title?: string;
}

const PROJECTION_SCALE = 130;
const PROJECTION_WIDTH = 900;
const PROJECTION_HEIGHT = 440;

// Simplified Mercator projection (matches d3-geo Mercator defaults)
function mercator(lng: number, lat: number, width: number, height: number) {
  const scale = PROJECTION_SCALE * (width / PROJECTION_WIDTH);
  const cx = width / 2;
  const cy = height / 2 + 30;
  const x = cx + (lng / 180) * scale * Math.PI;
  const latR = (lat * Math.PI) / 180;
  const y = cy - scale * Math.log(Math.tan(Math.PI / 4 + latR / 2));
  return [x, y] as [number, number];
}

export function WorldBubbleMap({ data, title }: Props) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; label: string; count: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(PROJECTION_WIDTH);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w && w > 200) setWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const height = Math.round((width / PROJECTION_WIDTH) * PROJECTION_HEIGHT);

  const maxCount = useMemo(() => Math.max(...data.map((d) => d.count), 1), [data]);
  const countMap = useMemo(() => Object.fromEntries(data.map((d) => [d.iso, d])), [data]);

  const bubbles = useMemo(() => {
    return data
      .filter((d) => COUNTRY_INFO[d.iso])
      .map((d) => {
        const info = COUNTRY_INFO[d.iso]!;
        const [x, y] = mercator(info.lng, info.lat, width, height);
        const r = 4 + Math.sqrt(d.count / maxCount) * 28;
        return { ...d, x, y, r, info };
      })
      .sort((a, b) => b.count - a.count);
  }, [data, width, height, maxCount]);

  // Algeria target dot
  const dzInfo = COUNTRY_INFO['DZ']!;
  const [dzX, dzY] = mercator(dzInfo.lng, dzInfo.lat, width, height);

  return (
    <div ref={containerRef} className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <p className="text-sm font-medium text-ink mb-3" style={{ direction: 'inherit' }}>{title}</p>
      )}
      <div className="relative">
        <svg
          width={width}
          height={height}
          style={{ background: '#f3f2ef', borderRadius: 8, overflow: 'hidden' }}
        >
          {/* Simple graticule lines */}
          {[-60, -30, 0, 30, 60].map((lat) => {
            const [, y] = mercator(0, lat, width, height);
            return (
              <line
                key={lat}
                x1={0} y1={y} x2={width} y2={y}
                stroke="#e5e4e0" strokeWidth={0.5}
              />
            );
          })}
          {[-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150].map((lng) => {
            const [x] = mercator(lng, 0, width, height);
            return (
              <line
                key={lng}
                x1={x} y1={0} x2={x} y2={height}
                stroke="#e5e4e0" strokeWidth={0.5}
              />
            );
          })}

          {/* Source country bubbles */}
          {bubbles.map((b) => (
            <g key={b.iso}>
              <circle
                cx={b.x}
                cy={b.y}
                r={b.r}
                fill="#2d6a4f"
                fillOpacity={0.7}
                stroke="#1a3d2e"
                strokeWidth={0.8}
                style={{ cursor: 'pointer' }}
                onMouseEnter={(e) => {
                  const rect = containerRef.current?.getBoundingClientRect();
                  if (rect) {
                    setTooltip({
                      x: e.clientX - rect.left,
                      y: e.clientY - rect.top,
                      label: b.label,
                      count: b.count,
                    });
                  }
                }}
                onMouseLeave={() => setTooltip(null)}
              />
              {b.r > 14 && (
                <text
                  x={b.x}
                  y={b.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={b.r > 20 ? 11 : 9}
                  fill="white"
                  fontFamily="ui-monospace, monospace"
                  style={{ pointerEvents: 'none', userSelect: 'none' }}
                >
                  {b.iso}
                </text>
              )}
            </g>
          ))}

          {/* Algeria target marker */}
          <circle cx={dzX} cy={dzY} r={6} fill="#e8590c" stroke="#fff" strokeWidth={1.5} />
          <circle cx={dzX} cy={dzY} r={12} fill="none" stroke="#e8590c" strokeWidth={1.5} strokeDasharray="3,2" />
        </svg>

        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-10 bg-ink text-paper text-xs font-mono px-2 py-1 rounded pointer-events-none"
            style={{ left: tooltip.x + 12, top: tooltip.y - 28 }}
          >
            {tooltip.label} · {tooltip.count.toLocaleString()}
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-3 text-xs text-muted font-mono">
        <span className="flex items-center gap-1.5">
          <svg width={12} height={12}><circle cx={6} cy={6} r={5} fill="#2d6a4f" fillOpacity={0.7}/></svg>
          دولة مُصدِّرة
        </span>
        <span className="flex items-center gap-1.5">
          <svg width={12} height={12}><circle cx={6} cy={6} r={5} fill="#e8590c"/></svg>
          الجزائر (الوجهة)
        </span>
        <span className="opacity-60">حجم الفقاعة = عدد الرخص</span>
      </div>
    </div>
  );
}
