"use client";

import { AXIS_IDS, AXIS_LABELS, type AxisId } from "@/lib/types";

interface AxisBarsProps {
  values: Record<AxisId, number>;
}

export function AxisBars({ values }: AxisBarsProps) {
  return (
    <ul className="flex w-full max-w-xl flex-col gap-5">
      {AXIS_IDS.map((axis) => {
        const v = values[axis];
        const meta = AXIS_LABELS[axis];
        return (
          <li key={axis}>
            <div className="mb-1 flex items-baseline justify-between gap-2">
              <span className="font-medium text-[var(--ink)]">{meta.name}</span>
              <span className="text-sm tabular-nums text-[var(--muted)]">
                {v}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
                style={{ width: `${v}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between gap-4 text-xs text-[var(--muted)]">
              <span>{meta.low}</span>
              <span className="text-right">{meta.high}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
