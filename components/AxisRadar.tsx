"use client";

import { AXIS_IDS, AXIS_LABELS, type AxisId } from "@/lib/types";

interface AxisRadarProps {
  /** Display values 0–100 per axis. */
  values: Record<AxisId, number>;
  size?: number;
}

export function AxisRadar({ values, size = 320 }: AxisRadarProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.32;
  const n = AXIS_IDS.length;

  function point(i: number, r: number) {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / n;
    return {
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
    };
  }

  const gridLevels = [0.25, 0.5, 0.75, 1];
  const valuePoints = AXIS_IDS.map((axis, i) => {
    const t = values[axis] / 100;
    return point(i, maxR * t);
  });
  const polygon = valuePoints.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <div className="flex flex-col items-center gap-4">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label="Radar dos eixos políticos"
        className="max-w-full"
      >
        {gridLevels.map((level) => {
          const pts = AXIS_IDS.map((_, i) => {
            const p = point(i, maxR * level);
            return `${p.x},${p.y}`;
          }).join(" ");
          return (
            <polygon
              key={level}
              points={pts}
              fill="none"
              stroke="var(--line)"
              strokeWidth={1}
            />
          );
        })}
        {AXIS_IDS.map((_, i) => {
          const p = point(i, maxR);
          return (
            <line
              key={i}
              x1={cx}
              y1={cy}
              x2={p.x}
              y2={p.y}
              stroke="var(--line)"
              strokeWidth={1}
            />
          );
        })}
        <polygon
          points={polygon}
          fill="var(--accent-soft)"
          stroke="var(--accent)"
          strokeWidth={2}
        />
        {valuePoints.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={3.5} fill="var(--accent)" />
        ))}
        {AXIS_IDS.map((axis, i) => {
          const p = point(i, maxR + 28);
          return (
            <text
              key={axis}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-[var(--ink-soft)] text-[10px]"
            >
              {AXIS_LABELS[axis].name}
            </text>
          );
        })}
      </svg>
    </div>
  );
}
