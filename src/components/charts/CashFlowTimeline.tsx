import { useMemo, useState } from 'react';
import { Card, CardHeader } from '../ui/Card';
import { AmountDisplay } from '../ui/AmountDisplay';
import type { Currency } from '../../types';

interface DataPoint {
  month: string;
  label: string;
  balance: number;
  income: number;
  expenses: number;
}

interface CashFlowTimelineProps {
  data: DataPoint[];
  currency: Currency;
}

export function CashFlowTimeline({ data, currency }: CashFlowTimelineProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const { points, pathD, areaD, minBalance, maxBalance, balanceRange } = useMemo(() => {
    if (data.length === 0) return { points: [], pathD: '', areaD: '', minBalance: 0, maxBalance: 0, balanceRange: 0 };

    const balances = data.map((d) => d.balance);
    const min = Math.min(...balances);
    const max = Math.max(...balances);
    const range = max - min || 1;

    const chartWidth = 300;
    const chartHeight = 160;
    const paddingX = 20;
    const paddingY = 16;
    const usableWidth = chartWidth - paddingX * 2;
    const usableHeight = chartHeight - paddingY * 2;

    const pts = data.map((d, i) => ({
      x: paddingX + (i / Math.max(1, data.length - 1)) * usableWidth,
      y: paddingY + (1 - (d.balance - min) / range) * usableHeight,
    }));

    const path = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');

    const areaPath = path +
      ` L ${pts[pts.length - 1].x} ${chartHeight - paddingY}` +
      ` L ${pts[0].x} ${chartHeight - paddingY} Z`;

    return { points: pts, pathD: path, areaD: areaPath, minBalance: min, maxBalance: max, balanceRange: range };
  }, [data]);

  if (data.length === 0) return null;

  const chartWidth = 300;
  const chartHeight = 160;
  const paddingX = 20;
  const paddingY = 16;
  const usableHeight = chartHeight - paddingY * 2;

  return (
    <Card padding="md">
      <CardHeader title="Cash Flow Timeline" />
      <div className="overflow-x-auto -mx-1 px-1">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto"
          style={{ minWidth: '260px' }}
        >
          <defs>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
            const y = paddingY + (1 - pct) * usableHeight;
            return (
              <line
                key={pct}
                x1={paddingX}
                y1={y}
                x2={chartWidth - paddingX}
                y2={y}
                stroke="var(--color-border-light)"
                strokeWidth="0.5"
                strokeDasharray="2,4"
              />
            );
          })}

          {/* Area fill */}
          <path d={areaD} fill="url(#lineGradient)" />

          {/* Line */}
          <path
            d={pathD}
            fill="none"
            stroke="var(--color-accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {points.map((p, i) => (
            <g key={i}>
              <circle
                cx={p.x}
                cy={p.y}
                r={hoveredIndex === i ? 5 : 3}
                fill="var(--color-surface)"
                stroke="var(--color-accent)"
                strokeWidth="2"
                className="transition-all duration-150"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                onTouchStart={() => setHoveredIndex(i)}
                onTouchEnd={() => setHoveredIndex(null)}
                style={{ cursor: 'pointer' }}
              />
              {/* Month label */}
              <text
                x={p.x}
                y={chartHeight - 2}
                textAnchor="middle"
                className="fill-[var(--color-text-muted)]"
                fontSize="8"
                fontWeight="500"
              >
                {data[i].label}
              </text>
            </g>
          ))}

          {/* Tooltip */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <rect
                x={Math.min(points[hoveredIndex].x - 40, chartWidth - 84)}
                y={Math.max(points[hoveredIndex].y - 44, 4)}
                width="80"
                height="36"
                rx="6"
                fill="var(--color-primary)"
                opacity="0.95"
              />
              <text
                x={Math.min(points[hoveredIndex].x, chartWidth - 44)}
                y={Math.max(points[hoveredIndex].y - 30, 18)}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="600"
              >
                +{data[hoveredIndex].income.toLocaleString('en-IN')}
              </text>
              <text
                x={Math.min(points[hoveredIndex].x, chartWidth - 44)}
                y={Math.max(points[hoveredIndex].y - 18, 30)}
                textAnchor="middle"
                fill="white"
                fontSize="8"
                fontWeight="600"
              >
                -{data[hoveredIndex].expenses.toLocaleString('en-IN')}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Hover detail card */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div className="mt-3 p-3 bg-[var(--color-surface-dim)] rounded-xl animate-fadeIn">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[var(--color-text-secondary)]">
              {data[hoveredIndex].label}
            </span>
            <AmountDisplay amount={data[hoveredIndex].balance} currency={currency} size="sm" colorize />
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-success)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">
                +{data[hoveredIndex].income.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
              <span className="text-[10px] text-[var(--color-text-muted)]">
                -{data[hoveredIndex].expenses.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
