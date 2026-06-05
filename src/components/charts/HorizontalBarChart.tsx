import { useMemo, useState } from 'react';
import { scaleBand, scaleLinear } from '@visx/scale';
import { Bar } from '@visx/shape';
import { Group } from '@visx/group';
import { AxisBottom } from '@visx/axis';
import { Text } from '@visx/text';
import { motion } from 'framer-motion';
import { getCategoryColor } from '../../lib/categoryColors';

export interface BarDatum {
  label: string;
  count: number;
}

interface Props {
  data: BarDatum[];
  width?: number;
  maxBars?: number;
  colorByLabel?: boolean;
  title?: string;
}

const MARGIN = { top: 8, right: 16, bottom: 36, left: 160 };

export function HorizontalBarChart({
  data,
  width = 600,
  maxBars = 15,
  colorByLabel = false,
  title,
}: Props) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const sorted = useMemo(
    () => [...data].sort((a, b) => b.count - a.count).slice(0, maxBars),
    [data, maxBars]
  );

  const barHeight = 24;
  const innerHeight = sorted.length * barHeight;
  const height = innerHeight + MARGIN.top + MARGIN.bottom;
  const innerWidth = width - MARGIN.left - MARGIN.right;

  const yScale = useMemo(
    () =>
      scaleBand<string>({
        domain: sorted.map((d) => d.label),
        range: [0, innerHeight],
        padding: 0.25,
      }),
    [sorted, innerHeight]
  );

  const xScale = useMemo(
    () =>
      scaleLinear<number>({
        domain: [0, Math.max(...sorted.map((d) => d.count))],
        range: [0, innerWidth],
        nice: true,
      }),
    [sorted, innerWidth]
  );

  return (
    <div className="w-full overflow-x-auto">
      {title && (
        <p className="text-sm font-medium text-ink mb-2">{title}</p>
      )}
      <svg width={width} height={height}>
        <Group left={MARGIN.left} top={MARGIN.top}>
          {sorted.map((d, i) => {
            const barY = yScale(d.label) ?? 0;
            const barWidth = xScale(d.count);
            const bandHeight = yScale.bandwidth();
            const isHovered = hoveredIndex === i;
            const fill = colorByLabel ? getCategoryColor(d.label) : '#2d6a4f';

            return (
              <g
                key={d.label}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <motion.rect
                  x={0}
                  y={barY}
                  height={bandHeight}
                  fill={fill}
                  opacity={isHovered ? 1.0 : 0.82}
                  rx={2}
                  initial={{ width: 0 }}
                  animate={{ width: barWidth }}
                  transition={{ delay: i * 0.03, duration: 0.4, ease: 'easeOut' }}
                />
                <Text
                  x={-8}
                  y={barY + bandHeight / 2}
                  textAnchor="end"
                  verticalAnchor="middle"
                  fontSize={12}
                  fill={isHovered ? '#111318' : '#6b7280'}
                  fontFamily="ui-monospace, monospace"
                >
                  {d.label}
                </Text>
                <motion.text
                  x={barWidth + 6}
                  y={barY + bandHeight / 2}
                  dominantBaseline="middle"
                  fontSize={11}
                  fill="#6b7280"
                  fontFamily="ui-monospace, monospace"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 + 0.35, duration: 0.25 }}
                >
                  {d.count.toLocaleString()}
                </motion.text>
              </g>
            );
          })}
          <AxisBottom
            top={innerHeight}
            scale={xScale}
            numTicks={5}
            stroke="#e5e4e0"
            tickStroke="#e5e4e0"
            tickLabelProps={{
              fill: '#6b7280',
              fontSize: 11,
              fontFamily: 'ui-monospace, monospace',
              textAnchor: 'middle',
            }}
          />
        </Group>
      </svg>
    </div>
  );
}
