"use client";

import { AXIS_LABELS, type AxisId, type AxisProfile } from "@/lib/types";

interface EssentialSummaryProps {
  ranked: AxisId[];
  profiles: Record<AxisId, AxisProfile>;
  limit?: number;
}

export function EssentialSummary({
  ranked,
  profiles,
  limit = 4,
}: EssentialSummaryProps) {
  const top = ranked.slice(0, limit);
  const peripheral = ranked
    .filter((axis) => profiles[axis].tier === "peripheral")
    .slice(0, 3);

  if (top.length === 0) return null;

  return (
    <section className="w-full max-w-xl space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Núcleo essencial
        </h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Temas em que suas escolhas trataram a posição como quase inegociável.
        </p>
        <ul className="mt-3 flex flex-col gap-2">
          {top.map((axis) => (
            <li
              key={axis}
              className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2"
            >
              <span className="text-[var(--ink)]">{AXIS_LABELS[axis].name}</span>
              <span className="text-sm tabular-nums text-[var(--muted)]">
                {profiles[axis].essentiality}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {peripheral.length > 0 ? (
        <div>
          <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
            Zona limítrofe
          </h2>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Temas tocados, mas com mais margem de negociação nas suas escolhas.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {peripheral.map((axis) => (
              <li
                key={axis}
                className="flex items-baseline justify-between gap-3 border-b border-[var(--line)] py-2"
              >
                <span className="text-[var(--ink)]">
                  {AXIS_LABELS[axis].name}
                </span>
                <span className="text-sm tabular-nums text-[var(--muted)]">
                  {profiles[axis].essentiality}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
