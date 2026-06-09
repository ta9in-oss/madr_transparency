import { useMemo, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, LabelList,
} from 'recharts';
import { getCategoryColor } from '../../lib/categoryColors';

export interface BarDatum {
  label: string;
  count: number;
}

interface Props {
  data: BarDatum[];
  maxBars?: number;
  colorByLabel?: boolean;
  title?: string;
  isRtl?: boolean;
}

const DEFAULT_COLOR = '#2d6a4f';

export function HorizontalBarChart({
  data,
  maxBars = 15,
  colorByLabel = false,
  title,
  isRtl = false,
}: Props) {
  const sorted = useMemo(
    () => [...data].sort((a, b) => b.count - a.count).slice(0, maxBars),
    [data, maxBars]
  );

  const barHeight = 28;
  const chartHeight = sorted.length * barHeight + 60;

  // recharts 3 + Astro client:visible: ResizeObserver update gets batched and
  // never flushes on initial hydration. Dispatching resize forces recharts to
  // re-measure and render the SVG.
  useEffect(() => {
    const id = requestAnimationFrame(() => window.dispatchEvent(new Event('resize')));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="w-full" style={{ direction: 'ltr' }}>
      {title && (
        <p
          className="text-sm font-medium text-ink mb-3"
          style={{ direction: isRtl ? 'rtl' : 'ltr' }}
        >
          {title}
        </p>
      )}
      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={sorted}
          layout="vertical"
          margin={{ top: 4, right: 48, bottom: 4, left: isRtl ? 16 : 160 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e4e0" horizontal={false} />
          <XAxis
            type="number"
            reversed={isRtl}
            tick={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fill: '#6b7280' }}
            tickLine={{ stroke: '#e5e4e0' }}
            axisLine={{ stroke: '#e5e4e0' }}
            tickFormatter={(v: number) => (Number.isInteger(v) ? v.toLocaleString() : '')}
          />
          <YAxis
            type="category"
            dataKey="label"
            width={isRtl ? 200 : 155}
            orientation={isRtl ? 'right' : 'left'}
            tick={{
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              fill: '#6b7280',
              textAnchor: isRtl ? 'start' : 'end',
            }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(45,106,79,0.06)' }}
            contentStyle={{
              fontSize: 12,
              fontFamily: 'ui-monospace, monospace',
              border: '1px solid #e5e4e0',
              borderRadius: 4,
              background: '#fafaf8',
            }}
            formatter={(value: number) => [value.toLocaleString(), '']}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]} maxBarSize={22}>
            {sorted.map((entry) => (
              <Cell
                key={`cell-${entry.label}`}
                fill={colorByLabel ? getCategoryColor(entry.label) : DEFAULT_COLOR}
                opacity={0.85}
              />
            ))}
            <LabelList
              dataKey="count"
              content={(props: any) => {
                const { x, y, width, height, value } = props;
                // recharts renders RTL bars with negative width (x=zero_edge, width=-ve).
                // position='left'/'right' doesn't account for this, so labels land on the
                // Y axis labels. Manually compute the visual tip of the bar.
                const tipX = isRtl ? x + width - 4 : x + width + 4;
                return (
                  <text
                    x={tipX}
                    y={y + height / 2}
                    textAnchor={isRtl ? 'end' : 'start'}
                    dominantBaseline="middle"
                    style={{ fontSize: 11, fontFamily: 'ui-monospace, monospace', fill: '#6b7280' }}
                  >
                    {(value as number).toLocaleString()}
                  </text>
                );
              }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
