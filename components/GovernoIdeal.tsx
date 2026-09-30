import type { ReactNode } from "react";
import {
  GOVERNMENT_RESULT_LEAD,
  GOVERNMENT_RESULT_TITLE,
  NEAR_TIE_LINE,
  type GovernmentArrangement,
  type GovernmentResult,
} from "@/lib/governoFlow";

interface GovernoIdealProps {
  result: GovernmentResult;
  /** Line under the title, e.g. when the block was saved. */
  meta?: ReactNode;
  /** Dedicated page, without a positioning profile above. */
  standalone?: boolean;
}

function Arrangement({
  arrangement,
  heading,
}: {
  arrangement: GovernmentArrangement;
  heading?: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left">
      {heading ? (
        <p className="text-sm text-[var(--accent)]">{heading}</p>
      ) : null}
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl leading-snug text-[var(--ink)]">
        {arrangement.title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-[var(--ink-soft)]">
        <span className="text-[var(--muted)]">Problema. </span>
        {arrangement.problem}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed text-[var(--ink-soft)]">
        <span className="text-[var(--muted)]">Preço. </span>
        {arrangement.cost}
      </p>
      {arrangement.drivers.length > 0 ? (
        <div className="mt-4 border-t border-[var(--line)] pt-3">
          <p className="text-sm text-[var(--muted)]">O que puxou este arranjo</p>
          <ul className="mt-2 flex list-none flex-col gap-3 p-0">
            {arrangement.drivers.map((driver) => (
              <li key={`${driver.sceneTitle}-${driver.choiceLabel}`}>
                <p className="text-sm text-[var(--accent)]">{driver.sceneTitle}</p>
                <p className="mt-1 text-sm leading-snug text-[var(--ink)]">
                  {driver.choiceLabel}
                </p>
                <p className="mt-1 text-sm leading-relaxed text-[var(--ink-soft)]">
                  {driver.sentence}
                </p>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );
}

/**
 * Ideal-government result. Titles describe an arrangement.
 * Internal profile ids are not rendered.
 */
export function GovernoIdeal({
  result,
  meta,
  standalone = false,
}: GovernoIdealProps) {
  const peer = result.nearTie && result.secondary;

  return (
    <section
      aria-labelledby="governo-ideal-title"
      data-block="governo-ideal"
      className={
        standalone
          ? "w-full"
          : "mt-16 w-full border-t border-[var(--line)] pt-12"
      }
    >
      <p className="text-center text-sm tracking-wide text-[var(--accent)] uppercase">
        Arranjo
      </p>
      <h2
        id="governo-ideal-title"
        className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl"
      >
        {GOVERNMENT_RESULT_TITLE}
      </h2>
      {meta ? (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">{meta}</p>
      ) : null}
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[var(--muted)]">
        {GOVERNMENT_RESULT_LEAD}
      </p>

      {peer ? (
        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-[var(--ink-soft)]">
          {NEAR_TIE_LINE}
        </p>
      ) : null}

      <div
        className={
          peer
            ? "mx-auto mt-6 grid w-full max-w-3xl gap-3 sm:grid-cols-2"
            : "mx-auto mt-8 flex w-full max-w-xl flex-col gap-3"
        }
      >
        <Arrangement arrangement={result.primary} />
        {result.secondary ? (
          <Arrangement
            arrangement={result.secondary}
            heading={peer ? undefined : "Também cabe, um pouco mais longe"}
          />
        ) : null}
      </div>
    </section>
  );
}
