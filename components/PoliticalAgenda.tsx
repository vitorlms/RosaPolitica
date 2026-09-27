"use client";

import { InfoTooltip } from "@/components/InfoTooltip";
import {
  AGENDA_THRESHOLD,
  AXIS_LABELS,
  type AxisId,
  type AxisProfile,
} from "@/lib/types";

interface PoliticalAgendaProps {
  ranked: AxisId[];
  profiles: Record<AxisId, AxisProfile>;
}

/**
 * Themes that cleared the agenda threshold (saliency / essentiality ≥ 70).
 * These are the person's real political agenda items from this test.
 */
export function PoliticalAgenda({ ranked, profiles }: PoliticalAgendaProps) {
  const agenda = ranked.filter(
    (axis) => profiles[axis].essentiality >= AGENDA_THRESHOLD,
  );

  return (
    <section className="w-full max-w-xl">
      <div className="flex items-center justify-center gap-1 sm:justify-start">
        <h2 className="font-[family-name:var(--font-display)] text-xl text-[var(--ink)]">
          Agenda política
        </h2>
        <InfoTooltip label="O que é agenda política">
          Temas que pesaram de verdade nas suas escolhas — tratados como pauta
          central, não como detalhe. Só entram aqui eixos com saliência acima de{" "}
          {AGENDA_THRESHOLD}, para refletir o que de fato é agenda para você
          neste teste.
        </InfoTooltip>
      </div>

      {agenda.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">
          Nenhuma pauta passou do limiar de agenda neste percurso. Suas escolhas
          espalharam o peso entre vários temas, sem fixar um núcleo claro.
        </p>
      ) : (
        <>
          <p className="mt-1 text-sm text-[var(--muted)]">
            Pautas com saliência a partir de {AGENDA_THRESHOLD} — o que ficou
            como núcleo nas suas respostas.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {agenda.map((axis) => (
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
        </>
      )}
    </section>
  );
}
