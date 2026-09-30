import type { ReactNode } from "react";
import Link from "next/link";
import {
  DEFAULT_COUNTRY_NAME,
  GOVERNMENT_RESULT_TITLE,
  NEAR_TIE_LINE,
  governmentResultLead,
  type GovernmentArrangement,
  type GovernmentResult,
} from "@/lib/governoFlow";
import { classroomNameFor } from "@/lib/organizacoes";

interface GovernoIdealProps {
  result: GovernmentResult;
  /** Country the player is founding. */
  countryName?: string;
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
  const classroomName = classroomNameFor(arrangement.profileId);
  return (
    <article className="rounded-lg border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left">
      {heading ? (
        <p className="text-sm text-[var(--accent)]">{heading}</p>
      ) : null}
      <h3 className="mt-1 font-[family-name:var(--font-display)] text-xl leading-snug text-[var(--ink)]">
        {arrangement.title}
      </h3>
      {classroomName ? (
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Mais próximo de:{" "}
          <Link
            href={`/organizacoes#${arrangement.profileId}`}
            className="font-semibold text-[var(--accent)] underline decoration-[var(--line)] underline-offset-4 hover:decoration-[var(--accent)]"
          >
            {classroomName}
          </Link>
        </p>
      ) : null}
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
          <p className="text-sm text-[var(--muted)]">O que mais puxou este arranjo</p>
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
 * Ideal-government result. The descriptive title stays primary.
 * The classroom name sits under it and links to that organization.
 */
export function GovernoIdeal({
  result,
  countryName = DEFAULT_COUNTRY_NAME,
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
      <h1
        id="governo-ideal-title"
        className="mt-2 text-center font-[family-name:var(--font-display)] text-2xl text-[var(--ink)] sm:text-3xl"
      >
        {GOVERNMENT_RESULT_TITLE}
      </h1>
      {meta ? (
        <p className="mt-2 text-center text-sm text-[var(--muted)]">{meta}</p>
      ) : null}
      <p className="mx-auto mt-3 max-w-xl text-center text-sm leading-relaxed text-[var(--muted)]">
        {governmentResultLead(countryName)}
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
            heading={peer ? undefined : "Outro arranjo que também cabe"}
          />
        ) : null}
      </div>
    </section>
  );
}
