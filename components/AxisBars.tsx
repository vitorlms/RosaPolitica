"use client";

import { AXIS_IDS, AXIS_LABELS, type AxisId, type AxisProfile } from "@/lib/types";

const TIER_LABEL: Record<AxisProfile["tier"], string> = {
  essential: "Essencial",
  moderate: "Moderado",
  peripheral: "Limítrofe / negociável",
  untouched: "Não tocado",
};

interface AxisBarsProps {
  profiles: Record<AxisId, AxisProfile>;
}

export function AxisBars({ profiles }: AxisBarsProps) {
  return (
    <ul className="flex w-full max-w-xl flex-col gap-6">
      {AXIS_IDS.map((axis) => {
        const profile = profiles[axis];
        const meta = AXIS_LABELS[axis];
        return (
          <li key={axis}>
            <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
              <span className="font-medium text-[var(--ink)]">{meta.name}</span>
              <span className="text-xs tracking-wide text-[var(--muted)] uppercase">
                {TIER_LABEL[profile.tier]}
              </span>
            </div>

            <div className="mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-[var(--ink-soft)]">Posição</span>
              <span className="tabular-nums text-[var(--muted)]">
                {profile.position}
              </span>
            </div>
            <div className="relative h-2 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent)]"
                style={{ width: `${profile.position}%` }}
              />
            </div>
            <div className="mt-1 flex justify-between gap-4 text-xs text-[var(--muted)]">
              <span>{meta.low}</span>
              <span className="text-right">{meta.high}</span>
            </div>

            <div className="mt-3 mb-1 flex items-baseline justify-between gap-2 text-sm">
              <span className="text-[var(--ink-soft)]">Essencialidade</span>
              <span className="tabular-nums text-[var(--muted)]">
                {profile.essentiality}
              </span>
            </div>
            <div className="relative h-1.5 overflow-hidden rounded-full bg-[var(--line)]">
              <div
                className="absolute inset-y-0 left-0 rounded-full bg-[var(--accent-muted)]"
                style={{ width: `${profile.essentiality}%` }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
